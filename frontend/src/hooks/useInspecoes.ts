import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { InspecaoMontagem, VerificacaoItem } from '../types/inspecao';
import { extractDateInput, getLocalDateInput } from '../utils/date';
import { normalizeTag } from '../utils/tag';
import {
  NOMES_INSTRUMENTOS_AFERICAO,
  NOMES_VERIFICACOES_GERAIS_PREMONTAGEM,
  NOMES_VERIFICACAO_POSMONTAGEM,
} from '../constants/inspecaoMontagem';

type ApiListResponse<T> = {
  data: T[];
};

const NAO = 'NÃO';
const INSTRUMENTOS_KEY = 'instrumentosAferi' + String.fromCharCode(231) + String.fromCharCode(227) + 'o';
const NOMES_VERIFICACOES_PREMONTAGEM = NOMES_VERIFICACOES_GERAIS_PREMONTAGEM;

const toDateInput = (value?: string | null) => {
  if (!value) return getLocalDateInput();
  return extractDateInput(value);
};

const conformidadeToFront = (value?: boolean | null) => {
  if (value === true) return 'SIM';
  if (value === false) return NAO;
  return '';
};

const conformidadeToApi = (value: string) => {
  if (value === 'SIM') return true;
  if (value === NAO) return false;
  return undefined;
};

const mapRegistros = (
  registros: any[] = [],
  nomes: string[],
  ordemInicial: number,
): VerificacaoItem[] => {
  const porOrdem = new Map(registros.map((registro) => [registro.ordem, registro]));

  return nomes.map((nome, index) => {
    const ordem = ordemInicial + index;
    const registro = porOrdem.get(ordem);

    return {
      id: String(ordem),
      nome,
      valorObservado: registro?.valorObservado ?? '',
      instrumentoMedicao: registro?.instrumentoMedicao ?? '',
      conformidade: conformidadeToFront(registro?.conformidades) as VerificacaoItem['conformidade'],
    };
  });
};

const mapApiToInspecao = (producao: any): InspecaoMontagem => {
  const instrumentosAfericao = mapRegistros(
    producao.registrosInspecaoMontagem,
    NOMES_INSTRUMENTOS_AFERICAO,
    1,
  );
  const verificacoesGeraisPremontagem = mapRegistros(
    producao.registrosInspecaoMontagem,
    NOMES_VERIFICACOES_PREMONTAGEM,
    3,
  );
    const verificacaoPosmontagem = mapRegistros(
      producao.registrosInspecaoMontagem,
      NOMES_VERIFICACAO_POSMONTAGEM,
      19,
    );
  const registros = [...instrumentosAfericao, ...verificacoesGeraisPremontagem];
  const reprovado = registros.some((item) => item.conformidade === NAO);
  const preenchido = registros.some(
    (item) => item.valorObservado || item.instrumentoMedicao || item.conformidade,
  );

  return {
    id: producao.id,
    numeroSerie: producao.numeroSerie ?? '',
    numeroLote: producao.numeroLote ?? producao.loteProducao?.numeroLote ?? null,
    tag: normalizeTag(producao.tag),
    statusProducao: producao.statusProducao ?? '',
    tipoEquipamentoNome: producao.tipoEquipamento?.nome ?? '',
    dataInspecao: toDateInput(producao.atualizadoEm || producao.criadoEm),
    modelo: producao.modelo ?? '',
    dataInicio: producao.dataInicio ? extractDateInput(producao.dataInicio) : '',
    dataTermino: producao.dataTermino ? extractDateInput(producao.dataTermino) : '',
    [INSTRUMENTOS_KEY]: instrumentosAfericao,
    verificacoesGeraisPremontagem,
    verificacaoPosmontagem,
    resultadoFinal: preenchido ? (reprovado ? 'REPROVADO' : 'APROVADO') : '',
    observacoes: '',
    responsavel: producao.responsavelServico ?? '',
    responsavelServico: producao.responsavelServico ?? '',
    responsavelRevisao: producao.responsavelRevisao ?? '',
    data: toDateInput(producao.atualizadoEm || producao.criadoEm),
    assinatura: '',
    nomeAssinante: '',
    aprovado: !reprovado && preenchido,
    imagensAnexadas: producao.imagensAnexadas
      ? (typeof producao.imagensAnexadas === 'string'
          ? JSON.parse(producao.imagensAnexadas)
          : producao.imagensAnexadas)
      : [],
    createdAt: producao.criadoEm,
    updatedAt: producao.atualizadoEm,
  } as unknown as InspecaoMontagem;
};

export const useInspecoes = () => {
  const [inspecoes, setInspecoes] = useState<InspecaoMontagem[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarInspecoes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<ApiListResponse<any>>('/producoes', {
        params: { limit: 100 },
      });
      setInspecoes(response.data.data.map(mapApiToInspecao));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarInspecoes();
  }, []);

  const salvarRegistrosInspecao = async (producaoId: string, inspecao: InspecaoMontagem) => {
    const instrumentos = (inspecao.instrumentosAferição || []).slice(0, 2);
    const verificacoes = (inspecao.verificacoesGeraisPremontagem || []).slice(0, 16);
    const posmontagem = (inspecao.verificacaoPosmontagem || []).slice(0, NOMES_VERIFICACAO_POSMONTAGEM.length);

    const all = [...instrumentos, ...verificacoes, ...posmontagem];

    await Promise.all(
      all.map((item, index) =>
        axiosInstance.patch(`/producoes/${producaoId}/inspecao-montagem/${index + 1}`, {
          valorObservado: item.valorObservado || undefined,
          instrumentoMedicao: item.instrumentoMedicao || undefined,
          conformidades: conformidadeToApi(item.conformidade),
        }),
      ),
    );

    await axiosInstance.patch(`/producoes/${producaoId}`, {
      responsavelServico:
        inspecao.responsavelServico || inspecao.responsavel || undefined,
      responsavelRevisao: inspecao.responsavelRevisao || undefined,
      ...(inspecao.imagensAnexadas?.length
        ? { imagensAnexadas: JSON.stringify(inspecao.imagensAnexadas) }
        : {}),
    });

    await carregarInspecoes();
  };

  const atualizarInspecao = async (id: string, inspecaoAtualizada: InspecaoMontagem) => {
    await salvarRegistrosInspecao(id, inspecaoAtualizada);
  };

  const deletarInspecao = async (id: string) => {
    await axiosInstance.delete(`/producoes/${id}`);
    setInspecoes((prev) => prev.filter((insp) => insp.id !== id));
  };

  return {
    inspecoes,
    loading,
    salvarRegistrosInspecao,
    atualizarInspecao,
    deletarInspecao,
  };
};
