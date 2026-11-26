import { InspecaoManutencao } from "../types/manutencao";
import { extractDateInput, getLocalDateInput } from "./date";

export interface PeriodoIntervalo {
  inicio: string; // YYYY-MM-DD
  fim: string; // YYYY-MM-DD
}

export type SemanaIntervalo = PeriodoIntervalo;

const parseLocalDate = (dateInput: string): Date => {
  const normalized = extractDateInput(dateInput, true);
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const adicionarDiasData = (dateInput: string, dias: number): string => {
  const date = parseLocalDate(dateInput);
  date.setDate(date.getDate() + dias);
  return formatLocalDate(date);
};

export const obterIntervaloSemana = (
  dataReferencia: string = getLocalDateInput(),
): SemanaIntervalo => {
  const date = parseLocalDate(dataReferencia);
  const dayOfWeek = date.getDay(); // 0 = domingo, 1 = segunda, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const segunda = new Date(date);
  segunda.setDate(date.getDate() + diffToMonday);

  const domingo = new Date(segunda);
  domingo.setDate(segunda.getDate() + 6);

  return {
    inicio: formatLocalDate(segunda),
    fim: formatLocalDate(domingo),
  };
};

export const filtrarManutencoesConcluidasNoPeriodo = (
  manutencoes: InspecaoManutencao[],
  intervalo: PeriodoIntervalo,
): InspecaoManutencao[] => {
  const inicio = extractDateInput(intervalo.inicio, false);
  const fim = extractDateInput(intervalo.fim, false);
  if (!inicio || !fim || inicio > fim) {
    return [];
  }

  return manutencoes
    .filter((item) => {
      if (item.statusManutencao !== "CONCLUIDA") return false;
      const dataTermino = extractDateInput(item.dataTermino, false);
      if (!dataTermino) return false;
      return dataTermino >= inicio && dataTermino <= fim;
    })
    .sort((a, b) => {
      const dataA = extractDateInput(a.dataTermino, false);
      const dataB = extractDateInput(b.dataTermino, false);
      if (dataA !== dataB) return dataA.localeCompare(dataB);
      return (a.numeroOrdemManutencao ?? 0) - (b.numeroOrdemManutencao ?? 0);
    });
};

export const filtrarManutencoesConcluidasNaSemana =
  filtrarManutencoesConcluidasNoPeriodo;

const sanitizeFilenameSegment = (value: string): string => {
  return Array.from(value)
    .filter((ch) => ch.charCodeAt(0) >= 32)
    .join("")
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/-{2,}/g, "-")
    .replace(/^[\s.-]+|[\s.-]+$/g, "");
};

export const construirNomeBasePdfInspecao = (
  inspecao: Pick<
    InspecaoManutencao,
    "tipoEquipamento" | "modelo" | "numeroSerie" | "tag" | "numeroOrdemManutencao"
  >,
): string => {
  const itemBruto =
    inspecao.tipoEquipamento?.trim() ||
    inspecao.modelo?.trim() ||
    "equipamento";
  const identificadorBruto =
    inspecao.numeroSerie?.trim() ||
    inspecao.tag?.trim() ||
    (inspecao.numeroOrdemManutencao !== null &&
    inspecao.numeroOrdemManutencao !== undefined
      ? `OM-${inspecao.numeroOrdemManutencao}`
      : "sem-identificacao");

  const item = sanitizeFilenameSegment(itemBruto) || "equipamento";
  const identificador =
    sanitizeFilenameSegment(identificadorBruto) || "sem-identificacao";

  return `${item}-${identificador}`;
};

export const construirNomesArquivosSemana = (
  manutencoes: InspecaoManutencao[],
): string[] => {
  const usados = new Set<string>();

  return manutencoes.map((inspecao) => {
    const base = construirNomeBasePdfInspecao(inspecao);
    let candidato = `${base}.pdf`;

    if (
      usados.has(candidato.toLowerCase()) &&
      inspecao.numeroOrdemManutencao !== null &&
      inspecao.numeroOrdemManutencao !== undefined
    ) {
      candidato = `${base}-OM-${inspecao.numeroOrdemManutencao}.pdf`;
    }

    let sufixo = 2;
    while (usados.has(candidato.toLowerCase())) {
      candidato = `${base}-${sufixo}.pdf`;
      sufixo += 1;
    }

    usados.add(candidato.toLowerCase());
    return candidato;
  });
};
