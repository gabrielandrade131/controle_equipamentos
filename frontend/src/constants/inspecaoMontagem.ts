import { CreateInspecaoMontageDto, VerificacaoItem } from '../types/inspecao';

type VerificacaoTemplate = {
  nome: string;
  instrumentoMedicao?: string;
};

const buildVerificacaoItems = (
  templates: VerificacaoTemplate[],
  prefixo: string,
): VerificacaoItem[] =>
  templates.map((template, index) => ({
    id: `${prefixo}-${index}`,
    nome: template.nome,
    valorObservado: '',
    instrumentoMedicao: template.instrumentoMedicao ?? '',
    conformidade: '',
  }));

const INSTRUMENTOS_AFERICAO_TEMPLATES: VerificacaoTemplate[] = [
  {
    nome: 'Os instrumentos encontram-se limpos e em perfeitas condições de uso? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
  },
  {
    nome: 'Os instrumentos encontram-se com seus certificados de calibração em dia? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
  },
];

const VERIFICACOES_GERAIS_PREMONTAGEM_TEMPLATES: VerificacaoTemplate[] = [
  {
    nome: 'Check dos Itens dos Seriados',
    instrumentoMedicao: 'AVALIAÇÃO VISUAL',
  },
  {
    nome: 'Análise Dimensional da Carcaça',
    instrumentoMedicao: 'TRENA / Nº Série',
  },
  {
    nome: 'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
    instrumentoMedicao: 'TRENA / Nº Série',
  },
  {
    nome: 'Resultado Esperado: Modelo CSEX420AC entre 415 e 430mm',
    instrumentoMedicao: 'TRENA / Nº Série',
  },
  {
    nome: 'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
    instrumentoMedicao: 'TRENA / Nº Série',
  },
  {
    nome: 'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
    instrumentoMedicao: 'TRENA / Nº Série',
  },
  {
    nome: 'Teste de Aterramento do Motor',
    instrumentoMedicao: 'MEGÔMETRO / Nº Série',
  },
  {
    nome: 'Teste de Isolação do Motor',
    instrumentoMedicao: 'MULTÍMETRO / MEGÔMETRO / Nº Série',
  },
  {
    nome: 'Aplicação e aferição de Torque do Motor M4',
    instrumentoMedicao: 'TORQUÍMETRO / Nº Série',
  },
  {
    nome: 'Aplicação e aferição de Torque do Motor M5',
    instrumentoMedicao: 'TORQUÍMETRO / Nº Série',
  },
  {
    nome: 'Aplicação e aferição de Torque (botoeira)',
    instrumentoMedicao: 'TORQUÍMETRO / Nº Série',
  },
  {
    nome: 'Teste de Funcionamento do Motor',
    instrumentoMedicao: 'AMPERÍMETRO / Nº Série',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX420RM',
    instrumentoMedicao: 'TACÔMETRO / Nº Série',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX420AC',
    instrumentoMedicao: 'TACÔMETRO / Nº Série',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX550AC',
    instrumentoMedicao: 'TACÔMETRO / Nº Série',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX550SS',
    instrumentoMedicao: 'TACÔMETRO / Nº Série',
  },
];

const VERIFICACAO_POSMONTAGEM_TEMPLATES: VerificacaoTemplate[] = [
  {
    nome: 'Teste de Aterramento (Resultado Esperado: >=0)',
  },
  {
    nome: 'Teste de Isolação (Resultado Esperado: >=0)',
  },
  {
    nome: 'Teste de Funcionamento (Inspeção visual de estado de funcionamento do equipamento)',
  },
  {
    nome: 'Teste de Rotação - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
  },
  {
    nome: 'Teste de Rotação - Modelo CSEX42DAC (3.600 rpm, com tolerância de -150 rpm)',
  },
  {
    nome: 'Teste de Rotação - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
  },
  {
    nome: 'Teste de Rotação - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
  },
  {
    nome: 'Teste de Temperatura (Range: 30 a 40 graus C)',
  },
  {
    nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420RM ou T<=96.2 SPL(a) dB]',
  },
  {
    nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420AC ou T<=97 SPL(a) dB]',
  },
  {
    nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX550AC ou T<=89 SPL(a) dB]',
  },
  {
    nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX550SS ou T<=89 SPL(a) dB]',
  },
  {
    nome: 'Teste de Continuidade (Resultado: >=0)',
  },
];

export type LinhaVerificacaoInspecaoPdf = {
  itemIndex: number;
  titulo: string;
  detalhes: string[];
  instrumentoPadrao: string;
};

