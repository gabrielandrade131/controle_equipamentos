import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { InspecaoManutencao, StatusManutencao, criarInspecaoVazia } from '../types/manutencao';

type ApiListResponse<T> = {
  data: T[];
};

const toDateInput = (value?: string | null, fallbackToday = true) => {
  if (!value) return fallbackToday ? new Date().toISOString().split('T')[0] : '';
  return value.split('T')[0];
};

const mapApiToInspecao = (manutencao: any): InspecaoManutencao => {
  const base = criarInspecaoVazia();
  const avaliacaoFinal =
    manutencao.avaliacaoFinalConforme === true
      ? 'CONFORME'
      : manutencao.avaliacaoFinalConforme === false
        ? 'NÃO CONFORME'
        : '';

  return {
    ...base,
    id: manutencao.id,
    dataManutencao: toDateInput(manutencao.dataInicio, false),
    dataRetornoBase: toDateInput(manutencao.dataRetornoBase, false),
    previsaoTermino: toDateInput(manutencao.previsaoTermino, false),
    localManutencao: manutencao.origem === 'SYNCHRO' ? 'Retorno Synchro' : '',
    fabricante: manutencao.tipoEquipamentoNome ?? '',
    modelo: manutencao.modeloEquipamento ?? '',
    numeroSerie: manutencao.numeroSerie ?? '',
    tag: manutencao.tag ?? '',
    destino: manutencao.situacaoEquipamento ?? '',
    responsavel: manutencao.responsavelManutencao ?? '',
    statusManutencao: manutencao.statusManutencao ?? 'EM_MANUTENCAO',
    dataTermino: toDateInput(manutencao.dataTermino, false),
    diasEsperaManutencao: manutencao.diasEsperaManutencao ?? null,
    diasManutencao: manutencao.diasManutencao ?? null,
    avaliacaoFinal,
    observacoes: manutencao.diagnostico ?? '',
    criadoEm: manutencao.criadoEm,
    atualizadoEm: manutencao.atualizadoEm,
  };
};

const mapInspecaoToApi = (inspecao: InspecaoManutencao) => ({
  tipoEquipamentoNome: inspecao.fabricante || undefined,
  modeloEquipamento: inspecao.modelo || undefined,
  numeroSerie: inspecao.numeroSerie || undefined,
  tag: inspecao.tag || undefined,
  situacaoEquipamento: inspecao.destino || 'Manutencao manual',
  dataRetornoBase: inspecao.dataRetornoBase || undefined,
  dataInicio: inspecao.dataManutencao || undefined,
  previsaoTermino: inspecao.previsaoTermino || undefined,
  dataTermino: inspecao.dataTermino || undefined,
  diagnostico: inspecao.observacoes || undefined,
  responsavelManutencao: inspecao.responsavel || undefined,
  statusManutencao: (inspecao.statusManutencao || 'EM_MANUTENCAO') as StatusManutencao,
  avaliacaoFinalConforme:
    inspecao.avaliacaoFinal === ''
      ? undefined
      : inspecao.avaliacaoFinal === 'CONFORME',
});

export const useManutencao = () => {
  const [historico, setHistorico] = useState<InspecaoManutencao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregarManutencoes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiListResponse<any>>('/manutencoes', {
        params: { limit: 100 },
      });
      setHistorico(response.data.data.map(mapApiToInspecao));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar manutencoes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarManutencoes();
  }, []);

  const adicionarInspecao = async (inspecao: InspecaoManutencao) => {
    const response = await axiosInstance.post('/manutencoes', mapInspecaoToApi(inspecao));
    const novaInspecao = mapApiToInspecao(response.data);
    setHistorico((prev) => [novaInspecao, ...prev]);
    return novaInspecao;
  };

  const atualizarInspecao = async (id: string, inspecao: InspecaoManutencao) => {
    const response = await axiosInstance.patch(`/manutencoes/${id}`, mapInspecaoToApi(inspecao));
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
    removerInspecao,
  };
};
