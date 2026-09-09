import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ManutencoesService } from './manutencoes.service';
import { CreateManutencaoSynchroDto } from './dto/create-manutencao-synchro.dto';
import { CreateManutencoesSynchroBulkDto } from './dto/create-manutencoes-synchro-bulk.dto';
import { CreateManutencaoDto } from './dto/create-manutencao.dto';
import { UpdateManutencaoDto } from './dto/update-manutencao.dto';
import { SynchroIntegrationGuard } from '../auth/synchro-integration.guard';
import { FilterManutencaoDto } from './dto/filter-manutencao.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { Response } from 'express';
import { basename, extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  assertNotOperationalUser,
  type AuthenticatedUser,
} from '../auth/user-permissions';

@ApiTags('Manutenções')
@Controller('manutencoes')
export class ManutencoesController {
  constructor(private readonly manutencoesService: ManutencoesService) {}

  private removerArquivoAnexo(caminhoArquivo: string) {
    const arquivo = join(
      process.cwd(),
      '..',
      'uploads',
      'manutencoes',
      basename(caminhoArquivo),
    );

    if (existsSync(arquivo)) {
      unlinkSync(arquivo);
    }
  }

  @Post('synchro')
  @UseGuards(SynchroIntegrationGuard)
  @ApiHeader({
    name: 'x-integration-key',
    description: 'Chave de integração entre Synchro e Manutenção',
    required: true,
  })
  @ApiOperation({
    summary: 'Criar manutenção automaticamente a partir do Synchro',
  })
  createFromSynchro(@Body() body: CreateManutencaoSynchroDto) {
    return this.manutencoesService.createFromSynchro(body);
  }

  @Post('synchro/bulk')
  @UseGuards(SynchroIntegrationGuard)
  @ApiHeader({
    name: 'x-integration-key',
    description: 'Chave de integração entre Synchro e Manutenção',
    required: true,
  })
  @ApiOperation({ summary: 'Importar manutenções em lote a partir do Synchro' })
  createBulkFromSynchro(@Body() body: CreateManutencoesSynchroBulkDto) {
    return this.manutencoesService.createBulkFromSynchro(body.items);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar manutencao manualmente' })
  create(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Body() body: CreateManutencaoDto,
  ) {
    assertNotOperationalUser(usuarioAtual);
    return this.manutencoesService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar manutenções com filtros opcionais' })
  findAll(@Query() filters: FilterManutencaoDto) {
    return this.manutencoesService.findAll(filters);
  }

  @Get('export/excel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar manutenções para Excel' })
  async exportExcel(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Query() filters: FilterManutencaoDto,
    @Res() res: Response,
  ) {
    assertNotOperationalUser(usuarioAtual);
    const buffer = await this.manutencoesService.exportExcel(filters);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  @Get(':id/recebimento')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar dados de recebimento vinculados a manutencao',
  })
  buscarRecebimento(@Param('id') id: string) {
    return this.manutencoesService.buscarRecebimentoDaManutencao(id);
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

  @Post(':id/anexos-pdf')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Anexar PDF à ordem de manutenção' })
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: (() => {
          const destination = join(
            process.cwd(),
            '..',
            'uploads',
            'manutencoes',
          );
          mkdirSync(destination, { recursive: true });
          return destination;
        })(),
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(
            null,
            `${uniqueSuffix}${extname(file.originalname).toLowerCase()}`,
          );
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        // Browsers/Windows can send arbitrary or empty MIME values for PDFs.
        // The filename extension is the stable signal available to Multer;
        // requiring an exact MIME value was causing valid PDFs to return 400.
        const isPdf = extname(file.originalname).toLowerCase() === '.pdf';
        callback(
          isPdf ? null : new Error('Apenas arquivos PDF são permitidos.'),
          isPdf,
        );
      },
    }),
  )
  async anexarPdf(
    @Param('id') id: string,
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @Req() req: any,
  ) {
    if (!arquivo) {
      throw new BadRequestException('Selecione um arquivo PDF para anexar.');
    }

    const anexo = await this.manutencoesService.criarAnexoPdf(
      id,
      {
        nomeArquivo: basename(arquivo.originalname),
        caminhoArquivo: `/uploads/manutencoes/${arquivo.filename}`,
      },
      req.user,
    );

    // O anexo não precisa devolver todo o checklist e as fotos em data URL.
    // Isso evita respostas de vários megabytes após um upload simples de PDF.
    return { anexo };
  }

  @Patch(':id/anexos-pdf/:anexoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: diskStorage({
        destination: (() => {
          const destination = join(process.cwd(), '..', 'uploads', 'manutencoes');
          mkdirSync(destination, { recursive: true });
          return destination;
        })(),
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname).toLowerCase()}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        const isPdf = extname(file.originalname).toLowerCase() === '.pdf';
        callback(isPdf ? null : new Error('Apenas arquivos PDF sÃ£o permitidos.'), isPdf);
      },
    }),
  )
  async substituirPdf(
    @Param('id') id: string,
    @Param('anexoId') anexoId: string,
    @UploadedFile() arquivo: Express.Multer.File | undefined,
    @Req() req: any,
  ) {
    if (!arquivo) {
      throw new BadRequestException('Selecione um arquivo PDF para substituir.');
    }

    const resultado = await this.manutencoesService.substituirAnexoPdf(
      id,
      anexoId,
      {
        nomeArquivo: basename(arquivo.originalname),
        caminhoArquivo: `/uploads/manutencoes/${arquivo.filename}`,
      },
      req.user,
    );
    this.removerArquivoAnexo(resultado.caminhoArquivoAnterior);

    return { anexo: resultado.anexo };
  }

  @Delete(':id/anexos-pdf/:anexoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async removerPdf(
    @Param('id') id: string,
    @Param('anexoId') anexoId: string,
    @Req() req: any,
  ) {
    const anexo = await this.manutencoesService.removerAnexoPdf(id, anexoId, req.user);
    this.removerArquivoAnexo(anexo.caminhoArquivo);
    return { id: anexo.id };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar dados da manutenção' })
  update(
    @Param('id') id: string,
    @Body() body: UpdateManutencaoDto,
    @Req() req: any,
  ) {
    return this.manutencoesService.update(id, body, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Excluir manutenção' })
  remove(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    assertNotOperationalUser(usuarioAtual);
    return this.manutencoesService.remove(id);
  }
}
