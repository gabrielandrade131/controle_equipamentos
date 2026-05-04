import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateManutencaoDto {
  @ApiPropertyOptional({ example: 'Exaustor' })
  @IsOptional()
  @IsString()
  tipoEquipamentoNome?: string;

  @ApiPropertyOptional({ example: 'Exaustor 420 Monofasico' })
  @IsOptional()
  @IsString()
  modeloEquipamento?: string;

  @ApiPropertyOptional({ example: 'CSEX420ACM-0559' })
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

  @ApiPropertyOptional({ example: 'Diagnostico inicial' })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiPropertyOptional({ example: 'Joao da Silva' })
  @IsOptional()
  @IsString()
  responsavelManutencao?: string;

  @ApiPropertyOptional({
    example: 'EM_MANUTENCAO',
    description: 'Status: PENDENTE, PARALISADA, EM_MANUTENCAO, CONCLUIDA'
  })
  @IsOptional()
  @IsString()
  statusManutencao?: string;
}
