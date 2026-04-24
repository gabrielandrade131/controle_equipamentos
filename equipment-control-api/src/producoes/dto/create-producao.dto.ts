import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsEnum,
    IsOptional,
    IsString,
    ValidateNested,

} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateItemSeriadoDto } from "./create-item-seriado.dto";
import { StatusProducao } from '@prisma/client';

export class CreateProducaoDto {
    @ApiPropertyOptional({ example: '2023-01-01' })
    @IsOptional()
    @IsDateString()
    dataSolicitacao?: string;

    @ApiPropertyOptional({ example: '2026-04-15' })
    @IsOptional()
    @IsDateString()
    dataInicio?: string;

    @ApiPropertyOptional({ example: '2026-04-30' })
    @IsOptional()
    @IsDateString()
    dataTermino?: string;

    @ApiPropertyOptional({
        enum: StatusProducao,
        example: StatusProducao.PROGRAMADA,
    })
    @IsOptional()
    @IsEnum(StatusProducao)
    statusProducao?: StatusProducao;

    @ApiPropertyOptional({ example: 'uuid-do-tipo-de-equipamento' })
    @IsOptional()
    @IsString()
    tipoEquipamentoId?: string;

    @ApiPropertyOptional({ example: 'EXAUSTOR 420 MONOFASICO' })
    @IsOptional()
    @IsString()
    modelo?: string;

    @ApiPropertyOptional({ example: 'Descrição do equipamento' })
    @IsOptional()
    @IsString()
    descricaoComplemento?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    listaPecas?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    sequenciaMontagem?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    inspecaoMontagem?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    historicoEquipamento?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    procedimentoTesteInspecaoMontagem?: boolean;

    @ApiPropertyOptional({
        type: [CreateItemSeriadoDto],
        example: [
            {
                descricao: 'CSEX420 MONOFASICO - W22Xdb - carcaça 80 - 1,1 KW',
            },
        ],
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateItemSeriadoDto)
    itensSeriados?: CreateItemSeriadoDto[];
}
