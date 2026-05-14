import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }

    async onModuleInit() {
        try {
            await this.$connect();
            console.log('✓ Conectado ao banco de dados');
        } catch (error) {
            console.error('✗ Erro ao conectar ao banco de dados:', error);
            console.warn('⚠️ API iniciada sem conexão ativa com o banco.');
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
