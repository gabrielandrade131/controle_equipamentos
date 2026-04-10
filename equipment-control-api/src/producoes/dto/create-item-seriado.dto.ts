import { IsString } from 'class-validator';

export class CreateItemSeriadoDto {
    @IsString()
    descricao: string;
}