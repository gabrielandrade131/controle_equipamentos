import { Module } from '@nestjs/common';
import { RecebimentosController } from './recebimentos.controller';
import { RecebimentosService } from './recebimentos.service';

@Module({
  controllers: [RecebimentosController],
  providers: [RecebimentosService]
})
export class RecebimentosModule {}
