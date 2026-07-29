import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import {
  OrigemManutencao,
  Prisma,
  StatusManutencao,
  TipoManutencao,
} from '@prisma/client';
import { CreateManutencaoSynchroDto } from './dto/create-manutencao-synchro.dto';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { FilterManutencaoDto } from './dto/filter-manutencao.dto';
import * as ExcelJS from 'exceljs';

type UsuarioHistorico = {
  nome?: string | null;
  email?: string | null;
  username?: string | null;
} | null;

@Injectable()
export class ManutencoesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly manutencaoInclude = {
    tipoEquipamento: true,
    historicoAlteracoes: {
      orderBy: {
        criadoEm: 'desc' as const,
      },
    },
  };

  private normalizarTexto(value?: string | null): string | null {
    const texto = String(value ?? '').trim();
    return texto.length > 0 ? texto : null;
  }

  private normalizarData(data?: string | Date | null): Date | null {
    if (!data) {
      return null;
    }

    if (data instanceof Date) {
      return data;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return new Date(`${data}T12:00:00.000Z`);
    }

    return new Date(data);
  }

  private mesmaData(a?: Date | null, b?: Date | null): boolean {
    if (!a && !b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
  }

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

  private async adicionarValidadeEquipamento<T extends { tag?: string | null }>(
    manutencao: T,
  ) {
    const tag = this.normalizarTexto(manutencao.tag);

    if (!tag) {
      return {
        ...manutencao,
        validadeEquipamento: null,
      };
    }

    const equipamento = await this.prisma.equipment.findFirst({
      where: {
        tag: {
          equals: tag,
          mode: 'insensitive',
        },
        ativo: true,
      },
      select: {
        validade: true,
      },
    });

    return {
      ...manutencao,
      validadeEquipamento: equipamento?.validade ?? null,
    };
  }

  private async atualizarValidadeEquipamentoPorTag(
    tag?: string | null,
    validade?: string,
    alteradoPor?: string | null,
  ) {
    if (validade === undefined) {
      return;
    }

    const tagNormalizada = this.normalizarTexto(tag);

    if (!tagNormalizada) {
      return;
    }

    const equipamento = await this.prisma.equipment.findFirst({
      where: {
        tag: {
          equals: tagNormalizada,
          mode: 'insensitive',
        },
        ativo: true,
      },
      select: {
        id: true,
        validade: true,
      },
    });

    if (!equipamento) {
      return;
    }

    const novaValidade = this.normalizarData(validade);

    if (this.mesmaData(equipamento.validade, novaValidade)) {
      return;
    }

    await this.prisma.$transaction([
      this.prisma.equipment.update({
        where: {
          id: equipamento.id,
        },
        data: {
          validade: novaValidade,
        },
      }),
      this.prisma.historicoProducao.create({
        data: {
          equipmentId: equipamento.id,
          campo: 'validade',
          valorAnterior: this.formatarValor(equipamento.validade),
          valorNovo: this.formatarValor(novaValidade),
          alteradoPor,
        },
      }),
    ]);
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

    return dias >= 1 ? dias : 1;
  }

  private adicionarDiasManutencao<
    T extends {
      dataRetornoBase?: Date | null;
      dataInicio?: Date | null;
      dataParalisacao?: Date | null;
      dataTermino?: Date | null;
      statusManutencao?: string | null;
    },
  >(manutencao: T) {
    const deveCalcular = manutencao.statusManutencao === 'EM_MANUTENCAO';
    const deveCalcularParalisacao =
      manutencao.statusManutencao === 'PARALISADA';
    const deveCalcularEspera =
      Boolean(manutencao.dataRetornoBase) &&
      (manutencao.statusManutencao === 'PENDENTE' ||
        Boolean(manutencao.dataInicio));

    return {
      ...manutencao,
      diasEsperaManutencao: deveCalcularEspera
        ? this.calcularDias(
            manutencao.dataRetornoBase ?? null,
            manutencao.dataInicio ?? null,
          )
        : null,
      diasManutencao: deveCalcular
        ? this.calcularDias(
            manutencao.dataInicio ?? null,
            manutencao.dataTermino ?? null,
          )
        : null,
      diasParalisacao: deveCalcularParalisacao
        ? this.calcularDias(
            manutencao.dataParalisacao ?? null,
            manutencao.dataTermino ?? null,
          )
        : null,
    };
  }

  private resolverDataParalisacao(
    statusAtual?: string | null,
    statusNovo?: StatusManutencao | null,
    dataParalisacaoAtual?: Date | null,
    dataParalisacaoInformada?: string | null,
  ): Date | null | undefined {
    if (dataParalisacaoInformada !== undefined) {
      return dataParalisacaoInformada
        ? this.normalizarData(dataParalisacaoInformada)
        : null;
    }

    const statusFinal = statusNovo ?? statusAtual ?? null;

    if (statusFinal === StatusManutencao.PARALISADA) {
      return dataParalisacaoAtual ?? new Date();
    }

    if (
      statusAtual === StatusManutencao.PARALISADA &&
      statusFinal !== StatusManutencao.PARALISADA
    ) {
      return null;
    }

    return undefined;
  }

  private montarWhere(
    filters: FilterManutencaoDto,
  ): Prisma.ManutencaoWhereInput {
    const where: Prisma.ManutencaoWhereInput = {
      ativo: true,
    };

    if (filters.numeroOrdemManutencao) {
      where.numeroOrdemManutencao = filters.numeroOrdemManutencao;
    }

    if (filters.statusManutencao) {
      where.statusManutencao = filters.statusManutencao;
    }

    if (filters.tag) {
      where.tag = {
        contains: filters.tag,
        mode: 'insensitive',
      };
    }

    if (filters.tipoEquipamentoNome) {
      where.tipoEquipamentoNome = {
        contains: filters.tipoEquipamentoNome,
        mode: 'insensitive',
      };
    }

    return where;
  }

  private async resolverTipoEquipamento(
    tipoEquipamentoId?: string | null,
    tipoEquipamentoNome?: string | null,
  ) {
    if (!tipoEquipamentoId) {
      return {
        tipoEquipamentoId: null,
        tipoEquipamentoNome: this.normalizarTexto(tipoEquipamentoNome),
      };
    }

    const tipoEquipamento = await this.prisma.tipoEquipamento.findFirst({
      where: {
        id: tipoEquipamentoId,
        ativo: true,
      },
    });

    if (!tipoEquipamento) {
      throw new NotFoundException('Tipo de equipamento não encontrado.');
    }

    return {
      tipoEquipamentoId: tipoEquipamento.id,
      tipoEquipamentoNome: tipoEquipamento.nome,
    };
  }

  private async importarUmaManutencaoSynchro(data: CreateManutencaoSynchroDto) {
    if (!this.ehSituacaoRetornoBase(data.situacaoEquipamento)) {
      throw new BadRequestException(
        'A manutenção só pode ser criada quando a situação do equipamento for "Retornou para a base" ou "retornou_base".',
      );
    }

    const synchroId = this.normalizarTexto(data.synchroId);
    const tag = this.normalizarTexto(data.tag);
    const dataRetornoBase = this.normalizarData(data.dataRetornoBase);

    const manutencaoPorSynchroId = synchroId
      ? await this.prisma.manutencao.findUnique({
          where: { synchroId },
        })
      : null;

    if (manutencaoPorSynchroId) {
      const atualizada = await this.prisma.manutencao.update({
        where: { id: manutencaoPorSynchroId.id },
        data: {
          ativo: true,
          excluidoEm: null,
          tipoEquipamentoNome: data.tipoEquipamentoNome,
          modeloEquipamento: data.modeloEquipamento,
          tag,
          situacaoEquipamento: data.situacaoEquipamento,
          dataRetornoBase,
        },
      });

      return {
        action: manutencaoPorSynchroId.ativo ? 'updated' : 'reactivated',
        manutencao: atualizada,
      } as const;
    }

    const candidatos = tag
      ? await this.prisma.manutencao.findMany({
          where: {
            origem: OrigemManutencao.SYNCHRO,
            synchroId: null,
            tag,
          },
          orderBy: {
            criadoEm: 'desc',
          },
        })
      : [];

    const manutencaoExistente = candidatos.find(
      (item) =>
        this.normalizarTexto(item.tag) === tag &&
        this.mesmaData(item.dataRetornoBase, dataRetornoBase),
    );

    if (manutencaoExistente) {
      const atualizada = await this.prisma.manutencao.update({
        where: { id: manutencaoExistente.id },
        data: {
          ativo: true,
          excluidoEm: null,
          synchroId,
          tipoEquipamentoNome: data.tipoEquipamentoNome,
          modeloEquipamento: data.modeloEquipamento,
          tag,
          situacaoEquipamento: data.situacaoEquipamento,
          dataRetornoBase,
        },
      });

      return {
        action: manutencaoExistente.ativo ? 'updated' : 'reactivated',
        manutencao: atualizada,
      } as const;
    }

    const condicoesDuplicidade: Prisma.ManutencaoWhereInput[] = [];

    if (tag) {
      condicoesDuplicidade.push({ tag });
    }

    const manutencaoAberta =
      condicoesDuplicidade.length > 0
        ? await this.prisma.manutencao.findFirst({
            where: {
              OR: condicoesDuplicidade,
              ativo: true,
              statusManutencao: {
                in: [
                  StatusManutencao.EM_QUARENTENA,
                  StatusManutencao.PENDENTE,
                  StatusManutencao.EM_MANUTENCAO,
                  StatusManutencao.PARALISADA,
                ],
              },
            },
            orderBy: {
              criadoEm: 'desc',
            },
          })
        : null;

    if (manutencaoAberta) {
      throw new ConflictException(
        'Já existe uma manutenção aberta para este equipamento.',
      );
    }

    const criada = await this.prisma.manutencao.create({
      data: {
        synchroId,
        origem: OrigemManutencao.SYNCHRO,
        tipoEquipamentoNome: data.tipoEquipamentoNome,
        modeloEquipamento: data.modeloEquipamento,
        tag,
        situacaoEquipamento: data.situacaoEquipamento,
        dataRetornoBase,
        statusManutencao: StatusManutencao.EM_QUARENTENA,
      },
    });

    return {
      action: 'created',
      manutencao: criada,
    } as const;
  }

  async createFromSynchro(data: CreateManutencaoSynchroDto) {
    const resultado = await this.importarUmaManutencaoSynchro(data);
    return resultado.manutencao;
  }

  async createBulkFromSynchro(items: CreateManutencaoSynchroDto[]) {
    const results: Array<{
      index: number;
      action: 'created' | 'updated' | 'reactivated' | 'error';
      id?: string;
      synchroId?: string | null;
      numeroOrdemManutencao?: number | null;
      tag?: string | null;
      message?: string;
    }> = [];

    for (const [index, item] of items.entries()) {
      try {
        const resultado = await this.importarUmaManutencaoSynchro(item);

        results.push({
          index,
          action: resultado.action,
          id: resultado.manutencao.id,
          synchroId: resultado.manutencao.synchroId,
          numeroOrdemManutencao: resultado.manutencao.numeroOrdemManutencao,
          tag: resultado.manutencao.tag,
        });
      } catch (error) {
        results.push({
          index,
          action: 'error',
          synchroId: item.synchroId ?? null,
          numeroOrdemManutencao: null,
          tag: item.tag ?? null,
          message:
            error instanceof Error
              ? error.message
              : 'Falha ao importar manutenção.',
        });
      }
    }

    return {
      total: items.length,
      created: results.filter((item) => item.action === 'created').length,
      updated: results.filter((item) => item.action === 'updated').length,
      reactivated: results.filter((item) => item.action === 'reactivated')
        .length,
      errors: results.filter((item) => item.action === 'error').length,
      results,
    };
  }

  async create(data: CreateManutencaoDto) {
    const tipoEquipamento = await this.resolverTipoEquipamento(
      data.tipoEquipamentoId,
      data.tipoEquipamentoNome,
    );

    const manutencao = await this.prisma.manutencao.create({
      data: {
        origem: OrigemManutencao.MANUAL,
        tipoEquipamentoId: tipoEquipamento.tipoEquipamentoId,
        tipoEquipamentoNome: tipoEquipamento.tipoEquipamentoNome,
        tipoManutencao: data.tipoManutencao ?? TipoManutencao.CORRETIVA,
        modeloEquipamento: data.modeloEquipamento,
        numeroSerie: data.numeroSerie,
        tag: data.tag,
        situacaoEquipamento: data.situacaoEquipamento,
        dataRetornoBase: this.normalizarData(data.dataRetornoBase),
        dataInicio: this.normalizarData(data.dataInicio),
        dataParalisacao: this.resolverDataParalisacao(
          null,
          data.statusManutencao ?? StatusManutencao.EM_MANUTENCAO,
          null,
          data.dataParalisacao,
        ),
        previsaoTermino: this.normalizarData(data.previsaoTermino),
        dataTermino: data.dataTermino
          ? this.normalizarData(data.dataTermino)
          : data.statusManutencao === StatusManutencao.CONCLUIDA
            ? new Date()
            : null,
        diagnostico: data.diagnostico,
        responsavelManutencao: data.responsavelManutencao,
        responsavelRevisao: data.responsavelRevisao,
        statusManutencao:
          data.statusManutencao ?? StatusManutencao.EM_MANUTENCAO,
        avaliacaoFinalConforme: data.avaliacaoFinalConforme,
      },
      include: {
        tipoEquipamento: true,
      },
    });

    await this.atualizarValidadeEquipamentoPorTag(
      manutencao.tag,
      data.validade,
      data.responsavelManutencao,
    );

    return this.adicionarValidadeEquipamento(
      this.adicionarDiasManutencao(manutencao),
    );
  }

  async findAll(filters: FilterManutencaoDto) {
    const where = this.montarWhere(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortBy = filters.sortBy ?? 'criadoEm';
    const sortOrder = filters.sortOrder ?? 'desc';

    const [data, total] = await Promise.all([
      this.prisma.manutencao.findMany({
        where,
        include: {
          tipoEquipamento: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.manutencao.count({ where }),
    ]);

    const manutencoesComValidade = await Promise.all(
      data.map((manutencao) =>
        this.adicionarValidadeEquipamento(
          this.adicionarDiasManutencao(manutencao),
        ),
      ),
    );

    return {
      data: manutencoesComValidade,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const manutencao = await this.prisma.manutencao.findUnique({
      where: {
        id,
        ativo: true,
      },
      include: this.manutencaoInclude,
    });

    if (!manutencao) {
      throw new NotFoundException('Manutenção não encontrada.');
    }

    return this.adicionarValidadeEquipamento(
      this.adicionarDiasManutencao(manutencao),
    );
  }

  async atualizarAnexoPdf(
    id: string,
    anexoPdf: string,
    user?: UsuarioHistorico,
  ) {
    const manutencao = await this.findOne(id);
    const alteradoPor = user?.nome || user?.email || user?.username || null;

    const atualizada = await this.prisma.manutencao.update({
      where: { id },
      data: { anexoPdf },
      include: { tipoEquipamento: true },
    });

    await this.prisma.historicoManutencao.create({
      data: {
        manutencaoId: id,
        campo: 'anexoPdf',
        valorAnterior: this.formatarValor(manutencao.anexoPdf),
        valorNovo: this.formatarValor(anexoPdf),
        alteradoPor,
      },
    });

    return this.adicionarValidadeEquipamento(
      this.adicionarDiasManutencao(atualizada),
    );
  }

  async update(id: string, data: UpdateManutencaoDto, user?: UsuarioHistorico) {
    const manutencaoAtual = await this.prisma.manutencao.findUnique({
      where: { id },
    });

    if (!manutencaoAtual) {
      throw new NotFoundException('Manutenção não encontrada.');
    }

    const alteradoPor = user?.nome || user?.email || user?.username || null;
    const responsavelManutencaoFinal =
      data.responsavelManutencao !== undefined
        ? (alteradoPor ?? data.responsavelManutencao)
        : undefined;
    const statusMudou =
      data.statusManutencao !== undefined &&
      data.statusManutencao !== manutencaoAtual.statusManutencao;

    if (
      manutencaoAtual.statusManutencao === StatusManutencao.CONCLUIDA &&
      statusMudou
    ) {
      throw new BadRequestException(
        'Manutencao concluida nao pode ter o status alterado.',
      );
    }

    const dataFoiAlterada = (
      campo: 'dataInicio' | 'dataTermino',
      valor: string | undefined,
    ) => {
      if (valor === undefined) {
        return false;
      }

      return !this.mesmaData(
        manutencaoAtual[campo],
        this.normalizarData(valor),
      );
    };

    if (
      !statusMudou &&
      (dataFoiAlterada('dataInicio', data.dataInicio) ||
        dataFoiAlterada('dataTermino', data.dataTermino))
    ) {
      throw new BadRequestException(
        'Datas da manutencao so podem ser alteradas pela mudanca de status.',
      );
    }

    const dataInicioPorStatus =
      statusMudou &&
      !manutencaoAtual.dataInicio &&
      data.statusManutencao === StatusManutencao.EM_MANUTENCAO
        ? new Date()
        : undefined;
    const dataTerminoPorStatus =
      statusMudou && data.statusManutencao === StatusManutencao.CONCLUIDA
        ? new Date()
        : statusMudou &&
            manutencaoAtual.statusManutencao === StatusManutencao.CONCLUIDA &&
            data.statusManutencao !== StatusManutencao.CONCLUIDA
          ? null
          : undefined;

    if (manutencaoAtual.statusManutencao === StatusManutencao.CONCLUIDA) {
      const tipoEquipamento = await this.resolverTipoEquipamento(
        data.tipoEquipamentoId ?? manutencaoAtual.tipoEquipamentoId,
        data.tipoEquipamentoNome ?? manutencaoAtual.tipoEquipamentoNome,
      );
      const camposPermitidosInspecao = [
        'diagnostico',
        'avaliacaoFinalConforme',
        'validade',
        'responsavelManutencao',
        'responsavelRevisao',
        'tipoEquipamentoId',
        'tipoEquipamentoNome',
      ] as const;

      const camposData = new Set([
        'dataRetornoBase',
        'dataInicio',
        'dataParalisacao',
        'previsaoTermino',
        'dataTermino',
      ]);

      const possuiCampoNaoPermitido = Object.entries(data).some(
        ([campo, value]) => {
          if (value === undefined) {
            return false;
          }

          if (
            (campo === 'dataInicio' || campo === 'dataTermino') &&
            statusMudou
          ) {
            return false;
          }

          if (
            camposPermitidosInspecao.includes(
              campo as (typeof camposPermitidosInspecao)[number],
            )
          ) {
            return false;
          }

          const valorNovo = camposData.has(campo)
            ? this.normalizarData(value as string)
            : value;
          const valorAnterior = manutencaoAtual[campo];

          return (
            this.formatarValor(valorAnterior) !== this.formatarValor(valorNovo)
          );
        },
      );

      if (possuiCampoNaoPermitido) {
        throw new BadRequestException(
          'Manutencao concluida nao pode ter seus dados editados.',
        );
      }

      const manutencaoAtualizadaConcluida = await this.prisma.manutencao.update(
        {
          where: { id },
          data: {
            tipoEquipamentoId:
              data.tipoEquipamentoId !== undefined
                ? tipoEquipamento.tipoEquipamentoId
                : undefined,
            tipoEquipamentoNome:
              data.tipoEquipamentoId !== undefined ||
              data.tipoEquipamentoNome !== undefined
                ? tipoEquipamento.tipoEquipamentoNome
                : undefined,
            diagnostico: data.diagnostico,
            avaliacaoFinalConforme: data.avaliacaoFinalConforme,
            responsavelManutencao: responsavelManutencaoFinal,
            responsavelRevisao: data.responsavelRevisao,
            statusManutencao: data.statusManutencao,
            dataInicio: dataInicioPorStatus,
            dataTermino: dataTerminoPorStatus,
          },
          include: {
            tipoEquipamento: true,
          },
        },
      );

      await this.atualizarValidadeEquipamentoPorTag(
        manutencaoAtualizadaConcluida.tag,
        data.validade,
        alteradoPor,
      );

      return this.adicionarValidadeEquipamento(
        this.adicionarDiasManutencao(manutencaoAtualizadaConcluida),
      );
    }

    const tipoEquipamento = await this.resolverTipoEquipamento(
      data.tipoEquipamentoId ?? manutencaoAtual.tipoEquipamentoId,
      data.tipoEquipamentoNome ?? manutencaoAtual.tipoEquipamentoNome,
    );

    const novosDados = {
      tipoEquipamentoId:
        data.tipoEquipamentoId !== undefined
          ? tipoEquipamento.tipoEquipamentoId
          : undefined,
      tipoEquipamentoNome:
        data.tipoEquipamentoId !== undefined ||
        data.tipoEquipamentoNome !== undefined
          ? tipoEquipamento.tipoEquipamentoNome
          : undefined,
      tipoManutencao: data.tipoManutencao,
      modeloEquipamento: data.modeloEquipamento,
      numeroSerie: data.numeroSerie,
      tag: data.tag,
      situacaoEquipamento: data.situacaoEquipamento,
      dataRetornoBase:
        data.dataRetornoBase !== undefined
          ? this.normalizarData(data.dataRetornoBase)
          : undefined,
      diagnostico: data.diagnostico,
      responsavelManutencao: responsavelManutencaoFinal,
      responsavelRevisao: data.responsavelRevisao,
      statusManutencao: data.statusManutencao,
      avaliacaoFinalConforme: data.avaliacaoFinalConforme,
      dataInicio: dataInicioPorStatus,
      dataParalisacao: this.resolverDataParalisacao(
        manutencaoAtual.statusManutencao,
        data.statusManutencao,
        manutencaoAtual.dataParalisacao,
        data.dataParalisacao,
      ),
      previsaoTermino:
        data.previsaoTermino !== undefined
          ? this.normalizarData(data.previsaoTermino)
          : undefined,
      dataTermino: dataTerminoPorStatus,
    };

    const historicoParaCriar: {
      campo: string;
      valorAnterior: string | null;
      valorNovo: string | null;
    }[] = [];

    const camposMonitorados: Array<keyof typeof novosDados> = [
      'tipoEquipamentoId',
      'tipoEquipamentoNome',
      'tipoManutencao',
      'modeloEquipamento',
      'numeroSerie',
      'tag',
      'situacaoEquipamento',
      'dataRetornoBase',
      'diagnostico',
      'responsavelManutencao',
      'responsavelRevisao',
      'statusManutencao',
      'avaliacaoFinalConforme',
      'dataInicio',
      'dataParalisacao',
      'previsaoTermino',
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
      include: {
        tipoEquipamento: true,
      },
    });

    await this.atualizarValidadeEquipamentoPorTag(
      manutencaoAtualizada.tag,
      data.validade,
      alteradoPor,
    );

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

  async exportExcel(filters: FilterManutencaoDto) {
    const where = this.montarWhere(filters);

    const sortBy = filters.sortBy ?? 'criadoEm';
    const sortOrder = filters.sortOrder ?? 'desc';

    const manutencoes = await this.prisma.manutencao.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    const dados = manutencoes.map((manutencao) =>
      this.adicionarDiasManutencao(manutencao),
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Manutenções');

    worksheet.columns = [
      {
        header: 'Ordem de Manutenção',
        key: 'numeroOrdemManutencao',
        width: 12,
      },
      { header: 'Tipo de Equipamento', key: 'tipoEquipamentoNome', width: 24 },
      { header: 'Tipo de Manutenção', key: 'tipoManutencao', width: 22 },
      { header: 'Modelo', key: 'modeloEquipamento', width: 28 },
      { header: 'TAG', key: 'tag', width: 18 },
      {
        header: 'Situação do Equipamento',
        key: 'situacaoEquipamento',
        width: 26,
      },
      { header: 'Data de Retorno à Base', key: 'dataRetornoBase', width: 22 },
      { header: 'Data de Início', key: 'dataInicio', width: 18 },
      { header: 'Data de Paralisação', key: 'dataParalisacao', width: 18 },
      { header: 'Data de Término', key: 'dataTermino', width: 18 },
      { header: 'Dias de Manutenção', key: 'diasManutencao', width: 20 },
      { header: 'Dias de Paralisação', key: 'diasParalisacao', width: 20 },
      { header: 'Status da Manutenção', key: 'statusManutencao', width: 24 },
      { header: 'Executado por', key: 'responsavelManutencao', width: 24 },
      { header: 'Revisado por', key: 'responsavelRevisao', width: 24 },
      { header: 'Diagnóstico', key: 'diagnostico', width: 45 },
      { header: 'Origem', key: 'origem', width: 14 },
      { header: 'Criado em', key: 'criadoEm', width: 20 },
    ];

    dados.forEach((manutencao) => {
      worksheet.addRow({
        numeroOrdemManutencao: manutencao.numeroOrdemManutencao,
        tipoEquipamentoNome: manutencao.tipoEquipamentoNome,
        tipoManutencao: manutencao.tipoManutencao,
        modeloEquipamento: manutencao.modeloEquipamento,
        tag: manutencao.tag,
        situacaoEquipamento: manutencao.situacaoEquipamento,
        dataRetornoBase: manutencao.dataRetornoBase,
        dataInicio: manutencao.dataInicio,
        dataParalisacao: manutencao.dataParalisacao,
        dataTermino: manutencao.dataTermino,
        diasManutencao: manutencao.diasManutencao,
        diasParalisacao: manutencao.diasParalisacao,
        statusManutencao: manutencao.statusManutencao,
        responsavelManutencao: manutencao.responsavelManutencao,
        responsavelRevisao: manutencao.responsavelRevisao,
        diagnostico: manutencao.diagnostico,
        origem: manutencao.origem,
        criadoEm: manutencao.criadoEm,
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
    worksheet.getColumn('dataRetornoBase').numFmt = 'dd/MM/yyyy';
    worksheet.getColumn('dataInicio').numFmt = 'dd/MM/yyyy';
    worksheet.getColumn('dataParalisacao').numFmt = 'dd/MM/yyyy';
    worksheet.getColumn('dataTermino').numFmt = 'dd/MM/yyyy';
    worksheet.getColumn('criadoEm').numFmt = 'dd/MM/yyyy HH:mm:ss';

    worksheet.autoFilter = {
      from: 'A1',
      to: 'Q1',
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

    return this.prisma.manutencao.update({
      where: { id },
      data: {
        ativo: false,
        excluidoEm: new Date(),
      },
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

  async buscarRecebimentoDaManutencao(id: string) {
    const manutencao = await this.prisma.manutencao.findUnique({
      where: {
        id,
      },
    });

    if (!manutencao) {
      throw new NotFoundException('Manutenção não encontrada.');
    }

    const recebimentoEquipamento =
      await this.prisma.recebimentoEquipamento.findFirst({
        where: {
          manutencaoId: id,
        },
        include: {
          recebimento: true,
          fotos: true,
          manutencao: true,
        },
      });

    if (!recebimentoEquipamento) {
      return {
        manutencao,
        recebimento: null,
        mensagem: 'Esta manutenção não possui recebimento vinculado.',
      };
    }

    return {
      manutencao,
      recebimento: recebimentoEquipamento.recebimento,
      checklist: {
        retornouFisicamente: recebimentoEquipamento.retornouFisicamente,
        equipamentoConferido: recebimentoEquipamento.equipamentoConferido,
        possuiAvaria: recebimentoEquipamento.possuiAvaria,
        observacao: recebimentoEquipamento.observacao,
      },
      equipamentoRecebido: {
        tag: recebimentoEquipamento.tag,
        numeroSerie: recebimentoEquipamento.numeroSerie,
        tipoEquipamento: recebimentoEquipamento.tipoEquipamento,
        modelo: recebimentoEquipamento.modelo,
      },
      fotos: recebimentoEquipamento.fotos,
    };
  }
}
