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
    loteProducao: {
      update: jest.Mock;
    };
    historicoProducao: {
      createMany: jest.Mock;
    };
    $transaction: jest.Mock;
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
      loteProducao: {
        update: jest.fn(),
      },
      historicoProducao: {
        createMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    service = new ProducoesService(prisma as unknown as PrismaService);
  });

  it('findOne throws when production is missing', async () => {
    prisma.equipment.findUnique.mockResolvedValue(null);

    await expect(service.findOne('prod-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('monta numero de serie com modelo, lote e ordem', () => {
    expect((service as any).montarNumeroSerie('CSEX420ACM', 1, 20)).toBe(
      'CSEX420ACM-1-20',
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
      loteProducao: { statusProducao: 'CONCLUIDA' },
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
      loteProducao: { statusProducao: 'CONCLUIDA' },
    } as any);
    prisma.equipment.findFirst.mockResolvedValue({ id: 'prod-2' });

    await expect(
      service.updateTag('prod-1', { tag: 'TAG-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects data update on concluded production', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      loteProducaoId: 'lote-1',
      modelo: 'MX',
      loteProducao: {
        id: 'lote-1',
        modelo: 'MX',
        statusProducao: 'CONCLUIDA',
      },
    } as any);

    await expect(
      service.update('prod-1', { modelo: 'MY' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects work date update without production status change', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      loteProducaoId: 'lote-1',
      loteProducao: {
        id: 'lote-1',
        statusProducao: 'CONCLUIDA',
        dataTermino: new Date('2024-01-10T12:00:00.000Z'),
      },
    } as any);

    await expect(
      service.update('prod-1', { dataTermino: '2024-01-11' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects status update on concluded production', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      loteProducaoId: 'lote-1',
      numeroOrdem: 10,
      loteProducao: {
        id: 'lote-1',
        numeroLote: 1,
        modelo: 'MX',
        statusProducao: 'CONCLUIDA',
        dataInicio: new Date('2024-01-01T12:00:00.000Z'),
        dataTermino: new Date('2024-01-10T12:00:00.000Z'),
      },
    } as any);

    await expect(
      service.update('prod-1', {
        statusProducao: 'EM_ANDAMENTO',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.loteProducao.update).not.toHaveBeenCalled();
  });

  it('updates registro de inspeção via upsert when EM_ANDAMENTO', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      statusProducao: 'EM_ANDAMENTO',
      loteProducao: { statusProducao: 'EM_ANDAMENTO' },
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

  it('rejects registro de inspeção when production is concluded', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      statusProducao: 'CONCLUIDA',
      loteProducao: { statusProducao: 'CONCLUIDA' },
    } as any);

    await expect(
      service.updateRegistroInspecaoMontagem('prod-1', 1, {
        valorObservado: 'OK',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects registro de inspeção when production is not EM_ANDAMENTO', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 'prod-1',
      statusProducao: 'PROGRAMADA',
      loteProducao: { statusProducao: 'PROGRAMADA' },
    } as any);

    await expect(
      service.updateRegistroInspecaoMontagem('prod-1', 1, {
        valorObservado: 'OK',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
