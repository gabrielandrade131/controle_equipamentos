import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusManutencao } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

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
}
