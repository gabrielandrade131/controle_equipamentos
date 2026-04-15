import { Module } from '@nestjs/common';
import { TiposEquipamentoController } from './tipos-equipamento.controller';
import { TiposEquipamentoService } from './tipos-equipamento.service';

@Module({
  controllers: [TiposEquipamentoController],
  providers: [TiposEquipamentoService]
})
export class TiposEquipamentoModule {}
