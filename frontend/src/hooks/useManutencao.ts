import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../services/axiosConfig";
import { criarInspecaoVazia } from "../constants/inspecaoManutencao";
import { InspecaoManutencao, StatusManutencao } from "../types/manutencao";
import { extractDateInput, getLocalDateInput } from "../utils/date";

type ApiListResponse<T> = {
  data: T[];
};

type RecebimentoManutencaoResponse = {
  fotos?: Array<{
    id: string;
    tipoFoto: string;
    nomeArquivo: string;
    caminhoArquivo: string;
  }>;
};

export type FotoRecebimentoManutencao = {
  id: string;
  tipoFoto: string;
  nomeArquivo: string;
  url: string;
};

const toDateInput = (value?: string | null, fallbackToday = true) =>
  extractDateInput(value, fallbackToday);

const toAssetUrl = (path: string) => {
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;

  const baseUrl = String(axiosInstance.defaults.baseURL || "");
  const apiOrigin = baseUrl.replace(/\/api\/?$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${apiOrigin}${normalizedPath}`;
};

const parseObservacoesDiarias = (diagnostico: any) => {
  if (!diagnostico) return [];
  if (typeof diagnostico !== "string") return [];
  try {
    const parsed = JSON.parse(diagnostico);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Backwards compatibility: tratar string legada como observação única
    return [
      {
        data: getLocalDateInput(),
        texto: diagnostico,
      },
    ];
  }
};

const extrairObservacaoTexto = (diagnostico: any): string => {
  if (!diagnostico) return "";

  if (typeof diagnostico !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(diagnostico);

    if (!Array.isArray(parsed)) {
      return "";
    }

    const ultimaObservacao = [...parsed]
      .reverse()
      .find((item) => typeof item?.texto === "string" && item.texto.trim().length > 0);

    return ultimaObservacao?.texto ?? "";
  } catch {
    return diagnostico;
  }
};

const mapApiToInspecao = (manutencao: any): InspecaoManutencao => {
  const base = criarInspecaoVazia();
  const avaliacaoFinal =
    manutencao.avaliacaoFinalConforme === true
      ? "CONFORME"
      : manutencao.avaliacaoFinalConforme === false
        ? "NÃO CONFORME"
        : "";

  const imagensAnexadas = manutencao.imagensAnexadas
    ? typeof manutencao.imagensAnexadas === "string"
      ? JSON.parse(manutencao.imagensAnexadas)
      : manutencao.imagensAnexadas
    : [];

  return {
    ...base,
    id: manutencao.id,
    dataInicio: toDateInput(manutencao.dataInicio, false),
    dataRetornoBase: toDateInput(manutencao.dataRetornoBase, false),
    previsaoTermino: toDateInput(manutencao.previsaoTermino, false),
    dataParalisacao: toDateInput(manutencao.dataParalisacao, false),
    localManutencao:
      manutencao.origem === "SYNCHRO"
        ? "Retorno Synchro"
        : manutencao.origem === "MANUAL"
          ? "Manutenção manual"
          : "",
    tipoEquipamentoId:
      manutencao.tipoEquipamentoId ?? manutencao.tipoEquipamento?.id ?? "",
    tipoEquipamento:
      manutencao.tipoEquipamento?.nome ?? manutencao.tipoEquipamentoNome ?? "",
    fabricante:
      manutencao.fabricante ??
      manutencao.fabricanteEquipamento ??
      manutencao.fabricanteNome ??
      "",
    modelo: manutencao.modeloEquipamento ?? "",
    tag: manutencao.tag ?? "",
    numeroOrdemManutencao: manutencao.numeroOrdemManutencao ?? null,
    destino: manutencao.situacaoEquipamento ?? "",
    responsavel: manutencao.responsavelManutencao ?? "",
    statusManutencao: manutencao.statusManutencao ?? "EM_MANUTENCAO",
    dataTermino: toDateInput(manutencao.dataTermino, false),
    diasEsperaManutencao: manutencao.diasEsperaManutencao ?? null,
    diasManutencao: manutencao.diasManutencao ?? null,
    diasParalisacao: manutencao.diasParalisacao ?? null,
    avaliacaoFinal,
    observacoes: extrairObservacaoTexto(manutencao.diagnostico),
    observacoesHistorico: parseObservacoesDiarias(manutencao.diagnostico),
    imagensAnexadas,
    criadoEm: manutencao.criadoEm,
    atualizadoEm: manutencao.atualizadoEm,
  };
};

const mapInspecaoToApi = (inspecao: InspecaoManutencao) => ({
  tipoEquipamentoId: inspecao.tipoEquipamentoId || undefined,
  tipoEquipamentoNome:
    inspecao.tipoEquipamento || inspecao.fabricante || undefined,
  modeloEquipamento: inspecao.modelo || undefined,
  tag: inspecao.tag || undefined,
  situacaoEquipamento: inspecao.destino || "Manutenção manual",
  dataRetornoBase: inspecao.dataRetornoBase || undefined,
  dataInicio: inspecao.dataInicio || undefined,
  previsaoTermino: inspecao.previsaoTermino || undefined,
  dataParalisacao: inspecao.dataParalisacao || undefined,
  dataTermino: inspecao.dataTermino || undefined,
  diagnostico:
    inspecao.observacoes?.trim() ||
    (inspecao.observacoesHistorico?.length
      ? JSON.stringify(inspecao.observacoesHistorico)
      : undefined),
  responsavelManutencao: inspecao.responsavel || undefined,
  statusManutencao: (inspecao.statusManutencao ||
    "EM_MANUTENCAO") as StatusManutencao,
  avaliacaoFinalConforme:
    inspecao.avaliacaoFinal === ""
      ? undefined
      : inspecao.avaliacaoFinal === "CONFORME",
  imagensAnexadas: inspecao.imagensAnexadas?.length
    ? JSON.stringify(inspecao.imagensAnexadas)
    : undefined,
});

export const useManutencao = () => {
  const [historico, setHistorico] = useState<InspecaoManutencao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarManutencoes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiListResponse<any>>(
        "/manutencoes",
        {
          params: { limit: 100 },
        },
      );
      setHistorico(response.data.data.map(mapApiToInspecao));
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Erro ao carregar manutenções",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarManutencoes();
  }, []);

  const buscarFotosRecebimento = useCallback(
    async (id: string): Promise<FotoRecebimentoManutencao[]> => {
      const response = await axiosInstance.get<RecebimentoManutencaoResponse>(
        `/manutencoes/${id}/recebimento`,
      );
      const fotos = Array.isArray(response.data?.fotos)
        ? response.data.fotos
        : [];

      return fotos.map((foto) => ({
        id: foto.id,
        tipoFoto: foto.tipoFoto,
        nomeArquivo: foto.nomeArquivo,
        url: toAssetUrl(foto.caminhoArquivo),
      }));
    },
    [],
  );

  const adicionarInspecao = async (inspecao: InspecaoManutencao) => {
    const response = await axiosInstance.post(
      "/manutencoes",
      mapInspecaoToApi(inspecao),
    );
    const novaInspecao = mapApiToInspecao(response.data);
    setHistorico((prev) => [novaInspecao, ...prev]);
    return novaInspecao;
  };

  const atualizarInspecao = async (
    id: string,
    inspecao: InspecaoManutencao,
  ) => {
    const response = await axiosInstance.patch(
      `/manutencoes/${id}`,
      mapInspecaoToApi(inspecao),
    );
    const inspecaoAtualizada = mapApiToInspecao(response.data);
    setHistorico((prev) =>
      prev.map((item) => (item.id === id ? inspecaoAtualizada : item)),
    );
    return inspecaoAtualizada;
  };

  const atualizarInspecaoConcluida = async (
    id: string,
    inspecao: InspecaoManutencao,
  ) => {
    const response = await axiosInstance.patch(`/manutencoes/${id}`, {
      diagnostico: inspecao.observacoes?.trim() || undefined,
      avaliacaoFinalConforme:
        inspecao.avaliacaoFinal === ""
          ? undefined
          : inspecao.avaliacaoFinal === "CONFORME",
    });
    const inspecaoAtualizada = mapApiToInspecao(response.data);
    setHistorico((prev) =>
      prev.map((item) => (item.id === id ? inspecaoAtualizada : item)),
    );
    return inspecaoAtualizada;
  };

  const removerInspecao = async (id: string) => {
    await axiosInstance.delete(`/manutencoes/${id}`);
    setHistorico((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    historico,
    loading,
    error,
    adicionarInspecao,
    atualizarInspecao,
    atualizarInspecaoConcluida,
    removerInspecao,
    buscarFotosRecebimento,
  };
};
