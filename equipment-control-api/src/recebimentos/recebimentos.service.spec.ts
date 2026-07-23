import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StatusManutencao, StatusRecebimentoOperacional } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SynchroIntegrationService } from '../integracoes/synchro/synchro-integration.service';
import { RecebimentosService } from './recebimentos.service';

describe('RecebimentosService', () => {
  let service: RecebimentosService;
  let prismaMock: {
    $transaction: jest.Mock;
    recebimentoOperacional: {
      update: jest.Mock;
    };
  };

  const arquivos = [
    { originalname: 'TAG-001_GERAL_1.jpg', filename: 'geral.jpg' },
    { originalname: 'TAG-001_IDENTIFICACAO_1.jpg', filename: 'id.jpg' },
  ] as Express.Multer.File[];

  beforeEach(async () => {
    prismaMock = {
      $transaction: jest.fn(),
      recebimentoOperacional: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecebimentosService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: SynchroIntegrationService,
          useValue: {
            marcarEquipamentosComoRetornados: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<RecebimentosService>(RecebimentosService);
  });

  it('normaliza nomes alternativos e persiste tipo/modelo na manutenção', async () => {
    const tx = {
      recebimentoOperacional: {
        create: jest.fn().mockResolvedValue({ id: 'rec-1' }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'rec-1',
          equipamentos: [],
        }),
      },
      recebimentoEquipamento: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'rec-eq-1' }),
      },
      manutencao: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'man-1' }),
      },
      fotoRecebimentoEquipamento: {
        create: jest.fn().mockResolvedValue({ id: 'foto-1' }),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(tx),
    );
    prismaMock.recebimentoOperacional.update.mockResolvedValue({
      id: 'rec-1',
      statusRecebimento: StatusRecebimentoOperacional.SINCRONIZADO_SYNCHRO,
      equipamentos: [],
    });

    await service.criarRecebimento(
      JSON.stringify({
        osId: 'os-1',
        numeroOs: '6337',
        equipamentos: [
          {
            equipamentoIdSynchro: '1226',
            tag: 'TAG-001',
            numeroSerie: 'SER-001',
            tipoEquipamentoNome: 'Bomba Pneumática',
            modeloEquipamento: 'BP-200',
            retornouFisicamente: true,
            equipamentoConferido: true,
            possuiAvaria: false,
            observacao: 'ok',
          },
        ],
      }),
      arquivos,
    );

    expect(tx.manutencao.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        origem: 'APP_RECEBIMENTO',
        tipoEquipamentoNome: 'Bomba Pneumática',
        modeloEquipamento: 'BP-200',
        tag: 'TAG-001',
        situacaoEquipamento: 'Retornou para a base',
        statusManutencao: StatusManutencao.EM_QUARENTENA,
      }),
    });

    expect(tx.recebimentoEquipamento.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        equipamentoIdSynchro: '1226',
        tag: 'TAG-001',
        numeroSerie: 'SER-001',
        tipoEquipamento: 'Bomba Pneumática',
        modelo: 'BP-200',
      }),
    });
  });

  it('aceita TAG sem modelo, serie ou tipo de equipamento', () => {
    expect(() =>
      (service as any).validarEquipamentosRecebidos(
        [
          {
            tag: 'TAG-001',
            numeroSerie: null,
            tipoEquipamento: null,
            modelo: null,
            retornouFisicamente: true,
            equipamentoConferido: true,
            possuiAvaria: false,
          },
        ],
        arquivos,
      ),
    ).not.toThrow();
  });

  it('rejeita recebimento sem TAG', () => {
    expect(() =>
      (service as any).validarEquipamentosRecebidos(
        [
          {
            tag: null,
            numeroSerie: null,
            tipoEquipamento: null,
            modelo: null,
            retornouFisicamente: true,
            equipamentoConferido: true,
            possuiAvaria: false,
          },
        ],
        arquivos,
      ),
    ).toThrow(
      new BadRequestException('Todo equipamento precisa ter TAG.'),
    );
  });
});
