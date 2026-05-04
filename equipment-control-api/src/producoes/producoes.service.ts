import { BadRequestException, ConflictException, Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { CreateObservacaoDto } from './dto/create-observacao.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateRegistroInspecaoDto } from './dto/update-registro-inspecao.dto';
import { Prisma } from '@prisma/client';
import { FilterProducaoDto } from './dto/filter-producao.dto';

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
        dataTermino?: Date | null;
        statusProducao?: string | null;
    }>(
        producao: T,
    ) {
        const deveCalcular = producao.statusProducao === 'EM_ANDAMENTO';

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
                previsaoTermino: data.previsaoTermino
                ? new Date(data.previsaoTermino)
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
                listaPecas: data.listaPecas ?? false,
                sequenciaMontagem: data.sequenciaMontagem ?? false,
                inspecaoMontagem: data.inspecaoMontagem ?? false,
                historicoEquipamento: data.historicoEquipamento ?? false,
                procedimentoTesteInspecaoMontagem:
                    data.procedimentoTesteInspecaoMontagem ?? false,
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
       const where: Prisma.EquipmentWhereInput = {
            ativo: true,
        } ;

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

        const camposMonitorados = {
            tipoEquipamentoId: data.tipoEquipamentoId,
            modelo: data.modelo,
            descricao: data.descricaoComplemento,
            statusProducao: data.statusProducao,
            dataSolicitacao: data.dataSolicitacao ? new Date(data.dataSolicitacao) : undefined,
            solicitante: data.solicitante,
            dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
            previsaoTermino: data.previsaoTermino ? new Date(data.previsaoTermino) : undefined,
            dataTermino: data.dataTermino ? new Date(data.dataTermino) : undefined,
            listaPecas: data.listaPecas,
            sequenciaMontagem: data.sequenciaMontagem,
            inspecaoMontagem: data.inspecaoMontagem,
            historicoEquipamento: data.historicoEquipamento,
            procedimentoTesteInspecaoMontagem: data.procedimentoTesteInspecaoMontagem,
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
                    previsaoTermino: data.previsaoTermino
                        ? new Date(data.previsaoTermino)
                        : undefined,
                    dataTermino: data.dataTermino
                        ? new Date(data.dataTermino)
                        : undefined,
                    statusProducao: data.statusProducao,
                    tipoEquipamentoId: data.tipoEquipamentoId,
                    modelo: data.modelo,
                    descricao: this.montarDescricao(
                        tipoEquipamentoNome,
                        data.descricaoComplemento,
                    ),
                    listaPecas: data.listaPecas,
                    sequenciaMontagem: data.sequenciaMontagem,
                    inspecaoMontagem: data.inspecaoMontagem,
                    historicoEquipamento: data.historicoEquipamento,
                    procedimentoTesteInspecaoMontagem:
                        data.procedimentoTesteInspecaoMontagem,
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

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.equipment.update({
            where: { id },
            data: {
                excluidoEm: new Date(),
            },
        });
    }
}

    
