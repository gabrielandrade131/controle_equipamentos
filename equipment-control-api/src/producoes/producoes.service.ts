import { BadRequestException, ConflictException, Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { CreateObservacaoDto } from './dto/create-observacao.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Prisma, StatusProducao } from '@prisma/client';

@Injectable()
export class ProducoesService {
    constructor(private prisma: PrismaService) {}

    private montarNumeroSerie(
        numeroSerieBase?: string | null,
        numeroOrdem?: number | null,
    ): string | null {
       if (!numeroSerieBase || !numeroOrdem) {
            return null;
        }
        return `${numeroSerieBase}-${numeroOrdem}`;
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
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        return diffDias >= 0 ? diffDias: 0;
    }

    private adicionarDiasProducao<T extends { dataInicio?: Date | null; dataTermino?: Date | null }>(
        producao: T,
    ) {
        return {
            ...producao,
            diasProducao: this.calcularDiasProducao(
                producao.dataInicio ?? null,
                producao.dataTermino ?? null,
            ),
        };
    }

    async create(data: CreateProducaoDto) {
        try {
        const producaoCriada = await this.prisma.equipment.create({
            data: {
                numeroSerieBase: data.numeroSerieBase,
                dataSolicitacao: data.dataSolicitacao
                ? new Date(data.dataSolicitacao)
                : null,
                dataInicio: data.dataInicio
                ? new Date(data.dataInicio)
                : null,
                dataTermino: data.dataTermino
                ? new Date(data.dataTermino)
                : null,
                tipoEquipamentoId: data.tipoEquipamentoId,
                modelo: data.modelo,
                descricao: data.descricao,
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
            },
        });

            const producaoFinal = await this.prisma.equipment.update({
                where: { id: producaoCriada.id },
                data: {
                    numeroSerie: this.montarNumeroSerie(
                        producaoCriada.numeroSerieBase,
                        producaoCriada.numeroOrdem,
                    ),
                },
                include: {
                    tipoEquipamento: true,
                    itensSeriados: true,
                    observacoes: {
                        orderBy: {
                            criadoEm: 'desc',
                        }
                    }
                }
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

    async findAll() {
        const producoes = await this.prisma.equipment.findMany({
            include: {
                tipoEquipamento: true,
                itensSeriados: true,
                observacoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    }
                }
            },
            orderBy: {
                criadoEm: 'desc',
            },
        });

        return producoes.map((producao) => this.adicionarDiasProducao(producao));
    }

    async findOne(id: string) {
        const producao = await this.prisma.equipment.findUnique({
            where: { id },
            include: {
                tipoEquipamento: true,
                itensSeriados: true,
                observacoes: {
                    orderBy: {
                        criadoEm: 'desc',
                    }
                }
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
                    }
                }
            },
        });
        if (!producao) {
            throw new NotFoundException('Produção não encontrada');
        }
        return this.adicionarDiasProducao(producao);
    }

    async update(id: string, data: UpdateProducaoDto) {
       const producaoAtual = await this.findOne(id);
       const numeroSerieBaseFinal = 
        data.numeroSerieBase ?? producaoAtual.numeroSerieBase  ?? undefined;

        try{
            return this.prisma.equipment.update({
                where: { id },
                data: {
                    numeroSerieBase: data.numeroSerieBase,
                    numeroSerie: this.montarNumeroSerie(
                        numeroSerieBaseFinal,
                        producaoAtual.numeroOrdem,
                    ),
                    dataSolicitacao: data.dataSolicitacao 
                        ? new Date(data.dataSolicitacao)
                        : undefined,
                    dataInicio: data.dataInicio
                        ? new Date(data.dataInicio)
                        : undefined,
                    dataTermino: data.dataTermino
                        ? new Date(data.dataTermino)
                        : undefined,
                    statusProducao: data.statusProducao,
                    tipoEquipamentoId: data.tipoEquipamentoId,
                    modelo: data.modelo,
                    descricao: data.descricao,
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
                        }
                    }
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
            },
        });

        return this.adicionarDiasProducao(equipamentoAtulizado);
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.equipment.delete({
            where: { id },
        });
    }
}

    
