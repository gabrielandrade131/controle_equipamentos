// Item Seriado
export interface ItemSeriado {
  id: string;
  numero: string;
  descricao: string;
  numeroSerie: string;
}

// Documento Relacionado
export interface Documento {
  id: string;
  nome: string;
  codigo: string;
}

// Para ENVIAR (criar novo)
export interface CreateProducaoDto {
  numeroOrdem: string;
  numeroSerie: string;
  dataSolicitacao: string;
  dataTermino?: string;
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

// Para RECEBER (resposta do backend)
export interface Producao extends CreateProducaoDto {
  id: string;              // ← Obrigatório quando recebe!
  createdAt?: string;
  updatedAt?: string;
}