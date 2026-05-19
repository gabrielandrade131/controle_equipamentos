import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { CreateObservacaoDto } from './dto/create-observacao.dto';
import { CreateHistoricoEquipamentoDto } from './dto/create-historico-equipamento.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { UpdateRegistroInspecaoDto } from './dto/update-registro-inspecao.dto';
import { ProducoesService } from './producoes.service';
import { FilterProducaoDto } from './dto/filter-producao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';

@ApiTags('Produções')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('producoes')
export class ProducoesController {
  constructor(private readonly producoesService: ProducoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova produção' })
  create(@Body() body: CreateProducaoDto) {
    return this.producoesService.create(body);
  }

  @Post(':id/observacoes')
  @ApiOperation({ summary: 'Adicionar uma nova Observação' })
  addObservacao(@Param('id') id: string, @Body() body: CreateObservacaoDto) {
    return this.producoesService.addObservacao(id, body);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todas as produções com filtros e paginação',
  })
  findAll(@Query() filters: FilterProducaoDto) {
    return this.producoesService.findAll(filters);
  }

  @Get(':id/observacoes')
  @ApiOperation({ summary: 'Lista as observações' })
  listObservacoes(@Param('id') id: string) {
    return this.producoesService.listObservacoes(id);
  }

  @Get('ordem/:numeroOrdem')
  @ApiOperation({ summary: 'Buscar produção por número da ordem' })
  @ApiParam({ name: 'numeroOrdem', example: 'OP-001' })
  findByNumeroOrdem(@Param('numeroOrdem', ParseIntPipe) numeroOrdem: number) {
    return this.producoesService.findByNumeroOrdem(numeroOrdem);
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar produções para Excel' })
  async exportExcel(@Query() filters: FilterProducaoDto, @Res() res: Response) {
    const buffer = await this.producoesService.exportExcel(filters);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=producoes.xlsx');

    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produção por ID' })
  @ApiParam({ name: 'id', example: '1' })
  findOne(@Param('id') id: string) {
    return this.producoesService.findOne(id);
  }

  @Get(':id/inspecao-montagem')
  @ApiOperation({
    summary: 'Listar os 16 registros da inspecao de montagem do equipamento ',
  })
  listRegistrosInspecaoMontagem(@Param('id') id: string) {
    return this.producoesService.listRegistrosInspecaoMontagem(id);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Listar o historico de alteracoes do equipamento' })
  listHistorico(@Param('id') id: string) {
    return this.producoesService.listHistorico(id);
  }

  @Get(':id/historico-equipamento')
  @ApiOperation({ summary: 'Listar o historico manual do equipamento' })
  listHistoricoEquipamento(@Param('id') id: string) {
    return this.producoesService.listHistoricoEquipamento(id);
  }

  @Post(':id/historico-equipamento')
  @ApiOperation({
    summary: 'Adicionar registro manual ao historico do equipamento',
  })
  addHistoricoEquipamento(
    @Param('id') id: string,
    @Body() body: CreateHistoricoEquipamentoDto,
  ) {
    return this.producoesService.addHistoricoEquipamento(id, body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma produção existente' })
  @ApiParam({
    name: 'id',
    example: '1',
  })
  update(
    @Param('id') id: string,
    @Body() body: UpdateProducaoDto,
    @Req() req: any,
  ) {
    return this.producoesService.update(id, body, req.user);
  }

  @Patch(':id/tag')
  @ApiOperation({ summary: 'Cadastrar ou atualizar a TAG do equipamento' })
  updateTag(@Param('id') id: string, @Body() body: UpdateTagDto) {
    return this.producoesService.updateTag(id, body);
  }

  @Patch(':id/inspecao-montagem/:ordem')
  @ApiOperation({
    summary: 'Atualizar um registro da inspeção de montagem pela ordem',
  })
  updateRegistroInspecaoMontagem(
    @Param('id') id: string,
    @Param('ordem', ParseIntPipe) ordem: number,
    @Body() body: UpdateRegistroInspecaoDto,
  ) {
    return this.producoesService.updateRegistroInspecaoMontagem(
      id,
      ordem,
      body,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma produção' })
  remove(@Param('id') id: string) {
    return this.producoesService.remove(id);
  }
}
