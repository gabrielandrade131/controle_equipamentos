import { CreateInspecaoMontageDto, VerificacaoItem } from '../types/inspecao';
import { getLocalDateInput } from '../utils/date';

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
    instrumentoMedicao: 'TRENA\nNºSérie:',
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
    instrumentoMedicao: 'MEGÔMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Isolação do Motor',
    instrumentoMedicao: 'MULTÍMETRO☐/MEGÔMETRO☐\nNºSérie:',
  },
  {
    nome: 'Aplicação e aferição de Torque do Motor M4',
    instrumentoMedicao: 'TORQUÍMETRO\nNºSérie:',
  },
  {
    nome: 'Aplicação e aferição de Torque do Motor M5',
    instrumentoMedicao: 'TORQUÍMETRO\nNºSérie:',
  },
  {
    nome: 'Aplicação e aferição de Torque (botoeira)',
    instrumentoMedicao: 'TORQUÍMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Funcionamento do Motor',
    instrumentoMedicao: 'AMPERÍMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX420RM',
    instrumentoMedicao: 'TACÔMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX420AC',
    instrumentoMedicao: 'TACÔMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX550AC',
    instrumentoMedicao: 'TACÔMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Rotação do Motor - Modelo CSEX550SS',
    instrumentoMedicao: 'TACÔMETRO\nNºSérie:',
  },
];

const VERIFICACAO_POSMONTAGEM_TEMPLATES: VerificacaoTemplate[] = [
  {
    nome: 'Teste de Aterramento (Resultado Esperado: >=0)',
    instrumentoMedicao: 'MULTÍMETRO☐/MEGÔMETRO☐\nNºSérie:',
  },
  {
    nome: 'Teste de Isolação (Resultado Esperado: >=0)',
    instrumentoMedicao: 'MEGÔMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Funcionamento (Inspeção visual de estado de funcionamento do equipamento)',
    instrumentoMedicao: 'AMPERÍMETRO\nNºSérie:',
  },
  {
    nome: 'Teste de Rotação - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
    instrumentoMedicao: 'TACÔMETRO\nNºSérie:',
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
    nome: 'Teste de Temperatura (Range: 30 a 40 graus Celsius)',
    instrumentoMedicao: 'TERMÔMETRO LASER\nNºSérie:',
  },
  {
    nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420RM ou T<=96.2 SPL(a) dB]',
    instrumentoMedicao: 'DECIBELÍMETRO\nNºSérie:',
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
    instrumentoMedicao: 'MULTÍMETRO\nNºSérie:',
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
    detalhes: ['(Números de série do motor, caixa elétrica e plug conferem com a Ordem de Produção?)'],
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
    instrumentoPadrao: 'TRENA\nNºSérie:',
  },
  {
    itemIndex: 6,
    titulo: 'Teste de Aterramento do Motor',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MEGÔMETRO\nNºSérie:',
  },
  {
    itemIndex: 7,
    titulo: 'Teste de Isolação do Motor',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MULTÍMETRO☐/MEGÔMETRO☐\nNºSérie:',
  },
  {
    itemIndex: 8,
    titulo: 'Aplicação e aferição de Torque do Motor',
    detalhes: ['Resultado Esperado para rosca M4: 1,5'],
    instrumentoPadrao: 'TORQUÍMETRO\nNºSérie:',
  },
  {
    itemIndex: 9,
    titulo: 'Aplicação e aferição de Torque do motor',
    detalhes: ['Resultado Esperado para rosca M5: 2'],
    instrumentoPadrao: 'TORQUÍMETRO\nNºSérie:',
  },
  {
    itemIndex: 10,
    titulo: 'Aplicação e aferição de Torque (botoeira)',
    detalhes: ['Resultado esperado: 2Nm'],
    instrumentoPadrao: 'TORQUÍMETRO\nNºSérie:',
  },
  {
    itemIndex: 11,
    titulo: 'Teste de Funcionamento do Motor',
    detalhes: ['Inspeção visual do estado de funcionamento do equipamento'],
    instrumentoPadrao: 'AMPERÍMETRO\nNºSérie:',
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
    instrumentoPadrao: 'TACÔMETRO\nNºSérie:',
  },
];

export const LINHAS_POSMONTAGEM_INSPECAO_PDF: LinhaVerificacaoInspecaoPdf[] = [
  {
    itemIndex: 0,
    titulo: 'Teste de Aterramento',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MULTÍMETRO☐/MEGÔMETRO☐\nNºSérie:',
  },
  {
    itemIndex: 1,
    titulo: 'Teste de Isolação',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MEGÔMETRO\nNºSérie:',
  },
  {
    itemIndex: 2,
    titulo: 'Teste de Funcionamento',
    detalhes: ['Inspeção visual de estado de funcionamento do equipamento'],
    instrumentoPadrao: 'AMPERÍMETRO\nNºSérie:',
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
    instrumentoPadrao: 'TACÔMETRO\nNºSérie:',
  },
  {
    itemIndex: 7,
    titulo: 'Teste de Temperatura',
    detalhes: ['Range: 30 a 40 graus Celsius'],
    instrumentoPadrao: 'TERMÔMETRO LASER\nNºSérie:',
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
    instrumentoPadrao: 'DECIBELÍMETRO\nNºSérie:',
  },
  {
    itemIndex: 12,
    titulo: 'Teste de Continuidade',
    detalhes: ['Resultado Esperado: >=0'],
    instrumentoPadrao: 'MULTÍMETRO\nNºSérie:',
  },
];

export const NOMES_INSTRUMENTOS_AFERICAO = INSTRUMENTOS_AFERICAO_TEMPLATES.map(({ nome }) => nome);

export const NOMES_VERIFICACOES_GERAIS_PREMONTAGEM = VERIFICACOES_GERAIS_PREMONTAGEM_TEMPLATES.map(
  ({ nome }) => nome,
);

export const NOMES_VERIFICACAO_POSMONTAGEM = VERIFICACAO_POSMONTAGEM_TEMPLATES.map(({ nome }) => nome);

export const criarFormularioInspecaoMontagemVazio = (): CreateInspecaoMontageDto => {
  const dataAtual = getLocalDateInput();

  return {
    numeroSerie: '',
    dataInspecao: dataAtual,
    modelo: '',
    instrumentosAferição: buildVerificacaoItems(INSTRUMENTOS_AFERICAO_TEMPLATES, 'inst'),
    verificacoesGeraisPremontagem: buildVerificacaoItems(
      VERIFICACOES_GERAIS_PREMONTAGEM_TEMPLATES,
      'vgpm',
    ),
    verificacaoPosmontagem: buildVerificacaoItems(VERIFICACAO_POSMONTAGEM_TEMPLATES, 'pos').map(
      (item) => ({
        ...item,
        conformidade: 'SIM',
      }),
    ),
    resultadoFinal: '',
    observacoes: undefined,
    responsavel: '',
    data: dataAtual,
    nomeAssinante: '',
    aprovado: false,
  };
};
