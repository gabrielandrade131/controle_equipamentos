import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation,ApiTags } from '@nestjs/swagger';
import { TiposEquipamentoService } from './tipos-equipamento.service';
import { CreateTipoEquipamentoDto } from './dto/create-tipo-equipamento.dto';
import { UpdateTipoEquipamentoDto } from './dto/update-tipo-equipamento.dto';


@ApiTags('Tipos de Equipamento')
@Controller('tipos-equipamento')
export class TiposEquipamentoController {
    constructor(
        private readonly tiposEquipamentoService: TiposEquipamentoService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Cadastrar tipo de equipamento' })
    create(@Body() body: CreateTipoEquipamentoDto) {
        return this.tiposEquipamentoService.create(body);
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
