import { useEffect, useState } from 'react';
import { HistoricoEquipamentoData, CreateHistoricoDto } from '../types/historico';

export const useHistoricoMock = () => {
    const [historicos, setHistoricos] = useState<HistoricoEquipamentoData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simula delay de API
        const timer = setTimeout(() => {
            const mockHistoricos: HistoricoEquipamentoData[] = [
                {
                    id: '1',
                    numeroSerie: 'CSEX420ACM-0559',
                    modelo: 'CSEX420ACM',
                    registros: [
                        {
                            id: '1',
                            data: '2026-01-15',
                            historico: 'Equipamento recebido e inspecionado. Funcionamento normal.',
                            assinatura: 'João Silva'
                        },
                        {
                            id: '2',
                            data: '2026-02-20',
                            historico: 'Manutenção preventiva realizada. Óleo trocado e rolamentos lubrificados.',
                            assinatura: 'Maria Santos'
                        },
                        {
                            id: '3',
                            data: '2026-03-10',
                            historico: 'Substituição de correia. Equipamento testado e aprovado.',
                            assinatura: 'Pedro Costa'
                        }
                    ],
                    notas: 'Equipamento em bom estado de funcionamento. Próxima manutenção prevista para junho.',
                    createdAt: '2026-01-15T10:30:00',
                    updatedAt: '2026-03-10T14:45:00'
                },
                {
                    id: '2',
                    numeroSerie: 'CSEX420ACM-0560',
                    modelo: 'CSEX420ACM',
                    registros: [
                        {
                            id: '4',
                            data: '2026-01-20',
                            historico: 'Equipamento entregue ao cliente. Funcionamento testado e aprovado.',
                            assinatura: 'João Silva'
                        }
                    ],
                    notas: 'Em operação normal junto ao cliente.',
                    createdAt: '2026-01-20T09:00:00',
                    updatedAt: '2026-01-20T09:00:00'
                }
            ];
            setHistoricos(mockHistoricos);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const criarHistorico = (novoHistorico: CreateHistoricoDto) => {
        const historico: HistoricoEquipamentoData = {
            id: Date.now().toString(),
            ...novoHistorico,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setHistoricos([...historicos, historico]);
    };

    const atualizarHistorico = (id: string, historico: HistoricoEquipamentoData) => {
        setHistoricos(historicos.map(h => h.id === id ? { ...historico, updatedAt: new Date().toISOString() } : h));
    };

    const deletarHistorico = (id: string) => {
        setHistoricos(historicos.filter(h => h.id !== id));
    };

    return {
        historicos,
        loading,
        criarHistorico,
        atualizarHistorico,
        deletarHistorico
    };
};
