import { Test, TestingModule } from '@nestjs/testing';
import { ProducoesController } from './producoes.controller';
import { ProducoesService } from './producoes.service';

describe('ProducoesController', () => {
  let controller: ProducoesController;
  const serviceMock = {
    create: jest.fn(),
    addObservacao: jest.fn(),
    findAll: jest.fn(),
    listObservacoes: jest.fn(),
    findByNumeroOrdem: jest.fn(),
    exportExcel: jest.fn(),
    findOne: jest.fn(),
    listRegistrosInspecaoMontagem: jest.fn(),
    listHistorico: jest.fn(),
    listHistoricoEquipamento: jest.fn(),
    addHistoricoEquipamento: jest.fn(),
    update: jest.fn(),
    updateTag: jest.fn(),
    updateRegistroInspecaoMontagem: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProducoesController],
      providers: [
        {
          provide: ProducoesService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<ProducoesController>(ProducoesController);
  });

  it('adds an observation', async () => {
    const dto = { descricao: 'Obs', responsavel: 'Gabriel' };
    serviceMock.addObservacao.mockResolvedValue({ id: 'obs-1' });

    await controller.addObservacao('prod-1', dto as any);

    expect(serviceMock.addObservacao).toHaveBeenCalledWith('prod-1', dto);
  });

  it('lists productions with filters', async () => {
    const filters = { page: 1 };
    serviceMock.findAll.mockResolvedValue([]);

    await controller.findAll(filters as any);

    expect(serviceMock.findAll).toHaveBeenCalledWith(filters);
  });

  it('lists observations', async () => {
    serviceMock.listObservacoes.mockResolvedValue([]);

    await controller.listObservacoes('prod-1');

    expect(serviceMock.listObservacoes).toHaveBeenCalledWith('prod-1');
  });

  it('finds by numeroOrdem', async () => {
    serviceMock.findByNumeroOrdem.mockResolvedValue({ id: 'prod-1' });

    await controller.findByNumeroOrdem(10);

    expect(serviceMock.findByNumeroOrdem).toHaveBeenCalledWith(10);
  });

  it('exports excel and writes to response', async () => {
    const buffer = Buffer.from('excel');
    serviceMock.exportExcel.mockResolvedValue(buffer);
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    };

    await controller.exportExcel({} as any, res as any);

    expect(serviceMock.exportExcel).toHaveBeenCalledWith({});
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=producoes.xlsx',
    );
    expect(res.send).toHaveBeenCalledWith(buffer);
  });

  it('finds production by id', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 'prod-1' });

    await controller.findOne('prod-1');

    expect(serviceMock.findOne).toHaveBeenCalledWith('prod-1');
  });

  it('lists registros de inspeção', async () => {
    serviceMock.listRegistrosInspecaoMontagem.mockResolvedValue([]);

    await controller.listRegistrosInspecaoMontagem('prod-1');

    expect(serviceMock.listRegistrosInspecaoMontagem).toHaveBeenCalledWith(
      'prod-1',
    );
  });

  it('lists historico', async () => {
    serviceMock.listHistorico.mockResolvedValue([]);

    await controller.listHistorico('prod-1');

    expect(serviceMock.listHistorico).toHaveBeenCalledWith('prod-1');
  });

  it('lists historico equipamento', async () => {
    serviceMock.listHistoricoEquipamento.mockResolvedValue([]);

    await controller.listHistoricoEquipamento('prod-1');

    expect(serviceMock.listHistoricoEquipamento).toHaveBeenCalledWith('prod-1');
  });

  it('adds historico equipamento', async () => {
    const dto = { data: '2024-01-01', historico: 'OK' };
    serviceMock.addHistoricoEquipamento.mockResolvedValue({ id: 'hist-1' });

    await controller.addHistoricoEquipamento('prod-1', dto as any);

    expect(serviceMock.addHistoricoEquipamento).toHaveBeenCalledWith(
      'prod-1',
      dto,
    );
  });

  it('updates a production', async () => {
    const dto = { modelo: 'MX' };
    serviceMock.update.mockResolvedValue({ id: 'prod-1' });

    await controller.update('prod-1', dto as any, { user: { nome: 'Gab' } });

    expect(serviceMock.update).toHaveBeenCalledWith(
      'prod-1',
      dto,
      { nome: 'Gab' },
    );
  });

  it('updates tag', async () => {
    serviceMock.updateTag.mockResolvedValue({ id: 'prod-1' });

    await controller.updateTag('prod-1', { tag: 'TAG-1' } as any);

    expect(serviceMock.updateTag).toHaveBeenCalledWith('prod-1', {
      tag: 'TAG-1',
    });
  });

  it('updates registro de inspeção de montagem', async () => {
    const dto = { valorObservado: 'OK' };
    serviceMock.updateRegistroInspecaoMontagem.mockResolvedValue({
      id: 'reg-1',
    });

    await controller.updateRegistroInspecaoMontagem('prod-1', 1, dto as any);

    expect(serviceMock.updateRegistroInspecaoMontagem).toHaveBeenCalledWith(
      'prod-1',
      1,
      dto,
    );
  });

  it('removes a production', async () => {
    serviceMock.remove.mockResolvedValue({ id: 'prod-1' });

    await controller.remove('prod-1');

    expect(serviceMock.remove).toHaveBeenCalledWith('prod-1');
  });
});
