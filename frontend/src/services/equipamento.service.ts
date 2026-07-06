import { mapApiToProducao } from "../hooks/useProducoes";
import { Producao } from "../types/producao";
import axiosInstance from "./axiosConfig";

type ApiListResponse<T> = {
  data: T[];
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export async function listarInspecoesProximas(
  diasLimite = 30,
): Promise<Producao[]> {
  const response = await axiosInstance.get<ApiListResponse<any>>("/producoes", {
    params: {
      limit: 1000,
      sortBy: "numeroOrdem",
      sortOrder: "asc",
    },
  });

  const hoje = parseDate(new Date().toISOString().split("T")[0]);

  return response.data.data
    .map(mapApiToProducao)
    .filter((equipamento) => {
      const validade = parseDate(equipamento.validade);
      if (!hoje || !validade) return false;
      const dias = Math.ceil((validade.getTime() - hoje.getTime()) / MS_PER_DAY);
      return dias >= 0 && dias <= diasLimite;
    })
    .sort((a, b) => String(a.validade).localeCompare(String(b.validade)));
}
