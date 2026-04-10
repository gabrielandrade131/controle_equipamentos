import { ConflictException, Injectable, NotFoundException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProducoesService {
    constructor(private prisma: PrismaService) {}

    private montarNumeroSerie(
        numeroSerieBase?: string,
        numeroOrdem?: string,
    ): string | null {
       if (!numeroSerieBase || !numeroOrdem) {
            return null;
        }
        return `${numeroSerieBase}-${numeroOrdem}`;
    }

    async create(data: CreateProducaoDto) {
        try {
        return this.prisma.equipment.create({
            data: {
                numeroOrdem: data.numeroOrdem,
                numeroSerieBase: data.numeroSerieBase,
                numeroSerie: this.montarNumeroSerie(data.numeroSerieBase, data.numeroOrdem),
                dataSolicitacao: data.dataSolicitacao ? new Date(data.dataSolicitacao) : null,
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
            include: {
                itensSeriados: true,
            },

        });
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
        return this.prisma.equipment.findMany({
            include: {
                itensSeriados: true,
            },
            orderBy: {
                criadoEm: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const producao = await this.prisma.equipment.findUnique({
            where: { id },
            include: {
                itensSeriados: true,
            },
        });
    if (!producao) {
        throw new NotFoundException('Produção não encontrada');
    }
    return producao;

    }

    async findByNumeroOrdem(numeroOrdem: string) {
        const producao = await this.prisma.equipment.findUnique({
            where: { numeroOrdem },
            include: {
                itensSeriados: true, 
            }
        })
        if (!producao) {
            throw new NotFoundException('Produção não encontrada');
        }
        return producao;
    }

    async update(id: string, data: UpdateProducaoDto) {
       const producaoAtual = await this.findOne(id);
       const numeroOrdemFinal = data.numeroOrdem ?? producaoAtual.numeroOrdem;
       const numeroSerieBaseFinal = 
        data.numeroSerieBase ?? producaoAtual.numeroSerieBase  ?? undefined;

        try{
            return this.prisma.equipment.update({
                where: { id },
                data: {
                    numeroOrdem: data.numeroOrdem,
                    numeroSerieBase: data.numeroSerieBase,
                    numeroSerie: this.montarNumeroSerie(
                        numeroSerieBaseFinal,
                        numeroOrdemFinal,
                    ),
                    dataSolicitacao: data.dataSolicitacao 
                        ? new Date(data.dataSolicitacao)
                        : undefined,
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
                    itensSeriados: true,
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

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.equipment.delete({
            where: { id },
        });
    }
}

    

