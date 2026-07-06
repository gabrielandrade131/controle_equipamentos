import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosConfig";
import { mapApiToProducao } from "../hooks/useProducoes";
import { Producao } from "../types/producao";
import { formatDatePtBr, getLocalDateInput } from "../utils/date";
import "./ValidadeEquipamentos.css";

type ApiListResponse<T> = {
  data: T[];
};

type StatusValidade = "VENCIDO" | "VENCE_HOJE" | "PROXIMO" | "NO_PRAZO" | "SEM_VALIDADE";
type StatusFiltro = "TODOS" | StatusValidade;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const JANELA_PROXIMOS_DIAS = 30;

const parseLocalDate = (value?: string | null) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const calcularDiasParaValidade = (validade?: string) => {
  const dataValidade = parseLocalDate(validade);
  const hoje = parseLocalDate(getLocalDateInput());

  if (!dataValidade || !hoje) return null;

  return Math.ceil((dataValidade.getTime() - hoje.getTime()) / MS_PER_DAY);
};

const getStatusValidade = (
  diasParaValidade: number | null,
  janelaDias: number,
): StatusValidade => {
  if (diasParaValidade === null) return "SEM_VALIDADE";
  if (diasParaValidade < 0) return "VENCIDO";
  if (diasParaValidade === 0) return "VENCE_HOJE";
  if (diasParaValidade <= janelaDias) return "PROXIMO";
  return "NO_PRAZO";
};

const statusLabel: Record<StatusValidade, string> = {
  VENCIDO: "Vencido",
  VENCE_HOJE: "Vence hoje",
  PROXIMO: "Próximo da validade",
  NO_PRAZO: "No prazo",
  SEM_VALIDADE: "Sem validade",
};

const ValidadeEquipamentos: React.FC = () => {
  const [equipamentos, setEquipamentos] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("TODOS");

  useEffect(() => {
    const carregarEquipamentos = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get<ApiListResponse<any>>("/producoes", {
          params: {
            limit: 1000,
            sortBy: "numeroOrdem",
            sortOrder: "asc",
          },
        });
        setEquipamentos(response.data.data.map(mapApiToProducao));
        setError(null);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Erro ao carregar equipamentos",
        );
      } finally {
        setLoading(false);
      }
    };

    carregarEquipamentos();
  }, []);

  const equipamentosComStatus = useMemo(
    () =>
      equipamentos
        .map((equipamento) => {
          const diasParaValidade = calcularDiasParaValidade(equipamento.validade);
          const status = getStatusValidade(diasParaValidade, JANELA_PROXIMOS_DIAS);
          return {
            ...equipamento,
            diasParaValidade,
            statusValidade: status,
          };
        })
        .sort((a, b) => {
          const aDias = a.diasParaValidade ?? Number.POSITIVE_INFINITY;
          const bDias = b.diasParaValidade ?? Number.POSITIVE_INFINITY;
          return aDias - bDias;
        }),
    [equipamentos],
  );

  const equipamentosFiltrados = equipamentosComStatus.filter((equipamento) => {
    if (statusFiltro !== "TODOS") {
      return equipamento.statusValidade === statusFiltro;
    }
    return equipamento.statusValidade !== "NO_PRAZO";
  });

  const resumo = equipamentosComStatus.reduce(
    (acc, equipamento) => {
      acc[equipamento.statusValidade] += 1;
      return acc;
    },
    {
      VENCIDO: 0,
      VENCE_HOJE: 0,
      PROXIMO: 0,
      NO_PRAZO: 0,
      SEM_VALIDADE: 0,
    } as Record<StatusValidade, number>,
  );

  if (loading) {
    return <div className="validade-page">Carregando validades...</div>;
  }

  if (error) {
    return <div className="validade-page validade-error">Erro: {error}</div>;
  }

  return (
    <main className="validade-page">
      <header className="validade-header">
        <div>
          <h2>Equipamentos Próximos da Validade</h2>
          <p>Acompanhe equipamentos vencidos ou com validade próxima.</p>
        </div>
        <div className="validade-controls">
          <label htmlFor="statusFiltro">Status</label>
          <select
            id="statusFiltro"
            value={statusFiltro}
            onChange={(event) => setStatusFiltro(event.target.value as StatusFiltro)}
          >
            <option value="TODOS">Todos</option>
            <option value="VENCIDO">Vencidos</option>
            <option value="VENCE_HOJE">Vencem hoje</option>
            <option value="PROXIMO">Próximos</option>
            <option value="SEM_VALIDADE">Sem validade</option>
          </select>
        </div>
      </header>

      <section className="validade-summary" aria-label="Resumo das validades">
        <div className="validade-summary-item danger">
          <span>{resumo.VENCIDO}</span>
          <strong>Vencidos</strong>
        </div>
        <div className="validade-summary-item warning">
          <span>{resumo.VENCE_HOJE}</span>
          <strong>Vencem hoje</strong>
        </div>
        <div className="validade-summary-item attention">
          <span>{resumo.PROXIMO}</span>
          <strong>Próximos</strong>
        </div>
        <div className="validade-summary-item neutral">
          <span>{resumo.SEM_VALIDADE}</span>
          <strong>Sem validade</strong>
        </div>
      </section>

      <section className="validade-table-wrap">
        {equipamentosFiltrados.length === 0 ? (
          <div className="validade-empty">
            Nenhum equipamento encontrado para o filtro selecionado.
          </div>
        ) : (
          <table className="validade-table">
            <thead>
              <tr>
                <th>Ordem</th>
                <th>TAG</th>
                <th>Série</th>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Validade</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {equipamentosFiltrados.map((equipamento) => (
                <tr key={equipamento.id}>
                  <td>{equipamento.numeroOrdem}</td>
                  <td>{equipamento.tag || "-"}</td>
                  <td>{equipamento.numeroSerie || "-"}</td>
                  <td>{equipamento.tipoEquipamentoNome || "-"}</td>
                  <td>{equipamento.modelo || "-"}</td>
                  <td>{formatDatePtBr(equipamento.validade) || "-"}</td>
                  <td>
                    <span className={`validade-badge ${equipamento.statusValidade.toLowerCase()}`}>
                      {statusLabel[equipamento.statusValidade]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
};

export default ValidadeEquipamentos;
