import {
  OrigemManutencao,
  Prisma,
  StatusManutencao,
  StatusRecebimentoOperacional,
} from '@prisma/client';
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SynchroIntegrationService } from '../integracoes/synchro/synchro-integration.service';

@Injectable()
export class RecebimentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly synchroIntegrationService: SynchroIntegrationService,
  ) {}

  private normalizarTexto(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    const texto = String(value).trim();
    return texto.length > 0 ? texto : null;
  }

  private normalizarEquipamentoPayload(equipamento: any) {
    return {
      ...equipamento,
      equipamentoId:
        this.normalizarTexto(equipamento?.equipamentoId) ??
        this.normalizarTexto(equipamento?.equipamentoIdSynchro),
      tag: this.normalizarTexto(equipamento?.tag),
      numeroSerie: this.normalizarTexto(equipamento?.numeroSerie),
      tipoEquipamento:
        this.normalizarTexto(equipamento?.tipoEquipamento) ??
        this.normalizarTexto(equipamento?.tipoEquipamentoNome) ??
        this.normalizarTexto(equipamento?.tipo) ??
        this.normalizarTexto(equipamento?.nomeTipoEquipamento),
      modelo:
        this.normalizarTexto(equipamento?.modelo) ??
        this.normalizarTexto(equipamento?.modeloEquipamento) ??
        this.normalizarTexto(equipamento?.descricaoModelo),
      observacao: this.normalizarTexto(equipamento?.observacao),
    };
  }

  private validarEquipamentosRecebidos(
    equipamentos: any[],
    arquivos: Express.Multer.File[],
  ) {
    for (const equipamento of equipamentos) {
      const identificador = equipamento.tag ?? equipamento.numeroSerie;

      if (!identificador) {
        throw new BadRequestException(
          'Todo equipamento precisa ter TAG ou número de série.',
        );
      }

      if (!equipamento.retornouFisicamente) {
        throw new BadRequestException(
          `O equipamento ${identificador} precisa estar marcado como retornou fisicamente.`,
        );
      }

      if (!equipamento.equipamentoConferido) {
        throw new BadRequestException(
          `O equipamento ${identificador} precisa estar marcado como conferido.`,
        );
      }

      const fotosDoEquipamento = arquivos.filter((arquivo) => {
        return arquivo.originalname.includes(identificador);
      });

      const temFotoGeral = fotosDoEquipamento.some((arquivo) =>
        arquivo.originalname.toUpperCase().includes('GERAL'),
      );

      const temFotoIdentificacao = fotosDoEquipamento.some((arquivo) =>
        arquivo.originalname.toUpperCase().includes('IDENTIFICACAO'),
      );

      const temFotoAvaria = fotosDoEquipamento.some((arquivo) =>
        arquivo.originalname.toUpperCase().includes('AVARIA'),
      );

      if (!temFotoGeral) {
        throw new BadRequestException(
          `O equipamento ${identificador} precisa ter foto geral.`,
        );
      }

      if (!temFotoIdentificacao) {
        throw new BadRequestException(
          `O equipamento ${identificador} precisa ter foto de identificação/TAG.`,
        );
      }

      if (equipamento.possuiAvaria && !temFotoAvaria) {
        throw new BadRequestException(
          `O equipamento ${identificador} possui avaria e precisa ter foto da avaria.`,
        );
      }

      if (!equipamento.tipoEquipamento) {
        throw new BadRequestException(
          `O equipamento ${identificador} precisa informar o tipo de equipamento.`,
        );
      }

      if (!equipamento.modelo) {
        throw new BadRequestException(
          `O equipamento ${identificador} precisa informar o modelo.`,
        );
      }
    }
  }

  async criarRecebimento(dadosRaw: string, arquivos: Express.Multer.File[]) {
    if (!dadosRaw) {
      throw new BadRequestException('Campo dados é obrigatório.');
    }

    let dados: any;

    try {
      const dadosNormalizados = dadosRaw.replace(/^\uFEFF/, '').trim();
      dados = JSON.parse(dadosNormalizados);
    } catch {
      throw new BadRequestException('Campo dados precisa ser um JSON válido.');
    }

    if (!dados.numeroOs) {
      throw new BadRequestException('Número da OS é obrigatório.');
    }

    if (!Array.isArray(dados.equipamentos) || dados.equipamentos.length === 0) {
      throw new BadRequestException(
        'É necessário enviar ao menos um equipamento.',
      );
    }

    const equipamentosNormalizados = dados.equipamentos.map((equipamento: any) =>
      this.normalizarEquipamentoPayload(equipamento),
    );

    this.validarEquipamentosRecebidos(equipamentosNormalizados, arquivos);

    const recebimentoCriado = await this.prisma.$transaction(async (tx) => {
      const recebimento = await tx.recebimentoOperacional.create({
        data: {
          osIdSynchro: dados.osId?.toString() ?? null,
          numeroOs: dados.numeroOs,
          cliente: dados.cliente ?? null,
          descricaoOperacao: dados.descricaoOperacao ?? null,
          statusOperacao: dados.status ?? null,
          statusRecebimento: StatusRecebimentoOperacional.PENDENTE_SYNCHRO,
          sincronizadoSynchro: false,
          dataRecebimento: dados.dataRecebimento
            ? new Date(dados.dataRecebimento)
            : new Date(),
        },
      });

      for (const equipamento of equipamentosNormalizados) {
        const filtrosRecebimentoEquipamento: Prisma.RecebimentoEquipamentoWhereInput[] = [];

        if (equipamento.equipamentoId) {
          filtrosRecebimentoEquipamento.push({
            equipamentoIdSynchro: equipamento.equipamentoId.toString(),
          });
        }

        if (equipamento.tag) {
          filtrosRecebimentoEquipamento.push({
            tag: equipamento.tag,
          });
        }

        if (equipamento.numeroSerie) {
          filtrosRecebimentoEquipamento.push({
            numeroSerie: equipamento.numeroSerie,
          });
        }

        const recebimentoEquipamentoExistente =
          filtrosRecebimentoEquipamento.length
            ? await tx.recebimentoEquipamento.findFirst({
                where: {
                  OR: filtrosRecebimentoEquipamento,
                  recebimento: {
                    numeroOs: dados.numeroOs,
                  },
                },
              })
            : null;

        if (recebimentoEquipamentoExistente) {
          throw new BadRequestException(
            `O equipamento ${equipamento.tag ?? equipamento.numeroSerie ?? equipamento.equipamentoId} já foi recebido para a OS ${dados.numeroOs}.`,
          );
        }

        const filtrosEquipamento: Prisma.ManutencaoWhereInput[] = [];

        if (equipamento.tag) {
          filtrosEquipamento.push({
            tag: equipamento.tag,
          });
        }

        const manutencaoExistente = filtrosEquipamento.length
          ? await tx.manutencao.findFirst({
              where: {
                OR: filtrosEquipamento,
                ativo: true,
                excluidoEm: null,
                statusManutencao: {
                  not: StatusManutencao.CONCLUIDA,
                },
              },
            })
          : null;

        if (manutencaoExistente) {
          throw new BadRequestException(
            `Já existe manutenção aberta para o equipamento ${equipamento.tag ?? equipamento.numeroSerie}.`,
          );
        }

        const manutencao = await tx.manutencao.create({
          data: {
            origem: OrigemManutencao.APP_RECEBIMENTO,
            tipoEquipamentoNome: equipamento.tipoEquipamento,
            modeloEquipamento: equipamento.modelo,
            tag: equipamento.tag ?? null,
            situacaoEquipamento: 'Retornou para a base',
            dataRetornoBase: dados.dataRecebimento
              ? new Date(dados.dataRecebimento)
              : new Date(),
            statusManutencao: StatusManutencao.EM_QUARENTENA,
            diagnostico: equipamento.observacao ?? null,
          },
        });

        const recebimentoEquipamento = await tx.recebimentoEquipamento.create({
          data: {
            recebimentoId: recebimento.id,
            manutencaoId: manutencao.id,
            equipamentoIdSynchro: equipamento.equipamentoId?.toString() ?? null,
            tag: equipamento.tag ?? null,
            numeroSerie: equipamento.numeroSerie ?? null,
            tipoEquipamento: equipamento.tipoEquipamento,
            modelo: equipamento.modelo,
            retornouFisicamente: equipamento.retornouFisicamente ?? false,
            equipamentoConferido: equipamento.equipamentoConferido ?? false,
            possuiAvaria: equipamento.possuiAvaria ?? false,
            observacao: equipamento.observacao ?? null,
          },
        });

        const fotosDoEquipamento = arquivos.filter((arquivo) => {
          return arquivo.originalname.includes(equipamento.tag);
        });

        for (const foto of fotosDoEquipamento) {
          await tx.fotoRecebimentoEquipamento.create({
            data: {
              recebimentoEquipamentoId: recebimentoEquipamento.id,
              tag: equipamento.tag ?? null,
              numeroSerie: equipamento.numeroSerie ?? null,
              tipoFoto: this.identificarTipoFoto(foto.originalname),
              nomeArquivo: foto.filename,
              caminhoArquivo: `/uploads/recebimentos/${foto.filename}`,
            },
          });
        }
      }

      return tx.recebimentoOperacional.findUnique({
        where: {
          id: recebimento.id,
        },
        include: {
          equipamentos: {
            include: {
              manutencao: true,
              fotos: true,
            },
          },
        },
      });
    });

    if (!recebimentoCriado) {
      throw new InternalServerErrorException(
        'Recebimento criado, mas não foi possível carregar o registro completo.',
      );
    }

    let sincronizadoSynchro = false;
    let erroSincronizacaoSynchro: string | null = null;

    try {
      sincronizadoSynchro =
        await this.synchroIntegrationService.marcarEquipamentosComoRetornados({
          osId: dados.osId?.toString() ?? null,
          numeroOs: dados.numeroOs,
          dataRecebimento: dados.dataRecebimento ?? new Date().toISOString(),
          equipamentos: equipamentosNormalizados.map((equipamento) => ({
            equipamentoId: equipamento.equipamentoId?.toString() ?? null,
            tag: equipamento.tag ?? null,
            numeroSerie: equipamento.numeroSerie ?? null,
          })),
        });
    } catch (error) {
      erroSincronizacaoSynchro =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao sincronizar com Synchro.';
    }

    const statusRecebimento = sincronizadoSynchro
      ? StatusRecebimentoOperacional.SINCRONIZADO_SYNCHRO
      : StatusRecebimentoOperacional.PENDENTE_SYNCHRO;

    const recebimentoAtualizado =
      await this.prisma.recebimentoOperacional.update({
        where: {
          id: recebimentoCriado.id,
        },
        data: {
          sincronizadoSynchro,
          erroSincronizacaoSynchro,
          dataSincronizacaoSynchro: sincronizadoSynchro ? new Date() : null,
          statusRecebimento,
        },
        include: {
          equipamentos: {
            include: {
              manutencao: true,
              fotos: true,
            },
          },
        },
      });

    return recebimentoAtualizado;
  }

  async listar(filtros: {
    numeroOs?: string;
    tag?: string;
    numeroSerie?: string;
    sincronizadoSynchro?: string;
    statusRecebimento?: StatusRecebimentoOperacional;
  }) {
    const where: any = {};

    if (filtros.numeroOs) {
      where.numeroOs = {
        contains: filtros.numeroOs,
        mode: 'insensitive',
      };
    }

    if (filtros.sincronizadoSynchro !== undefined) {
      where.sincronizadoSynchro = filtros.sincronizadoSynchro === 'true';
    }

    if (filtros.statusRecebimento) {
      where.statusRecebimento = filtros.statusRecebimento;
    }

    if (filtros.tag || filtros.numeroSerie) {
      where.equipamentos = {
        some: {
          ...(filtros.tag
            ? {
                tag: {
                  contains: filtros.tag,
                  mode: 'insensitive',
                },
              }
            : {}),
          ...(filtros.numeroSerie
            ? {
                numeroSerie: {
                  contains: filtros.numeroSerie,
                  mode: 'insensitive',
                },
              }
            : {}),
        },
      };
    }

    return this.prisma.recebimentoOperacional.findMany({
      where,
      include: {
        equipamentos: {
          include: {
            manutencao: true,
            fotos: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async buscarPorId(id: string) {
    return this.prisma.recebimentoOperacional.findUnique({
      where: {
        id,
      },
      include: {
        equipamentos: {
          include: {
            fotos: true,
          },
        },
      },
    });
  }

  private identificarTipoFoto(nomeArquivo: string): string {
    const nome = nomeArquivo.toUpperCase();

    if (nome.includes('IDENTIFICACAO')) {
      return 'IDENTIFICACAO';
    }

    if (nome.includes('AVARIA')) {
      return 'AVARIA';
    }

    return 'GERAL';
  }

  async buscarPorNumeroOs(numeroOs: string) {
    const recebimentos = await this.prisma.recebimentoOperacional.findMany({
      where: {
        numeroOs,
      },
      include: {
        equipamentos: {
          include: {
            manutencao: true,
            fotos: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    if (recebimentos.length === 0) {
      return {
        numeroOs,
        recebido: false,
        mensagem: 'Nenhum recebimento encontrado para esta OS.',
        recebimentos: [],
      };
    }

    return {
      numeroOs,
      recebido: true,
      totalRecebimentos: recebimentos.length,
      ultimoRecebimento: recebimentos[0],
      recebimentos,
    };
  }

  async listarEquipamentosRecebidos() {
    const equipamentos = await this.prisma.recebimentoEquipamento.findMany({
      where: {
        retornouFisicamente: true,
      },
      select: {
        equipamentoIdSynchro: true,
        tag: true,
        numeroSerie: true,
        recebimento: {
          select: {
            numeroOs: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    const unicos = new Map<
      string,
      {
        numeroOs: string;
        equipamentoIdSynchro: string;
        tag: string;
        numeroSerie: string;
      }
    >();

    for (const equipamento of equipamentos) {
      const numeroOs = equipamento.recebimento.numeroOs ?? '';
      const equipamentoIdSynchro = equipamento.equipamentoIdSynchro ?? '';
      const tag = equipamento.tag ?? '';
      const numeroSerie = equipamento.numeroSerie ?? '';
      const chave = `${numeroOs}|${equipamentoIdSynchro}|${tag}|${numeroSerie}`;

      if (!unicos.has(chave)) {
        unicos.set(chave, {
          numeroOs,
          equipamentoIdSynchro,
          tag,
          numeroSerie,
        });
      }
    }

    return Array.from(unicos.values());
  }

  async reprocessarSincronizacaoSynchro(id: string) {
    const recebimento = await this.prisma.recebimentoOperacional.findUnique({
      where: {
        id,
      },
      include: {
        equipamentos: true,
      },
    });

    if (!recebimento) {
      throw new BadRequestException('Recebimento não encontrado.');
    }

    if (recebimento.sincronizadoSynchro) {
      return {
        mensagem: 'Este recebimento já está sincronizado com o Synchro.',
        recebimento,
      };
    }

    let sincronizadoSynchro = false;
    let erroSincronizacaoSynchro: string | null = null;

    try {
      sincronizadoSynchro =
        await this.synchroIntegrationService.marcarEquipamentosComoRetornados({
          osId: recebimento.osIdSynchro,
          numeroOs: recebimento.numeroOs,
          dataRecebimento: recebimento.dataRecebimento.toISOString(),
          equipamentos: recebimento.equipamentos.map((equipamento) => ({
            equipamentoId: equipamento.equipamentoIdSynchro,
            tag: equipamento.tag,
            numeroSerie: equipamento.numeroSerie,
          })),
        });
    } catch (error) {
      erroSincronizacaoSynchro =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao sincronizar com Synchro.';
    }

    const statusRecebimento = sincronizadoSynchro
      ? StatusRecebimentoOperacional.SINCRONIZADO_SYNCHRO
      : StatusRecebimentoOperacional.PENDENTE_SYNCHRO;

    const recebimentoAtualizado =
      await this.prisma.recebimentoOperacional.update({
        where: {
          id,
        },
        data: {
          sincronizadoSynchro,
          erroSincronizacaoSynchro,
          dataSincronizacaoSynchro: sincronizadoSynchro ? new Date() : null,
          statusRecebimento,
        },
        include: {
          equipamentos: {
            include: {
              manutencao: true,
              fotos: true,
            },
          },
        },
      });

    return {
      mensagem: sincronizadoSynchro
        ? 'Recebimento sincronizado com o Synchro com sucesso.'
        : 'Não foi possível sincronizar com o Synchro.',
      recebimento: recebimentoAtualizado,
    };
  }
}
