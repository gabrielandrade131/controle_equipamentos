import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TiposEquipamentoService } from './tipos-equipamento.service';

describe('TiposEquipamentoService', () => {
  let service: TiposEquipamentoService;
  let prisma: {
    tipoEquipamento: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      tipoEquipamento: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new TiposEquipamentoService(
      prisma as unknown as PrismaService,
    );
  });

  it('creates a tipo de equipamento', async () => {
    prisma.tipoEquipamento.create.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador',
    });

    const result = await service.create({ nome: 'Gerador' });

    expect(prisma.tipoEquipamento.create).toHaveBeenCalledWith({
      data: { nome: 'Gerador' },
    });
    expect(result).toEqual({ id: 'tipo-1', nome: 'Gerador' });
  });

  it('throws conflict when creating with duplicated name', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: '5.22.0',
    });
    prisma.tipoEquipamento.create.mockRejectedValue(error);

    await expect(service.create({ nome: 'Gerador' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('findOne throws when record is missing', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue(null);

    await expect(service.findOne('tipo-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates a tipo de equipamento', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador',
    });
    prisma.tipoEquipamento.update.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador X',
    });

    const result = await service.update('tipo-1', { nome: 'Gerador X' });

    expect(prisma.tipoEquipamento.update).toHaveBeenCalledWith({
      where: { id: 'tipo-1' },
      data: { nome: 'Gerador X' },
    });
    expect(result).toEqual({ id: 'tipo-1', nome: 'Gerador X' });
  });

  it('throws conflict when updating with duplicated name', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador',
    });
    const error = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: '5.22.0',
    });
    prisma.tipoEquipamento.update.mockRejectedValue(error);

    await expect(
      service.update('tipo-1', { nome: 'Gerador' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('inativar marks the record as inactive', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador',
    });
    prisma.tipoEquipamento.update.mockResolvedValue({
      id: 'tipo-1',
      ativo: false,
    });

    await service.inativar('tipo-1');

    expect(prisma.tipoEquipamento.update).toHaveBeenCalledWith({
      where: { id: 'tipo-1' },
      data: { ativo: false },
    });
  });

  it('ativar marks the record as active', async () => {
    prisma.tipoEquipamento.findUnique.mockResolvedValue({
      id: 'tipo-1',
      nome: 'Gerador',
    });
    prisma.tipoEquipamento.update.mockResolvedValue({
      id: 'tipo-1',
      ativo: true,
    });

    await service.ativar('tipo-1');

    expect(prisma.tipoEquipamento.update).toHaveBeenCalledWith({
      where: { id: 'tipo-1' },
      data: { ativo: true },
    });
  });
});
