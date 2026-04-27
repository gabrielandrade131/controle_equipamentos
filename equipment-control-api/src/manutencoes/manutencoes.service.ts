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

type UsuarioHistorico = {
  nome?: string | null;
  email?: string | null;
  username?: string | null;
} | null;

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

  private formatarValor(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return String(value);
  }

  private calcularDias(
    dataInicio?: Date | null,
    dataTermino?: Date | null,
  ): number | null {
    if (!dataInicio) {
      return null;
    }

    const inicio = new Date(dataInicio);
    const fim = dataTermino ? new Date(dataTermino) : new Date();

    inicio.setHours(0, 0, 0, 0);
    fim.setHours(0, 0, 0, 0);

    
    const diffMs = fim.getTime() - inicio.getTime();
    const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    return dias >= 0 ? dias : 0;
  }

  private adicionarDiasManutencao<T extends { dataInicio?: Date | null; dataTermino?: Date | null }>(
    manutencao: T,
  ) {
    return { 
      ...manutencao,
      diasManutencao: This.calcularDias(
        manutencao.dataInicio ?? null,
        manutencao.dataTermino ?? null,
      ),
    };
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

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy ?? 'criadoEm';
    const sortOrder = filters.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.manutencao.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.manutencao.count({ where }),
    ]);

    return {
      data: data.map((manutencao) => this.adicionarDiasManutencao(manutencao)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

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
      include: {
        historicoAlteracoes: {
          orderBy: {
            criadoEm: 'desc',
          },
        },
      },
    });

    if (!manutencao) {
      throw new NotFoundException('Manutenção não encontrada.');
    }

    return this.adicionarDiasManutencao(manutencao);
  }

  async update(id: string, data: UpdateManutencaoDto, user?: UsuarioHistorico) {
    const manutencaoAtual = await this.prisma.manutencao.findUnique({
      where: { id },
    });

    if (!manutencaoAtual) {
      throw new NotFoundException('Manutenção não encontrada.');
    }

    const novosDados = {
      diagnostico: data.diagnostico,
      responsavelManutencao: data.responsavelManutencao,
      statusManutencao: data.statusManutencao,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataTermino: data.dataTermino ? new Date(data.dataTermino) : undefined,
    };

    const alteradoPor = 
      user?.nome ||
      user?.email || 
      user?.username ||
      null;

    const historicoParaCriar: {
      campo: string;
      valorAnterior: string | null;
      valorNovo: string | null;
    }[] = [];

    const camposMonitorados: Array<keyof typeof novosDados> = [
      'diagnostico',
      'responsavelManutencao',
      'statusManutencao',
      'dataInicio',
      'dataTermino',
    ];

    for (const campo of camposMonitorados) {
      const novoValor = novosDados[campo];

      if (novoValor === undefined) {
        continue;
      }

      const valorAnterior = manutencaoAtual[campo];
      const anteriorFormatado = this.formatarValor(valorAnterior);
      const novoFormatado = this.formatarValor(novoValor);

      if (anteriorFormatado !== novoFormatado) {
        historicoParaCriar.push({
          campo,
          valorAnterior: anteriorFormatado,
          valorNovo: novoFormatado,
        });
      }
    }

    const manutencaoAtualizada = await this.prisma.manutencao.update({
      where: { id },
      data: novosDados,
    });

    if (historicoParaCriar.length > 0) {
      await this.prisma.historicoManutencao.createMany({
        data: historicoParaCriar.map((item) => ({
          manutencaoId: id,
          campo: item.campo,
          valorAnterior: item.valorAnterior,
          valorNovo: item.valorNovo,
          alteradoPor,
        })),
      });
    }

    return this.findOne(manutencaoAtualizada.id);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.manutencao.delete({
      where: { id },
    });
  }

  async listHistorico(id: string) {
    await this.findOne(id);

    return this.prisma.historicoManutencao.findMany({
      where: {
        manutencaoId: id,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }
}
