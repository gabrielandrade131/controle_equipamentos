import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TiposEquipamentoService } from './tipos-equipamento.service';
import { CreateTipoEquipamentoDto } from './dto/create-tipo-equipamento.dto';
import { UpdateTipoEquipamentoDto } from './dto/update-tipo-equipamento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VerifiedUserGuard } from '../auth/verified-user.guard';

@ApiTags('Tipos de Equipamento')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('tipos-equipamento')
export class TiposEquipamentoController {
  constructor(
    private readonly tiposEquipamentoService: TiposEquipamentoService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, VerifiedUserGuard)
  @ApiOperation({ summary: 'Cadastrar tipo de equipamento' })
  create(@Body() dto: CreateTipoEquipamentoDto) {
    return this.tiposEquipamentoService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de equipamento' })
  findAll() {
    return this.tiposEquipamentoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'buscar tipo de equipamento por ID' })
  findOne(@Param('id') id: string) {
    return this.tiposEquipamentoService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar tipo de equipamento' })
  update(@Param('id') id: string, @Body() body: UpdateTipoEquipamentoDto) {
    return this.tiposEquipamentoService.update(id, body);
  }

  @Patch(':id/inativar')
  @ApiOperation({ summary: 'Inativar tipo de equipamento' })
  inactivate(@Param('id') id: string) {
    return this.tiposEquipamentoService.inativar(id);
  }

  @Patch(':id/ativar')
  @ApiOperation({ summary: 'Ativar tipo de equipamento' })
  activate(@Param('id') id: string) {
    return this.tiposEquipamentoService.ativar(id);
  }
}
