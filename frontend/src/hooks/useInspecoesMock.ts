import { useEffect, useState } from 'react';
import { InspecaoMontagem } from '../types/inspecao';

export const useInspecoesMock = () => {
    const [inspecoes, setInspecoes] = useState<InspecaoMontagem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simula delay de API
        const timer = setTimeout(() => {
            const mockInspecoes: InspecaoMontagem[] = [
                {
                    id: '1',
                    numeroSerie: 'CEEV2030ACM-0559',
                    dataInspecao: '2024-01-15',
                    modelo: 'EXAUSTOR 420 MONOFASICO',
                    instrumentosAferição: [],
                    verificacaoPremontagem: [],
                    analiseDimensional: [],
                    testes: [],
                    verificacaoPosmontagem: [],
                    resultadoFinal: 'APROVADO',
                    observacoes: 'Equipamento aprovado para uso.',
                    responsavel: 'João da Silva',
                    data: '2024-01-15',
                    createdAt: '2024-01-15T10:30:00',
                    updatedAt: '2024-01-15T10:30:00',
                },
            ];
            setInspecoes(mockInspecoes);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const criarInspecao = (novaInspecao: InspecaoMontagem) => {
        const inspecaoComId = {
            ...novaInspecao,
            id: String(Date.now()),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setInspecoes((prev) => [...prev, inspecaoComId]);
    };

    const atualizarInspecao = (id: string, inspecaoAtualizada: InspecaoMontagem) => {
        setInspecoes((prev) =>
            prev.map((insp) =>
                insp.id === id
                    ? { ...inspecaoAtualizada, updatedAt: new Date().toISOString() }
                    : insp
            )
        );
    };

    const deletarInspecao = (id: string) => {
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
