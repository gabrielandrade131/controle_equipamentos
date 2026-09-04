export interface ItemSeriado {
  id: string;
  numero: string;
  descricao: string;
  numeroSerie: string;
}

export interface Documento {
  id: string;
  nome: string;
  codigo: string;
}

export interface HistoricoProducaoItem {
  id: string;
  descricao: string;
  responsavel: string;
  criadoEm?: string;
}

export type StatusProducao =
  | "PROGRAMADA"
  | "EM_ANDAMENTO"
  | "OPERACIONAL"
  | "CONCLUIDA"
  | "PARALISADA";

export interface TipoEquipamento {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CreateProducaoDto {
  numeroOrdem: string;
  quantidade?: number;
  numeroLote?: number | null;
  loteProducao?: {
    id: string;
    numeroLote: number;
    modelo?: string;
    descricao?: string;
    statusProducao?: StatusProducao;
    dataSolicitacao?: string;
    dataInicio?: string;
    dataParalisacao?: string;
    previsaoTermino?: string;
    dataTermino?: string;
    tipoEquipamento?: {
      id: string;
      nome: string;
    };
  };
  numeroSerie: string;
  tag?: string;
  validade?: string;
  dataSolicitacao: string;
  dataNecessidade?: string;
  dataInicio?: string;
  dataParalisacao?: string;
  dataPrevisao?: string;
  dataTermino?: string;
  statusProducao?: StatusProducao;
  tipoEquipamentoId?: string;
  tipoEquipamentoNome?: string;
  modelo: string;
  descricao: string;
  itensSeriados: ItemSeriado[];
  documentos: Documento[];
  observacoes: string;
  listaPecas?: string;
  sequencialMontagem?: string;
  inspecaoMontagem?: string;
  historicoEquipamento?: string;
  procedimentoTestes?: string;
  historicoProducao?: HistoricoProducaoItem[];
}

export interface Producao extends CreateProducaoDto {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  diasSolicitacao?: number | null;
  diasProducao?: number | null;
  diasParalisacao?: number | null;
  situacaoPrazo?: "NO_PRAZO" | "ATENCAO" | "ATRASADA" | "CONCLUIDA" | null;
  resultadoPrazo?: "CONCLUIDA_NO_PRAZO" | "CONCLUIDA_COM_ATRASO" | null;
}
