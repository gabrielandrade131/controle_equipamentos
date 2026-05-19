import { Test, TestingModule } from '@nestjs/testing';
import { RecebimentosService } from './recebimentos.service';

describe('RecebimentosService', () => {
  let service: RecebimentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecebimentosService],
    }).compile();

    service = module.get<RecebimentosService>(RecebimentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
