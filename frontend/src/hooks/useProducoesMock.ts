import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { CreateProducaoDto, Producao } from '../types/producao';
import { mapApiToProducao, mapProducaoToApi } from './useProducoes';

type ApiListResponse<T> = {
  data: T[];
};

export const useProducoesMock = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarProducoes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiListResponse<any>>('/producoes', {
        params: { limit: 100 },
      });
      setProducoes(response.data.data.map(mapApiToProducao));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar producoes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProducoes();
  }, [carregarProducoes]);

  const criarProducao = async (novaProducao: CreateProducaoDto) => {
    const response = await axiosInstance.post('/producoes', mapProducaoToApi(novaProducao));
    const producaoCriada = mapApiToProducao(response.data);

    if (novaProducao.observacoes) {
      await axiosInstance.post(`/producoes/${producaoCriada.id}/observacoes`, {
        descricao: novaProducao.observacoes,
      });
    }

    await carregarProducoes();
    return producaoCriada;
  };

  const atualizarProducao = async (id: string, producaoAtualizada: Producao) => {
    const response = await axiosInstance.put(`/producoes/${id}`, mapProducaoToApi(producaoAtualizada));
    const producao = mapApiToProducao(response.data);
    setProducoes((prev) => prev.map((item) => (item.id === id ? producao : item)));
    return producao;
  };

  return {
    producoes,
    loading,
    error,
    criarProducao,
    atualizarProducao,
  };
};
