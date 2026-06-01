import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusProducao } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLoteProducaoDto {
  @ApiPropertyOptional({ example: 'uuid-do-tipo-equipamento' })
  @IsOptional()
  @IsString()
  tipoEquipamentoId?: string;

  @ApiProperty({ example: 'CSEX420ACM' })
  @IsString()
  modelo: string;

  @ApiPropertyOptional({ example: 'Exaustor 420 Monofásico' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: 'Joao Silva' })
  @IsOptional()
  @IsString()
  solicitante?: string;

  @ApiProperty({ example: 20 })
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiPropertyOptional({ example: '2026-05-01' })
  @IsOptional()
  @IsDateString()
  dataSolicitacao?: string;

  @ApiPropertyOptional({ example: '2026-05-02' })
  @IsOptional()
  @IsDateString()
  dataInicio?: string;

  @ApiPropertyOptional({ example: '2026-05-03' })
  @IsOptional()
  @IsDateString()
  dataNecessidade?: string;

  @ApiPropertyOptional({ example: '2026-05-03' })
  @IsOptional()
  @IsDateString()
  previsaoTermino?: string;

  @ApiPropertyOptional({ example: '2026-05-10' })
  @IsOptional()
  @IsDateString()
  dataTermino?: string;

  @ApiPropertyOptional({
    example: StatusProducao.PROGRAMADA,
    enum: StatusProducao,
  })
  @IsOptional()
  @IsEnum(StatusProducao)
  statusProducao?: StatusProducao;
}
