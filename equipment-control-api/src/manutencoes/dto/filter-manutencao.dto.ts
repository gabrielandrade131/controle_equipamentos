import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusManutencao } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationManutencaoDto } from './pagination-manutencao.dto';

export class FilterManutencaoDto {
    @ApiPropertyOptional({ 
        enum: StatusManutencao,
        example: StatusManutencao.PENDENTE,
    })
    @IsOptional()
    @IsEnum(StatusManutencao)
    statusManutencao?: StatusManutencao;

    @ApiPropertyOptional({ example: 'TAG-0001'})
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ example: 'SN-12345'})
    @IsOptional()
    @IsString()
    numeroSerie?: string;

    @ApiPropertyOptional({ example: 'Exaustor'})
    @IsOptional()
    @IsString()
    tipoEquipamentoNome?: string;

    @ApiPropertyOptional({ example: 'Modelo X'})
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
        enum: ['criadoEm', 'dataRetornoBase', 'dataInicio', 'dataTermino', 'statusManutencao'],
    })
    @IsOptional()
    @IsIn(['criadoEm', 'dataRetornoBase', 'dataInicio', 'dataTermino', 'statusManutencao'])
    sortBy?: 'criadoEm' | 'dataRetornoBase' | 'dataInicio' | 'dataTermino' | 'statusManutencao';

    @ApiPropertyOptional({
        example: 'desc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}
