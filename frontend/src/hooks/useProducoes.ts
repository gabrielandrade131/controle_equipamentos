import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';
import { CreateProducaoDto, Documento, Producao } from '../types/producao';

type ApiListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const toDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.split('T')[0];
};

const buildDocumentos = (producao: any): Documento[] => {
  const documentos: Documento[] = [];

  if (producao.listaPecas) {
    documentos.push({ id: `${producao.id}-listaPecas`, nome: 'Lista de Pecas', codigo: 'Sim' });
  }
  if (producao.sequenciaMontagem) {
    documentos.push({ id: `${producao.id}-sequenciaMontagem`, nome: 'Sequencia de Montagem', codigo: 'Sim' });
  }
  if (producao.inspecaoMontagem) {
    documentos.push({ id: `${producao.id}-inspecaoMontagem`, nome: 'Inspecao de Montagem', codigo: 'Sim' });
  }
  if (producao.historicoEquipamento) {
    documentos.push({ id: `${producao.id}-historicoEquipamento`, nome: 'Historico do Equipamento', codigo: 'Sim' });
  }
  if (producao.procedimentoTesteInspecaoMontagem) {
    documentos.push({ id: `${producao.id}-procedimentoTeste`, nome: 'Procedimento para Testes', codigo: 'Sim' });
  }

  return documentos;
};

export const mapApiToProducao = (producao: any): Producao => ({
  id: producao.id,
  numeroOrdem: String(producao.numeroOrdem ?? ''),
  numeroSerie: producao.numeroSerie ?? '',
  dataSolicitacao: toDateInput(producao.dataSolicitacao),
  dataTermino: toDateInput(producao.dataTermino),
  modelo: producao.modelo ?? '',
  descricao: producao.descricao ?? '',
  itensSeriados: (producao.itensSeriados ?? []).map((item: any, index: number) => ({
    id: item.id,
    numero: String(index + 1),
    descricao: item.descricao ?? '',
    numeroSerie: '',
  })),
  documentos: buildDocumentos(producao),
  observacoes: (producao.observacoes ?? []).map((observacao: any) => observacao.descricao).join('\n'),
  listaPecas: producao.listaPecas ? 'Sim' : '',
  sequencialMontagem: producao.sequenciaMontagem ? 'Sim' : '',
  inspecaoMontagem: producao.inspecaoMontagem ? 'Sim' : '',
  historicoEquipamento: producao.historicoEquipamento ? 'Sim' : '',
  procedimentoTestes: producao.procedimentoTesteInspecaoMontagem ? 'Sim' : '',
  createdAt: producao.criadoEm,
  updatedAt: producao.atualizadoEm,
});

export const mapProducaoToApi = (producao: CreateProducaoDto | Producao) => ({
  dataSolicitacao: producao.dataSolicitacao || undefined,
  dataTermino: producao.dataTermino || undefined,
  modelo: producao.modelo || undefined,
  descricaoComplemento: producao.descricao || undefined,
  listaPecas: Boolean(producao.listaPecas),
  sequenciaMontagem: Boolean(producao.sequencialMontagem),
  inspecaoMontagem: Boolean(producao.inspecaoMontagem),
  historicoEquipamento: Boolean(producao.historicoEquipamento),
  procedimentoTesteInspecaoMontagem: Boolean(producao.procedimentoTestes),
  itensSeriados: producao.itensSeriados?.map((item) => ({
    descricao: item.descricao,
  })),
});

export const useProducoes = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducoes = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<ApiListResponse<any>>('/producoes', {
        params: { limit: 100 },
      });
      setProducoes(response.data.data.map(mapApiToProducao));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao carregar producoes');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducoes();
  }, []);

  return { producoes, loading, error, recarregar: fetchProducoes };
};
