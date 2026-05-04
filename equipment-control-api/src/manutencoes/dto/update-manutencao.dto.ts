import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateManutencaoDto {
    @ApiPropertyOptional({
        example: 'Troca de rolamento, reaperto geral e revisão completa',
    })
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

    @ApiPropertyOptional({ example: '2026-04-20' })
    @IsOptional()
    @IsDateString()
    dataInicio?: string;

    @ApiPropertyOptional({ example: '2026-04-25' })
    @IsOptional()
    @IsDateString()
    dataTermino?: string;
}
