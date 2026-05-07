import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { CreateProducaoDto, Documento, Producao } from '../types/producao';

type ApiListResponse<T> = {
  data: T[];
};

const toDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.split('T')[0];
};

const buildDocumentos = (producao: any): Documento[] => {
  const documentos: Documento[] = [];

  if (producao.listaPecas && String(producao.listaPecas).trim() !== '') {
    documentos.push({ id: `${producao.id}-listaPecas`, nome: 'Lista de Pecas', codigo: String(producao.listaPecas) });
  }
  if (producao.sequencialMontagem && String(producao.sequencialMontagem).trim() !== '') {
    documentos.push({ id: `${producao.id}-sequencialMontagem`, nome: 'Sequencial de Montagem', codigo: String(producao.sequencialMontagem) });
  }
  if (producao.inspecaoMontagem && String(producao.inspecaoMontagem).trim() !== '') {
    documentos.push({ id: `${producao.id}-inspecaoMontagem`, nome: 'Inspecao de Montagem', codigo: String(producao.inspecaoMontagem) });
  }
  if (producao.historicoEquipamento && String(producao.historicoEquipamento).trim() !== '') {
    documentos.push({ id: `${producao.id}-historicoEquipamento`, nome: 'Historico do Equipamento', codigo: String(producao.historicoEquipamento) });
  }
  if (producao.procedimentoTestes && String(producao.procedimentoTestes).trim() !== '') {
    documentos.push({ id: `${producao.id}-procedimentoTeste`, nome: 'Procedimento para Testes', codigo: String(producao.procedimentoTestes) });
  }

  return documentos;
};

export const mapApiToProducao = (producao: any): Producao => ({
  id: producao.id,
  numeroOrdem: String(producao.numeroOrdem ?? ''),
  numeroSerie: producao.numeroSerie ?? '',
  dataSolicitacao: toDateInput(producao.dataSolicitacao),
  dataInicio: toDateInput(producao.dataInicio),
  dataPrevisao: toDateInput(producao.dataPrevisao),
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
  listaPecas: producao.listaPecas ?? '',
  sequencialMontagem: producao.sequenciaMontagem ?? producao.sequencialMontagem ?? '',
  inspecaoMontagem: producao.inspecaoMontagem ?? '',
  historicoEquipamento: producao.historicoEquipamento ?? '',
  procedimentoTestes: producao.procedimentoTesteInspecaoMontagem ?? producao.procedimentoTestes ?? '',
  createdAt: producao.criadoEm,
  updatedAt: producao.atualizadoEm,
});

export const mapProducaoToApi = (producao: CreateProducaoDto | Producao) => ({
  dataSolicitacao: producao.dataSolicitacao || undefined,
  dataInicio: producao.dataInicio || undefined,
  dataPrevisao: producao.dataPrevisao || undefined,
  dataTermino: producao.dataTermino || undefined,
  modelo: producao.modelo || undefined,
  descricaoComplemento: producao.descricao || undefined,
  listaPecas: producao.listaPecas || undefined,
  sequencialMontagem: producao.sequencialMontagem || undefined,
  inspecaoMontagem: producao.inspecaoMontagem || undefined,
  historicoEquipamento: producao.historicoEquipamento || undefined,
  procedimentoTestes: producao.procedimentoTestes || undefined,
  itensSeriados: producao.itensSeriados?.map((item) => ({
    descricao: item.descricao,
  })),
});

export const useProducoes = () => {
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
