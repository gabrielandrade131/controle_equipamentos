import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { timeStamp } from 'console';

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
  }) {
    return this.prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        ativo: data.ativo ?? true,
        precisaTrocarSenha: data.precisaTrocarSenha ?? true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
}
