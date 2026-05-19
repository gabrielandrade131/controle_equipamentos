import { useCallback, useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { CreateProducaoDto, Documento, HistoricoProducaoItem, Producao } from '../types/producao';

type ApiListResponse<T> = {
  data: T[];
};

const toDateInput = (value?: string | null) => {
  if (!value) return '';
  return value.split('T')[0];
};

const parseAnexos = (valor?: string | null) => {
  const texto = String(valor ?? '').trim();
  if (!texto) return [] as string[];

  try {
    const parsed = JSON.parse(texto);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // Compatibilidade com registros antigos em texto
  }

  return texto
    .split(/\r?\n/)
    .map((linha) => linha.replace(/^-+\s*/, '').trim())
    .filter(Boolean);
};

const formatarCodigoDocumento = (valor?: string | null) => {
  const anexos = parseAnexos(valor);
  if (anexos.length === 0) return '';
  return anexos.join(', ');
};

const buildDocumentos = (producao: any): Documento[] => {
  const documentos: Documento[] = [];

  const listaPecas = formatarCodigoDocumento(producao.listaPecas);
  if (listaPecas) {
    documentos.push({ id: `${producao.id}-listaPecas`, nome: 'Lista de Pecas', codigo: listaPecas });
  }
  const sequencialMontagem = producao.sequenciaMontagem ?? producao.sequencialMontagem;
  const sequencialMontagemCodigo = formatarCodigoDocumento(sequencialMontagem);
  if (sequencialMontagemCodigo) {
    documentos.push({ id: `${producao.id}-sequencialMontagem`, nome: 'Sequencial de Montagem', codigo: sequencialMontagemCodigo });
  }
  const inspecaoMontagem = formatarCodigoDocumento(producao.inspecaoMontagem);
  if (inspecaoMontagem) {
    documentos.push({ id: `${producao.id}-inspecaoMontagem`, nome: 'Inspecao de Montagem', codigo: inspecaoMontagem });
  }
  const historicoEquipamento = formatarCodigoDocumento(producao.historicoEquipamento);
  if (historicoEquipamento) {
    documentos.push({ id: `${producao.id}-historicoEquipamento`, nome: 'Historico do Equipamento', codigo: historicoEquipamento });
  }
  const procedimentoTestes = producao.procedimentoTesteInspecaoMontagem ?? producao.procedimentoTestes;
  const procedimentoTestesCodigo = formatarCodigoDocumento(procedimentoTestes);
  if (procedimentoTestesCodigo) {
    documentos.push({ id: `${producao.id}-procedimentoTeste`, nome: 'Procedimento para Testes', codigo: procedimentoTestesCodigo });
  }

  return documentos;
};

const getDescricaoComplementar = (producao: any): string => {
  const descricao = producao.descricao ?? '';
  const tipoNome = producao.tipoEquipamento?.nome;

  if (!tipoNome || !descricao.startsWith(tipoNome)) {
    return descricao;
  }

  return descricao.slice(tipoNome.length).trim();
};

const getDescricaoItemSeriado = (item: { numero?: string; descricao?: string; numeroSerie?: string }) => {
  const descricao = item.descricao?.trim() ?? '';

  if (descricao.startsWith('Numero:') || descricao.includes(' - Serie:')) {
    return descricao;
  }

  const partes = [
    item.numero ? `Numero: ${item.numero.trim()}` : '',
    descricao,
    item.numeroSerie ? `Serie: ${item.numeroSerie.trim()}` : '',
  ].filter(Boolean);

  return partes.join(' - ');
};

const mapHistoricoProducao = (observacoes: any[] | undefined | null): HistoricoProducaoItem[] =>
  (observacoes ?? []).map((observacao: any) => ({
    id: observacao.id,
    descricao: String(observacao.descricao ?? '').trim(),
    responsavel: String(observacao.responsavel ?? '').trim(),
    criadoEm: observacao.criadoEm ?? undefined,
  }));

const getHistoricoNovo = (historico?: HistoricoProducaoItem[] | null) =>
  (historico ?? []).filter((item) => item.id.startsWith('novo-') || !item.id);

const parseItemSeriado = (item: { id: string; descricao?: string | null }, index: number) => {
  const descricaoCompleta = item.descricao ?? '';
  const partes = descricaoCompleta.split(' - ');
  const numeroPart = partes.find((parte) => parte.startsWith('Numero: '));
  const seriePart = partes.find((parte) => parte.startsWith('Serie: '));
  const descricao = partes
    .filter((parte) => !parte.startsWith('Numero: ') && !parte.startsWith('Serie: '))
    .join(' - ');

  return {
    id: item.id,
    numero: numeroPart?.replace('Numero: ', '') || String(index + 1),
    descricao: descricao || descricaoCompleta,
    numeroSerie: seriePart?.replace('Serie: ', '') || '',
  };
};

export const mapApiToProducao = (producao: any): Producao => ({
  id: producao.id,
  numeroOrdem: String(producao.numeroOrdem ?? ''),
  numeroLote: producao.numeroLote ?? producao.loteProducao?.numeroLote ?? null,
  loteProducao: producao.loteProducao ?? undefined,
  numeroSerie: producao.numeroSerie ?? '',
  tag: producao.tag ?? '',
  dataSolicitacao: toDateInput(producao.dataSolicitacao),
  dataNecessidade: toDateInput(producao.dataNecessidade),
  dataInicio: toDateInput(producao.dataInicio),
  dataPrevisao: toDateInput(producao.dataPrevisao ?? producao.previsaoTermino),
  dataTermino: toDateInput(producao.dataTermino),
  statusProducao: producao.statusProducao ?? 'PROGRAMADA',
  tipoEquipamentoId: producao.tipoEquipamentoId ?? '',
  tipoEquipamentoNome: producao.tipoEquipamento?.nome ?? '',
  modelo: producao.modelo ?? '',
  descricao: getDescricaoComplementar(producao),
  itensSeriados: (producao.itensSeriados ?? []).map(parseItemSeriado),
  documentos: buildDocumentos(producao),
  observacoes: (producao.observacoes ?? []).map((observacao: any) => observacao.descricao).join('\n'),
  historicoProducao: mapHistoricoProducao(producao.observacoes),
  listaPecas: producao.listaPecas ?? '',
  sequencialMontagem: producao.sequenciaMontagem ?? producao.sequencialMontagem ?? '',
  inspecaoMontagem: producao.inspecaoMontagem ?? '',
  historicoEquipamento: producao.historicoEquipamento ?? '',
  procedimentoTestes: producao.procedimentoTesteInspecaoMontagem ?? producao.procedimentoTestes ?? '',
  createdAt: producao.criadoEm,
  updatedAt: producao.atualizadoEm,
  diasSolicitacao: producao.diasSolicitacao ?? null,
  diasProducao: producao.diasProducao ?? null,
  situacaoPrazo: producao.situacaoPrazo ?? null,
  resultadoPrazo: producao.resultadoPrazo ?? null,
});

export const mapProducaoToApi = (producao: CreateProducaoDto | Producao) => ({
  dataSolicitacao: producao.dataSolicitacao || undefined,
  dataNecessidade: producao.dataNecessidade || undefined,
  dataInicio: producao.dataInicio || undefined,
  previsaoTermino: producao.dataPrevisao || undefined,
  dataTermino: producao.dataTermino || undefined,
  statusProducao: producao.statusProducao || undefined,
  tipoEquipamentoId: producao.tipoEquipamentoId || undefined,
  modelo: producao.modelo || undefined,
  descricaoComplemento: producao.descricao || undefined,
  listaPecas: producao.listaPecas || undefined,
  sequencialMontagem: producao.sequencialMontagem || undefined,
  inspecaoMontagem: producao.inspecaoMontagem || undefined,
  historicoEquipamento: producao.historicoEquipamento || undefined,
  procedimentoTestes: producao.procedimentoTestes || undefined,
  itensSeriados: producao.itensSeriados
    ?.map((item) => ({
      descricao: getDescricaoItemSeriado(item),
    }))
    .filter((item) => item.descricao),
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
    let producaoCriada = mapApiToProducao(response.data);

    const historicoParaSalvar = getHistoricoNovo(novaProducao.historicoProducao);

    if (historicoParaSalvar.length > 0) {
      await Promise.all(
        historicoParaSalvar.map((item) =>
          axiosInstance.post(`/producoes/${producaoCriada.id}/observacoes`, {
            descricao: item.descricao,
            responsavel: item.responsavel,
          }),
        ),
      );
    }

    if (novaProducao.tag && producaoCriada.statusProducao === 'CONCLUIDA') {
      const tagResponse = await axiosInstance.patch(`/producoes/${producaoCriada.id}/tag`, {
        tag: novaProducao.tag,
      });
      producaoCriada = mapApiToProducao(tagResponse.data);
    }

    const refreshed = await axiosInstance.get(`/producoes/${producaoCriada.id}`);
    producaoCriada = mapApiToProducao(refreshed.data);

    await carregarProducoes();
    return producaoCriada;
  };

  const atualizarProducao = async (id: string, producaoAtualizada: Producao) => {
    const response = await axiosInstance.put(`/producoes/${id}`, mapProducaoToApi(producaoAtualizada));
    let producao = mapApiToProducao(response.data);

    const historicoNovo = getHistoricoNovo(producaoAtualizada.historicoProducao);

    if (historicoNovo.length > 0) {
      await Promise.all(
        historicoNovo.map((item) =>
          axiosInstance.post(`/producoes/${id}/observacoes`, {
            descricao: item.descricao,
            responsavel: item.responsavel,
          }),
        ),
      );

      const refreshed = await axiosInstance.get(`/producoes/${id}`);
      producao = mapApiToProducao(refreshed.data);
    }

    if (producaoAtualizada.tag && producao.statusProducao === 'CONCLUIDA') {
      const tagResponse = await axiosInstance.patch(`/producoes/${id}/tag`, {
        tag: producaoAtualizada.tag,
      });
      producao = mapApiToProducao(tagResponse.data);
    }

    await carregarProducoes();
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
