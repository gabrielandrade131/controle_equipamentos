import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { StatusManutencao } from '@prisma/client';

export class FilterManutencaoDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numeroOrdemManutencao?: number;

  @ApiPropertyOptional({
    enum: StatusManutencao,
    example: StatusManutencao.PENDENTE,
    description: 'Status: PENDENTE, PARALISADA, EM_MANUTENCAO, CONCLUIDA',
  })
  @IsOptional()
  @IsEnum(StatusManutencao)
  statusManutencao?: StatusManutencao;

  @ApiPropertyOptional({ example: 'TAG-0001' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ example: 'Exaustor' })
  @IsOptional()
  @IsString()
  tipoEquipamentoNome?: string;

  @ApiPropertyOptional({ example: 'Modelo X' })
  @IsOptional()
  @IsString()
  modeloEquipamento?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 'criadoEm',
    enum: [
      'numeroOrdemManutencao',
      'criadoEm',
      'dataRetornoBase',
      'dataInicio',
      'dataTermino',
      'statusManutencao',
    ],
  })
  @IsOptional()
  @IsIn([
    'numeroOrdemManutencao',
    'criadoEm',
    'dataRetornoBase',
    'dataInicio',
    'dataTermino',
    'statusManutencao',
  ])
  sortBy?:
    | 'numeroOrdemManutencao'
    | 'criadoEm'
    | 'dataRetornoBase'
    | 'dataInicio'
    | 'dataTermino'
    | 'statusManutencao';

  @ApiPropertyOptional({
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
