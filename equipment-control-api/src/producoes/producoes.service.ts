import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { stringify } from 'querystring';

@Injectable()
export class ProducoesService {
    constructor(private prisma: PrismaService) {}

    async create(data: CreateProducaoDto) {
        return this.prisma.equipment.create({
            data: {
                numeroOrdem: data.numeroOrdem,
                numeroSerie: data.numeroSerie,
                dataSolicitacao: data.dataSolicitacao ? new Date(data.dataSolicitacao) : null,
                modelo: data.modelo,
                descricao: data.descricao,
                listaPecas: data.listaPecas ?? false,
                sequenciaMontagem: data.sequencialMontagem ?? false,
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
        await this.findOne(id);
        return this.prisma.equipment.update({
            where: { id },
            data: {
                numeroOrdem: data.numeroOrdem,
                numeroSerie: data.numeroSerie,
                dataSolicitacao: data.dataSolicitacao 
                    ? new Date(data.dataSolicitacao)
                    : undefined,
                modelo: data.modelo,
                descricao: data.descricao,
                listaPecas: data.listaPecas,
                sequenciaMontagem: data.sequencialMontagem,
                inspecaoMontagem: data.inspecaoMontagem,
                historicoEquipamento: data.historicoEquipamento,
                procedimentoTesteInspecaoMontagem:
                    data.procedimentoTesteInspecaoMontagem,
            },
            include: {
                itensSeriados: true,
            },
        });

    }

}

