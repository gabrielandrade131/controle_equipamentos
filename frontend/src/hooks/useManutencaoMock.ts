import { useState, useEffect } from 'react';
import { InspecaoManutencao, criarInspecaoVazia } from '../types/manutencao';

// Dados mockados de inspeção de manutenção
const criarInspecaoMock = (): InspecaoManutencao => {
  const inspecao = criarInspecaoVazia();
  
  return {
    ...inspecao,
    id: 'mock-1',
    dataManutencao: '2026-04-27',
    localManutencao: 'Oficina Piracicaba',
    fabricante: 'ALLIGATOR',
    modelo: 'CSEX420ACM',
    numeroSerie: 'CSEX420ACM-0559',
    tag: 'EQUIP-001',
    destino: 'Manutenção preventiva',
    responsavel: 'João Silva',
    
    // Certificações - algumas com respostas
    certificacoes: inspecao.certificacoes.map((item, index) => ({
      ...item,
      resposta: index === 0 ? 'SIM' : index === 1 ? 'SIM' : 'N/A',
    })),
    
    // Estrutura - algumas preenchidas
    estruturaMecanica: inspecao.estruturaMecanica.map((item, index) => ({
      ...item,
      resposta: index < 3 ? 'SIM' : index === 3 ? 'NÃO' : '',
    })),
    
    // Sistema Hidráulico
    sistemaHidraulico: inspecao.sistemaHidraulico.map((item, index) => ({
      ...item,
      resposta: index % 2 === 0 ? 'SIM' : 'N/A',
    })),
    
    // Sistema Pneumático
    sistemaPneumatico: inspecao.sistemaPneumatico.map((item, index) => ({
      ...item,
      resposta: index % 2 === 0 ? 'SIM' : 'NÃO',
    })),
    
    // Sistema Elétrico
    sistemaEletrico: inspecao.sistemaEletrico.map((item, index) => ({
      ...item,
      resposta: index === 0 ? 'NÃO' : 'SIM',
    })),
    
    // Dispositivos de Segurança
    dispositivoSeguranca: inspecao.dispositivoSeguranca.map((item, index) => ({
      ...item,
      resposta: 'SIM',
    })),
    
    // Componentes Operacionais
    componentesOperacionais: inspecao.componentesOperacionais.map((item, index) => ({
      ...item,
      resposta: index < 2 ? 'SIM' : 'N/A',
    })),
    
    // Acessórios
    acessorios: inspecao.acessorios.map((item) => ({
      ...item,
      resposta: 'SIM',
    })),
    
    // Testes Operacionais
    testesOperacionais: inspecao.testesOperacionais.map((item, index) => ({
      ...item,
      resposta: index === 0 ? 'SIM' : 'SIM',
    })),
    
    avaliacaoFinal: 'CONFORME',
    observacoes: 'Equipamento inspecionado e aprovado para operação. Próxima manutenção preventiva em 06/2026.',
    assinatura: 'João Silva',
    criadoEm: new Date().toISOString(),
  };
};

export const useManutencaoMock = () => {
  const [historico, setHistorico] = useState<InspecaoManutencao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simular carregamento assíncrono
    setLoading(true);
    setTimeout(() => {
      setHistorico([criarInspecaoMock()]);
      setLoading(false);
    }, 500);
  }, []);

  const adicionarInspecao = (inspecao: InspecaoManutencao) => {
    setHistorico((prev) => [inspecao, ...prev]);
  };

  const removerInspecao = (id: string) => {
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
