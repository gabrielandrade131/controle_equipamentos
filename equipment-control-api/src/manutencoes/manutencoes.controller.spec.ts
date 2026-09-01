import { Test, TestingModule } from '@nestjs/testing';
import { ManutencoesController } from './manutencoes.controller';
import { ManutencoesService } from './manutencoes.service';

describe('ManutencoesController', () => {
  let controller: ManutencoesController;
  const serviceMock = {
    createFromSynchro: jest.fn(),
    createBulkFromSynchro: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    exportExcel: jest.fn(),
    findOne: jest.fn(),
    listHistorico: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManutencoesController],
      providers: [
        {
          provide: ManutencoesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ManutencoesController>(ManutencoesController);
  });

  it('creates maintenance from synchro', async () => {
    const dto = { synchroId: 'syn-1' };
    serviceMock.createFromSynchro.mockResolvedValue({ id: 'man-1' });

    await controller.createFromSynchro(dto);

    expect(serviceMock.createFromSynchro).toHaveBeenCalledWith(dto);
  });

  it('imports bulk maintenances from synchro', async () => {
    const dto = { items: [{ synchroId: 'syn-1' }] };
    serviceMock.createBulkFromSynchro.mockResolvedValue({ total: 1 });

    await controller.createBulkFromSynchro(dto);

    expect(serviceMock.createBulkFromSynchro).toHaveBeenCalledWith(dto.items);
  });

  it('creates maintenance manually', async () => {
    const dto = { tag: 'TAG-1' };
    serviceMock.create.mockResolvedValue({ id: 'man-1' });

    await controller.create({ role: 'ADMIN' } as any, dto);

    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('lists maintenances with filters', async () => {
    const filters = { page: 1 };
    serviceMock.findAll.mockResolvedValue([]);

    await controller.findAll(filters);

    expect(serviceMock.findAll).toHaveBeenCalledWith(filters);
  });

  it('exports excel and writes to response', async () => {
    const buffer = Buffer.from('excel');
    serviceMock.exportExcel.mockResolvedValue(buffer);
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    await controller.exportExcel({ role: 'ADMIN' } as any, {}, res as any);

    expect(serviceMock.exportExcel).toHaveBeenCalledWith({});
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('finds maintenance by id', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 'man-1' });

    await controller.findOne('man-1');

    expect(serviceMock.findOne).toHaveBeenCalledWith('man-1');
  });

  it('lists maintenance history', async () => {
    serviceMock.listHistorico.mockResolvedValue([]);

    await controller.listHistorico('man-1');

    expect(serviceMock.listHistorico).toHaveBeenCalledWith('man-1');
  });

  it('updates maintenance', async () => {
    const dto = { tag: 'TAG-2' };
    serviceMock.update.mockResolvedValue({ id: 'man-1' });

    await controller.update('man-1', dto, { user: { nome: 'Gab' } });

    expect(serviceMock.update).toHaveBeenCalledWith('man-1', dto, {
      nome: 'Gab',
    });
  });

  it('removes maintenance', async () => {
    serviceMock.remove.mockResolvedValue({ id: 'man-1' });

    await controller.remove({ role: 'ADMIN' } as any, 'man-1');

    expect(serviceMock.remove).toHaveBeenCalledWith('man-1');
  });
});
