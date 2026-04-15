import { Test, TestingModule } from '@nestjs/testing';
import { TiposEquipamentoService } from './tipos-equipamento.service';

describe('TiposEquipamentoService', () => {
  let service: TiposEquipamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiposEquipamentoService],
    }).compile();

    service = module.get<TiposEquipamentoService>(TiposEquipamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
