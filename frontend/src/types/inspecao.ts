// Verificação Individual com valores fixos e campos de preenchimento
export interface VerificacaoItem {
  id: string;
  nome: string; // Nome FIXO do item
  valorObservado?: string; // Campo preenchido pelo inspetor
  instrumentoMedicao?: string; // Campo preenchido pelo inspetor
  conformidade: 'SIM' | 'NÃO' | 'N/A' | ''; // Checklist SIM/NÃO/N/A
}

// Para ENVIAR (criar novo)
export interface CreateInspecaoMontageDto {
  numeroSerie: string;
  numeroLote?: number | null;
  tag?: string;
  statusProducao?: string;
  tipoEquipamentoNome?: string;
  dataInspecao: string;
  modelo: string;
  dataInicio?: string;
  dataTermino?: string;
  // Instrumentos de Afeição (verificação com SIM/NÃO)
  instrumentosAferição: VerificacaoItem[]; // Micrômetro, Multímetro, etc.
  // Verificações Gerais Pré Montagem (inclui Check dos Seriados, Análise Dimensional e Testes)
  verificacoesGeraisPremontagem: VerificacaoItem[];
  // Verificações Gerais Pós Montagem
  verificacaoPosmontagem: VerificacaoItem[];
  // Resultado Final
  resultadoFinal: 'APROVADO' | 'REPROVADO' | '';
  observacoes?: string;
  responsavel: string;
  responsavelServico?: string;
  responsavelRevisao?: string;
  data: string;
  assinatura?: string;
  nomeAssinante?: string;
  aprovado?: boolean;
  imagensAnexadas?: string[];
}

// Para RECEBER (resposta do backend)
export interface InspecaoMontagem extends CreateInspecaoMontageDto {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}
