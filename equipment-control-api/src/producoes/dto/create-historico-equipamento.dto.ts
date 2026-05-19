import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

export class CreateHistoricoEquipamentoDto {
  @ApiProperty({ example: '2026-05-07' })
  @IsDateString()
  data: string;

  @ApiProperty({ example: 'Troca do motor principal.' })
  @IsString()
  historico: string;

  @ApiProperty({ example: 'Joao Junior' })
  @IsString()
  assinatura: string;
}
