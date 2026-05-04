import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationProducaoDto } from './pagination-producao.dto';

export enum StatusProducao {
    PROGRAMADA = 'PROGRAMADA',
    PARALISADA = 'PARALISADA',
    EM_ANDAMENTO = 'EM_ANDAMENTO',
    CONCLUIDA = 'CONCLUIDA',
}

export class FilterProducaoDto extends PaginationProducaoDto {
    @ApiPropertyOptional({ example:1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    numeroOrdem?: number;

    @ApiPropertyOptional({ example: 'CSEX420ACM-1'})
    @IsOptional()
    @IsString()
    numeroSerie?: string;

    @ApiPropertyOptional({example: 'CSEX420ACM'})
    @IsOptional()
    @IsString()
    modelo?: string;

    @ApiPropertyOptional({example: 'TAG-0001'})
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({
        enum: StatusProducao,
        example: StatusProducao.PROGRAMADA,
    })
    @IsOptional()
    @IsEnum(StatusProducao)
    statusProducao?: StatusProducao;

    @ApiPropertyOptional({ example: 'uuid-do-tipo-equipamento' })
    @IsOptional()
    @IsString()
    tipoEquipamentoId?: string;

    @ApiPropertyOptional({
        example: 'criadoEm',
        enum: [
            'criadoEm',
            'dataSolicitacao',
            'dataInicio',
            'dataTermino',
            'numeroOrdem',
            'modelo',
            'statusProducao',
        ],
    })
    @IsOptional()
    @IsIn([
        'criadoEm',
        'dataSolicitacao',
        'dataInicio',
        'dataTermino',
        'numeroOrdem',
        'modelo',
        'statusProducao',
    ])
    sortBy?:
    |'criadoEm'
    |'dataSolicitacao'
    |'dataInicio'
    |'dataTermino'
    |'numeroOrdem'
    |'modelo'
    |'statusProducao';

    @ApiPropertyOptional({
        example: 'desc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsIn(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';
}

