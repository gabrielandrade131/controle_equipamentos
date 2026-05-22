import { Test, TestingModule } from '@nestjs/testing';
import { RecebimentosController } from './recebimentos.controller';
import { RecebimentosService } from './recebimentos.service';

describe('RecebimentosController', () => {
  let controller: RecebimentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecebimentosController],
      providers: [
        {
          provide: RecebimentosService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RecebimentosController>(RecebimentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