export const LINHAS_PREMONTAGEM_INSPECAO_PDF: LinhaVerificacaoInspecaoPdf[] = [
  {
    itemIndex: 0,
    titulo: 'Check dos Itens dos Seriados',
    detalhes: ['(Números de série do motor, caixa elétrica e plug conferem com Ordem Produção?)'],
    instrumentoPadrao: 'AVALIAÇÃO VISUAL',
  },
  {
    itemIndex: 1,
    titulo: 'Análise Dimensional da Carcaça',
    detalhes: [
      'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
      'Resultado Esperado: Modelo CSEX420AC entre 415 e 430mm',
      'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
      'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
    ],
    instrumentoPadrao: 'TRENA / Nº Série',
  },
  {
    itemIndex: 6,
    titulo: 'Teste de Aterramento do Motor',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MEGÔMETRO / Nº Série',
  },
  {
    itemIndex: 7,
    titulo: 'Teste de Isolação do Motor',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MULTÍMETRO ( ) / MEGÔMETRO ( ) / Nº Série',
  },
  {
    itemIndex: 8,
    titulo: 'Aplicação e aferição de Torque do Motor',
    detalhes: ['Resultado Esperado para rosca M4: 1,5'],
    instrumentoPadrao: 'TORQUÍMETRO / Nº Série',
  },
  {
    itemIndex: 9,
    titulo: 'Aplicação e aferição de Torque do motor',
    detalhes: ['Resultado Esperado para rosca M5: 2'],
    instrumentoPadrao: 'TORQUÍMETRO / Nº Série',
  },
  {
    itemIndex: 10,
    titulo: 'Aplicação e aferição de Torque (botoeira)',
    detalhes: ['Resultado esperado: 2Nm'],
    instrumentoPadrao: 'TORQUÍMETRO / Nº Série',
  },
  {
    itemIndex: 11,
    titulo: 'Teste de Funcionamento do Motor',
    detalhes: ['Inspeção visual do estado de funcionamento do equipamento'],
    instrumentoPadrao: 'AMPERÍMETRO / Nº Série',
  },
  {
    itemIndex: 12,
    titulo: 'Teste de Rotação do Motor',
    detalhes: [
      'Resultado Esperado: Modelo CSEX420RM 3.390 rpm, com tolerância de -150 rpm',
      'Resultado Esperado: Modelo CSEX420AC 3.600 rpm, com tolerância de -150 rpm',
      'Resultado Esperado: Modelo CSEX550AC 1.800 rpm, com tolerância de -150 rpm',
      'Resultado Esperado: Modelo CSEX550SS 1.800 rpm, com tolerância de -150 rpm',
    ],
    instrumentoPadrao: 'TACÔMETRO / Nº Série',
  },
];

export const LINHAS_POSMONTAGEM_INSPECAO_PDF: LinhaVerificacaoInspecaoPdf[] = [
  {
    itemIndex: 0,
    titulo: 'Teste de Aterramento',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MULTÍMETRO ( ) / MEGÔMETRO ( ) / Nº Série',
  },
  {
    itemIndex: 1,
    titulo: 'Teste de Isolação',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MEGÔMETRO / Nº Série',
  },
  {
    itemIndex: 2,
    titulo: 'Teste de Funcionamento',
    detalhes: ['Inspeção visual de estado de funcionamento do equipamento'],
    instrumentoPadrao: 'AMPERÍMETRO / Nº Série',
  },
  {
    itemIndex: 3,
    titulo: 'Teste de Rotação',
    detalhes: [
      'Resultado Esperado: Modelo CSEX420RM 3.390 rpm, com tolerância de -150 rpm',
      'Resultado Esperado: Modelo CSEX420AC 3.600 rpm, com tolerância de -150 rpm',
      'Resultado Esperado: Modelo CSEX550AC 1.800 rpm, com tolerância de -150 rpm',
      'Resultado Esperado: Modelo CSEX550SS 1.800 rpm, com tolerância de -150 rpm',
    ],
    instrumentoPadrao: 'TACÔMETRO / Nº Série',
  },
  {
    itemIndex: 7,
    titulo: 'Teste de Temperatura',
    detalhes: ['Range: 30 a 40 graus celsius'],
    instrumentoPadrao: 'TERMÔMETRO LASER / Nº Série',
  },
  {
    itemIndex: 8,
    titulo: 'Teste de Decibéis',
    detalhes: [
      'Resultado Esperado: Modelo CSEX420RM ou T <= 96.2 SPL(A) dB',
      'Resultado Esperado: Modelo CSEX420AC ou T <= 97 SPL(A) dB',
      'Resultado Esperado: Modelo CSEX550AC ou T <= 89 SPL(A) dB',
      'Resultado Esperado: Modelo CSEX550SS ou T <= 89 SPL(A) dB',
    ],
    instrumentoPadrao: 'DECIBELÍMETRO / Nº Série',
  },
  {
    itemIndex: 12,
    titulo: 'Teste de Continuidade',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MULTÍMETRO / Nº Série',
  },
];

export const NOMES_INSTRUMENTOS_AFERICAO = INSTRUMENTOS_AFERICAO_TEMPLATES.map(({ nome }) => nome);

export const NOMES_VERIFICACOES_GERAIS_PREMONTAGEM = VERIFICACOES_GERAIS_PREMONTAGEM_TEMPLATES.map(
  ({ nome }) => nome,
);

export const NOMES_VERIFICACAO_POSMONTAGEM = VERIFICACAO_POSMONTAGEM_TEMPLATES.map(({ nome }) => nome);

export const criarFormularioInspecaoMontagemVazio = (): CreateInspecaoMontageDto => {
  const dataAtual = new Date().toISOString().split('T')[0];

  return {
    numeroSerie: '',
    dataInspecao: dataAtual,
    modelo: '',
    instrumentosAferição: buildVerificacaoItems(INSTRUMENTOS_AFERICAO_TEMPLATES, 'inst'),
    verificacoesGeraisPremontagem: buildVerificacaoItems(
      VERIFICACOES_GERAIS_PREMONTAGEM_TEMPLATES,
      'vgpm',
    ),
    verificacaoPosmontagem: buildVerificacaoItems(VERIFICACAO_POSMONTAGEM_TEMPLATES, 'pos'),
    resultadoFinal: '',
    observacoes: undefined,
    responsavel: '',
    data: dataAtual,
    nomeAssinante: '',
    aprovado: false,
  };
};