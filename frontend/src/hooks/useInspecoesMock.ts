import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { InspecaoMontagem, VerificacaoItem } from '../types/inspecao';

type ApiListResponse<T> = {
  data: T[];
};

const NAO = 'N' + String.fromCharCode(195, 131) + 'O';
const INSTRUMENTOS_KEY = 'instrumentosAferi' + String.fromCharCode(231) + String.fromCharCode(227) + 'o';

const NOMES_REGISTROS = [
  'Check dos Itens dos Seriados',
  'Analise Dimensional de Carcaca',
  'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
  'Resultado Esperado: Modelo CSC3420AC entre 415 e 430mm',
  'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
  'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
  'Teste de Aterramento do Motor',
  'Teste de Isolacao do Motor',
  'Aplicacao e afericao de Torque do Motor M4',
  'Aplicacao e afericao de Torque do Motor M5',
  'Aplicacao e afericao de Torque da botoeira',
  'Teste de Funcionamento do Motor',
  'Teste de Rotacao do Motor - Modelo CSEX420RM',
  'Teste de Rotacao do Motor - Modelo CSEX420AC',
  'Teste de Rotacao do Motor - Modelo CSEX550AC',
  'Teste de Rotacao do Motor - Modelo CSEX550SS',
];

const toDateInput = (value?: string | null) => {
  if (!value) return new Date().toISOString().split('T')[0];
  return value.split('T')[0];
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

const mapRegistros = (registros: any[] = []): VerificacaoItem[] => {
  const porOrdem = new Map(registros.map((registro) => [registro.ordem, registro]));

  return NOMES_REGISTROS.map((nome, index) => {
    const ordem = index + 1;
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
  const verificacoesGeraisPremontagem = mapRegistros(producao.registrosInspecaoMontagem);
  const reprovado = verificacoesGeraisPremontagem.some((item) => item.conformidade === NAO);
  const preenchido = verificacoesGeraisPremontagem.some(
    (item) => item.valorObservado || item.instrumentoMedicao || item.conformidade,
  );

  return {
    id: producao.id,
    numeroSerie: producao.numeroSerie ?? '',
    dataInspecao: toDateInput(producao.atualizadoEm || producao.criadoEm),
    modelo: producao.modelo ?? '',
    [INSTRUMENTOS_KEY]: [],
    verificacoesGeraisPremontagem,
    verificacaoPosmontagem: [],
    resultadoFinal: preenchido ? (reprovado ? 'REPROVADO' : 'APROVADO') : '',
    observacoes: '',
    responsavel: '',
    data: toDateInput(producao.atualizadoEm || producao.criadoEm),
    assinatura: '',
    nomeAssinante: '',
    aprovado: !reprovado && preenchido,
    createdAt: producao.criadoEm,
    updatedAt: producao.atualizadoEm,
  } as unknown as InspecaoMontagem;
};

export const useInspecoesMock = () => {
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

  const criarInspecao = async (novaInspecao: InspecaoMontagem) => {
    const response = await axiosInstance.post('/producoes', {
      dataSolicitacao: novaInspecao.data || novaInspecao.dataInspecao,
      modelo: novaInspecao.modelo || undefined,
      descricaoComplemento: novaInspecao.numeroSerie || undefined,
      inspecaoMontagem: true,
    });

    await Promise.all(
      (novaInspecao.verificacoesGeraisPremontagem || []).slice(0, 16).map((item, index) =>
        axiosInstance.patch(`/producoes/${response.data.id}/inspecao-montagem/${index + 1}`, {
          valorObservado: item.valorObservado || undefined,
          instrumentoMedicao: item.instrumentoMedicao || undefined,
          conformidades: conformidadeToApi(item.conformidade),
        }),
      ),
    );

    await carregarInspecoes();
  };

  const atualizarInspecao = async (id: string, inspecaoAtualizada: InspecaoMontagem) => {
    await Promise.all(
      (inspecaoAtualizada.verificacoesGeraisPremontagem || []).slice(0, 16).map((item, index) =>
        axiosInstance.patch(`/producoes/${id}/inspecao-montagem/${index + 1}`, {
          valorObservado: item.valorObservado || undefined,
          instrumentoMedicao: item.instrumentoMedicao || undefined,
          conformidades: conformidadeToApi(item.conformidade),
        }),
      ),
    );
    await carregarInspecoes();
  };

  const deletarInspecao = async (id: string) => {
    await axiosInstance.delete(`/producoes/${id}`);
    setInspecoes((prev) => prev.filter((insp) => insp.id !== id));
  };

  return {
    inspecoes,
    loading,
    criarInspecao,
    atualizarInspecao,
    deletarInspecao,
  };
};
