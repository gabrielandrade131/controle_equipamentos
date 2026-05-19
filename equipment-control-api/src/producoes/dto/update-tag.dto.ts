import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ example: 'TAG-0001' })
  @IsString()
  tag: string;
}
