import { CreateInspecaoMontageDto, VerificacaoItem } from '../types/inspecao';

// Arrays fixos conforme formulário (apenas constantes, sem dados de teste)
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

// Hook para obter as constantes (sem dados de teste)
export const useInspecaoMontagem = () => {
  return {
    INSTRUMENTOS_AFERIÇÃO,
    VERIFICACOES_GERAIS_PREMONTAGEM,
    VERIFICACAO_POSMONTAGEM,
  };
};
