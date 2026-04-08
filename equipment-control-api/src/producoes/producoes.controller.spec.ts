import { Test, TestingModule } from '@nestjs/testing';
import { ProducoesController } from './producoes.controller';

describe('ProducoesController', () => {
  let controller: ProducoesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducoesController],
    }).compile();

    controller = module.get<ProducoesController>(ProducoesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
