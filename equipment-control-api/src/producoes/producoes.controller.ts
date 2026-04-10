import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CreateProducaoDto } from './dto/create-producao.dto';
import { UpdateProducaoDto } from './dto/update-producao.dto';
import { ProducoesService } from './producoes.service';


@Controller('producoes')
export class ProducoesController {
    constructor(private readonly producoesService: ProducoesService) {}

    @Post()
    create(@Body() body: CreateProducaoDto) {
        return this.producoesService.create(body);
    }

    @Get()
    findAll() {
        return this.producoesService.findAll();

    }

    @Get('ordem/:numeroOrdem')
    findByNumeroOrdem(@Param('numeroOrdem') numeroOrdem: string) {
        return this.producoesService.findByNumeroOrdem(numeroOrdem);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.producoesService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() body: UpdateProducaoDto) {
        return this.producoesService.update(id, body);
    }
}

