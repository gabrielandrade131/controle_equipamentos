// Tipos genéricos para filtros
export interface OrdemFilter {
  status?: string;
  tag?: string;
  tipoEquipamento?: string;
  numeroSerie?: string;
  modelo?: string;
  numeroLote?: string;
  dataInicio?: string;
  dataTermino?: string;
}

export interface InspecaoFilter {
  resultado?: string;
  status?: string;
  tag?: string;
  tipoEquipamento?: string;
  modelo?: string;
  numeroSerie?: string;
  numeroLote?: string;
  dataInicio?: string;
  dataTermino?: string;
}

export interface HistoricoFilter {
  numeroSerie?: string;
  modelo?: string;
}

export interface ManutencaoFilter {
  status?: string;
  tipoManutencao?: string;
  tag?: string;
  tipoEquipamento?: string;
  numeroSerie?: string;
  fabricante?: string;
  responsavel?: string;
  dataInicio?: string;
  dataTermino?: string;
}

export type FilterType = {
  [key: string]: string | undefined;
};
