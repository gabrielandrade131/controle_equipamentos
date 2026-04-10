import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,

} from "class-validator";
import { Type } from "class-transformer";
import { CreateItemSeriadoDto } from "./create-item-seriado.dto";

export class CreateProducaoDto {
    @IsString()
    numeroOrdem: string;

    @IsOptional()
    @IsString()
    numeroSerie?: string;

    @IsOptional()
    @IsDateString()
    dataSolicitacao?: string;

    @IsOptional()
    @IsString()
    modelo?: string;

    @IsOptional()
    @IsString()
    descricao?: string;

    @IsOptional()
    @IsBoolean()
    listaPecas?: boolean;

    @IsOptional()
    @IsBoolean()
    sequencialMontagem?: boolean;

    @IsOptional()
    @IsBoolean()
    inspecaoMontagem?: boolean;

    @IsOptional()
    @IsBoolean()
    historicoEquipamento?: boolean;

    @IsOptional()
    @IsBoolean()
    procedimentoTesteInspecaoMontagem?: boolean;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateItemSeriadoDto)
    itensSeriados?: CreateItemSeriadoDto[];
}
