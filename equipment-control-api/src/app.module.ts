import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducoesModule } from './producoes/producoes.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ProducoesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
