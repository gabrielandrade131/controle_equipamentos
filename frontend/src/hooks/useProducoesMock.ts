import { useState, useEffect } from 'react';
import { Producao } from '../types/producao';

// Dados simulados para testes - Informações Reais
const MOCK_PRODUCOES: Producao[] = [
  {
    id: '1',
    numeroOrdem: '0559',
    numeroSerie: 'CSEX420ACM-0559',
    modelo: 'CSEX420ACM',
    dataSolicitacao: '18/03/2026',
    descricao: 'EXAUSTOR 420 MONOFÁSICO - 220V 50/60 Hz',
    listaPecas: true,
    sequencialMontagem: true,
    inspecaoMontagem: true,
    historicoEquipamento: true,
  },
  {
    id: '2',
    numeroOrdem: '0560',
    numeroSerie: 'CSEX320ACM-0560',
    modelo: 'CSEX320ACM',
    dataSolicitacao: '19/03/2026',
    descricao: 'EXAUSTOR 320 MONOFÁSICO - W222xdb Carcaça 80 - 1,1 kW',
    listaPecas: true,
    sequencialMontagem: true,
    inspecaoMontagem: true,
    historicoEquipamento: true,
  },
  {
    id: '3',
    numeroOrdem: '0561',
    numeroSerie: 'CVA500ACM-0561',
    modelo: 'CVA500ACM',
    dataSolicitacao: '20/03/2026',
    descricao: 'CENTRÍFUGO 500 MONOFÁSICO - Boteira BTEx 56571/015',
    listaPecas: true,
    sequencialMontagem: true,
    inspecaoMontagem: false,
    historicoEquipamento: true,
  },
];

export const useProducoesMock = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula delay de carregamento
    const timer = setTimeout(() => {
      setProducoes(MOCK_PRODUCOES);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { producoes, loading, error };
};
