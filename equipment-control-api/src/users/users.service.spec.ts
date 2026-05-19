import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
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
      },
    });
  });
});
