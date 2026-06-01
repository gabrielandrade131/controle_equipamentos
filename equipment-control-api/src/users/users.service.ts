import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    nome: string;
    email: string;
    senha: string;
    ativo?: boolean;
    precisaTrocarSenha?: boolean;
    cSafety?: boolean;
  }) {
    return this.prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        ativo: data.ativo ?? true,
        precisaTrocarSenha: data.precisaTrocarSenha ?? true,
        cSafety: data.cSafety ?? false,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findOne(id: string) {
    const usuario = await this.findById(id);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        ativo: true,
        precisaTrocarSenha: true,
        cSafety: true,
        criadoEm: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async update(
    id: string,
    data: {
      nome?: string;
      email?: string;
      ativo?: boolean;
      precisaTrocarSenha?: boolean;
      cSafety?: boolean;
    },
  ) {
    await this.findOne(id);

    const dataAtualizada = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    try {
      return await this.prisma.user.update({
        where: { id },
        data: dataAtualizada,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe um usuário com este e-mail.');
      }

      throw error;
    }
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
