import { Module } from '@nestjs/common';
import { LotesProducaoController } from './lotes-producao.controller';
import { LotesProducaoService } from './lotes-producao.service';

@Module({
  controllers: [LotesProducaoController],
  providers: [LotesProducaoService]
})
export class LotesProducaoModule {}
