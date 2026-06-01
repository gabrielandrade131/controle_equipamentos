import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import { TipoEquipamento } from '../types/producao';
import './TiposEquipamento.css';

type FormState = {
  nome: string;
};

const initialFormState: FormState = {
  nome: '',
};

const normalizeTiposEquipamento = (payload: TipoEquipamento[] | { data?: TipoEquipamento[] }) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const TiposEquipamentoPage: React.FC = () => {
  const [tipos, setTipos] = useState<TipoEquipamento[]>([]);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const tiposOrdenados = useMemo(
    () => [...tipos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    [tipos],
  );

  const carregarTipos = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<TipoEquipamento[] | { data?: TipoEquipamento[] }>(
        '/tipos-equipamento',
      );
      setTipos(normalizeTiposEquipamento(response.data));
      setError(null);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Não foi possível carregar os tipos de equipamento.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTipos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nome = form.nome.trim();
    if (!nome) {
      setError('Informe o nome do tipo de equipamento.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await axiosInstance.post('/tipos-equipamento', { nome });

      setForm(initialFormState);
      setSuccessMessage('Tipo de equipamento cadastrado com sucesso.');
      await carregarTipos();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Não foi possível cadastrar o tipo de equipamento.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tipos-equipamento-page">
      <div className="tipos-equipamento-header">
        <div>
          <h2>Tipos de Equipamento</h2>
          <p>Cadastre novos tipos e use-os em produção e manutenção.</p>
        </div>
      </div>

      <div className="tipos-equipamento-layout">
        <section className="tipos-equipamento-card">
          <h3>Novo Tipo</h3>
          <form onSubmit={handleSubmit} className="tipos-equipamento-form">
            <label htmlFor="nomeTipoEquipamento">Nome do tipo</label>
            <input
              id="nomeTipoEquipamento"
              type="text"
              value={form.nome}
              onChange={(e) => setForm({ nome: e.target.value })}
              placeholder="Ex.: Exaustor SH-30"
            />
            <button type="submit" className="tipos-equipamento-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Cadastrar tipo'}
            </button>
          </form>

          {error ? <p className="tipos-equipamento-feedback error">{error}</p> : null}
          {successMessage ? (
            <p className="tipos-equipamento-feedback success">{successMessage}</p>
          ) : null}
        </section>

        <section className="tipos-equipamento-card">
          <div className="tipos-equipamento-list-header">
            <h3>Tipos Disponíveis</h3>
            <button
              type="button"
              className="tipos-equipamento-secondary"
              onClick={carregarTipos}
              disabled={loading}
            >
              Atualizar
            </button>
          </div>

          {loading ? <p>Carregando tipos de equipamento...</p> : null}

          {!loading && tiposOrdenados.length === 0 ? (
            <p>Nenhum tipo de equipamento cadastrado.</p>
          ) : null}

          {!loading && tiposOrdenados.length > 0 ? (
            <ul className="tipos-equipamento-list">
              {tiposOrdenados.map((tipo) => (
                <li key={tipo.id}>
                  <span>{tipo.nome}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default TiposEquipamentoPage;
