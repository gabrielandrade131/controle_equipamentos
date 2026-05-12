import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { StatusManutencao } from '@prisma/client';

export class CreateManutencaoDto {
  @ApiPropertyOptional({ example: 'Exaustor' })
  @IsOptional()
  @IsString()
  tipoEquipamentoNome?: string;

  @ApiPropertyOptional({ example: 'Exaustor 420 Monofasico' })
  @IsOptional()
  @IsString()
  modeloEquipamento?: string;

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

  @ApiPropertyOptional({ example: 'Diagnostico inicial' })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiPropertyOptional({ example: 'Joao da Silva' })
  @IsOptional()
  @IsString()
  responsavelManutencao?: string;

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
    description: 'Resultado da avaliacao final: true para conforme, false para nao conforme',
  })
  @IsOptional()
  @IsBoolean()
  avaliacaoFinalConforme?: boolean;
}
