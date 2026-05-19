import { Test, TestingModule } from '@nestjs/testing';
import { RecebimentosController } from './recebimentos.controller';

describe('RecebimentosController', () => {
  let controller: RecebimentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecebimentosController],
    }).compile();

    controller = module.get<RecebimentosController>(RecebimentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
