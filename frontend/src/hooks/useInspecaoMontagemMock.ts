import { CreateInspecaoMontageDto, VerificacaoItem } from '../types/inspecao';

// Arrays fixos conforme formulário
const INSTRUMENTOS_AFERIÇÃO = [
  'Os Instrumentos encontram-se limpos e em perfeitas condições de uso? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
  'Os instrumentos encontram-se com seus certificados de calibração em dia? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)'
];

const VERIFICACOES_GERAIS_PREMONTAGEM = [
  'Check dos Itens dos Seriados (Números de série do motor, caixa elétrica e plug conferem com Ordem Produção?)',
  '@SECTION:Análise Dimensional de Carcaça',
  'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
  'Resultado Esperado: Modelo CSC3420AC entre 415 e 430mm',
  'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
  'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
  'Teste de Aterramento do Motor (Resultado Esperado: >=0)',
  'Teste de Isolação do Motor(Resultado Esperado: >=0)',
  'Aplicação e aferição de Torque do Motor (Resultado esperado para rosca M4: 1,5)',
  'Aplicação e aferição de Torque do motor (Resultado esperado para rosca M5: 2)',
  'Aplicação e aferição de Torque (botoeira) (Resultado esperado: 2Nm)',
  'Teste de Funcionamento do Motor (Inspeção visual de estado de funcionamento do equipamento)',
  'Teste de Rotação do Motor - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação do Motor - Modelo CSEX420AC (3.000 rpm, com tolerância de 150 rpm)',
  'Teste de Rotação do Motor - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação do Motor - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)'
];

const VERIFICACAO_POSMONTAGEM = [
  'Teste de Aterramento (Resultado Esperado: >=0)',
  'Teste de Isolação (Resultado Esperado: >=0)',
  'Teste de Funcionamento (Inspeção visual de estado de funcionamento do equipamento)',
  'Teste de Rotação - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação - Modelo CSEX42DAC (3.600 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
  'Teste de Temperatura (Range: 30 a 40 graus C)',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX420RM ou T<=96.2 SPL(a) dB]',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX420AC ou T<=97 SPL(a) dB]',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX550AC ou T<=89 SPL(a) dB]',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX550SS ou T<=89 SPL(a) dB]',
  'Teste de Continuidade (Resultado: >=0)'
];

// Mock 1 - Inspeção APROVADA
export const mockInspecaoAprovada: CreateInspecaoMontageDto = {
  numeroSerie: 'CSEX420ACM-0559',
  dataInspecao: '2026-04-24',
  modelo: 'CSEX420ACM',
  instrumentosAferição: [
    {
      id: 'inst-0',
      nome: INSTRUMENTOS_AFERIÇÃO[0],
      conformidade: 'SIM'
    },
    {
      id: 'inst-1',
      nome: INSTRUMENTOS_AFERIÇÃO[1],
      conformidade: 'SIM'
    }
  ],
  verificacoesGeraisPremontagem: [
    {
      id: 'vgpm-0',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[0],
      valorObservado: 'OK - Conferidos',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-1',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[1],
      conformidade: ''
    },
    {
      id: 'vgpm-2',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[2],
      valorObservado: '420mm',
      instrumentoMedicao: 'Paquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-3',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[3],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-4',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[4],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-5',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[5],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-6',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[6],
      valorObservado: '0.2',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-7',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[7],
      valorObservado: '500',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-8',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[8],
      valorObservado: '1.5',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-9',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[9],
      valorObservado: '2.0',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-10',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[10],
      valorObservado: '2.0',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-11',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[11],
      valorObservado: 'Motor funcionando normalmente',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-12',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[12],
      valorObservado: '3390',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-13',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[13],
      valorObservado: '3000',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-14',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[14],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-15',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[15],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    }
  ],
  verificacaoPosmontagem: [
    {
      id: 'pos-0',
      nome: VERIFICACAO_POSMONTAGEM[0],
      valorObservado: '0.2',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-1',
      nome: VERIFICACAO_POSMONTAGEM[1],
      valorObservado: '500',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-2',
      nome: VERIFICACAO_POSMONTAGEM[2],
      valorObservado: 'Motor funcionando normalmente',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'SIM'
    },
    {
      id: 'pos-3',
      nome: VERIFICACAO_POSMONTAGEM[3],
      valorObservado: '3390',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-4',
      nome: VERIFICACAO_POSMONTAGEM[4],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-5',
      nome: VERIFICACAO_POSMONTAGEM[5],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-6',
      nome: VERIFICACAO_POSMONTAGEM[6],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-7',
      nome: VERIFICACAO_POSMONTAGEM[7],
      valorObservado: '35',
      instrumentoMedicao: 'Termômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-8',
      nome: VERIFICACAO_POSMONTAGEM[8],
      valorObservado: '95.8',
      instrumentoMedicao: 'Decibelímetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-9',
      nome: VERIFICACAO_POSMONTAGEM[9],
      valorObservado: '96.5',
      instrumentoMedicao: 'Decibelímetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-10',
      nome: VERIFICACAO_POSMONTAGEM[10],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-11',
      nome: VERIFICACAO_POSMONTAGEM[11],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-12',
      nome: VERIFICACAO_POSMONTAGEM[12],
      valorObservado: '0',
      instrumentoMedicao: 'Multímetro',
      conformidade: 'SIM'
    }
  ],
  resultadoFinal: 'APROVADO',
  responsavel: 'João da Silva',
  data: '2026-04-24'
};

