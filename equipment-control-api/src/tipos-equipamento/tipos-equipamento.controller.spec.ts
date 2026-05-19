import { Test, TestingModule } from '@nestjs/testing';
import { TiposEquipamentoController } from './tipos-equipamento.controller';
import { TiposEquipamentoService } from './tipos-equipamento.service';

describe('TiposEquipamentoController', () => {
  let controller: TiposEquipamentoController;
  const serviceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    inativar: jest.fn(),
    ativar: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiposEquipamentoController],
      providers: [
        {
          provide: TiposEquipamentoService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<TiposEquipamentoController>(
      TiposEquipamentoController,
    );
  });

  it('creates a tipo de equipamento', async () => {
    const dto = { nome: 'Gerador' };
    serviceMock.create.mockResolvedValue({ id: 'tipo-1' });

    await controller.create(dto);

    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('lists tipos de equipamento', async () => {
    serviceMock.findAll.mockResolvedValue([]);

    await controller.findAll();

    expect(serviceMock.findAll).toHaveBeenCalledWith();
  });

  it('finds by id', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 'tipo-1' });

    await controller.findOne('tipo-1');

    expect(serviceMock.findOne).toHaveBeenCalledWith('tipo-1');
  });

  it('updates a tipo de equipamento', async () => {
    const dto = { nome: 'Gerador X' };
    serviceMock.update.mockResolvedValue({ id: 'tipo-1' });

    await controller.update('tipo-1', dto);

    expect(serviceMock.update).toHaveBeenCalledWith('tipo-1', dto);
  });

  it('inactivates a tipo de equipamento', async () => {
    serviceMock.inativar.mockResolvedValue({ id: 'tipo-1' });

    await controller.inactivate('tipo-1');

    expect(serviceMock.inativar).toHaveBeenCalledWith('tipo-1');
  });

  it('activates a tipo de equipamento', async () => {
    serviceMock.ativar.mockResolvedValue({ id: 'tipo-1' });

    await controller.activate('tipo-1');

    expect(serviceMock.ativar).toHaveBeenCalledWith('tipo-1');
  });
});
