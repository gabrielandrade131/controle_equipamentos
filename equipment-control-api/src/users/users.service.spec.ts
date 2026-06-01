import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('findByEmail queries prisma by email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await service.findByEmail('gabriel@teste.com');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'gabriel@teste.com' },
    });
  });

  it('findById queries prisma by id', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1' });

    await service.findById('user-1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-1' },
    });
  });

  it('create applies default flags when missing', async () => {
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      nome: 'Gabriel',
    });

    await service.create({
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      senha: 'hash',
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        nome: 'Gabriel',
        email: 'gabriel@teste.com',
        senha: 'hash',
        ativo: true,
        precisaTrocarSenha: true,
        cSafety: false,
      },
    });
  });

  it('updates a user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      nome: 'Gabriel Silva',
      email: 'gabriel.silva@teste.com',
    });

    const result = await service.update('user-1', {
      nome: 'Gabriel Silva',
      email: 'gabriel.silva@teste.com',
    });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        nome: 'Gabriel Silva',
        email: 'gabriel.silva@teste.com',
      },
    });
    expect(result).toEqual({
      id: 'user-1',
      nome: 'Gabriel Silva',
      email: 'gabriel.silva@teste.com',
    });
  });

  it('throws not found when updating a missing user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.update('user-1', { nome: 'Gabriel Silva' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws conflict when updating with duplicated email', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
    });
    const error = new Prisma.PrismaClientKnownRequestError('unique', {
      code: 'P2002',
      clientVersion: '5.22.0',
    });
    prisma.user.update.mockRejectedValue(error);

    await expect(
      service.update('user-1', { email: 'outro@teste.com' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
