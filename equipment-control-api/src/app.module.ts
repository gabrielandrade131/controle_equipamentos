import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducoesModule } from './producoes/producoes.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TiposEquipamentoModule } from './tipos-equipamento/tipos-equipamento.module';

@Module({
  imports: [ProducoesModule, PrismaModule, UsersModule, AuthModule, TiposEquipamentoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
