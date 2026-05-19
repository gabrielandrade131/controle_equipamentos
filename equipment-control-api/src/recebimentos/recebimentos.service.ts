import { OrigemManutencao, Prisma, StatusManutencao } from '@prisma/client';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecebimentosService {
  constructor(private readonly prisma: PrismaService) {}

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
    const recebimentoExistente =
        await this.prisma.recebimentoOperacional.findFirst({
        where: {
            numeroOs: dados.numeroOs,
        },
    });

    if (recebimentoExistente) {
        throw new BadRequestException(
            `A OS ${dados.numeroOs} já possui recebimento registrado.`,
        );
    }

    if (!Array.isArray(dados.equipamentos) || dados.equipamentos.length === 0) {
      throw new BadRequestException('É necessário enviar ao menos um equipamento.');
    }


    
    this.validarEquipamentosRecebidos(dados.equipamentos, arquivos);

    return this.prisma.$transaction(async (tx) => {
      const recebimento = await tx.recebimentoOperacional.create({
        data: {
          osIdSynchro: dados.osId?.toString() ?? null,
          numeroOs: dados.numeroOs,
          cliente: dados.cliente ?? null,
          descricaoOperacao: dados.descricaoOperacao ?? null,
          statusOperacao: dados.status ?? null,
          dataRecebimento: dados.dataRecebimento
            ? new Date(dados.dataRecebimento)
            : new Date(),
        },
      });

      for (const equipamento of dados.equipamentos) {
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
        tipoEquipamentoNome: equipamento.tipoEquipamento ?? null,
        modeloEquipamento: equipamento.modelo ?? null,
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
        tipoEquipamento: equipamento.tipoEquipamento ?? null,
        modelo: equipamento.modelo ?? null,
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
  }

  async listar() {
    return this.prisma.recebimentoOperacional.findMany({
      include: {
        equipamentos: {
          include: {
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
}
