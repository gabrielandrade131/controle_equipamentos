import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: CreateUserDto) {
    const usuarioExistente = await this.usersService.findByEmail(data.email);

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este e-mail');
    }

    const senhaHash = await bcrypt.hash(data.senha, 10);

    const usuario = await this.usersService.create({
      nome: data.nome,
      email: data.email,
      senha: senhaHash,
      ativo: true,
      precisaTrocarSenha: true,
      cSafety: data.cSafety ?? false,
      verificado: data.verificado ?? false,
    });

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      ativo: usuario.ativo,
      precisaTrocarSenha: usuario.precisaTrocarSenha,
      cSafety: usuario.cSafety,
      verificado: usuario.verificado,
      criadoEm: usuario.criadoEm,
    };
  }

  async login(data: LoginDto) {
    const usuario = await this.usersService.findByEmail(data.email);

    if (!usuario) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    if (!usuario.ativo) {
      throw new UnauthorizedException('Usuario inativo.');
    }

    const senhaValida = await bcrypt.compare(data.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos. ');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      verificado: usuario.verificado,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        ativo: usuario.ativo,
        precisaTrocarSenha: usuario.precisaTrocarSenha,
        cSafety: usuario.cSafety,
        verificado: usuario.verificado,
      },
    };
  }

  async validateUserById(userId: string) {
    return this.usersService.findById(userId);
  }
}
