// Tipos genéricos para filtros
export interface OrdemFilter {
  status?: string;
  tag?: string;
  modelo?: string;
  numeroLote?: string;
}

export interface InspecaoFilter {
  resultado?: string;
  modelo?: string;
  numeroSerie?: string;
}

export interface HistoricoFilter {
  numeroSerie?: string;
  modelo?: string;
}

export interface ManutencaoFilter {
  status?: string;
  tag?: string;
  fabricante?: string;
  responsavel?: string;
}

export type FilterType = {
  [key: string]: string | undefined;
};
