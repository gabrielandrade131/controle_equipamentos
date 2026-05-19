import { Module } from '@nestjs/common';
import { RecebimentosService } from './recebimentos.service';
import { RecebimentosController } from './recebimentos.controller';
import { SynchroIntegrationModule } from '../integracoes/synchro/synchro-integration.module';

@Module({
  imports: [SynchroIntegrationModule],
  controllers: [RecebimentosController],
  providers: [RecebimentosService],
})
export class RecebimentosModule {}