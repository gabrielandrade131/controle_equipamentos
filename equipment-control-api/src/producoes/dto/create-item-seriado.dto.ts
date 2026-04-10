import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateItemSeriadoDto {
    @ApiProperty({
        example: 'CSEX420 MONOFASICO - W22Xdb - carcaça 80 - 1,1 KW',
    })
    @IsString()
    descricao: string;
}