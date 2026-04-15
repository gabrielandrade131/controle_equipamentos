import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoEquipamentoDto } from './dto/create-tipo-equipamento.dto';
import { UpdateTipoEquipamentoDto } from './dto/update-tipo-equipamento.dto';

@Injectable()
export class TiposEquipamentoService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: CreateTipoEquipamentoDto) {
        try {
            return await this.prisma.tipoEquipamento.create({
                data: {
                    nome: data.nome,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError && 
                error.code === 'P2002'
            ) {
                throw new ConflictException( 'Já existe um tipo de equipamento com este nome.');
            }

            throw error;
        }
    }

    async findAll() {
        return this.prisma.tipoEquipamento.findMany({
            orderBy: {
                nome: 'asc',
            },
        });
    }

    async findOne(id: string) {
        const tipoEquipamento = await this.prisma.tipoEquipamento.findUnique({
            where: { id },
        });

        if (!tipoEquipamento) {
            throw new NotFoundException('Tipo de equipamento não encontrado.');
        }

        return tipoEquipamento;
    }

    async update(id: string, data: UpdateTipoEquipamentoDto) {
        await this.findOne(id);

        try {
            return await this.prisma.tipoEquipamento.update({
                where: { id },
                data: {
                    nome: data.nome,
                },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('Já existe um tipo de equipamento com este nome.');
            }

            throw error;
        }
    }

    async inativar(id: string) {
        await this.findOne(id);

        return this.prisma.tipoEquipamento.update({
            where: { id },
            data: {
                ativo: false,
            },
        })
    }

    async ativar(id: string) {
        await this.findOne(id);

        return this.prisma.tipoEquipamento.update({
            where: { id },
            data: {
                ativo: true,
            },
        });
    }
}
