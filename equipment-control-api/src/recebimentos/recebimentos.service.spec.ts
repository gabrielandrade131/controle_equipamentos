import { Test, TestingModule } from '@nestjs/testing';
import { RecebimentosService } from './recebimentos.service';
import { PrismaService } from '../prisma/prisma.service';
import { SynchroIntegrationService } from '../integracoes/synchro/synchro-integration.service';

describe('RecebimentosService', () => {
  let service: RecebimentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecebimentosService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: SynchroIntegrationService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RecebimentosService>(RecebimentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
