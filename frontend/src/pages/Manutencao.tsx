import React, { useState } from 'react';
import { FormularioInspecaoManutencao } from '../components/FormularioInspecaoManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import './Manutencao.css';

interface SelectedInspecao {
  id: string;
  data: InspecaoManutencao;
}

type Modo = 'lista' | 'criar';

export const Manutencao: React.FC = () => {
  const [modo, setModo] = useState<Modo>('lista');
  const [historicoManutencoes, setHistoricoManutencoes] = useState<InspecaoManutencao[]>([]);
  const [selected, setSelected] = useState<SelectedInspecao | null>(null);
  const { exportInspecaoToPdf } = usePdfExportManutencao();

  const handleSelectInspecao = (inspecao: InspecaoManutencao) => {
    setSelected({
      id: inspecao.id || '',
      data: inspecao,
    });
  };

  const handleSalvarInspecao = (inspecao: InspecaoManutencao) => {
    const novoRegistro: InspecaoManutencao = {
      ...inspecao,
      id: Math.random().toString(36).substr(2, 9),
      criadoEm: new Date().toISOString(),
    };

    setHistoricoManutencoes((prev) => [novoRegistro, ...prev]);
    alert('Inspeção salva com sucesso!');
    setModo('lista');

    console.log('Inspeção salva:', novoRegistro);
  };

  const handleExportarPDF = async (inspecao: InspecaoManutencao) => {
    try {
      const nomeArquivo = `inspecao_manutencao_${inspecao.numeroSerie || 'equipamento'}_${new Date().toISOString().split('T')[0]}.pdf`;
      await exportInspecaoToPdf(inspecao, nomeArquivo);
    } catch (error) {
      alert('Erro ao gerar PDF: ' + error);
    }
  };

  // Modo criar - mostrar formulário em página cheia
  if (modo === 'criar') {
    return (
      <div className="manutencao-container">
        <FormularioInspecaoManutencao onSalvar={handleSalvarInspecao} />
      </div>
    );
  }

  // Modo lista - mostrar layout split
  return (
    <div className="manutencao-page">
      <h2>Manutenção</h2>
      
      <div className="page-toolbar">
        <button 
          onClick={() => setModo('criar')}
          className="btn-primary"
        >
          Nova Inspeção
        </button>
      </div>
      
      <div className="page-content">
        <div className="page-list-section">
          <h3>Histórico de Manutenções ({historicoManutencoes.length})</h3>
          {historicoManutencoes.length === 0 ? (
            <p>Nenhuma manutenção registrada</p>
          ) : (
            <ul className="page-list">
              {historicoManutencoes.map((inspecao) => (
                <li
                  key={inspecao.id}
                  className={selected?.id === inspecao.id ? 'active' : ''}
                  onClick={() => handleSelectInspecao(inspecao)}
                >
                  <strong>{inspecao.numeroSerie || 'Sem série'}</strong>
                  <small>{inspecao.fabricante || '—'}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="manutencao-detail">
              <h2>Detalhes da Inspeção</h2>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Número de Série:</label>
                  <p>{selected.data.numeroSerie || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>TAG:</label>
                  <p>{selected.data.tag || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Fabricante:</label>
                  <p>{selected.data.fabricante || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo || '—'}</p>
                </div>
                <div className="detail-item">
                  <label>Data da Manutenção:</label>
                  <p>{new Date(selected.data.dataManutencao).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="detail-item">
                  <label>Responsável:</label>
                  <p>{selected.data.responsavel || '—'}</p>
                </div>
              </div>

              <div className="detail-item full">
                <label>Avaliação Final:</label>
                <span className={`badge badge-${selected.data.avaliacaoFinal === 'CONFORME' ? 'success' : 'danger'}`}>
                  {selected.data.avaliacaoFinal || '—'}
                </span>
              </div>

              {selected.data.observacoes && (
                <div className="documents-section">
                  <h3>Observações</h3>
                  <p>{selected.data.observacoes}</p>
                </div>
              )}

              <div className="action-buttons">
                <button 
                  onClick={() => handleExportarPDF(selected.data)}
                  className="btn-secondary"
                >
                  📄 Exportar PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecione uma manutenção para visualizar detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
