import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecebimentosService } from './recebimentos.service';

@ApiTags('Recebimentos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recebimentos')
export class RecebimentosController {
  constructor(private readonly recebimentosService: RecebimentosService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dados: {
          type: 'string',
          example: '{"numeroOs":"OS-001","equipamentos":[]}',
        },
        fotos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('fotos', 50, {
      storage: diskStorage({
        destination: (() => {
          const destination = join(
            process.cwd(),
            '..',
            'uploads',
            'recebimentos',
          );
          mkdirSync(destination, { recursive: true });
          return destination;
        })(),
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const extension = extname(file.originalname);

          callback(null, `${uniqueSuffix}${extension}`);
        },
      }),
    }),
  )
  criar(
    @Body('dados') dados: string,
    @UploadedFiles() arquivos: Express.Multer.File[],
  ) {
    return this.recebimentosService.criarRecebimento(dados, arquivos ?? []);
  }

  @Get()
  listar(
    @Query('numeroOs') numeroOs?: string,
    @Query('tag') tag?: string,
    @Query('numeroSerie') numeroSerie?: string,
    @Query('sincronizadoSynchro') sincronizadoSynchro?: string,
    @Query('statusRecebimento') statusRecebimento?: any,
  ) {
    return this.recebimentosService.listar({
      numeroOs,
      tag,
      numeroSerie,
      sincronizadoSynchro,
      statusRecebimento,
    });
  }

  @Get('os/:numeroOs')
  buscarPorNumeroOs(@Param('numeroOs') numeroOs: string) {
    return this.recebimentosService.buscarPorNumeroOs(numeroOs);
  }

  @Get('equipamentos-recebidos')
  listarEquipamentosRecebidos() {
    return this.recebimentosService.listarEquipamentosRecebidos();
  }

  @Post(':id/reprocessar-synchro')
  reprocessarSynchro(@Param('id') id: string) {
    return this.recebimentosService.reprocessarSincronizacaoSynchro(id);
  }

  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.recebimentosService.buscarPorId(id);
  }
}
