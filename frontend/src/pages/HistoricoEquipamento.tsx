import React, { useEffect, useMemo, useState } from 'react';
import { FormularioHistorico } from '../components/FormularioHistorico';
import { FilterPanel } from '../components/FilterPanel';
import { useFilters } from '../hooks/useFilters';
import { PdfExporterHistorico } from '../components/PdfExporterHistorico';
import { Pagination } from '../components/Pagination';
import { usePaginatedSelection } from '../hooks/usePaginatedSelection';
import { useHistorico } from '../hooks/useHistorico';
import { HistoricoEquipamentoData } from '../types/historico';
import { FilterType } from '../types/filters';
import { buildSelectOptions } from '../utils/filterOptions';
import '../pages/Producao.css';

const matchesTextFilter = (
  value: string | number | null | undefined,
  filter?: string,
) => {
  const normalizedFilter = String(filter ?? '').trim().toLowerCase();
  if (!normalizedFilter) return true;

  return String(value ?? '').trim().toLowerCase().includes(normalizedFilter);
};

const HistoricoEquipamento: React.FC = () => {
  const { historicos, loading, salvarHistoricoEquipamento } = useHistorico();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { filters, updateFilters } = useFilters('historico-filters', {});
  const [draftFilters, setDraftFilters] = useState<FilterType>(filters);
  const modeloOptions = useMemo(
    () => buildSelectOptions(historicos.map((historico) => historico.modelo)),
    [historicos],
  );
  const serieOptionsSource = useMemo(() => {
    const modeloSelecionado = String(draftFilters.modelo ?? '').trim();
    if (!modeloSelecionado) {
      return historicos;
    }
    return historicos.filter(
      (historico) => matchesTextFilter(historico.modelo, modeloSelecionado),
    );
  }, [draftFilters.modelo, historicos]);
  const numeroSerieOptions = useMemo(
    () => buildSelectOptions(serieOptionsSource.map((historico) => historico.numeroSerie)),
    [serieOptionsSource],
  );

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const filteredHistoricos = useMemo(() => {
    return historicos.filter((h) => {
      if (!matchesTextFilter(h.modelo, filters.modelo)) return false;
      if (!matchesTextFilter(h.numeroSerie, filters.numeroSerie)) return false;
      return true;
    });
  }, [historicos, filters]);
  const {
    currentPage,
    pageSize,
    pageSizeOptions,
    paginatedItems,
    selectedId,
    selectedItem,
    selectItem,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
  } = usePaginatedSelection({
    items: filteredHistoricos,
    getId: (historico) => historico.id,
  });

  const handleSalvarHistorico = async (historicoAtualizado: HistoricoEquipamentoData) => {
    if (!selectedItem?.id) return;

    try {
      setSalvando(true);
      await salvarHistoricoEquipamento(selectedItem.id, historicoAtualizado);
      setEditando(false);
      alert('Histórico do equipamento salvo com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar histórico do equipamento.');
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

  if (editando && selectedItem) {
    return (
      <div className="container">
        <FormularioHistorico
          key={selectedItem.id}
          historico={selectedItem}
          onSalvar={handleSalvarHistorico}
          onCancelar={() => setEditando(false)}
          isEditing
        />
        {salvando && <p>Salvando...</p>}
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Histórico do Equipamento</h2>

      <div className="page-content">
        <div className="page-list-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={updateFilters}
            onDraftChange={setDraftFilters}
            fields={[
              {
                key: 'modelo',
                label: 'Modelo',
                type: 'text',
                placeholder: 'Digite o modelo',
                options: modeloOptions,
              },
              {
                key: 'numeroSerie',
                label: 'Número de Série',
                type: 'text',
                placeholder: 'Digite a série',
                options: numeroSerieOptions,
              },
            ]}
            titulo="Filtros"
          />
          <h3>Produções ({filteredHistoricos.length})</h3>
          {filteredHistoricos.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
          ) : (
            <>
              <ul className="page-list">
                {paginatedItems.map((historico) => (
                <li
                  key={historico.id}
                  className={selectedId === historico.id ? 'active' : ''}
                  onClick={() => {
                    selectItem(historico);
                    setEditando(false);
                  }}
                >
                  <strong>{historico.numeroSerie || 'Sem série'}</strong>
                  <small>{historico.modelo || 'Sem modelo'}</small>
                </li>
                ))}
              </ul>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>

        <div className="page-detail-section">
          {selectedItem ? (
            <div className="historico-detail">
              <h3>Histórico vinculado à produção</h3>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Número de série:</label>
                  <p>{selectedItem.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selectedItem.modelo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Registros manuais:</label>
                  <p>{selectedItem.registros.length}</p>
                </div>
              </div>

              <div className="section-registros">
                <h3>Registros</h3>
                {selectedItem.registros.length === 0 ? (
                  <p>Nenhum registro manual cadastrado.</p>
                ) : (
                  <div className="registros-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Histórico</th>
                          <th>Assinatura</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.registros.map((registro) => (
                          <tr key={registro.id}>
                            <td>{new Date(registro.data).toLocaleDateString('pt-BR')}</td>
                            <td>{registro.historico}</td>
                            <td>{registro.assinatura}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="btn-primary"
                >
                  Adicionar registro
                </button>
                <PdfExporterHistorico historico={selectedItem} logoPath="/logo.png" />
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Selecione uma produção para visualizar ou preencher o histórico do equipamento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoEquipamento;
