import { PartialType } from '@nestjs/swagger';
import { CreateLoteProducaoDto } from './create-lote-producao.dto';

export class UpdateLoteProducaoDto extends PartialType(CreateLoteProducaoDto) {}