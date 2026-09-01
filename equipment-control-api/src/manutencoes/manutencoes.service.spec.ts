import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ManutencoesService } from './manutencoes.service';

describe('ManutencoesService', () => {
  let service: ManutencoesService;
  let prisma: {
    manutencao: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    historicoManutencao: {
      createMany: jest.Mock;
      findMany: jest.Mock;
    };
    tipoEquipamento: {
      findFirst: jest.Mock;
    };
    equipment: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      manutencao: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      historicoManutencao: {
        createMany: jest.fn(),
        findMany: jest.fn(),
      },
      tipoEquipamento: {
        findFirst: jest.fn(),
      },
      equipment: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
    };

    service = new ManutencoesService(prisma as unknown as PrismaService);
  });

  it('rejects synchro import when situacao is invalid', async () => {
    await expect(
      service.createFromSynchro({
        situacaoEquipamento: 'Em uso',
        tag: 'TAG-1',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates an existing synchro maintenance', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      ativo: true,
    });
    prisma.manutencao.update.mockResolvedValue({
      id: 'man-1',
      tag: 'TAG-1',
      synchroId: 'syn-1',
      ativo: true,
    });

    const result = await service.createFromSynchro({
      synchroId: 'syn-1',
      situacaoEquipamento: 'retornou_base',
      tipoEquipamentoNome: 'Gerador',
      modeloEquipamento: 'MX',
      tag: 'TAG-1',
      dataRetornoBase: '2024-01-10',
    });

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'man-1' },
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'man-1',
        tag: 'TAG-1',
      }),
    );
  });

  it('lists maintenances with pagination and calculated days', async () => {
    prisma.manutencao.findMany.mockResolvedValue([
      {
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        dataInicio: new Date('2024-01-01T00:00:00.000Z'),
        dataTermino: new Date('2024-01-03T00:00:00.000Z'),
      },
    ]);
    prisma.manutencao.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data[0].diasManutencao).toBe(2);
    expect(result.totalPages).toBe(1);
  });

  it('keeps calculated maintenance days after conclusion', async () => {
    prisma.manutencao.findMany.mockResolvedValue([
      {
        id: 'man-1',
        statusManutencao: 'CONCLUIDA',
        dataInicio: new Date('2024-01-01T00:00:00.000Z'),
        dataTermino: new Date('2024-01-03T00:00:00.000Z'),
      },
    ]);
    prisma.manutencao.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data[0].diasManutencao).toBe(2);
  });

  it('persists manufacturer and inspection data when creating maintenance', async () => {
    prisma.manutencao.create.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'EM_MANUTENCAO',
      fabricante: 'WEG',
      dadosInspecao: { certificacoes: [] },
      imagensAnexadas: '[]',
    });

    await service.create({
      fabricante: 'WEG',
      dadosInspecao: { certificacoes: [] },
      imagensAnexadas: '[]',
    } as any);

    expect(prisma.manutencao.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          fabricante: 'WEG',
          dadosInspecao: { certificacoes: [] },
          imagensAnexadas: '[]',
        }),
      }),
    );
  });

  it('updates manufacturer through the canonical fabricante field only', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'PENDENTE',
      tipoEquipamentoId: null,
      tipoEquipamentoNome: null,
      dataInicio: null,
      dataTermino: null,
      dataParalisacao: null,
      responsavelRevisao: null,
    });
    prisma.manutencao.update.mockResolvedValue({
      id: 'man-1',
      tag: 'TAG-1',
      statusManutencao: 'PENDENTE',
    });

    await service.update('man-1', { fabricante: 'WEG' });

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ fabricante: 'WEG' }),
      }),
    );
    expect(prisma.manutencao.update.mock.calls[0][0].data).not.toHaveProperty(
      'fabricanteEquipamento',
    );
  });

  it('calculates diasParalisacao when status is PARALISADA', async () => {
    prisma.manutencao.findMany.mockResolvedValue([
      {
        id: 'man-1',
        statusManutencao: 'PARALISADA',
        dataParalisacao: new Date('2024-01-01T00:00:00.000Z'),
        dataTermino: new Date('2024-01-03T00:00:00.000Z'),
      },
    ]);
    prisma.manutencao.count.mockResolvedValue(1);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.data[0].diasParalisacao).toBe(2);
  });

  it('throws when updating missing maintenance', async () => {
    prisma.manutencao.findUnique.mockResolvedValue(null);

    await expect(
      service.update('man-1', { tag: 'TAG-2' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects any update on concluded maintenance', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'CONCLUIDA',
    });

    await expect(
      service.update('man-1', { tag: 'TAG-2' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.update('man-1', { dadosInspecao: { certificacoes: [] } } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.update('man-1', { statusManutencao: 'EM_MANUTENCAO' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('saves inspection during EM_MANUTENCAO status', async () => {
    prisma.manutencao.findUnique
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        tag: 'TAG-1',
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        tag: 'TAG-1',
        dadosInspecao: { certificacoes: [] },
        avaliacaoFinalConforme: true,
        historicoAlteracoes: [],
      });
    prisma.manutencao.update.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'EM_MANUTENCAO',
      dadosInspecao: { certificacoes: [] },
      avaliacaoFinalConforme: true,
    });
    prisma.historicoManutencao.createMany.mockResolvedValue({ count: 2 });

    const result = await service.update(
      'man-1',
      {
        dadosInspecao: { certificacoes: [] },
        avaliacaoFinalConforme: true,
      } as any,
      { nome: 'Gabriel' },
    );

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'man-1' },
        data: expect.objectContaining({
          dadosInspecao: { certificacoes: [] },
          avaliacaoFinalConforme: true,
        }),
      }),
    );
    expect(result).toBeDefined();
  });

  it('rejects creating maintenance directly with CONCLUIDA status', async () => {
    await expect(
      service.create({
        statusManutencao: 'CONCLUIDA' as any,
        responsavelRevisao: 'Revisor',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects saving inspection when status is not EM_MANUTENCAO', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'PENDENTE',
    });

    await expect(
      service.update(
        'man-1',
        { dadosInspecao: { certificacoes: [] } } as any,
        { nome: 'Gabriel' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.update(
        'man-1',
        { imagensAnexadas: '["data:image/png;base64,..."]' } as any,
        { nome: 'Gabriel' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates history records when updating monitored fields', async () => {
    prisma.manutencao.findUnique
      .mockResolvedValueOnce({
        id: 'man-1',
        tag: 'TAG-1',
        statusManutencao: 'EM_MANUTENCAO',
      })
      .mockResolvedValueOnce({
        id: 'man-1',
        tag: 'TAG-2',
        statusManutencao: 'EM_MANUTENCAO',
        historicoAlteracoes: [],
      });
    prisma.manutencao.update.mockResolvedValue({ id: 'man-1' });
    prisma.historicoManutencao.createMany.mockResolvedValue({ count: 1 });

    await service.update('man-1', { tag: 'TAG-2' }, { nome: 'Gabriel' });

    expect(prisma.historicoManutencao.createMany).toHaveBeenCalledWith({
      data: [
        {
          manutencaoId: 'man-1',
          campo: 'tag',
          valorAnterior: 'TAG-1',
          valorNovo: 'TAG-2',
          alteradoPor: 'Gabriel',
        },
      ],
    });
  });

  it('persists the maintenance executor informed in the request', async () => {
    prisma.manutencao.findUnique
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        responsavelManutencao: 'Executor anterior',
      })
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'CONCLUIDA',
        responsavelManutencao: 'Executor informado',
        responsavelRevisao: 'Douglas Moreira Alves',
        historicoAlteracoes: [],
      });
    prisma.manutencao.update.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'CONCLUIDA',
      responsavelManutencao: 'Executor informado',
    });
    prisma.historicoManutencao.createMany.mockResolvedValue({ count: 2 });

    await service.update(
      'man-1',
      {
        statusManutencao: 'CONCLUIDA',
        responsavelManutencao: 'Executor informado',
      } as any,
      { nome: 'Douglas Alves', email: 'douglas.alves@ambipar.com' },
    );

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          responsavelManutencao: 'Executor informado',
          responsavelRevisao: 'Douglas Moreira Alves',
        }),
      }),
    );
    expect(prisma.historicoManutencao.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          campo: 'responsavelManutencao',
          valorNovo: 'Executor informado',
          alteradoPor: 'Douglas Alves',
        }),
      ]),
    });
  });

  it('rejects conclusion when user is not douglas.alves@ambipar.com', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'EM_MANUTENCAO',
    });

    await expect(
      service.update(
        'man-1',
        { statusManutencao: 'CONCLUIDA' } as any,
        { email: 'outro.usuario@ambipar.com' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('allows changing equipment type without failing when work dates keep the same day', async () => {
    prisma.manutencao.findUnique
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: new Date('2024-01-10T03:42:00.000Z'),
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-2',
        tipoEquipamentoNome: 'Bomba',
        dataInicio: new Date('2024-01-10T12:00:00.000Z'),
        historicoAlteracoes: [],
      });
    prisma.tipoEquipamento.findFirst.mockResolvedValue({
      id: 'tipo-2',
      nome: 'Bomba',
      ativo: true,
    });
    prisma.manutencao.update.mockResolvedValue({ id: 'man-1' });
    prisma.historicoManutencao.createMany.mockResolvedValue({ count: 1 });

    await expect(
      service.update(
        'man-1',
        {
          tipoEquipamentoId: 'tipo-2',
          dataInicio: '2024-01-10',
        } as any,
        { nome: 'Gabriel' },
      ),
    ).resolves.toEqual(expect.objectContaining({ id: 'man-1' }));

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tipoEquipamentoId: 'tipo-2',
          tipoEquipamentoNome: 'Bomba',
        }),
      }),
    );
  });

  it('sets dataInicio only on the first transition to in progress', async () => {
    prisma.tipoEquipamento.findFirst.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Motor',
      ativo: true,
    });

    prisma.manutencao.findUnique
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'PENDENTE',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: null,
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-1',
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: new Date('2024-01-10T12:00:00.000Z'),
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-2',
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: new Date('2024-01-10T12:00:00.000Z'),
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-2',
        statusManutencao: 'CONCLUIDA',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: new Date('2024-01-10T12:00:00.000Z'),
        dataTermino: new Date('2024-01-11T12:00:00.000Z'),
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-3',
        statusManutencao: 'PENDENTE',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: null,
        historicoAlteracoes: [],
      })
      .mockResolvedValueOnce({
        id: 'man-3',
        statusManutencao: 'CONCLUIDA',
        tipoEquipamentoId: 'tipo-1',
        tipoEquipamentoNome: 'Motor',
        dataInicio: null,
        dataTermino: new Date('2024-01-11T12:00:00.000Z'),
        historicoAlteracoes: [],
      });

    prisma.manutencao.update
      .mockResolvedValueOnce({ id: 'man-1' })
      .mockResolvedValueOnce({ id: 'man-2' })
      .mockResolvedValueOnce({ id: 'man-3' });
    prisma.historicoManutencao.createMany.mockResolvedValue({ count: 1 });

    await service.update(
      'man-1',
      { statusManutencao: 'EM_MANUTENCAO' } as any,
      { nome: 'Gabriel' },
    );
    await service.update(
      'man-2',
      { statusManutencao: 'CONCLUIDA' } as any,
      { nome: 'Douglas Alves', email: 'douglas.alves@ambipar.com' },
    );
    await service.update(
      'man-3',
      { statusManutencao: 'CONCLUIDA' } as any,
      { nome: 'Douglas Alves', email: 'douglas.alves@ambipar.com' },
    );

    expect(prisma.manutencao.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({
          dataInicio: expect.any(Date),
          statusManutencao: 'EM_MANUTENCAO',
        }),
      }),
    );
    expect(prisma.manutencao.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          dataInicio: undefined,
          dataTermino: expect.any(Date),
          statusManutencao: 'CONCLUIDA',
        }),
      }),
    );
    expect(prisma.manutencao.update).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: expect.objectContaining({
          dataInicio: undefined,
          dataTermino: expect.any(Date),
          statusManutencao: 'CONCLUIDA',
        }),
      }),
    );
  });

  it('sets dataParalisacao when updating status to PARALISADA', async () => {
    prisma.manutencao.findUnique.mockResolvedValueOnce({
      id: 'man-1',
      statusManutencao: 'EM_MANUTENCAO',
      dataParalisacao: null,
      historicoAlteracoes: [],
    });
    prisma.manutencao.update.mockResolvedValue({ id: 'man-1' });
    prisma.historicoManutencao.createMany.mockResolvedValue({ count: 1 });
    prisma.manutencao.findUnique.mockResolvedValueOnce({
      id: 'man-1',
      statusManutencao: 'PARALISADA',
      dataParalisacao: new Date(),
      historicoAlteracoes: [],
    });

    await service.update('man-1', { statusManutencao: 'PARALISADA' } as any, {
      nome: 'Gabriel',
    });

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          statusManutencao: 'PARALISADA',
          dataParalisacao: expect.any(Date),
        }),
      }),
    );
  });

  it('removes maintenance by soft delete', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      ativo: true,
      historicoAlteracoes: [],
    });
    prisma.manutencao.update.mockResolvedValue({ id: 'man-1', ativo: false });

    await service.remove('man-1');

    expect(prisma.manutencao.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'man-1' },
        data: expect.objectContaining({
          ativo: false,
          excluidoEm: expect.any(Date),
        }),
      }),
    );
  });

  it('lists maintenance history', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      historicoAlteracoes: [],
    });
    prisma.historicoManutencao.findMany.mockResolvedValue([{ id: 'hist-1' }]);

    const result = await service.listHistorico('man-1');

    expect(prisma.historicoManutencao.findMany).toHaveBeenCalledWith({
      where: { manutencaoId: 'man-1' },
      orderBy: { criadoEm: 'desc' },
    });
    expect(result).toEqual([{ id: 'hist-1' }]);
  });
});
