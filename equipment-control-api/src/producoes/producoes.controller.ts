import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { CreateObservacaoDto } from './dto/create-observacao.dto';
import { ProducoesService } from './producoes.service';

@ApiTags('Produções')
@Controller('producoes')
export class ProducoesController {
    constructor(private readonly producoesService: ProducoesService) {}

    @Post()
    @ApiOperation({ summary: 'Criar uma nova produção' })
    create(@Body() body: CreateProducaoDto) {
        return this.producoesService.create(body);
    }

    @Post(':id/observacoes')
    @ApiOperation({ summary: 'Adicionar uma nova Observação'})
    addObservacao(
        @Param('id') id: string,
        @Body() body: CreateObservacaoDto,
    ) {
        return this.producoesService.addObservacao(id, body);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as produções' })
    findAll() {
        return this.producoesService.findAll();

    }

    @Get(':id/observacoes')
    @ApiOperation({ summary: 'Lista as observações'})
    listObservacoes(@Param('id') id: string) {
        return this.producoesService.listObservacoes(id);
    }

    @Get('ordem/:numeroOrdem')
    @ApiOperation({ summary: 'Buscar produção por número da ordem' })
    @ApiParam({ name: 'numeroOrdem', example: 'OP-001' })
    findByNumeroOrdem(@Param('numeroOrdem', ParseIntPipe) numeroOrdem: number) {
        return this.producoesService.findByNumeroOrdem(numeroOrdem);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar produção por ID' })
    @ApiParam({ name: 'id', example: '1' })
    findOne(@Param('id') id: string) {
        return this.producoesService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar uma produção existente' })
    @ApiParam({
        name: 'id',
        example: '1',
    })
    update(@Param('id') id: string, @Body() body: UpdateProducaoDto) {
        return this.producoesService.update(id, body);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Excluir uma produção' })
    remove(@Param('id') id: string) {
        return this.producoesService.remove(id);
    }
}

