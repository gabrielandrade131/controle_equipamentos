import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTipoEquipamentoDto {
    @ApiProperty({ example: 'Exaustor' })
    @IsString()
    nome: string;
    
}