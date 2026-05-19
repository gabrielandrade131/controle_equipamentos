import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateObservacaoDto {
  @ApiProperty({
    example: 'Atrasou por falta de peças',
  })
  @IsString()
  @IsNotEmpty()
  descricao: string;

  @ApiProperty({
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  responsavel: string;
}
