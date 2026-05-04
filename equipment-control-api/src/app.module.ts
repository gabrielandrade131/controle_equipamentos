import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import type { Response } from 'express';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProducoesModule } from './producoes/producoes.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TiposEquipamentoModule } from './tipos-equipamento/tipos-equipamento.module';
import { ManutencoesModule } from './manutencoes/manutencoes.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'frontend', 'build'),
      renderPath: '/{*splat}',
      exclude: ['/api/{*splat}'],
      serveStaticOptions: {
        setHeaders(res: Response, filePath: string) {
          if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          }
        },
      },
    }),
    ProducoesModule,
    PrismaModule,
    UsersModule,
    AuthModule,
    TiposEquipamentoModule,
    ManutencoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
