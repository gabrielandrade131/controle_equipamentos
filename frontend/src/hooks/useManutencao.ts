import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../services/axiosConfig";
import {
  aplicarChecklistManutencao,
  criarInspecaoVazia,
} from "../constants/inspecaoManutencao";
import { InspecaoManutencao, StatusManutencao } from "../types/manutencao";
import { extractDateInput, getLocalDateInput } from "../utils/date";

const SECOES_INSPECAO = [
  "certificacoes",
  "estruturaMecanica",
  "sistemaHidraulico",
  "sistemaPneumatico",
  "sistemaEletrico",
  "dispositivoSeguranca",
  "componentesOperacionais",
  "acessorios",
  "testesOperacionais",
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

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

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const parseDadosInspecaoRecord = (value: unknown): Record<string, unknown> => {
  const parsed = parseJson(value);
  return isRecord(parsed) ? parsed : {};
};

const parseDadosInspecao = (
  value: unknown,
): Partial<InspecaoManutencao> => {
  const parsed = parseDadosInspecaoRecord(value);

  return SECOES_INSPECAO.reduce<Partial<InspecaoManutencao>>(
    (dados, key) => {
      const itens = parsed[key];
      if (Array.isArray(itens)) dados[key] = itens;
      return dados;
    },
    {},
  );
};

const mapDadosInspecao = (inspecao: InspecaoManutencao) =>
  SECOES_INSPECAO.reduce<Record<string, unknown>>(
    (dados, key) => {
      dados[key] = inspecao[key];
      return dados;
    },
    { imagensAnexadas: inspecao.imagensAnexadas || [] },
  );

const serializarDiagnostico = (inspecao: InspecaoManutencao) => {
  const textoAtual = inspecao.observacoes?.trim();
  const historico = [...(inspecao.observacoesHistorico || [])];
  const ultimoTexto = historico[historico.length - 1]?.texto?.trim();

  if (textoAtual && textoAtual !== ultimoTexto) {
    historico.push({
      data: getLocalDateInput(),
      texto: textoAtual,
    });
  }

  return historico.length
    ? JSON.stringify(historico)
    : textoAtual || undefined;
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
      .find(
        (item) =>
          typeof item?.texto === "string" && item.texto.trim().length > 0,
      );

    return ultimaObservacao?.texto ?? "";
  } catch {
    return diagnostico;
  }
};

const mapApiToInspecao = (manutencao: any): InspecaoManutencao => {
  const base = criarInspecaoVazia();
  const dadosInspecaoBrutos = parseDadosInspecaoRecord(
    manutencao.dadosInspecao,
  );
  const dadosInspecao = parseDadosInspecao(dadosInspecaoBrutos);
  const avaliacaoFinal =
    manutencao.avaliacaoFinalConforme === true
      ? "CONFORME"
      : manutencao.avaliacaoFinalConforme === false
        ? "NÃO CONFORME"
        : "";

  const imagensSalvas = parseJson(manutencao.imagensAnexadas);
  const imagensCampoSeparado = Array.isArray(imagensSalvas)
    ? imagensSalvas.filter(
        (imagem): imagem is string => typeof imagem === "string",
      )
    : [];
  const imagensNoChecklist = Array.isArray(dadosInspecaoBrutos.imagensAnexadas)
    ? dadosInspecaoBrutos.imagensAnexadas.filter(
        (imagem): imagem is string => typeof imagem === "string",
      )
    : [];
  const imagensAnexadas =
    imagensCampoSeparado.length > 0
      ? imagensCampoSeparado
      : imagensNoChecklist;

  const inspecaoMapeada: InspecaoManutencao = {
    ...base,
    ...dadosInspecao,
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
          : manutencao.origem === "APP_RECEBIMENTO"
            ? "Recebimento operacional"
            : manutencao.situacaoEquipamento ?? "",
    tipoManutencao: manutencao.tipoManutencao ?? "CORRETIVA",
    tipoEquipamentoId:
      manutencao.tipoEquipamentoId ?? manutencao.tipoEquipamento?.id ?? "",
    tipoEquipamento:
      manutencao.tipoEquipamento?.nome ?? manutencao.tipoEquipamentoNome ?? "",
    fabricante:
      manutencao.fabricanteEquipamento ??
      manutencao.fabricante ??
      manutencao.fabricanteNome ??
      "",
    modelo: manutencao.modeloEquipamento ?? "",
    numeroSerie: manutencao.numeroSerie ?? "",
    tag: manutencao.tag ?? "",
    numeroOrdemManutencao: manutencao.numeroOrdemManutencao ?? null,
    destino: manutencao.situacaoEquipamento ?? "",
    responsavel: manutencao.responsavelManutencao ?? "",
    responsavelRevisao: manutencao.responsavelRevisao ?? "",
    statusManutencao: manutencao.statusManutencao ?? "EM_MANUTENCAO",
    dataTermino: toDateInput(manutencao.dataTermino, false),
    validade: toDateInput(
      manutencao.validade ?? manutencao.validadeEquipamento,
      false,
    ),
    diasEsperaManutencao: manutencao.diasEsperaManutencao ?? null,
    diasManutencao: manutencao.diasManutencao ?? null,
    diasParalisacao: manutencao.diasParalisacao ?? null,
    avaliacaoFinal,
    observacoes: extrairObservacaoTexto(manutencao.diagnostico),
    observacoesHistorico: parseObservacoesDiarias(manutencao.diagnostico),
    imagensAnexadas,
    anexoPdf: manutencao.anexoPdf ? toAssetUrl(manutencao.anexoPdf) : "",
    criadoEm: manutencao.criadoEm,
    atualizadoEm: manutencao.atualizadoEm,
  };

  SECOES_INSPECAO.forEach((secao) => {
    if (Array.isArray(dadosInspecao[secao])) {
      inspecaoMapeada[secao] = dadosInspecao[secao] as InspecaoManutencao[typeof secao];
    }
  });

  return aplicarChecklistManutencao(inspecaoMapeada, {
    tipoEquipamento: inspecaoMapeada.tipoEquipamento,
    modeloEquipamento: inspecaoMapeada.modelo,
  });
};

