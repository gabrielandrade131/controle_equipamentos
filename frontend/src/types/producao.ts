// Para ENVIAR (criar novo)
export interface CreateProducaoDto {
  numeroOrdem: string;
  numeroSerie: string;
  dataSolicitacao: string;
  modelo: string;
  descricao: string;
  listaPecas: boolean;
  sequencialMontagem: boolean;
  inspecaoMontagem: boolean;
  historicoEquipamento: boolean;
}

// Para RECEBER (resposta do backend)
export interface Producao extends CreateProducaoDto {
  id: string;              // ← Obrigatório quando recebe!
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemSeriado {
  id: string;
  numero: string;
  descricao: string;
}