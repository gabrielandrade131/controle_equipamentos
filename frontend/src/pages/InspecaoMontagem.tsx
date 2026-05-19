import React, { useState, useMemo } from 'react';
import { FormularioInspecaoNovo } from '../components/FormularioInspecaoNovo';
import { FilterPanel } from '../components/FilterPanel';
import { useFilters } from '../hooks/useFilters';
import { PdfExporterInspecao } from '../components/PdfExporterInspecao';
import { useInspecoes } from '../hooks/useInspecoes';
import { InspecaoMontagem } from '../types/inspecao';
import { buildSelectOptions } from '../utils/filterOptions';
import '../pages/Producao.css';

interface SelectedInspecao {
  id: string;
  data: InspecaoMontagem;
}

const getResultadoColor = (resultado?: string) => {
  if (resultado === 'APROVADO') return '#4caf50';
  if (resultado === 'REPROVADO') return '#f44336';
  return '#666';
};

const InspecaoMontagemPage: React.FC = () => {
  const { inspecoes, loading, atualizarInspecao } = useInspecoes();
  const [selected, setSelected] = useState<SelectedInspecao | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { filters, updateFilters } = useFilters('inspecao-filters', {});
  const modeloOptions = useMemo(
    () => buildSelectOptions(inspecoes.map((inspecao) => inspecao.modelo)),
    [inspecoes],
  );
  const numeroSerieOptions = useMemo(
    () => buildSelectOptions(inspecoes.map((inspecao) => inspecao.numeroSerie)),
    [inspecoes],
  );

  const filteredInspecoes = useMemo(() => {
    return inspecoes.filter((i) => {
      if (filters.resultado && i.resultadoFinal !== filters.resultado) return false;
      if (filters.modelo && String(i.modelo ?? '').trim() !== filters.modelo) return false;
      if (filters.numeroSerie && String(i.numeroSerie ?? '').trim() !== filters.numeroSerie) return false;
      return true;
    });
  }, [inspecoes, filters]);

  const handleSelectInspecao = (inspecao: InspecaoMontagem) => {
    setSelected({
      id: inspecao.id || '',
      data: inspecao,
    });
    setEditando(false);
  };

  const handleSalvarInspecao = async (inspecaoAtualizada: InspecaoMontagem) => {
    if (!selected?.id) return;

    try {
      setSalvando(true);
      await atualizarInspecao(selected.id, inspecaoAtualizada);
      setSelected({
        id: selected.id,
        data: {
          ...inspecaoAtualizada,
          id: selected.id,
        },
      });
      setEditando(false);
      alert('Inspeção de montagem salva com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar inspeção de montagem.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    );
  }

  if (editando && selected) {
    return (
      <div className="container">
        <FormularioInspecaoNovo
          key={selected.id}
          inspecaoInicial={selected.data}
          titulo={`Inspeção de montagem - ${selected.data.numeroSerie || selected.data.modelo}`}
          onSubmit={handleSalvarInspecao}
          onCancel={() => setEditando(false)}
        />
        {salvando && <p>Salvando...</p>}
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Inspeção de Montagem</h2>

      <div className="page-content">
        <div className="page-list-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={updateFilters}
            fields={[
              {
                key: 'resultado',
                label: 'Resultado',
                type: 'select',
                options: [
                  { value: 'APROVADO', label: 'Aprovado' },
                  { value: 'REPROVADO', label: 'Reprovado' },
                ],
              },
              { key: 'modelo', label: 'Modelo', type: 'select', options: modeloOptions },
              { key: 'numeroSerie', label: 'Número de Série', type: 'select', options: numeroSerieOptions },
            ]}
            titulo="Filtros"
          />
          <h3>Produções ({filteredInspecoes.length})</h3>
          {filteredInspecoes.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
          ) : (
            <ul className="page-list">
              {filteredInspecoes.map((inspecao) => (
                <li
                  key={inspecao.id}
                  className={selected?.id === inspecao.id ? 'active' : ''}
                  onClick={() => handleSelectInspecao(inspecao)}
                >
                  <strong>{inspecao.numeroSerie || 'Sem série'}</strong>
                  <small>{inspecao.modelo || 'Sem modelo'}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="inspecao-detail">
              <h3>Inspeção vinculada à produção</h3>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Número de série:</label>
                  <p>{selected.data.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data da inspeção:</label>
                  <p>{selected.data.data}</p>
                </div>
                <div className="detail-item">
                  <label>Resultado:</label>
                  <p>
                    <strong style={{ color: getResultadoColor(selected.data.resultadoFinal) }}>
                      {selected.data.resultadoFinal || 'Não preenchida'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="page-toolbar" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setEditando(true)}
                >
                  Preencher inspeção
                </button>
                <PdfExporterInspecao inspecao={selected.data} />
              </div>
            </div>
          ) : (
            <div className="page-detail-section">
              <p>Selecione uma produção para preencher a inspeção de montagem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspecaoMontagemPage;
