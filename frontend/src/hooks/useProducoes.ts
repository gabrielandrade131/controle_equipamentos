import { useState, useEffect } from 'react';
import axiosInstance from '../services/axiosConfig';
import { Producao } from '../types/producao';

export const useProducoes = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducoes = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/producoes');
        setProducoes(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar produções');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducoes();
  }, []);

  return { producoes, loading, error };
};