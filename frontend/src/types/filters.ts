// Tipos genéricos para filtros
export interface BaseFilter {
  dataInicio?: string;
  dataFinal?: string;
}

export interface OrdemFilter extends BaseFilter {
  status?: string;
  tag?: string;
  modelo?: string;
}

export interface InspecaoFilter extends BaseFilter {
  resultado?: string;
  modelo?: string;
  numeroSerie?: string;
}

export interface HistoricoFilter extends BaseFilter {
  tag?: string;
  status?: string;
}

export interface ManutencaoFilter extends BaseFilter {
  status?: string;
  tag?: string;
  fabricante?: string;
  responsavel?: string;
}

export type FilterType = {
  [key: string]: string | undefined;
  dataInicio?: string;
  dataFinal?: string;
};
