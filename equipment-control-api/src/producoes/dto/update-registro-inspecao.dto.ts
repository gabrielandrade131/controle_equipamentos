import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRegistroInspecaoDto {
  @ApiPropertyOptional({ example: 'Resultado dentro do esperado' })
  @IsOptional()
  @IsString()
  valorObservado?: string;

  @ApiPropertyOptional({ example: 'Multímetro' })
  @IsOptional()
  @IsString()
  instrumentoMedicao?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  conformidades?: boolean;
}
