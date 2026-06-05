import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusProducao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLoteProducaoDto } from './dto/create-lote-producao.dto';
import { UpdateLoteProducaoDto } from './dto/update-lote-producao.dto';

@Injectable()
export class LotesProducaoService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDateInput(data?: string | Date | null): Date | null {
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

  private normalizarInicioDoDiaUTC(data: Date): Date {
    return new Date(
      Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate()),
    );
  }

  private montarNumeroSerie(
    modelo?: string | null,
    numeroLote?: number | null,
    numeroOrdem?: number | null,
  ) {
    if (!modelo || !numeroLote || !numeroOrdem) {
      return null;
    }

    return `${modelo}-${numeroLote}-${numeroOrdem}`;
  }

  private calcularDiasProducao(
    dataInicio?: Date | null,
    dataTermino?: Date | null,
  ): number | null {
    if (!dataInicio) {
      return null;
    }

    const dataFinal = dataTermino ?? new Date();

    const inicio = this.normalizarInicioDoDiaUTC(new Date(dataInicio));
    const fim = this.normalizarInicioDoDiaUTC(new Date(dataFinal));

    const diffMs = fim.getTime() - inicio.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

    return diffDias >= 1 ? diffDias : 1;
  }

  private calcularPrazoProducao(
    statusProducao?: string | null,
    dataNecessidade?: Date | null,
    previsaoTermino?: Date | null,
    dataTermino?: Date | null,
  ) {
    const dataBasePrazo = dataNecessidade ?? previsaoTermino;

    if (!dataBasePrazo) {
      return {
        situacaoPrazo: null,
        resultadoPrazo: null,
      };
    }

    const prazo = this.normalizarInicioDoDiaUTC(new Date(dataBasePrazo));

    if (statusProducao === 'CONCLUIDA') {
      if (!dataTermino) {
        return {
          situacaoPrazo: 'CONCLUIDA',
          resultadoPrazo: null,
        };
      }

      const termino = this.normalizarInicioDoDiaUTC(new Date(dataTermino));

      return {
        situacaoPrazo: 'CONCLUIDA',
        resultadoPrazo:
          termino.getTime() <= prazo.getTime()
            ? 'CONCLUIDA_NO_PRAZO'
            : 'CONCLUIDA_COM_ATRASO',
      };
    }

    const hoje = this.normalizarInicioDoDiaUTC(new Date());

    if (hoje.getTime() < prazo.getTime()) {
      return {
        situacaoPrazo: 'NO_PRAZO',
        resultadoPrazo: null,
      };
    }

    if (hoje.getTime() === prazo.getTime()) {
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

  private adicionarCamposCalculados(lote: any) {
    const deveCalcularProducao =
      lote.statusProducao === StatusProducao.EM_ANDAMENTO;
    const deveCalcularParalisacao =
      lote.statusProducao === StatusProducao.PARALISADA;

    const prazo = this.calcularPrazoProducao(
      lote.statusProducao,
      lote.dataNecessidade,
      lote.previsaoTermino,
      lote.dataTermino,
    );

    return {
      ...lote,
      diasSolicitacao: this.calcularDiasProducao(
        lote.dataSolicitacao ?? null,
        lote.dataInicio ?? null,
      ),
      diasProducao: deveCalcularProducao
        ? this.calcularDiasProducao(
            lote.dataInicio ?? null,
            lote.dataTermino ?? null,
          )
        : null,
      diasParalisacao: deveCalcularParalisacao
        ? this.calcularDiasProducao(
            lote.dataParalisacao ?? null,
            lote.dataTermino ?? null,
          )
        : null,
      situacaoPrazo: prazo.situacaoPrazo,
      resultadoPrazo: prazo.resultadoPrazo,
    };
  }

  private montarDataAtualizacaoLote(
    loteAtual: {
      dataParalisacao?: Date | null;
      statusProducao?: string | null;
    },
    data: UpdateLoteProducaoDto,
  ): Prisma.LoteProducaoUncheckedUpdateInput {
    const statusFinal: string | null =
      data.statusProducao ?? loteAtual.statusProducao ?? null;
    const dataAtualizacao: Prisma.LoteProducaoUncheckedUpdateInput = {
      tipoEquipamentoId: data.tipoEquipamentoId,
      modelo: data.modelo,
      descricao: data.descricao,
      solicitante: data.solicitante,
      quantidade: data.quantidade,
      dataSolicitacao: data.dataSolicitacao
        ? this.parseDateInput(data.dataSolicitacao)
        : undefined,
      dataInicio: data.dataInicio
        ? this.parseDateInput(data.dataInicio)
        : undefined,
      dataNecessidade: data.dataNecessidade
        ? this.parseDateInput(data.dataNecessidade)
        : undefined,
      previsaoTermino: data.previsaoTermino
        ? this.parseDateInput(data.previsaoTermino)
        : undefined,
      dataTermino: data.dataTermino
        ? this.parseDateInput(data.dataTermino)
        : undefined,
      statusProducao: data.statusProducao,
    };

    if (data.dataParalisacao !== undefined) {
      dataAtualizacao.dataParalisacao = data.dataParalisacao
        ? this.parseDateInput(data.dataParalisacao)
        : null;
    } else if (statusFinal === StatusProducao.PARALISADA) {
      dataAtualizacao.dataParalisacao = loteAtual.dataParalisacao ?? new Date();
    } else if (
      loteAtual.statusProducao === StatusProducao.PARALISADA &&
      statusFinal !== StatusProducao.PARALISADA
    ) {
      dataAtualizacao.dataParalisacao = null;
    }

    return dataAtualizacao;
  }

  async create(data: CreateLoteProducaoDto) {
    if (data.quantidade <= 0) {
      throw new BadRequestException('A quantidade deve ser maior que zero.');
    }

    if (data.tipoEquipamentoId) {
      const tipoEquipamento = await this.prisma.tipoEquipamento.findUnique({
        where: {
          id: data.tipoEquipamentoId,
        },
      });

      if (!tipoEquipamento) {
        throw new NotFoundException('Tipo de equipamento não encontrado.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const lote = await tx.loteProducao.create({
        data: {
          tipoEquipamentoId: data.tipoEquipamentoId,
          modelo: data.modelo,
          descricao: data.descricao,
          solicitante: data.solicitante,
          quantidade: data.quantidade,
          dataSolicitacao: data.dataSolicitacao
            ? this.parseDateInput(data.dataSolicitacao)
            : null,
          dataInicio: data.dataInicio
            ? this.parseDateInput(data.dataInicio)
            : null,
          dataNecessidade: data.dataNecessidade
            ? this.parseDateInput(data.dataNecessidade)
            : null,
          previsaoTermino: data.previsaoTermino
            ? this.parseDateInput(data.previsaoTermino)
            : null,
          dataTermino: data.dataTermino
            ? this.parseDateInput(data.dataTermino)
            : null,
          dataParalisacao:
            data.statusProducao === StatusProducao.PARALISADA
              ? data.dataParalisacao
                ? this.parseDateInput(data.dataParalisacao)
                : new Date()
              : data.dataParalisacao
                ? this.parseDateInput(data.dataParalisacao)
                : null,
          statusProducao: data.statusProducao ?? StatusProducao.PROGRAMADA,
        },
      });

      for (let i = 0; i < data.quantidade; i++) {
        const equipamento = await tx.equipment.create({
          data: {
            loteProducaoId: lote.id,

            listaPecas: null,
            sequenciaMontagem: null,
            inspecaoMontagem: null,
            historicoEquipamento: null,
            procedimentoTesteInspecaoMontagem: null,

            registrosInspecaoMontagem: {
              create: Array.from({ length: 18 }, (_, index) => ({
                ordem: index + 1,
              })),
            },
          },
        });

        const identificadorEquipamento = this.montarNumeroSerie(
          lote.modelo,
          lote.numeroLote,
          equipamento.numeroOrdem,
        );

        await tx.equipment.update({
          where: {
            id: equipamento.id,
          },
          data: {
            numeroSerie: identificadorEquipamento,
            tag: identificadorEquipamento,
          },
        });
      }

      const loteCompleto = await tx.loteProducao.findUnique({
        where: {
          id: lote.id,
        },
        include: {
          tipoEquipamento: true,
          equipamentos: {
            orderBy: {
              numeroOrdem: 'asc',
            },
          },
        },
      });

      return this.adicionarCamposCalculados(loteCompleto);
    });
  }

  async findAll() {
    const lotes = await this.prisma.loteProducao.findMany({
      where: {
        ativo: true,
      },
      include: {
        tipoEquipamento: true,
        equipamentos: {
          select: {
            id: true,
            numeroOrdem: true,
            numeroSerie: true,
            tag: true,
          },
          orderBy: {
            numeroOrdem: 'asc',
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return lotes.map((lote) => this.adicionarCamposCalculados(lote));
  }

  async findOne(id: string) {
    const lote = await this.prisma.loteProducao.findFirst({
      where: {
        id,
        ativo: true,
      },
      include: {
        tipoEquipamento: true,
        equipamentos: {
          orderBy: {
            numeroOrdem: 'asc',
          },
        },
      },
    });

    if (!lote) {
      throw new NotFoundException('Lote de produção não encontrado.');
    }

    return this.adicionarCamposCalculados(lote);
  }

  async update(id: string, data: UpdateLoteProducaoDto) {
    const loteAtual = await this.findOne(id);

    if (data.tipoEquipamentoId) {
      const tipoEquipamento = await this.prisma.tipoEquipamento.findUnique({
        where: {
          id: data.tipoEquipamentoId,
        },
      });

      if (!tipoEquipamento) {
        throw new NotFoundException('Tipo de equipamento não encontrado.');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const loteAtualizado = await tx.loteProducao.update({
        where: {
          id,
        },
        data: this.montarDataAtualizacaoLote(loteAtual, data),
        include: {
          tipoEquipamento: true,
          equipamentos: {
            orderBy: {
              numeroOrdem: 'asc',
            },
          },
        },
      });

      if (data.modelo !== undefined && data.modelo !== loteAtual.modelo) {
        const equipamentos = await tx.equipment.findMany({
          where: {
            loteProducaoId: id,
            ativo: true,
          },
          select: {
            id: true,
            numeroOrdem: true,
          },
        });

        for (const equipamento of equipamentos) {
          const identificadorEquipamento = this.montarNumeroSerie(
            data.modelo,
            loteAtualizado.numeroLote,
            equipamento.numeroOrdem,
          );

          await tx.equipment.update({
            where: {
              id: equipamento.id,
            },
            data: {
              numeroSerie: identificadorEquipamento,
              tag: identificadorEquipamento,
            },
          });
        }
      }

      const loteCompleto = await tx.loteProducao.findUnique({
        where: {
          id,
        },
        include: {
          tipoEquipamento: true,
          equipamentos: {
            orderBy: {
              numeroOrdem: 'asc',
            },
          },
        },
      });

      return this.adicionarCamposCalculados(loteCompleto);
    });
  }

  async findEquipamentos(id: string) {
    await this.findOne(id);

    return this.prisma.equipment.findMany({
      where: {
        loteProducaoId: id,
        ativo: true,
      },
      orderBy: {
        numeroOrdem: 'asc',
      },
      include: {
        loteProducao: {
          include: {
            tipoEquipamento: true,
          },
        },
        itensSeriados: true,
        registrosInspecaoMontagem: {
          orderBy: {
            ordem: 'asc',
          },
        },
        observacoes: {
          orderBy: {
            criadoEm: 'desc',
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.loteProducao.update({
      where: {
        id,
      },
      data: {
        ativo: false,
        excluidoEm: new Date(),
      },
    });
  }
}
