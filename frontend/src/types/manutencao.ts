// Tipos para Inspeção de Manutenção

export type RespostaBinaria = "SIM" | "NÃO" | "N/A" | "";

export type StatusManutencao =
  | "EM_QUARENTENA"
  | "PENDENTE"
  | "EM_MANUTENCAO"
  | "OPERACIONAL"
  | "CONCLUIDA"
  | "PARALISADA";

export type TipoManutencao = "CORRETIVA" | "PREVENTIVA";
export type DestinoManutencao = "ESTOQUE" | "OPERACAO";

export interface ItemInspecao {
  id: string;
  titulo: string;
  categoria: string;
  resposta: RespostaBinaria;
  observacoes?: string;
}

export interface ObservacaoHistorico {
  id?: string;
  data: string;
  texto: string;
}

export interface AnexoPdfManutencao {
  id: string;
  nomeArquivo: string;
  caminhoArquivo: string;
  criadoEm?: string;
}

export interface SessaoInspecao {
  categoria: string;
  titulo: string;
  itens: ItemInspecao[];
}

export interface InspecaoManutencao {
  id?: string;
  dataInicio: string;
  localManutencao: string;
  tipoManutencao: TipoManutencao;
  tipoEquipamentoId?: string;
  tipoEquipamento?: string;
  fabricante: string;
  modelo: string;
  numeroSerie?: string;
  tag: string;
  numeroOrdemManutencao?: number | null;
  situacaoEquipamento: string;
  destino?: DestinoManutencao;
  dataRetornoBase?: string;
  previsaoTermino?: string;
  dataParalisacao?: string;
  responsavel: string;
  responsavelRevisao?: string;
  statusManutencao: StatusManutencao;
  dataTermino?: string;
  validade?: string;
  diasEsperaManutencao?: number | null;
  diasManutencao?: number | null;
  diasParalisacao?: number | null;

  // Certificações e Documentação
  certificacoes: ItemInspecao[];

  // Estrutura e Integridade Mecânica
  estruturaMecanica: ItemInspecao[];

  // Sistema Hidráulico
  sistemaHidraulico: ItemInspecao[];

  // Sistema Pneumático
  sistemaPneumatico: ItemInspecao[];

  // Sistema Elétrico
  sistemaEletrico: ItemInspecao[];

  // Dispositivos de Segurança
  dispositivoSeguranca: ItemInspecao[];

  // Componentes Operacionais
  componentesOperacionais: ItemInspecao[];

  // Acessórios e Itens Específicos
  acessorios: ItemInspecao[];

  // Testes Operacionais
  testesOperacionais: ItemInspecao[];

  // Avaliação Final
  avaliacaoFinal: "CONFORME" | "NÃO CONFORME" | "";
  observacoes?: string;
  observacoesHistorico?: ObservacaoHistorico[];
  assinatura?: string;

  // Imagens/Fotos
  imagensAnexadas?: string[];
  anexoPdf?: string;
  anexosPdf?: AnexoPdfManutencao[];

  criadoEm?: string;
  atualizadoEm?: string;
}
