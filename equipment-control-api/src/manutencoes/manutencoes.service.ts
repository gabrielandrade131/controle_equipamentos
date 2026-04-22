import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrigemManutencao,
  Prisma,
  StatusManutencao,
} from '@prisma/client';
import { CreateManutencaoSynchroDto } from './dto/create-manutencao-synchro.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { FilterManutencaoDto } from './dto/filter-manutencao.dto';

@Injectable()
export class ManutencoesService {
  constructor(private readonly prisma: PrismaService) {}

  private ehSituacaoRetornoBase(value?: string | null): boolean {
    const situacao = String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');

    return [
      'retornou_base',
      'retornou para base',
      'retornou para a base',
    ].includes(situacao);
  }

  async createFromSynchro(data: CreateManutencaoSynchroDto) {
    if (!this.ehSituacaoRetornoBase(data.situacaoEquipamento)) {
      throw new BadRequestException(
        'A manutenção só pode ser criada quando a situação do equipamento for "Retornou para a base" ou "retornou_base".',
      );
    }

    const condicoesDuplicidade: Prisma.ManutencaoWhereInput[] = [];

    if (data.numeroSerie) {
      condicoesDuplicidade.push({ numeroSerie: data.numeroSerie });
    }

    if (data.tag) {
      condicoesDuplicidade.push({ tag: data.tag });
    }

    const manutencaoAberta =
      condicoesDuplicidade.length > 0
        ? await this.prisma.manutencao.findFirst({
            where: {
              OR: condicoesDuplicidade,
              statusManutencao: {
                in: [
                  StatusManutencao.PENDENTE,
                  StatusManutencao.EM_MANUTENCAO,
                ],
              },
            },
          })
        : null;

    if (manutencaoAberta) {
      throw new ConflictException(
        'Já existe uma manutenção aberta para este equipamento.',
      );
    }

    return this.prisma.manutencao.create({
      data: {
        origem: OrigemManutencao.SYNCHRO,
        tipoEquipamentoNome: data.tipoEquipamentoNome,
        modeloEquipamento: data.modeloEquipamento,
        numeroSerie: data.numeroSerie,
        tag: data.tag,
        situacaoEquipamento: data.situacaoEquipamento,
        dataRetornoBase: data.dataRetornoBase
          ? new Date(data.dataRetornoBase)
          : null,
        statusManutencao: StatusManutencao.PENDENTE,
      },
    });
  }

  async findAll(filters: FilterManutencaoDto) {
    const where: Prisma.ManutencaoWhereInput = {};

    if (filters.statusManutencao) {
      where.statusManutencao = filters.statusManutencao;
    }

    if (filters.tag) {
      where.tag = {
        contains: filters.tag,
        mode: 'insensitive',
      };
    }

    if (filters.numeroSerie) {
      where.numeroSerie = {
        contains: filters.numeroSerie,
        mode: 'insensitive',
      };
    }

    if (filters.tipoEquipamentoNome) {
      where.tipoEquipamentoNome = {
        contains: filters.tipoEquipamentoNome,
        mode: 'insensitive',
      };
    }

    if (filters.modeloEquipamento) {
      where.modeloEquipamento = {
        contains: filters.modeloEquipamento,
        mode: 'insensitive',
      };
    }

    return this.prisma.manutencao.findMany({
      where,
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const manutencao = await this.prisma.manutencao.findUnique({
      where: { id },
    });

    if (!manutencao) {
      throw new NotFoundException('Manutenção não encontrada.');
    }

    return manutencao;
  }

  async update(id: string, data: UpdateManutencaoDto) {
    await this.findOne(id);

    return this.prisma.manutencao.update({
      where: { id },
      data: {
        diagnostico: data.diagnostico,
        responsavelManutencao: data.responsavelManutencao,
        statusManutencao: data.statusManutencao,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
        dataTermino: data.dataTermino ? new Date(data.dataTermino) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.manutencao.delete({
      where: { id },
    });
  }
}
