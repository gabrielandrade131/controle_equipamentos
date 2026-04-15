import { Test, TestingModule } from '@nestjs/testing';
import { TiposEquipamentoController } from './tipos-equipamento.controller';

describe('TiposEquipamentoController', () => {
  let controller: TiposEquipamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposEquipamentoController],
    }).compile();

    controller = module.get<TiposEquipamentoController>(TiposEquipamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
