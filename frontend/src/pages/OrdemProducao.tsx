import React, { useState } from 'react';
import { useProducoesMock } from '../hooks/useProducoesMock';
import { Producao } from '../types/producao';
import { PdfExporter } from '../components/PdfExporter';
import './OrdemProducao.css';

interface SelectedProducao {
  id: string;
  data: Producao;
}

const OrdemProducao: React.FC = () => {
  const { producoes, loading, error } = useProducoesMock();
  const [selected, setSelected] = useState<SelectedProducao | null>(null);

  const handleSelectProducao = (producao: Producao) => {
    setSelected({
      id: producao.id || '',
      data: producao,
    });
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;
  if (error) return <div className="container error"><p>Erro: {error}</p></div>;

  return (
    <div className="container">
      <h1>Ordem de Produção</h1>
      
      <div className="content">
        <div className="list-section">
          <h2>Produções</h2>
          {producoes.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
          ) : (
            <ul className="producao-list">
              {producoes.map((producao) => (
                <li
                  key={producao.id}
                  className={selected?.id === producao.id ? 'active' : ''}
                  onClick={() => handleSelectProducao(producao)}
                >
                  <strong>{producao.numeroOrdem}</strong>
                  <small>{producao.modelo}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="detail-section">
          {selected ? (
            <div className="producao-detail">
              <h2>Detalhes da Ordem</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Número Ordem:</label>
                  <p>{selected.data.numeroOrdem}</p>
                </div>
                <div className="detail-item">
                  <label>Série:</label>
                  <p>{selected.data.numeroSerie}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo}</p>
                </div>
                <div className="detail-item">
                  <label>Data Solicitação:</label>
                  <p>{selected.data.dataSolicitacao}</p>
                </div>
              </div>
              <div className="detail-item full">
                <label>Descrição:</label>
                <p>{selected.data.descricao}</p>
              </div>

              <div className="documents-section">
                <h3>Documentos</h3>
                <div className="doc-checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.data.listaPecas}
                      readOnly
                    />
                    Lista de Peças
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.data.sequencialMontagem}
                      readOnly
                    />
                    Sequencial de Montagem
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.data.inspecaoMontagem}
                      readOnly
                    />
                    Inspeção de Montagem
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.data.historicoEquipamento}
                      readOnly
                    />
                    Histórico do Equipamento
                  </label>
                </div>
              </div>

              <PdfExporter 
                producao={selected.data}
              />
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecione uma ordem para visualizar detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdemProducao;
