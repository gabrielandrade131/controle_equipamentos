import { useState, useEffect } from 'react';
import { Producao, CreateProducaoDto } from '../types/producao';

// Dados mockados que correspondem à interface Producao com TODOS os campos
const mockProducoes: Producao[] = [
  {
    id: '1',
    numeroOrdem: '0559',
    numeroSerie: 'CSEX420ACM-0559',
    dataSolicitacao: '2026-03-18',
    modelo: 'CSEX420ACM',
    descricao: 'EXAUSTOR 420 MONOFASICO',
    listaPecas: 'DM-EX420MONO',
    sequencialMontagem: 'EXAUSTOR 420',
    inspecaoMontagem: 'FOR-MAN-006 (x) FOR-MAN-057 ()',
    historicoEquipamento: 'FOR-MAN-008',
    observacoes: 'Equipamento padrão',
    documentos: [
      { id: 'doc-1', nome: 'Lista de Peças', codigo: 'DM-EX420MONO' },
      { id: 'doc-2', nome: 'Sequência de Montagem', codigo: 'EXAUSTOR 420' },
      { id: 'doc-3', nome: 'Inspeção de Montagem', codigo: 'FOR-MAN-006 (x)' },
      { id: 'doc-4', nome: 'Histórico do Equipamento', codigo: 'FOR-MAN-008' },
      { id: 'doc-5', nome: 'Procedimento para Testes e Inspeção de Montagem', codigo: 'PR-MAN-003' },
    ],
    itensSeriados: [
      { id: 'item-1', numero: '1', descricao: 'CSEX420 MONOFÁSICO - W222xdb -carcaça 80 - 1,1 kW (1,5 cv) - 220 Vca - 50/60 Hz - 2 pólos', numeroSerie: '' },
      { id: 'item-2', numero: '2', descricao: 'CSEX420 MONOFÁSICO - Boteira BTEx 56571/015 (TRAMONTINA)', numeroSerie: '' },
      { id: 'item-3', numero: '3', descricao: 'CSEX420 MONOFÁSICO - PCX PES316PB (APPLETON)', numeroSerie: '' },
    ],
  },
  {
    id: '2',
    numeroOrdem: '0560',
    numeroSerie: 'CSEX420ACM-0560',
    dataSolicitacao: '2026-03-19',
    modelo: 'CSEX420ACM',
    descricao: 'EXAUSTOR 420 MONOFASICO',
    listaPecas: 'DM-EX420MONO',
    sequencialMontagem: 'EXAUSTOR 420',
    inspecaoMontagem: 'FOR-MAN-006 (x)',
    historicoEquipamento: 'FOR-MAN-008',
    observacoes: 'Em produção',
    documentos: [
      { id: 'doc-6', nome: 'Lista de Peças', codigo: 'DM-EX420MONO' },
      { id: 'doc-7', nome: 'Sequência de Montagem', codigo: 'EXAUSTOR 420' },
    ],
    itensSeriados: [
      { id: 'item-4', numero: '1', descricao: 'CSEX420 MONOFÁSICO - W222xdb -carcaça 80', numeroSerie: '' },
    ],
  },
  {
    id: '3',
    numeroOrdem: '0561',
    numeroSerie: 'CSEX420ACM-0561',
    dataSolicitacao: '2026-03-20',
    modelo: 'CSEX420ACM',
    descricao: 'EXAUSTOR 420 MONOFASICO',
    listaPecas: '',
    sequencialMontagem: '',
    inspecaoMontagem: '',
    historicoEquipamento: '',
    observacoes: 'Planejamento',
    documentos: [],
    itensSeriados: [],
  },
];

export const useProducoesMock = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[useProducoesMock] Carregando dados mockados...');
      setProducoes(mockProducoes);
      setLoading(false);
      console.log('[useProducoesMock] Dados carregados:', mockProducoes);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const criarProducao = (novaProducao: CreateProducaoDto) => {
    const id = String(Math.max(...producoes.map(p => parseInt(p.id)), 0) + 1);
    const producaoCompleta: Producao = {
      id,
      ...novaProducao,
    };

    setProducoes([...producoes, producaoCompleta]);
    console.log('[useProducoesMock] Produção criada:', producaoCompleta);
  };

  const atualizarProducao = (id: string, producaoAtualizada: Producao) => {
    setProducoes(producoes.map(p => p.id === id ? producaoAtualizada : p));
    console.log('[useProducoesMock] Produção atualizada:', producaoAtualizada);
  };

  return {
    producoes,
    loading,
    error,
    criarProducao,
    atualizarProducao,
  };
};
