import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,

} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateItemSeriadoDto } from "./create-item-seriado.dto";

export class CreateProducaoDto {
    @ApiProperty({ example: 'OP-001' })
    @IsString()
    numeroOrdem: string;

    @ApiPropertyOptional({ example: 'SER-1001'})
    @IsOptional()
    @IsString()
    numeroSerieBase?: string;

    @ApiPropertyOptional({ example: '2023-01-01' })
    @IsOptional()
    @IsDateString()
    dataSolicitacao?: string;

    @ApiPropertyOptional({ example: 'EXAUSTOR 420 MONOFASICO' })
    @IsOptional()
    @IsString()
    modelo?: string;

    @ApiPropertyOptional({ example: 'Descrição do equipamento' })
    @IsOptional()
    @IsString()
    descricao?: string;

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
