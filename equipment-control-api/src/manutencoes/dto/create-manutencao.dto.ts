import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusManutencao, TipoManutencao } from '@prisma/client';

export class CreateManutencaoDto {
  @ApiPropertyOptional({ example: 'uuid-do-tipo-equipamento' })
  @IsOptional()
  @IsString()
  tipoEquipamentoId?: string;

  @ApiPropertyOptional({ example: 'Exaustor' })
  @IsOptional()
  @IsString()
  tipoEquipamentoNome?: string;

  @ApiPropertyOptional({
    enum: TipoManutencao,
    example: TipoManutencao.CORRETIVA,
    description: 'Tipo: CORRETIVA ou PREVENTIVA',
  })
  @IsOptional()
  @IsEnum(TipoManutencao)
  tipoManutencao?: TipoManutencao;

  @ApiPropertyOptional({ example: 'WEG' })
  @IsOptional()
  @IsString()
  fabricanteEquipamento?: string;

  @ApiPropertyOptional({ example: 'Exaustor 420 Monofasico' })
  @IsOptional()
  @IsString()
  modeloEquipamento?: string;

  @ApiPropertyOptional({ example: 'SN-000123' })
  @IsOptional()
  @IsString()
  numeroSerie?: string;

  @ApiPropertyOptional({ example: 'TAG-0001' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ example: 'Manutencao manual' })
  @IsOptional()
  @IsString()
  situacaoEquipamento?: string;

  @ApiPropertyOptional({ example: '2026-04-29' })
  @IsOptional()
  @IsDateString()
  dataRetornoBase?: string;

  @ApiPropertyOptional({ example: '2026-04-29' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-05-10' })
  @IsOptional()
  @IsDateString()
  previsaoTermino?: string;

  @ApiPropertyOptional({ example: '2026-05-05' })
  @IsOptional()
  @IsDateString()
  dataParalisacao?: string;

  @ApiPropertyOptional({ example: 'Diagnostico inicial' })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiPropertyOptional({ description: 'Respostas preenchidas na inspeção.' })
  @IsOptional()
  @IsObject()
  dadosInspecao?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Imagens da inspeção serializadas em JSON.' })
  @IsOptional()
  @IsString()
  imagensAnexadas?: string;

  @ApiPropertyOptional({ example: 'Joao da Silva' })
  @IsOptional()
  @IsString()
  responsavelManutencao?: string;

  @ApiPropertyOptional({ example: 'Maria Souza' })
  @IsOptional()
  @IsString()
  responsavelRevisao?: string;

  @ApiPropertyOptional({
    enum: StatusManutencao,
    example: StatusManutencao.EM_MANUTENCAO,
    description: 'Status: PENDENTE, PARALISADA, EM_MANUTENCAO, CONCLUIDA',
  })
  @IsOptional()
  @IsEnum(StatusManutencao)
  statusManutencao?: StatusManutencao;

  @ApiPropertyOptional({
    example: true,
    description:
      'Resultado da avaliacao final: true para conforme, false para nao conforme',
  })
  @IsOptional()
  @IsBoolean()
  avaliacaoFinalConforme?: boolean;

  @ApiPropertyOptional({ example: '2026-04-25' })
  @IsOptional()
  @IsDateString()
  dataTermino?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description:
      'Validade do equipamento após a manutenção. Deve considerar a peça que vence primeiro.',
  })
  @IsOptional()
  @IsDateString()
  validade?: string;
}
