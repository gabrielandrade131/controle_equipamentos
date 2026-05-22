import { Test, TestingModule } from '@nestjs/testing';
import { LotesProducaoController } from './lotes-producao.controller';
import { LotesProducaoService } from './lotes-producao.service';

describe('LotesProducaoController', () => {
  let controller: LotesProducaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LotesProducaoController],
      providers: [
        {
          provide: LotesProducaoService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<LotesProducaoController>(LotesProducaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
