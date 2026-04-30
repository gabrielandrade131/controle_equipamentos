import React, { useState } from 'react';
import { useInspecoes } from '../hooks/useInspecoes';
import { InspecaoMontagem } from '../types/inspecao';
import { PdfExporterInspecao } from '../components/PdfExporterInspecao';
import { FormularioInspecaoNovo } from '../components/FormularioInspecaoNovo';
import '../pages/Producao.css';

interface SelectedInspecao {
  id: string;
  data: InspecaoMontagem;
}

const InspecaoMontagemPage: React.FC = () => {
  const { inspecoes, loading, criarInspecao } = useInspecoes();
  const [selected, setSelected] = useState<SelectedInspecao | null>(null);
  const [modo, setModo] = useState<'lista' | 'criar'>('lista');

  const handleSelectInspecao = (inspecao: InspecaoMontagem) => {
    setSelected({
      id: inspecao.id || '',
      data: inspecao,
    });
  };

  const handleCriarInspecao = (novaInspecao: InspecaoMontagem) => {
    criarInspecao(novaInspecao);
    setModo('lista');
    alert('Inspeção de montagem criada com sucesso!');
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;

  if (modo === 'criar') {
    return (
      <div className="container">
        <FormularioInspecaoNovo
          onSubmit={handleCriarInspecao}
          onCancel={() => setModo('lista')}
        />
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Inspeção de Montagem</h2>
      
      <div className="page-toolbar">
        <button 
          onClick={() => setModo('criar')}
          className="btn-primary"
        >
          Criar Inspeção de Montagem
        </button>
      </div>
      
      <div className="page-content">
        <div className="page-list-section">
          <h3>Inspeções ({inspecoes.length})</h3>
          {inspecoes.length === 0 ? (
            <p>Nenhuma inspeção encontrada</p>
          ) : (
            <ul className="page-list">
              {inspecoes.map((inspecao: InspecaoMontagem) => (
                <li
                  key={inspecao.id}
                  className={selected?.id === inspecao.id ? 'active' : ''}
                  onClick={() => handleSelectInspecao(inspecao)}
                >
                  <strong>{inspecao.numeroSerie}</strong>
                  <small>{inspecao.modelo}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="inspecao-detail">
              <h3>Detalhes da Inspeção</h3>
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
                  <label>Data de Inspeção:</label>
                  <p>{selected.data.data}</p>
                </div>
                <div className="detail-item">
                  <label>Responsável:</label>
                  <p>{selected.data.responsavel}</p>
                </div>
                <div className="detail-item">
                  <label>Resultado:</label>
                  <p><strong style={{ color: selected.data.resultadoFinal === 'APROVADO' ? '#4caf50' : '#f44336' }}>
                    {selected.data.resultadoFinal}
                  </strong></p>
                </div>
              </div>

              {selected.data.observacoes && (
                <div style={{ marginTop: '20px' }}>
                  <h4>Observações:</h4>
                  <p>{selected.data.observacoes}</p>
                </div>
              )}

              <div className="page-toolbar" style={{ marginTop: '20px' }}>
                <PdfExporterInspecao inspecao={selected.data} />
              </div>
            </div>
          ) : (
            <div className="page-detail-section">
              <p>Selecione uma inspeção para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspecaoMontagemPage;
