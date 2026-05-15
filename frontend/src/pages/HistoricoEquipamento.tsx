import React, { useState, useMemo } from 'react';
import { FormularioHistorico } from '../components/FormularioHistorico';
import { FilterPanel } from '../components/FilterPanel';
import { useFilters } from '../hooks/useFilters';
import { PdfExporterHistorico } from '../components/PdfExporterHistorico';
import { useHistorico } from '../hooks/useHistorico';
import { HistoricoEquipamentoData } from '../types/historico';
import '../pages/Producao.css';

interface SelectedHistorico {
  id: string;
  data: HistoricoEquipamentoData;
}

const HistoricoEquipamento: React.FC = () => {
  const { historicos, loading, salvarHistoricoEquipamento } = useHistorico();
  const [selected, setSelected] = useState<SelectedHistorico | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { filters, updateFilters } = useFilters('historico-filters', {});

  const filteredHistoricos = useMemo(() => {
    return historicos.filter((h) => {
      if (filters.tag && !h.numeroSerie?.toLowerCase().includes(filters.tag.toLowerCase())) return false;
      return true;
    });
  }, [historicos, filters]);

  const handleSelectHistorico = (historico: HistoricoEquipamentoData) => {
    setSelected({
      id: historico.id || '',
      data: historico,
    });
    setEditando(false);
  };

  const handleSalvarHistorico = async (historicoAtualizado: HistoricoEquipamentoData) => {
    if (!selected?.id) return;

    try {
      setSalvando(true);
      await salvarHistoricoEquipamento(selected.id, historicoAtualizado);
      setSelected({
        id: selected.id,
        data: historicoAtualizado,
      });
      setEditando(false);
      alert('Historico do equipamento salvo com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar historico do equipamento.');
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
        <FormularioHistorico
          key={selected.id}
          historico={selected.data}
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
      <h2>Historico do Equipamento</h2>

      <div className="page-content">
        <div className="page-list-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={updateFilters}
            fields={[
              { key: 'tag', label: 'Número de Série', type: 'text', placeholder: 'Buscar série...' },
            ]}
            titulo="Filtros"
          />
          <h3>Produções ({filteredHistoricos.length})</h3>
          {filteredHistoricos.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
          ) : (
            <ul className="page-list">
              {filteredHistoricos.map((historico) => (
                <li
                  key={historico.id}
                  className={selected?.id === historico.id ? 'active' : ''}
                  onClick={() => handleSelectHistorico(historico)}
                >
                  <strong>{historico.numeroSerie || 'Sem serie'}</strong>
                  <small>{historico.modelo || 'Sem modelo'}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="historico-detail">
              <h3>Historico vinculado a producao</h3>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Numero de serie:</label>
                  <p>{selected.data.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Registros manuais:</label>
                  <p>{selected.data.registros.length}</p>
                </div>
              </div>

              <div className="section-registros">
                <h3>Registros</h3>
                {selected.data.registros.length === 0 ? (
                  <p>Nenhum registro manual cadastrado.</p>
                ) : (
                  <div className="registros-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Historico</th>
                          <th>Assinatura</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.data.registros.map((registro) => (
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
                <PdfExporterHistorico historico={selected.data} logoPath="/logo.png" />
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Selecione uma producao para visualizar ou preencher o historico do equipamento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoEquipamento;
