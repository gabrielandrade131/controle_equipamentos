import { Test, TestingModule } from '@nestjs/testing';
import { LotesProducaoService } from './lotes-producao.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LotesProducaoService', () => {
  let service: LotesProducaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LotesProducaoService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<LotesProducaoService>(LotesProducaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('monta numero de serie com modelo, lote e ordem', () => {
    expect((service as any).montarNumeroSerie('CSEX420ACM', 1, 20)).toBe(
      'CSEX420ACM-1-20',
    );
  });
});
