import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates register to AuthService', async () => {
    const usuarioAtual = {
      id: 'admin-1',
      email: 'gabriel.roza@ambipar.com',
      verificado: true,
    };
    const dto = {
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      senha: '123456',
    };
    const expected = { id: 'user-1' };
    authServiceMock.register.mockResolvedValue(expected);

    await expect(controller.register(usuarioAtual, dto)).resolves.toEqual(
      expected,
    );
    expect(authServiceMock.register).toHaveBeenCalledWith(dto);
  });

  it('blocks register for non-admin users', async () => {
    const usuarioAtual = {
      id: 'user-1',
      email: 'user@teste.com',
      verificado: true,
    };
    const dto = {
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      senha: '123456',
    };

    expect(() => controller.register(usuarioAtual, dto)).toThrow(
      ForbiddenException,
    );
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('delegates login to AuthService', async () => {
    const dto = {
      email: 'gabriel@teste.com',
      senha: '123456',
    };
    const expected = { access_token: 'token' };
    authServiceMock.login.mockResolvedValue(expected);

    await expect(controller.login(dto)).resolves.toEqual(expected);
    expect(authServiceMock.login).toHaveBeenCalledWith(dto);
  });

  it('returns authenticated user from request object', () => {
    const user = { id: 'user-1', email: 'gabriel@teste.com' };

    expect(controller.me({ user })).toEqual(user);
  });
});