const mapInspecaoToApi = (inspecao: InspecaoManutencao) => ({
  tipoEquipamentoId: inspecao.tipoEquipamentoId || undefined,
  tipoManutencao: inspecao.tipoManutencao || "CORRETIVA",
  fabricanteEquipamento: inspecao.fabricante || undefined,
  tipoEquipamentoNome:
    inspecao.tipoEquipamento || inspecao.fabricante || undefined,
  modeloEquipamento: inspecao.modelo || undefined,
  numeroSerie: inspecao.numeroSerie || undefined,
  tag: inspecao.tag || undefined,
  situacaoEquipamento: inspecao.destino || "Manutenção manual",
  dataRetornoBase: inspecao.dataRetornoBase || undefined,
  dataInicio: inspecao.dataInicio || undefined,
  previsaoTermino: inspecao.previsaoTermino || undefined,
  dataParalisacao: inspecao.dataParalisacao || undefined,
  dataTermino: inspecao.dataTermino || undefined,
  validade: inspecao.validade || undefined,
  diagnostico: serializarDiagnostico(inspecao),
  dadosInspecao: mapDadosInspecao(inspecao),
  responsavelManutencao: inspecao.responsavel || undefined,
  responsavelRevisao: inspecao.responsavelRevisao || undefined,
  statusManutencao: (inspecao.statusManutencao ||
    "EM_MANUTENCAO") as StatusManutencao,
  avaliacaoFinalConforme:
    inspecao.avaliacaoFinal === ""
      ? undefined
      : inspecao.avaliacaoFinal === "CONFORME",
  imagensAnexadas: JSON.stringify(inspecao.imagensAnexadas || []),
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

  const anexarPdf = async (id: string, arquivo: File) => {
    const dados = new FormData();
    dados.append("arquivo", arquivo);

    const response = await axiosInstance.post(
      `/manutencoes/${id}/anexo-pdf`,
      dados,
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
      diagnostico: serializarDiagnostico(inspecao),
      dadosInspecao: mapDadosInspecao(inspecao),
      avaliacaoFinalConforme:
        inspecao.avaliacaoFinal === ""
          ? undefined
          : inspecao.avaliacaoFinal === "CONFORME",
      validade: inspecao.validade || undefined,
      responsavelManutencao: inspecao.responsavel || undefined,
      responsavelRevisao: inspecao.responsavelRevisao || undefined,
      imagensAnexadas: JSON.stringify(inspecao.imagensAnexadas || []),
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
    anexarPdf,
    atualizarInspecaoConcluida,
    removerInspecao,
    buscarFotosRecebimento,
  };
};
