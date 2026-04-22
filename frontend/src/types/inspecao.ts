// Verificação Individual com valores fixos e campos de preenchimento
export interface VerificacaoItem {
  id: string;
  nome: string; // Nome FIXO do item
  valorObservado?: string; // Campo preenchido pelo inspetor
  instrumentoMedicao?: string; // Campo preenchido pelo inspetor
  conformidade: 'SIM' | 'NÃO' | ''; // Checklist SIM/NÃO
}

// Para ENVIAR (criar novo)
export interface CreateInspecaoMontageDto {
  numeroSerie: string;
  dataInspecao: string;
  modelo: string;
  // Instrumentos de Afeição (verificação com SIM/NÃO)
  instrumentosAferição: VerificacaoItem[]; // Micrômetro, Multímetro, etc.
  // Verificação Geral Pré Montagem
  verificacaoPremontagem: VerificacaoItem[];
  // Análise Dimensional de Carcaça
  analiseDimensional: VerificacaoItem[];
  // Testes
  testes: VerificacaoItem[];
  // Verificações Gerais Pós Montagem
  verificacaoPosmontagem: VerificacaoItem[];
  // Resultado Final
  resultadoFinal: 'APROVADO' | 'REPROVADO' | '';
  observacoes: string;
  responsavel: string;
  data: string;
  assinatura?: string;
}

// Para RECEBER (resposta do backend)
export interface InspecaoMontagem extends CreateInspecaoMontageDto {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}
