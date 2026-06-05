import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersServiceMock = {
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('allows admin to update any user field', async () => {
    const usuarioAtual = {
      id: 'admin-1',
      email: 'lohran.victor@ambipar.com',
      verificado: false,
    };
    const body = {
      nome: 'Novo Nome',
      ativo: false,
      verificado: true,
    };
    const expected = { id: 'user-1' };
    usersServiceMock.update.mockResolvedValue(expected);

    await expect(controller.update(usuarioAtual, 'user-1', body)).resolves.toBe(
      expected,
    );
    expect(usersServiceMock.update).toHaveBeenCalledWith('user-1', body);
  });

  it('allows verified non-admin to update only verification', async () => {
    const usuarioAtual = {
      id: 'user-2',
      email: 'verified@teste.com',
      verificado: true,
    };
    const expected = { id: 'user-1', verificado: true };
    usersServiceMock.update.mockResolvedValue(expected);

    await expect(
      controller.update(usuarioAtual, 'user-1', { verificado: true }),
    ).resolves.toBe(expected);
    expect(usersServiceMock.update).toHaveBeenCalledWith('user-1', {
      verificado: true,
    });
  });

  it('blocks verified non-admin from updating other user fields', async () => {
    const usuarioAtual = {
      id: 'user-2',
      email: 'verified@teste.com',
      verificado: true,
    };

    await expect(
      controller.update(usuarioAtual, 'user-1', {
        nome: 'Novo Nome',
        verificado: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(usersServiceMock.update).not.toHaveBeenCalled();
  });

  it('blocks non-verified users from updating users', async () => {
    const usuarioAtual = {
      id: 'user-2',
      email: 'user@teste.com',
      verificado: false,
    };

    await expect(
      controller.update(usuarioAtual, 'user-1', { verificado: true }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(usersServiceMock.update).not.toHaveBeenCalled();
  });

  it('allows only admins to delete users', async () => {
    const usuarioAtual = {
      id: 'admin-1',
      email: 'gabriel.roza@ambipar.com',
      verificado: false,
    };
    usersServiceMock.delete.mockResolvedValue({ id: 'user-1' });

    await expect(controller.delete(usuarioAtual, 'user-1')).resolves.toEqual({
      id: 'user-1',
    });
    expect(usersServiceMock.delete).toHaveBeenCalledWith('user-1');
  });

  it('blocks delete for non-admin users', async () => {
    const usuarioAtual = {
      id: 'user-2',
      email: 'verified@teste.com',
      verificado: true,
    };

    await expect(controller.delete(usuarioAtual, 'user-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(usersServiceMock.delete).not.toHaveBeenCalled();
  });
});
