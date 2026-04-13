import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateObservacaoDto {
    @ApiProperty({
        example: 'Atrasou por falta de peças',
    })
    @IsString()
    descricao: string;
}