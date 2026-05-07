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

export type StatusProducao =
  | 'PROGRAMADA'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDA'
  | 'PARALISADA';

export interface TipoEquipamento {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CreateProducaoDto {
  numeroOrdem: string;
  numeroSerie: string;
  tag?: string;
  dataSolicitacao: string;
  dataInicio?: string;
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
}

export interface Producao extends CreateProducaoDto {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  diasSolicitacao?: number | null;
  diasProducao?: number | null;
  situacaoPrazo?: 'NO_PRAZO' | 'ATENCAO' | 'ATRASADA' | 'CONCLUIDA' | null;
  resultadoPrazo?: 'CONCLUIDA_NO_PRAZO' | 'CONCLUIDA_COM_ATRASO' | null;
}
