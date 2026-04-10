import { useState, useEffect } from 'react';
import axios from 'axios';
import { Producao } from '../types/producao';

const API_BASE_URL = 'http://localhost:3001/api';

export const useProducoes = () => {
  const [producoes, setProducoes] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducoes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/producoes`);
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