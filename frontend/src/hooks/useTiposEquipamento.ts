import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { TipoEquipamento } from '../types/producao';

type ApiListResponse<T> = {
  data: T[];
};

const normalizeTiposEquipamento = (
  payload: TipoEquipamento[] | ApiListResponse<TipoEquipamento>,
): TipoEquipamento[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

export const useTiposEquipamento = () => {
  const [tiposEquipamento, setTiposEquipamento] = useState<TipoEquipamento[]>([]);

  useEffect(() => {
    let ativo = true;

    axiosInstance
      .get<TipoEquipamento[] | ApiListResponse<TipoEquipamento>>('/tipos-equipamento')
      .then((response) => {
        if (!ativo) return;
        setTiposEquipamento(normalizeTiposEquipamento(response.data));
      })
      .catch((error) => {
        if (!ativo) return;
        console.error('Erro ao carregar tipos de equipamento:', error);
        setTiposEquipamento([]);
      });

    return () => {
      ativo = false;
    };
  }, []);

  return { tiposEquipamento };
};
