import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManutencoesService } from './manutencoes.service';
import { CreateManutencaoSynchroDto } from './dto/create-manutencao-synchro.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { SynchroIntegrationGuard } from '../auth/synchro-integration.guard';
import { FilterManutencaoDto } from './dto/filter-manutencao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Manutenções')
@Controller('manutencoes')
export class ManutencoesController {
  constructor(private readonly manutencoesService: ManutencoesService) {}

  @Post('synchro')
  @UseGuards(SynchroIntegrationGuard)
  @ApiHeader({
    name: 'x-integration-key',
    description: 'Chave de integração entre Synchro e Manutenção',
    required: true,
  })
  @ApiOperation({ summary: 'Criar manutenção automaticamente a partir do Synchro' })
  createFromSynchro(@Body() body: CreateManutencaoSynchroDto) {
    return this.manutencoesService.createFromSynchro(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar manutenções com filtros opcionais' })
  findAll(@Query() filters: FilterManutencaoDto) {
    return this.manutencoesService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar manutenção por ID com histórico' })
  findOne(@Param('id') id: string) {
    return this.manutencoesService.findOne(id);
  }

  @Get(':id/historico')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar histórico de alterações da manutenção' })
  listHistorico(@Param('id') id: string) {
    return this.manutencoesService.listHistorico(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar dados da manutenção' })
  update(@Param('id') id: string, @Body() body: UpdateManutencaoDto, @Req() req: any) {
    return this.manutencoesService.update(id, body, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir manutenção' })
  remove(@Param('id') id: string) {
    return this.manutencoesService.remove(id);
  }
}