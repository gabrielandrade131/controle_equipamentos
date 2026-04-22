export interface RegistroHistorico {
  id?: string;
  data: string;
  historico: string;
  assinatura: string;
}

export interface HistoricoEquipamentoData {
  id?: string;
  numeroSerie: string;
  modelo: string;
  registros: RegistroHistorico[];
  notas?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHistoricoDto {
  numeroSerie: string;
  modelo: string;
  registros: RegistroHistorico[];
  notas?: string;
}
