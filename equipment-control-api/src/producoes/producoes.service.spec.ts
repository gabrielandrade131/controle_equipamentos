import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProducoesService } from './producoes.service';

describe('ProducoesService', () => {
  let service: ProducoesService;
  let prisma: {
    tipoEquipamento: {
      findUnique: jest.Mock;
    };
    equipment: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
    registroInspecaoMontagem: {
      upsert: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      tipoEquipamento: {
        findUnique: jest.fn(),
      },
      equipment: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      registroInspecaoMontagem: {
        upsert: jest.fn(),
      },
    };

    service = new ProducoesService(prisma as unknown as PrismaService);
  });

  it('throws when tipoEquipamento is missing on create', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        tipoEquipamentoId: 'tipo-1',
        modelo: 'MX',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates a production and computes numeroSerie', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador',
    });
    prisma.equipment.findFirst.mockResolvedValue({ numeroOrdem: 9 });
    prisma.equipment.create.mockResolvedValue({
      id: 'prod-1',
      numeroOrdem: 10,
      modelo: 'MX',
    });
    prisma.equipment.update.mockResolvedValue({
      id: 'prod-1',
      numeroOrdem: 10,
      numeroSerie: 'MX-10',
      modelo: 'MX',
      descricao: 'Gerador X',
      statusProducao: 'EM_ANDAMENTO',
      dataSolicitacao: new Date('2024-01-10T00:00:00.000Z'),
      dataInicio: new Date('2024-01-11T00:00:00.000Z'),
      previsaoTermino: new Date('2024-01-20T00:00:00.000Z'),
      tipoEquipamento: null,
      itensSeriados: [],
      observacoes: [],
      registrosInspecaoMontagem: [],
    });

    const result = await service.create({
      tipoEquipamentoId: 'tipo-1',
      modelo: 'MX',
      descricaoComplemento: 'X',
      dataSolicitacao: '2024-01-10',
      dataInicio: '2024-01-11',
      dataPrevisao: '2024-01-20',
      itensSeriados: [{ descricao: 'Item 1' }],
    });

    const createArgs = prisma.equipment.create.mock.calls[0][0];
    expect(createArgs.data.numeroOrdem).toBe(10);
    expect(createArgs.data.registrosInspecaoMontagem.create).toHaveLength(18);
    expect(prisma.equipment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          numeroSerie: 'MX-10',
        },
      }),
    );
    expect(result.numeroSerie).toBe('MX-10');
  });

  it('findOne throws when production is missing', async () => {
    prisma.equipment.findUnique.mockResolvedValue(null);

    await expect(service.findOne('prod-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('findAll paginates results and calculates totals', async () => {
    prisma.equipment.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        statusProducao: 'EM_ANDAMENTO',
        dataSolicitacao: new Date('2024-01-10T00:00:00.000Z'),
        dataInicio: new Date('2024-01-11T00:00:00.000Z'),
      },
    ]);
    prisma.equipment.count.mockResolvedValue(22);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result.total).toBe(22);
    expect(result.totalPages).toBe(3);
    expect(result.data).toHaveLength(1);
  });

  it('rejects updateTag when production is not concluded', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      statusProducao: 'EM_ANDAMENTO',
    } as any);

    await expect(
      service.updateTag('prod-1', { tag: 'TAG-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates tag when production is concluded', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      statusProducao: 'CONCLUIDA',
    } as any);
    prisma.equipment.findFirst.mockResolvedValue(null);
    prisma.equipment.update.mockResolvedValue({
      id: 'prod-1',
      tag: 'TAG-1',
      statusProducao: 'CONCLUIDA',
      dataSolicitacao: new Date('2024-01-10T00:00:00.000Z'),
      dataInicio: new Date('2024-01-11T00:00:00.000Z'),
      tipoEquipamento: null,
      itensSeriados: [],
      observacoes: [],
      registrosInspecaoMontagem: [],
    });

    const result = await service.updateTag('prod-1', { tag: 'TAG-1' });

    expect(prisma.equipment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { tag: 'TAG-1' },
      }),
    );
    expect(result.tag).toBe('TAG-1');
  });

  it('throws conflict if tag is already used', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      statusProducao: 'CONCLUIDA',
    } as any);
    prisma.equipment.findFirst.mockResolvedValue({ id: 'prod-2' });

    await expect(
      service.updateTag('prod-1', { tag: 'TAG-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates registro de inspeção via upsert', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
    } as any);
    prisma.registroInspecaoMontagem.upsert.mockResolvedValue({
      equipmentId: 'prod-1',
      ordem: 1,
    });

    await service.updateRegistroInspecaoMontagem('prod-1', 1, {
      valorObservado: 'OK',
    });

    expect(prisma.registroInspecaoMontagem.upsert).toHaveBeenCalledWith({
      where: {
        equipmentId_ordem: {
          equipmentId: 'prod-1',
          ordem: 1,
        },
      },
      create: {
        equipmentId: 'prod-1',
        ordem: 1,
        valorObservado: 'OK',
        instrumentoMedicao: undefined,
        conformidades: undefined,
      },
      update: {
        valorObservado: 'OK',
        instrumentoMedicao: undefined,
        conformidades: undefined,
      },
    });
  });
});
