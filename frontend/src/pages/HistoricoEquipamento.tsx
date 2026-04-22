import React, { useState } from 'react';
import { useHistoricoMock } from '../hooks/useHistoricoMock';
import { HistoricoEquipamentoData, CreateHistoricoDto } from '../types/historico';
import { PdfExporterHistorico } from '../components/PdfExporterHistorico';
import { FormularioHistorico } from '../components/FormularioHistorico';
import '../pages/Producao.css';

interface SelectedHistorico {
  id: string;
  data: HistoricoEquipamentoData;
}

const HistoricoEquipamento: React.FC = () => {
  const { historicos, loading, criarHistorico, atualizarHistorico } = useHistoricoMock();
  const [selected, setSelected] = useState<SelectedHistorico | null>(null);
  const [modo, setModo] = useState<'lista' | 'criar' | 'editar'>('lista');

  const handleSelectHistorico = (historico: HistoricoEquipamentoData) => {
    setSelected({
      id: historico.id || '',
      data: historico,
    });
  };

  const handleCriarHistorico = (novoHistorico: CreateHistoricoDto) => {
    criarHistorico(novoHistorico);
    setModo('lista');
    alert('Histórico criado com sucesso!');
  };

  const handleEditarHistorico = (historicoAtualizado: HistoricoEquipamentoData) => {
    if (selected) {
      atualizarHistorico(selected.id, historicoAtualizado);
      setSelected(null);
      setModo('lista');
      alert('Histórico atualizado com sucesso!');
    }
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;

  if (modo === 'criar') {
    return (
      <div className="container">
        <FormularioHistorico
          onSalvar={handleCriarHistorico}
          onCancelar={() => setModo('lista')}
        />
      </div>
    );
  }

  if (modo === 'editar' && selected) {
    return (
      <div className="container">
        <FormularioHistorico
          historico={selected.data}
          onSalvar={handleEditarHistorico}
          onCancelar={() => {
            setModo('lista');
            setSelected(null);
          }}
          isEditing
        />
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Histórico do Equipamento</h2>
      
      <div className="page-toolbar">
        <button 
          onClick={() => setModo('criar')}
          className="btn-primary"
        >
          Novo Histórico
        </button>
      </div>
      
      <div className="page-content">
        <div className="page-list-section">
          <h3>Históricos ({historicos.length})</h3>
          {historicos.length === 0 ? (
            <p>Nenhum histórico encontrado</p>
          ) : (
            <ul className="page-list">
              {historicos.map((historico: HistoricoEquipamentoData) => (
                <li
                  key={historico.id}
                  className={selected?.id === historico.id ? 'active' : ''}
                  onClick={() => handleSelectHistorico(historico)}
                >
                  <strong>{historico.numeroSerie}</strong>
                  <small>{historico.modelo}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="historico-detail">
              <h3>Detalhes do Histórico</h3>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Número de Série:</label>
                  <p>{selected.data.numeroSerie}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Criação:</label>
                  <p>{new Date(selected.data.createdAt || '').toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="detail-item">
                  <label>Última Atualização:</label>
                  <p>{new Date(selected.data.updatedAt || '').toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              <div className="section-registros">
                <h3>Registros</h3>
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
              </div>

              {selected.data.notas && (
                <div className="section-notas">
                  <h3>Notas</h3>
                  <p>{selected.data.notas}</p>
                </div>
              )}

              <div className="action-buttons">
                <button 
                  onClick={() => setModo('editar')}
                  className="btn-secondary"
                >
                  Editar
                </button>
                <PdfExporterHistorico historico={selected.data} />
              </div>
            </div>
          ) : (
            <div className="no-selection">
              <p>Selecione um histórico para visualizar os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoricoEquipamento;
