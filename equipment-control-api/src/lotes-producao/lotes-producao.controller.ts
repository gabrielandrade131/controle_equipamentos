import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLoteProducaoDto } from './dto/create-lote-producao.dto';
import { UpdateLoteProducaoDto } from './dto/update-lote-producao.dto';
import { LotesProducaoService } from './lotes-producao.service';
import { assertNotOperationalUser } from '../auth/user-permissions';

@ApiTags('Lotes de Produção')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lotes-producao')
export class LotesProducaoController {
  constructor(private readonly lotesProducaoService: LotesProducaoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lote de produção e gerar equipamentos' })
  create(@Body() body: CreateLoteProducaoDto, @Req() req: any) {
    assertNotOperationalUser(req.user);
    return this.lotesProducaoService.create(body, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar lotes de produção' })
  findAll() {
    return this.lotesProducaoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lote de produção por ID' })
  findOne(@Param('id') id: string) {
    return this.lotesProducaoService.findOne(id);
  }

  @Get(':id/equipamentos')
  @ApiOperation({ summary: 'Listar equipamentos de um lote' })
  findEquipamentos(@Param('id') id: string) {
    return this.lotesProducaoService.findEquipamentos(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar lote de produção' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateLoteProducaoDto,
    @Req() req: any,
  ) {
    assertNotOperationalUser(req.user);
    return this.lotesProducaoService.update(id, body, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir lote de produção' })
  remove(@Param('id') id: string, @Req() req: any) {
    assertNotOperationalUser(req.user);
    return this.lotesProducaoService.remove(id);
  }
}
