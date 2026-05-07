import { BadRequestException, ConflictException, Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { CreateObservacaoDto } from './dto/create-observacao.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateRegistroInspecaoDto } from './dto/update-registro-inspecao.dto';
import { Prisma, StatusProducao as PrismaStatusProducao } from '@prisma/client';
import { FilterProducaoDto } from './dto/filter-producao.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ProducoesService {
    constructor(private prisma: PrismaService) {}

    private montarNumeroSerie(
        modelo?: string | null,
        numeroOrdem?: number | null,
    ): string | null {
       if (!modelo || !numeroOrdem) {
            return null;
        }
        return `${modelo}-${numeroOrdem}`;
    }

    private montarDescricao(
        nomeTipoEquipamento?: string | null,
        descricaoComplemento?: string | null,
    ): string | null {
        if (!nomeTipoEquipamento && !descricaoComplemento) {
            return null;
        }
        if (!nomeTipoEquipamento) {
            return descricaoComplemento?.trim() || null;
        }
        if (!descricaoComplemento) {
            return nomeTipoEquipamento.trim();
        }
        
        return `${nomeTipoEquipamento.trim()} ${descricaoComplemento?.trim() || ''}`;
    }

    private calcularDiasProducao(
        dataInicio?: Date | null,
        dataTermino?: Date| null,
    ): number | null {
        if (!dataInicio) {
            return null;
        }
        const dataFinal = dataTermino ?? new Date();

        const inicio = new Date(dataInicio);
        const fim = new Date(dataFinal);

        inicio.setHours(0, 0, 0, 0);
        fim.setHours(0, 0, 0, 0);

        const diffMs = fim.getTime() - inicio.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

        return diffDias >= 1 ? diffDias: 1;
    }

    private adicionarDiasProducao<T extends {
        dataSolicitacao?: Date | null;
        dataInicio?: Date | null;
        previsaoTermino?: Date | null;
        dataTermino?: Date | null;
        statusProducao?: string | null;
    }>(
        producao: T,
    ) {
        const deveCalcular = producao.statusProducao === 'EM_ANDAMENTO';

        const prazo = this.calcularPrazoProducao(
            producao.statusProducao ?? null,
            producao.previsaoTermino ?? null,
            producao.dataTermino ?? null,
        );

        return {
            ...producao,

            diasSolicitacao: this.calcularDiasProducao(
                producao.dataSolicitacao ?? null,
                producao.dataInicio ?? null,

            ),
  
            diasProducao: deveCalcular
            ? this.calcularDiasProducao(
                producao.dataInicio ?? null,
                producao.dataTermino ?? null,
            )

            : null,

            situacaoPrazo: prazo.situacaoPrazo,
            resultadoPrazo: prazo.resultadoPrazo,
        };
    }

    private formartarValor(value: unknown): string | null {
        if (value === null || value === undefined) {
            return null;
        }

        if (value instanceof Date) {
            return value.toISOString();
        }

        return String(value);
    }

    private obterPrevisaoTermino(data: CreateProducaoDto | UpdateProducaoDto): string | undefined {
        return data.previsaoTermino ?? data.dataPrevisao;
    }

    private calcularPrazoProducao(
        statusProducao?: string | null,
        previsaoTermino?: Date | null,
        dataTermino?: Date | null,
    ): {
        situacaoPrazo: 'NO_PRAZO' | 'ATENCAO' | 'ATRASADA' | 'CONCLUIDA' | null;
        resultadoPrazo: 'CONCLUIDA_NO_PRAZO' | 'CONCLUIDA_COM_ATRASO' | null;
    } {
        if (!previsaoTermino) {
            return {
                situacaoPrazo: null,
                resultadoPrazo: null,
            };
        }

        const previsao = new Date(previsaoTermino);
        previsao.setHours(0, 0, 0, 0);

        if (statusProducao === 'CONCLUIDA') {
            if (!dataTermino) {
                return {
                    situacaoPrazo: 'CONCLUIDA',
                    resultadoPrazo: null,
                };
            }

            const termino = new Date(dataTermino);
            termino.setHours(0, 0, 0, 0);

            return {
                situacaoPrazo: 'CONCLUIDA',
                resultadoPrazo: 
                   termino.getTime() <= previsao.getTime()
                   ? 'CONCLUIDA_NO_PRAZO'
                   : 'CONCLUIDA_COM_ATRASO',
            };
        }

        const hoje = new Date ();
        hoje.setHours(0, 0, 0, 0);

        if (hoje.getTime() < previsao.getTime()) {
            return {
                situacaoPrazo: 'NO_PRAZO',
                resultadoPrazo: null,

            };
        }

        if (hoje.getTime() === previsao.getTime()) {
            return {
                situacaoPrazo: 'ATENCAO',
                resultadoPrazo: null,
            };
        }

        return {
            situacaoPrazo: 'ATRASADA',
            resultadoPrazo: null,
        };
    }

    private montarWhere(filters: FilterProducaoDto): Prisma.EquipmentWhereInput {
        const where: Prisma.EquipmentWhereInput = {
            ativo: true,
        };

        if (filters.numeroOrdem) {
            where.numeroOrdem = filters.numeroOrdem;
        }

        if (filters.numeroSerie) {
            where.numeroSerie = {
            contains: filters.numeroSerie,
            mode: 'insensitive',
            };
        }

        if (filters.modelo) {
            where.modelo = {
            contains: filters.modelo,
            mode: 'insensitive',
            };
        }

        if (filters.tag) {
            where.tag = {
            contains: filters.tag,
            mode: 'insensitive',
            };
        }

        if (filters.statusProducao) {
            where.statusProducao = filters.statusProducao;
        }

        if (filters.tipoEquipamentoId) {
            where.tipoEquipamentoId = filters.tipoEquipamentoId;
        }

        return where;
    }

    async create(data: CreateProducaoDto) {
        try {
            let tipoEquipamentoNome: string | null = null;

            if (data.tipoEquipamentoId) {
                const tipoEquipamento = await this.prisma.tipoEquipamento.findUnique({
                    where: { id: data.tipoEquipamentoId },
                });

                if (!tipoEquipamento) {
                    throw new NotFoundException('Tipo de equipamento não encontrado');
                }
                
                tipoEquipamentoNome = tipoEquipamento.nome;
            }
        
        // Gerar próximo numeroOrdem
        const lastEquipment = await this.prisma.equipment.findFirst({
            orderBy: { numeroOrdem: 'desc' },
            select: { numeroOrdem: true },
        });
        const nextNumeroOrdem = (lastEquipment?.numeroOrdem ?? 0) + 1;

        const previsaoTermino = this.obterPrevisaoTermino(data);

        const producaoCriada = await this.prisma.equipment.create({
            data: {
                numeroOrdem: nextNumeroOrdem,
                dataSolicitacao: data.dataSolicitacao
                ? new Date(data.dataSolicitacao)
                : null,
                solicitante: data.solicitante,
                dataInicio: data.dataInicio
                ? new Date(data.dataInicio)
                : null,
                previsaoTermino: previsaoTermino
                ? new Date(previsaoTermino)
                : null,
                dataTermino: data.dataTermino
                ? new Date(data.dataTermino)
                : null,
                tipoEquipamentoId: data.tipoEquipamentoId || null,
                modelo: data.modelo,
                descricao: this.montarDescricao(
                    tipoEquipamentoNome,
                    data.descricaoComplemento,
                ),
                listaPecas: data.listaPecas ?? '',
                sequenciaMontagem: data.sequencialMontagem ?? '',
                inspecaoMontagem: data.inspecaoMontagem ?? '',
                historicoEquipamento: data.historicoEquipamento ?? '',
                procedimentoTesteInspecaoMontagem:
                    data.procedimentoTestes ?? '',
                itensSeriados: {
                    create:
                    data.itensSeriados?.map((item) => ({
                        descricao: item.descricao,
                    })) ?? [],
                },
                registrosInspecaoMontagem: {
                    create: Array.from({ length: 16 }, (_, index) => ({
                        ordem: index + 1,
                    })),
                }
            },
        });

            const producaoFinal = await this.prisma.equipment.update({
                where: { id: producaoCriada.id },
                data: {
                    numeroSerie: this.montarNumeroSerie(
                        producaoCriada.modelo,
                        producaoCriada.numeroOrdem,
                    ),
                },
                include: {
                    tipoEquipamento: true,
                    itensSeriados: true,
                    observacoes: {
                        orderBy: {
                            criadoEm: 'desc',
                        },
                    },
                    registrosInspecaoMontagem: {
                        orderBy: {
                            ordem: 'asc',
                        },
                    },
                },
            });

            return this.adicionarDiasProducao(producaoFinal);

        } catch(error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new ConflictException('Número de ordem já existe');
        }
        throw error;
        }
    }

    async findAll(filters: FilterProducaoDto) {
       const where = this.montarWhere(filters);

       if (filters.numeroOrdem) {
        where.numeroOrdem = filters.numeroOrdem;
       }

       if (filters.numeroSerie) {
        where.numeroSerie = {
            contains: filters.numeroSerie,
        };
       }

       if (filters.tag) {
        where.tag = {
            contains: filters.tag,
        };
       }

       if (filters.statusProducao) {
        where.statusProducao = filters.statusProducao;
       }

       if (filters.tipoEquipamentoId) {
        where.tipoEquipamentoId = filters.tipoEquipamentoId;
       }

       const page = filters.page ?? 1;
       const limit = filters.limit ?? 10;
       const skip = (page - 1) * limit;
       const sortBy = filters.sortBy ?? 'criadoEm';
       const sortOrder = filters.sortOrder ?? 'desc';

       const [data, total] = await Promise.all([
        this.prisma.equipment.findMany({
            where,
            include: {
                tipoEquipamento: true,
                itensSeriados: true,
                observacoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    },
                },
                registrosInspecaoMontagem: {
                    orderBy: {
                        ordem: 'asc',
                    },
                },
                historicoAlteracoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    },
                },
            },
            orderBy: {
                [sortBy]: sortOrder,
            },
            skip,
            take: limit,
        }),
        this.prisma.equipment.count({where})
       ]);

       return {
        data: data.map((producao) => this.adicionarDiasProducao(producao)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
       };
    }

    async findOne(id: string) {
        const producao = await this.prisma.equipment.findUnique({
            where: { 
                id, 
                ativo: true 
            },
            include: {
                tipoEquipamento: true,
                itensSeriados: true,
                observacoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    },
                },
                registrosInspecaoMontagem: {
                    orderBy: {
                        ordem: 'asc',
                    },
                },
                historicoAlteracoes: true,
            },
        });
    if (!producao) {
        throw new NotFoundException('Produção não encontrada');
    }
    return this.adicionarDiasProducao(producao);

    }

    async findByNumeroOrdem(numeroOrdem: number) {
        const producao = await this.prisma.equipment.findUnique({
            where: { numeroOrdem },
            include: {
                tipoEquipamento: true,
                itensSeriados: true,
                observacoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    },
                },
                registrosInspecaoMontagem: {
                    orderBy: {
                        ordem: 'asc',
                    },
                },

            },
        });
        if (!producao) {
            throw new NotFoundException('Produção não encontrada');
        }
        return this.adicionarDiasProducao(producao);
    }

    async update(id: string, data: UpdateProducaoDto, user?: any) {
       const producaoAtual = await this.findOne(id);
       const tipoEquipamentoIdFinal = 
        data.tipoEquipamentoId ?? producaoAtual.tipoEquipamentoId ?? undefined;

       let tipoEquipamentoNome: string | null = null;

       if (tipoEquipamentoIdFinal) {
            const tipoEquipamento = await this.prisma.tipoEquipamento.findUnique({
                where: { id: tipoEquipamentoIdFinal },
            });

            if (!tipoEquipamento) {
                throw new NotFoundException('Tipo de equipamento não encontrado');
            }

            tipoEquipamentoNome = tipoEquipamento.nome;
        }

        const descricaoComplementoAtual = 
            producaoAtual.descricao && tipoEquipamentoNome
            ? producaoAtual.descricao.replace(tipoEquipamentoNome, '').trim()
            : '';
        
        const descricaoComplementoFinal =
            data.descricaoComplemento ?? descricaoComplementoAtual;

        const alteradoPor = 
            user?.nome ||
            user?.email ||
            user?.username ||
            null;

        const historicoParaCriar: {
            campo: string;
            valorAnterior: string | null;
            valorNovo: string | null;
            alteradoPor: string | null;
        }[] = [];

        const previsaoTermino = this.obterPrevisaoTermino(data);

        const camposMonitorados = {
            tipoEquipamentoId: data.tipoEquipamentoId,
            modelo: data.modelo,
            descricao: data.descricaoComplemento,
            statusProducao: data.statusProducao,
            dataSolicitacao: data.dataSolicitacao ? new Date(data.dataSolicitacao) : undefined,
            solicitante: data.solicitante,
            dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
            previsaoTermino: previsaoTermino ? new Date(previsaoTermino) : undefined,
            dataTermino: data.dataTermino ? new Date(data.dataTermino) : undefined,
            listaPecas: data.listaPecas,
            sequenciaMontagem: data.sequencialMontagem,
            inspecaoMontagem: data.inspecaoMontagem,
            historicoEquipamento: data.historicoEquipamento,
            procedimentoTesteInspecaoMontagem: data.procedimentoTestes,
        };

        for (const [campo, novoValor] of Object.entries(camposMonitorados)) {
            if (novoValor === undefined) continue;

            const valorAnterior =
            campo === 'descricao'
                ? producaoAtual.descricao
                : (producaoAtual as any)[campo];
            
            const anteriorFormatado = this.formartarValor(valorAnterior);
            const novoFormatado = this.formartarValor(novoValor);

            if (anteriorFormatado !== novoFormatado) {
                historicoParaCriar.push({
                    campo,
                    valorAnterior: anteriorFormatado,
                    valorNovo: novoFormatado,
                    alteradoPor
                });
            }
        }

        try{
            if (historicoParaCriar.length > 0) {
                await Promise.all(
                    historicoParaCriar.map((item) =>
                        this.prisma.historicoProducao.create({
                            data: {
                                equipmentId: id,
                                campo: item.campo,
                                valorAnterior: item.valorAnterior,
                                valorNovo: item.valorNovo,
                                alteradoPor: item.alteradoPor,
                            },
                        })
                    )
                );
            }

            return this.prisma.equipment.update({
                where: { id },
                data: {
                    numeroSerie: this.montarNumeroSerie(
                        data.modelo ?? producaoAtual.modelo,
                        producaoAtual.numeroOrdem,
                    ),
                    dataSolicitacao: data.dataSolicitacao 
                        ? new Date(data.dataSolicitacao)
                        : undefined,
                    dataInicio: data.dataInicio
                        ? new Date(data.dataInicio)
                        : undefined,
                    previsaoTermino: previsaoTermino
                        ? new Date(previsaoTermino)
                        : undefined,
                    dataTermino: data.dataTermino
                        ? new Date(data.dataTermino)
                        : undefined,
                    statusProducao: data.statusProducao as PrismaStatusProducao | undefined,
                    tipoEquipamentoId: data.tipoEquipamentoId,
                    modelo: data.modelo,
                    descricao: this.montarDescricao(
                        tipoEquipamentoNome,
                        data.descricaoComplemento,
                    ),
                    listaPecas: data.listaPecas,
                    sequenciaMontagem: data.sequencialMontagem,
                    inspecaoMontagem: data.inspecaoMontagem,
                    historicoEquipamento: data.historicoEquipamento,
                    procedimentoTesteInspecaoMontagem:
                        data.procedimentoTestes,
                    itensSeriados:
                        data.itensSeriados !== undefined
                            ? {
                                deleteMany: {},
                                create: data.itensSeriados.map((item) => ({
                                    descricao: item.descricao,
                                })),
                            }
                            : undefined,
                },
                include: {
                    tipoEquipamento: true,
                    itensSeriados: true,
                    observacoes: {
                        orderBy: {
                            criadoEm: 'desc',
                        },
                    },
                    registrosInspecaoMontagem: {
                        orderBy: {
                            ordem: 'asc',
                        },
                    },

                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError && 
                error.code === 'P2002'
            ) {
                throw new ConflictException('Número de ordem já existe');
             }
             throw error;
         }
    }

    async addObservacao(id: string, data: CreateObservacaoDto) {
        await this.findOne(id);

        return this.prisma.observacaoProducao.create({
            data: {
                producaoId: id,
                descricao: data.descricao,
            },
        });
    }

    async listObservacoes(id: string) {
        await this.findOne(id);
        
        return this.prisma.observacaoProducao.findMany({
            where: {
                producaoId: id,
            },
            orderBy: {
                criadoEm: 'desc',
            }
        })
    }

    async updateTag(id: string, data: UpdateTagDto) {
        const equipment = await this.findOne(id);

        if (equipment.statusProducao !== 'CONCLUIDA') {
            throw new BadRequestException(
                'A TAG só pode ser cadastrada quando a produção estiver concluida',
            )
        }

        const existenteComTag = await this.prisma.equipment.findFirst({
            where: {
                tag: data.tag,
                NOT: {
                    id,
                },
            },
        });

        if (existenteComTag) {
            throw new ConflictException('Esta TAG já cadastrada em outro equipamento');
        }

        const equipamentoAtulizado = await this.prisma.equipment.update({
            where: { id },
            data: {
                tag: data.tag,
            },
            include: {
                tipoEquipamento: true,
                itensSeriados: true,
                observacoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    },
                },
                registrosInspecaoMontagem: {
                    orderBy: {
                        ordem: 'asc',
                    }
                }
            },
        });

        return this.adicionarDiasProducao(equipamentoAtulizado);
    }

    async listRegistrosInspecaoMontagem(id: string) {
        await this.findOne(id);

        return this.prisma.registroInspecaoMontagem.findMany({
            where: {
                equipmentId: id,
            },
            orderBy: {
                ordem: 'asc',
            },
        });
    }

    async updateRegistroInspecaoMontagem(
        equipmentId: string,
        ordem: number,
        data: UpdateRegistroInspecaoDto,
    ) {
        await this.findOne(equipmentId);

        const registro = await this.prisma.registroInspecaoMontagem.findUnique({
            where: {
                equipmentId_ordem:{
                    equipmentId,
                    ordem,
                },
            },
        });

        if (!registro) {
            throw new NotFoundException('Registro de inspeção não encontrada');
        }
        return this.prisma.registroInspecaoMontagem.update({
            where: {
                equipmentId_ordem: {
                    equipmentId,
                    ordem,
                },
            },
            data: {
                valorObservado: data.valorObservado,
                instrumentoMedicao: data.instrumentoMedicao,
                conformidades: data.conformidades,
            },
        });
    }

    async listHistorico(id: string) {
        await this.findOne(id);
        return this.prisma.historicoProducao.findMany({
            where: {
                equipmentId: id,
            },
            orderBy: {
                criadoEm: 'desc',
            },
        });
    }

    async exportExcel(filters: FilterProducaoDto) {
        const where = this.montarWhere(filters);

        const sortBy = filters.sortBy ?? 'criadoEm';
        const sortOrder = filters.sortOrder ?? 'desc';

        const producoes = await this.prisma.equipment.findMany({
            where,
            include: {
            tipoEquipamento: true,
            itensSeriados: true,
            },
            orderBy: {
            [sortBy]: sortOrder,
            },
        });

        const dados = producoes.map((producao) =>
            this.adicionarDiasProducao(producao),
        );

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Produções');

        worksheet.columns = [
            { header: 'Número da Ordem', key: 'numeroOrdem', width: 18 },
            { header: 'Número de Série', key: 'numeroSerie', width: 26 },
            { header: 'Tipo de Equipamento', key: 'tipoEquipamentoNome', width: 26 },
            { header: 'Modelo', key: 'modelo', width: 24 },
            { header: 'Descrição', key: 'descricao', width: 36 },
            { header: 'Solicitante', key: 'solicitante', width: 24 },
            { header: 'Data de Solicitação', key: 'dataSolicitacao', width: 22 },
            { header: 'Dias de Solicitação', key: 'diasSolicitacao', width: 22 },
            { header: 'Data de Início', key: 'dataInicio', width: 18 },
            { header: 'Previsão de Término', key: 'previsaoTermino', width: 22 },
            { header: 'Data de Término', key: 'dataTermino', width: 18 },
            { header: 'Dias de Produção', key: 'diasProducao', width: 20 },
            { header: 'Status da Produção', key: 'statusProducao', width: 22 },
            { header: 'Situação do Prazo', key: 'situacaoPrazo', width: 22 },
            { header: 'Resultado do Prazo', key: 'resultadoPrazo', width: 26 },
            { header: 'TAG', key: 'tag', width: 18 },
            { header: 'Lista de Peças', key: 'listaPecas', width: 16 },
            { header: 'Sequência de Montagem', key: 'sequenciaMontagem', width: 24 },
            { header: 'Inspeção de Montagem', key: 'inspecaoMontagem', width: 24 },
            { header: 'Histórico do Equipamento', key: 'historicoEquipamento', width: 26 },
            { header: 'Procedimento de Teste', key: 'procedimentoTesteInspecaoMontagem', width: 26 },
            { header: 'Itens Seriados', key: 'itensSeriados', width: 45 },
            { header: 'Criado em', key: 'criadoEm', width: 20 },
        ];

        dados.forEach((producao) => {
            worksheet.addRow({
            numeroOrdem: producao.numeroOrdem,
            numeroSerie: producao.numeroSerie,
            tipoEquipamentoNome: producao.tipoEquipamento?.nome,
            modelo: producao.modelo,
            descricao: producao.descricao,
            solicitante: producao.solicitante,
            dataSolicitacao: producao.dataSolicitacao,
            diasSolicitacao: producao.diasSolicitacao,
            dataInicio: producao.dataInicio,
            previsaoTermino: producao.previsaoTermino,
            dataTermino: producao.dataTermino,
            diasProducao: producao.diasProducao,
            statusProducao: producao.statusProducao,
            situacaoPrazo: producao.situacaoPrazo,
            resultadoPrazo: producao.resultadoPrazo,
            tag: producao.tag,
            listaPecas: producao.listaPecas ? 'Sim' : 'Não',
            sequenciaMontagem: producao.sequenciaMontagem ? 'Sim' : 'Não',
            inspecaoMontagem: producao.inspecaoMontagem ? 'Sim' : 'Não',
            historicoEquipamento: producao.historicoEquipamento ? 'Sim' : 'Não',
            procedimentoTesteInspecaoMontagem:
                producao.procedimentoTesteInspecaoMontagem ? 'Sim' : 'Não',
            itensSeriados: producao.itensSeriados
                ?.map((item) => item.descricao)
                .join(' | '),
            criadoEm: producao.criadoEm,
            });
        });

        worksheet.getRow(1).font = {
            bold: true,
        };

        worksheet.getRow(1).alignment = {
            vertical: 'middle',
            horizontal: 'center',
        };

        worksheet.getRow(1).height = 22;

        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };

            cell.alignment = {
                vertical: 'middle',
                wrapText: true,
            };
            });
        });

        worksheet.getColumn('dataSolicitacao').numFmt = 'dd/mm/yyyy';
        worksheet.getColumn('dataInicio').numFmt = 'dd/mm/yyyy';
        worksheet.getColumn('previsaoTermino').numFmt = 'dd/mm/yyyy';
        worksheet.getColumn('dataTermino').numFmt = 'dd/mm/yyyy';
        worksheet.getColumn('criadoEm').numFmt = 'dd/mm/yyyy hh:mm';

        worksheet.autoFilter = {
            from: 'A1',
            to: 'W1',
        };

        worksheet.views = [
            {
            state: 'frozen',
            ySplit: 1,
            },
        ];

        const buffer = await workbook.xlsx.writeBuffer();

        return buffer;
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.equipment.update({
            where: { id },
            data: {
                ativo: false,
                excluidoEm: new Date(),
            },
        });
    }
}

    
