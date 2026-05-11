import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrigemManutencao, Prisma, StatusManutencao } from '@prisma/client';
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

    return dias >= 1 ? dias : 1;
  }

  private adicionarDiasManutencao<T extends { 
    dataRetornoBase?: Date | null;
    dataInicio?: Date | null;
    dataTermino?: Date | null;
    statusManutencao?: string | null;
  }>(
    manutencao: T,
  ) {
    const deveCalcular = manutencao.statusManutencao === 'EM_MANUTENCAO';
    const deveCalcularEspera =
      Boolean(manutencao.dataRetornoBase) &&
      (manutencao.statusManutencao === 'PENDENTE' || Boolean(manutencao.dataInicio));

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
    };
  }

  private montarWhere(filters: FilterManutencaoDto): Prisma.ManutencaoWhereInput {
    const where: Prisma.ManutencaoWhereInput = {
      ativo: true,
    };

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

    return where;
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

  async create(data: CreateManutencaoDto) {
    const manutencao = await this.prisma.manutencao.create({
      data: {
        origem: OrigemManutencao.MANUAL,
        tipoEquipamentoNome: data.tipoEquipamentoNome,
        modeloEquipamento: data.modeloEquipamento,
        numeroSerie: data.numeroSerie,
        tag: data.tag,
        situacaoEquipamento: data.situacaoEquipamento,
        dataRetornoBase: data.dataRetornoBase
          ? new Date(data.dataRetornoBase)
          : null,
        dataInicio: data.dataInicio ? new Date(data.dataInicio) : null,
        previsaoTermino: data.previsaoTermino
          ? new Date(data.previsaoTermino)
          : null,
        diagnostico: data.diagnostico,
        responsavelManutencao: data.responsavelManutencao,
        statusManutencao: data.statusManutencao ?? StatusManutencao.EM_MANUTENCAO,
        avaliacaoFinalConforme: data.avaliacaoFinalConforme,
      },
    });

    return this.adicionarDiasManutencao(manutencao);
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
  }

  async findOne(id: string) {
    const manutencao = await this.prisma.manutencao.findUnique({
      where: { 
        id, 
        ativo: true 
      },
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

    if (manutencaoAtual.statusManutencao === StatusManutencao.CONCLUIDA) {
      throw new BadRequestException(
        'Manutencao concluida nao pode ser editada.',
      );
    }

    const novosDados = {
      tipoEquipamentoNome: data.tipoEquipamentoNome,
      modeloEquipamento: data.modeloEquipamento,
      numeroSerie: data.numeroSerie,
      tag: data.tag,
      situacaoEquipamento: data.situacaoEquipamento,
      dataRetornoBase: data.dataRetornoBase ? new Date(data.dataRetornoBase) : undefined,
      diagnostico: data.diagnostico,
      responsavelManutencao: data.responsavelManutencao,
      statusManutencao: data.statusManutencao,
      avaliacaoFinalConforme: data.avaliacaoFinalConforme,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      previsaoTermino: data.previsaoTermino ? new Date(data.previsaoTermino) : undefined,
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
      'tipoEquipamentoNome',
      'modeloEquipamento',
      'numeroSerie',
      'tag',
      'situacaoEquipamento',
      'dataRetornoBase',
      'diagnostico',
      'responsavelManutencao',
      'statusManutencao',
      'avaliacaoFinalConforme',
      'dataInicio',
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
      { header: 'Tipo de Equipamento', key: 'tipoEquipamentoNome', width: 24 },
      { header: 'Modelo', key: 'modeloEquipamento', width: 28 },
      { header: 'Número de Série', key: 'numeroSerie', width: 24 },
      { header: 'TAG', key: 'tag', width: 18 },
      { header: 'Situação do Equipamento', key: 'situacaoEquipamento', width: 26 },
      { header: 'Data de Retorno à Base', key: 'dataRetornoBase', width: 22 },
      { header: 'Data de Início', key: 'dataInicio', width: 18 },
      { header: 'Data de Término', key: 'dataTermino', width: 18 },
      { header: 'Dias de Manutenção', key: 'diasManutencao', width: 20 },
      { header: 'Status da Manutenção', key: 'statusManutencao', width: 24 },
      { header: 'Responsável', key: 'responsavelManutencao', width: 24 },
      { header: 'Diagnóstico', key: 'diagnostico', width: 45 },
      { header: 'Origem', key: 'origem', width: 14 },
      { header: 'Criado em', key: 'criadoEm', width: 20 },
    ];

    dados.forEach((manutencao) => {
      worksheet.addRow({
        tipoEquipamentoNome: manutencao.tipoEquipamentoNome,
        modeloEquipamento: manutencao.modeloEquipamento,
        numeroSerie: manutencao.numeroSerie,
        tag: manutencao.tag,
        situacaoEquipamento: manutencao.situacaoEquipamento,
        dataRetornoBase: manutencao.dataRetornoBase,
        dataInicio: manutencao.dataInicio,
        dataTermino: manutencao.dataTermino,
        diasManutencao: manutencao.diasManutencao,
        statusManutencao: manutencao.statusManutencao,
        responsavelManutencao: manutencao.responsavelManutencao,
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
    worksheet.getColumn('dataTermino').numFmt = 'dd/MM/yyyy';
    worksheet.getColumn('criadoEm').numFmt = 'dd/MM/yyyy HH:mm:ss';

    worksheet.autoFilter = {
      from: 'A1',
      to: 'N1',
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
}
