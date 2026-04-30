import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { InspecaoManutencao, criarInspecaoVazia } from '../types/manutencao';

type ApiListResponse<T> = {
  data: T[];
};

const toDateInput = (value?: string | null) => {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.split('T')[0];
};

const mapApiToInspecao = (manutencao: any): InspecaoManutencao => {
  const base = criarInspecaoVazia();

  return {
    ...base,
    id: manutencao.id,
    dataManutencao: toDateInput(manutencao.dataInicio || manutencao.dataRetornoBase || manutencao.criadoEm),
    localManutencao: manutencao.origem === 'SYNCHRO' ? 'Retorno Synchro' : '',
    fabricante: manutencao.tipoEquipamentoNome ?? '',
    modelo: manutencao.modeloEquipamento ?? '',
    numeroSerie: manutencao.numeroSerie ?? '',
    tag: manutencao.tag ?? '',
    destino: manutencao.situacaoEquipamento ?? '',
    responsavel: manutencao.responsavelManutencao ?? '',
    avaliacaoFinal: manutencao.statusManutencao === 'CONCLUIDA' ? 'CONFORME' : '',
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
  dataRetornoBase: inspecao.dataManutencao || undefined,
  dataInicio: inspecao.dataManutencao || undefined,
  diagnostico: inspecao.observacoes || undefined,
  responsavelManutencao: inspecao.responsavel || undefined,
  statusManutencao: inspecao.avaliacaoFinal === 'CONFORME' ? 'CONCLUIDA' : 'EM_MANUTENCAO',
});

export const useManutencaoMock = () => {
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

  const removerInspecao = async (id: string) => {
    await axiosInstance.delete(`/manutencoes/${id}`);
    setHistorico((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    historico,
    loading,
    error,
    adicionarInspecao,
    removerInspecao,
  };
};
