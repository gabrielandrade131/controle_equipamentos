import { Module } from '@nestjs/common';
import { SynchroIntegrationService } from './synchro-integration.service';

@Module({
  providers: [SynchroIntegrationService],
  exports: [SynchroIntegrationService],
})
export class SynchroIntegrationModule {}