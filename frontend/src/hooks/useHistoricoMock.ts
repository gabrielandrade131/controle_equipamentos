import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { HistoricoEquipamentoData, CreateHistoricoDto } from '../types/historico';

type ApiListResponse<T> = {
  data: T[];
};

const formatRegistro = (registro: any) => ({
  id: registro.id,
  data: registro.criadoEm,
  historico: `${registro.campo}: ${registro.valorAnterior ?? 'vazio'} -> ${registro.valorNovo ?? 'vazio'}`,
  assinatura: registro.alteradoPor || 'Sistema',
});

const mapApiToHistorico = (producao: any): HistoricoEquipamentoData => ({
  id: producao.id,
  numeroSerie: producao.numeroSerie ?? '',
  modelo: producao.modelo ?? '',
  registros: (producao.historicoAlteracoes ?? []).map(formatRegistro),
  notas: producao.descricao ?? '',
  createdAt: producao.criadoEm,
  updatedAt: producao.atualizadoEm,
});

export const useHistoricoMock = () => {
  const [historicos, setHistoricos] = useState<HistoricoEquipamentoData[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarHistoricos = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get<ApiListResponse<any>>('/producoes', {
        params: { limit: 100 },
      });
      setHistoricos(response.data.data.map(mapApiToHistorico));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistoricos();
  }, []);

  const criarHistorico = async (_novoHistorico: CreateHistoricoDto) => {
    await carregarHistoricos();
  };

  const atualizarHistorico = async (_id: string, _historico: HistoricoEquipamentoData) => {
    await carregarHistoricos();
  };

  const deletarHistorico = async (_id: string) => {
    await carregarHistoricos();
  };

  return {
    historicos,
    loading,
    criarHistorico,
    atualizarHistorico,
    deletarHistorico,
  };
};
