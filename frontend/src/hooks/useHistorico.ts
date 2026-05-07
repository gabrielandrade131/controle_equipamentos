import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { HistoricoEquipamentoData, CreateHistoricoDto } from '../types/historico';

type ApiListResponse<T> = {
  data: T[];
};

const formatRegistro = (registro: any) => ({
  id: registro.id,
  data: toDateInput(registro.data ?? registro.criadoEm),
  historico: registro.historico ?? '',
  assinatura: registro.assinatura ?? '',
});

const toDateInput = (value?: string | null) => {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.split('T')[0];
};

const mapApiToHistorico = (producao: any): HistoricoEquipamentoData => ({
  id: producao.id,
  numeroSerie: producao.numeroSerie ?? '',
  modelo: producao.modelo ?? '',
  registros: (producao.historicoEquipamentoRegistros ?? []).map(formatRegistro),
  notas: producao.descricao ?? '',
  createdAt: producao.criadoEm,
  updatedAt: producao.atualizadoEm,
});

export const useHistorico = () => {
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

  const salvarHistoricoEquipamento = async (id: string, historico: HistoricoEquipamentoData | CreateHistoricoDto) => {
    const registrosNovos = historico.registros.filter(
      (registro) => !registro.id || registro.id.startsWith('novo-'),
    );

    await Promise.all(
      registrosNovos.map((registro) =>
        axiosInstance.post(`/producoes/${id}/historico-equipamento`, {
          data: registro.data,
          historico: registro.historico,
          assinatura: registro.assinatura,
        }),
      ),
    );

    await carregarHistoricos();
  };

  const deletarHistorico = async (_id: string) => {
    await carregarHistoricos();
  };

  return {
    historicos,
    loading,
    salvarHistoricoEquipamento,
    deletarHistorico,
  };
};
