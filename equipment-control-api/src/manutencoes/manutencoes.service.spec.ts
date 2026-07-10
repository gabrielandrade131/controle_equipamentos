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

  it('rejects data update on concluded maintenance', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'CONCLUIDA',
    });

    await expect(
      service.update('man-1', { tag: 'TAG-2' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects work date update without maintenance status change', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'CONCLUIDA',
      dataTermino: new Date('2024-01-10T00:00:00.000Z'),
    });

    await expect(
      service.update('man-1', { dataTermino: '2024-01-11' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects status update on concluded maintenance', async () => {
    prisma.manutencao.findUnique.mockResolvedValue({
      id: 'man-1',
      statusManutencao: 'CONCLUIDA',
      tipoEquipamentoId: 'tipo-1',
    });

    await expect(
      service.update('man-1', {
        statusManutencao: 'EM_MANUTENCAO',
        tipoEquipamentoId: 'tipo-1',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.manutencao.update).not.toHaveBeenCalled();
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
