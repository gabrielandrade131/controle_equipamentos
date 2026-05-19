import {
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };
  const jwtService = {
    signAsync: jest.fn(),
  };
  const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
    );
  });

  it('throws when registering an existing user', async () => {
    usersService.findByEmail.mockResolvedValue({ id: 'user-1' });

    await expect(
      service.register({
        nome: 'Gabriel',
        email: 'gabriel@teste.com',
        senha: '123456',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('registers a new user with hashed password', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    bcryptMock.hash.mockResolvedValue('hashed');
    const createdAt = new Date('2024-02-10T10:00:00.000Z');
    usersService.create.mockResolvedValue({
      id: 'user-1',
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      ativo: true,
      precisaTrocarSenha: true,
      criadoEm: createdAt,
    });

    const result = await service.register({
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      senha: '123456',
    });

    expect(usersService.create).toHaveBeenCalledWith({
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      senha: 'hashed',
      ativo: true,
      precisaTrocarSenha: true,
    });
    expect(result).toEqual({
      id: 'user-1',
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      ativo: true,
      precisaTrocarSenha: true,
      criadoEm: createdAt,
    });
  });

  it('rejects login when email is unknown', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: 'invalido@teste.com', senha: '123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when user is inactive', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'gabriel@teste.com',
      senha: 'hash',
      ativo: false,
    });

    await expect(
      service.login({ email: 'gabriel@teste.com', senha: '123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects login when password is invalid', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'gabriel@teste.com',
      senha: 'hash',
      ativo: true,
    });
    bcryptMock.compare.mockResolvedValue(false);

    await expect(
      service.login({ email: 'gabriel@teste.com', senha: '123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns token and user data on successful login', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      nome: 'Gabriel',
      email: 'gabriel@teste.com',
      senha: 'hash',
      ativo: true,
      precisaTrocarSenha: false,
    });
    bcryptMock.compare.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      email: 'gabriel@teste.com',
      senha: '123456',
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'gabriel@teste.com',
    });
    expect(result).toEqual({
      access_token: 'jwt-token',
      usuario: {
        id: 'user-1',
        nome: 'Gabriel',
        email: 'gabriel@teste.com',
        ativo: true,
        precisaTrocarSenha: false,
      },
    });
  });

  it('validateUserById delegates to UsersService', async () => {
    usersService.findById.mockResolvedValue({ id: 'user-1' });

    await service.validateUserById('user-1');

    expect(usersService.findById).toHaveBeenCalledWith('user-1');
  });
});
