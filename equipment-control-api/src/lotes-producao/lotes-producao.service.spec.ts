import { Test, TestingModule } from '@nestjs/testing';
import { LotesProducaoService } from './lotes-producao.service';

describe('LotesProducaoService', () => {
  let service: LotesProducaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LotesProducaoService],
    }).compile();

    service = module.get<LotesProducaoService>(LotesProducaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
