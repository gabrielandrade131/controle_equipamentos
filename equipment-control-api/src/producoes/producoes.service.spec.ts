import { Test, TestingModule } from '@nestjs/testing';
import { ProducoesService } from './producoes.service';

describe('ProducoesService', () => {
  let service: ProducoesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProducoesService],
    }).compile();

    service = module.get<ProducoesService>(ProducoesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
