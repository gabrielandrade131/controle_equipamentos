import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { CreateManutencaoSynchroDto } from './create-manutencao-synchro.dto';

export class CreateManutencoesSynchroBulkDto {
  @ApiProperty({
    type: [CreateManutencaoSynchroDto],
    description: 'Lista de manutenções reenviadas pelo Synchro',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateManutencaoSynchroDto)
  items!: CreateManutencaoSynchroDto[];
}
