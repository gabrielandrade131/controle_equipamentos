import {
  BadRequestException,
  Controller,
  Get,
  Put,
  Delete,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  assertAdminUser,
  assertNotOperationalUser,
  assertCanManageUserVerification,
  isAdminUser,
} from '../auth/user-permissions';
import type { AuthenticatedUser } from '../auth/user-permissions';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  async findAll(@CurrentUser() usuarioAtual: AuthenticatedUser) {
    assertNotOperationalUser(usuarioAtual);
    return this.usersService.findAll();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar usuário' })
  async update(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Param('id') id: string,
    @Body()
    body: {
      nome?: string;
      email?: string;
      ativo?: boolean;
      precisaTrocarSenha?: boolean;
      cSafety?: boolean;
      operacional?: boolean;
      verificado?: boolean;
    },
  ) {
    assertNotOperationalUser(usuarioAtual);

    if (isAdminUser(usuarioAtual)) {
      return this.usersService.update(id, body);
    }

    assertCanManageUserVerification(usuarioAtual);

    const tentouAlterarOutroCampo = Object.entries(body).some(
      ([key, value]) => key !== 'verificado' && value !== undefined,
    );

    if (tentouAlterarOutroCampo) {
      throw new BadRequestException(
        'Usuários verificados não administradores só podem alterar o campo verificado.',
      );
    }

    if (body.verificado === undefined) {
      throw new BadRequestException('Informe o campo verificado.');
    }

    return this.usersService.update(id, { verificado: body.verificado });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar usuário' })
  async delete(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    assertAdminUser(usuarioAtual);
    return this.usersService.delete(id);
  }
}
