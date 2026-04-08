import { Module } from '@nestjs/common';
import { ProducoesController } from './producoes.controller';
import { ProducoesService } from './producoes.service';

@Module({
  controllers: [ProducoesController],
  providers: [ProducoesService]
})
export class ProducoesModule {}
