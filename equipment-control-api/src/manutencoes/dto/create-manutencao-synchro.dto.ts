import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateManutencaoSynchroDto {
    @ApiPropertyOptional({ example: 'SYNCHRO-12345' })
    @IsOptional()
    @IsString()
    synchroId?: string;

    @ApiPropertyOptional({ example: 'Exaustor' })
    @IsOptional()
    @IsString()
    tipoEquipamentoNome?: string;

    @ApiPropertyOptional({ example: 'Exaustor 420 Monofásico' })
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

    @ApiPropertyOptional({ example: 'Retornou para a base' })
    @IsOptional()
    @IsString()
    situacaoEquipamento?: string;

    @ApiPropertyOptional({ example: '2026-04-16' })
    @IsOptional()
    @IsDateString()
    dataRetornoBase?: string;
}
