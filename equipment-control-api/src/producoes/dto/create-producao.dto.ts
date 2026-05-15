import {
    IsArray,
    IsDateString,
    IsOptional,
    IsString,
    ValidateNested,

} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CreateItemSeriadoDto } from "./create-item-seriado.dto";

export class CreateProducaoDto {
    @ApiPropertyOptional({ example: '2023-01-01' })
    @IsOptional()
    @IsDateString()
    dataSolicitacao?: string;

    @ApiPropertyOptional({ example: '2026-05-20' })
    @IsOptional()
    @IsDateString()
    dataNecessidade?: string;

    @ApiPropertyOptional({ example: '2026-05-20' })
    @IsOptional()
    @IsDateString()
    dataPrevisao?: string;

    @ApiPropertyOptional({ example: 'João Junior' })
    @IsOptional()
    @IsString()
    solicitante?: string;

    @ApiPropertyOptional({ example: '2026-04-15' })
    @IsOptional()
    @IsDateString()
    dataInicio?: string;

    @ApiPropertyOptional({ example: '2026-04-30' })
    @IsOptional()
    @IsDateString()
    previsaoTermino?: string;

    @ApiPropertyOptional({ example: '2026-04-30' })
    @IsOptional()
    @IsDateString()
    dataTermino?: string;

    @ApiPropertyOptional({
        example: 'PROGRAMADA',
        description: 'Status: PROGRAMADA, PARALISADA, EM_ANDAMENTO, CONCLUIDA'
    })
    @IsOptional()
    @IsString()
    statusProducao?: string;

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

    @ApiPropertyOptional({ example: 'Descrição ou "Sim"/"Não"' })
    @IsOptional()
    @IsString()
    listaPecas?: string;

    @ApiPropertyOptional({ example: 'Descrição ou "Sim"/"Não"' })
    @IsOptional()
    @IsString()
    sequencialMontagem?: string;

    @ApiPropertyOptional({ example: 'Descrição ou "Sim"/"Não"' })
    @IsOptional()
    @IsString()
    inspecaoMontagem?: string;

    @ApiPropertyOptional({ example: 'Descrição ou "Sim"/"Não"' })
    @IsOptional()
    @IsString()
    historicoEquipamento?: string;

    @ApiPropertyOptional({ example: 'Descrição do procedimento, ex: PR-MAN-003' })
    @IsOptional()
    @IsString()
    procedimentoTestes?: string;

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
