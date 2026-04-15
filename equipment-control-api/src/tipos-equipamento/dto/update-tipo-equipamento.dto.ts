import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoEquipamentoDto } from './create-tipo-equipamento.dto';

export class UpdateTipoEquipamentoDto extends PartialType(CreateTipoEquipamentoDto) {}