// Mock 2 - Inspeção REPROVADA
export const mockInspecaoReprovada: CreateInspecaoMontageDto = {
  numeroSerie: 'CSEX550AC-0342',
  dataInspecao: '2026-04-23',
  modelo: 'CSEX550AC',
  instrumentosAferição: [
    {
      id: 'inst-0',
      nome: INSTRUMENTOS_AFERIÇÃO[0],
      conformidade: 'SIM'
    },
    {
      id: 'inst-1',
      nome: INSTRUMENTOS_AFERIÇÃO[1],
      conformidade: 'NÃO'
    }
  ],
  verificacoesGeraisPremontagem: [
    {
      id: 'vgpm-0',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[0],
      valorObservado: 'Divergência encontrada',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-1',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[1],
      conformidade: ''
    },
    {
      id: 'vgpm-2',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[2],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-3',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[3],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-4',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[4],
      valorObservado: '555',
      instrumentoMedicao: 'Paquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-5',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[5],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-6',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[6],
      valorObservado: '50',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-7',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[7],
      valorObservado: '100',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-8',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[8],
      valorObservado: '1.2',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-9',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[9],
      valorObservado: '1.8',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-10',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[10],
      valorObservado: '1.5',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-11',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[11],
      valorObservado: 'Motor não funciona',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-12',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[12],
      valorObservado: '0',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-13',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[13],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-14',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[14],
      valorObservado: '1850',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-15',
      nome: VERIFICACOES_GERAIS_PREMONTAGEM[15],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    }
  ],
  verificacaoPosmontagem: [
    {
      id: 'pos-0',
      nome: VERIFICACAO_POSMONTAGEM[0],
      valorObservado: 'Sem resposta',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-1',
      nome: VERIFICACAO_POSMONTAGEM[1],
      valorObservado: 'Sem resposta',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-2',
      nome: VERIFICACAO_POSMONTAGEM[2],
      valorObservado: 'Motor não responde',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-3',
      nome: VERIFICACAO_POSMONTAGEM[3],
      valorObservado: '0',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-4',
      nome: VERIFICACAO_POSMONTAGEM[4],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-5',
      nome: VERIFICACAO_POSMONTAGEM[5],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-6',
      nome: VERIFICACAO_POSMONTAGEM[6],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-7',
      nome: VERIFICACAO_POSMONTAGEM[7],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-8',
      nome: VERIFICACAO_POSMONTAGEM[8],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-9',
      nome: VERIFICACAO_POSMONTAGEM[9],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-10',
      nome: VERIFICACAO_POSMONTAGEM[10],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-11',
      nome: VERIFICACAO_POSMONTAGEM[11],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-12',
      nome: VERIFICACAO_POSMONTAGEM[12],
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    }
  ],
  resultadoFinal: 'REPROVADO',
  responsavel: 'Maria Santos',
  data: '2026-04-23'
};

// Hook para obter os mocks
export const useInspecaoMontagemMock = () => {
  return {
    mockInspecaoAprovada,
    mockInspecaoReprovada,
    mockInspecoes: [mockInspecaoAprovada, mockInspecaoReprovada]
  };
};
