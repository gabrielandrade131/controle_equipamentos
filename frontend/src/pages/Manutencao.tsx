import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioInspecaoManutencao } from '../components/FormularioInspecaoManutencao';
import { useManutencao } from '../hooks/useManutencao';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import './Manutencao.css';

interface SelectedInspecao {
  id: string;
  data: InspecaoManutencao;
}

export const Manutencao: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SelectedInspecao | null>(null);
  const [modo, setModo] = useState<'lista' | 'editar'>('lista');
  const { historico, atualizarInspecao } = useManutencao();
  const { exportInspecaoToPdf } = usePdfExportManutencao();

  const handleSelectInspecao = (inspecao: InspecaoManutencao) => {
    setSelected({
      id: inspecao.id || '',
      data: inspecao,
    });
  };

  const handleExportarPDF = async (inspecao: InspecaoManutencao) => {
    try {
      const nomeArquivo = `inspecao_manutencao_${inspecao.numeroSerie || 'equipamento'}_${new Date().toISOString().split('T')[0]}.pdf`;
      await exportInspecaoToPdf(inspecao, nomeArquivo);
    } catch (error) {
      alert('Erro ao gerar PDF: ' + error);
    }
  };

  const handleEditarInspecao = (inspecao: InspecaoManutencao) => {
    if (!selected) return;

    if (selected.data.statusManutencao === 'CONCLUIDA') {
      alert('Manutencao concluida nao pode ser editada.');
      setModo('lista');
      return;
    }

    atualizarInspecao(selected.id, inspecao)
      .then((inspecaoAtualizada) => {
        setSelected({ id: inspecaoAtualizada.id || selected.id, data: inspecaoAtualizada });
        setModo('lista');
        alert('Manutencao atualizada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao atualizar manutencao:', error);
        alert(error.response?.data?.message || 'Nao foi possivel atualizar a manutencao.');
      });
  };

  if (modo === 'editar' && selected && selected.data.statusManutencao !== 'CONCLUIDA') {
    return (
      <div className="manutencao-container">
        <FormularioInspecaoManutencao
          inspecaoInicial={selected.data}
          onSalvar={handleEditarInspecao}
          onCancelar={() => setModo('lista')}
          isEditing
        />
      </div>
    );
  }

  return (
    <div className="manutencao-page">
      <h2>Manutencao</h2>

      <div className="page-toolbar">
        <button
          onClick={() => navigate('/manutencao/criar')}
          className="btn-primary"
        >
          Nova Inspecao
        </button>
      </div>

      <div className="page-content">
        <div className="page-list-section">
          <h3>Historico de Manutencoes ({historico.length})</h3>
          {historico.length === 0 ? (
            <p>Nenhuma manutencao registrada</p>
          ) : (
            <ul className="page-list">
              {historico.map((inspecao) => (
                <li
                  key={inspecao.id}
                  className={selected?.id === inspecao.id ? 'active' : ''}
                  onClick={() => handleSelectInspecao(inspecao)}
                >
                  <strong>{inspecao.numeroSerie || 'Sem serie'}</strong>
                  <small>{inspecao.fabricante || '-'}</small>
                  <small>{inspecao.statusManutencao || '-'}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="manutencao-detail">
              <h2>Detalhes da Inspecao</h2>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Numero de Serie:</label>
                  <p>{selected.data.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>TAG:</label>
                  <p>{selected.data.tag || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Fabricante:</label>
                  <p>{selected.data.fabricante || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data da Manutencao:</label>
                  <p>{selected.data.dataManutencao ? new Date(selected.data.dataManutencao).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Retorno a Base:</label>
                  <p>{selected.data.dataRetornoBase ? new Date(selected.data.dataRetornoBase).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Previsao de Termino:</label>
                  <p>{selected.data.previsaoTermino ? new Date(selected.data.previsaoTermino).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Responsavel:</label>
                  <p>{selected.data.responsavel || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <p>{selected.data.statusManutencao || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Dias em Espera:</label>
                  <p>{selected.data.diasEsperaManutencao ?? '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Dias em Manutencao:</label>
                  <p>{selected.data.diasManutencao ?? '-'}</p>
                </div>
              </div>

              <div className="detail-item full">
                <label>Avaliacao Final:</label>
                <span className={`badge badge-${selected.data.avaliacaoFinal === 'CONFORME' ? 'success' : 'danger'}`}>
                  {selected.data.avaliacaoFinal || '-'}
                </span>
              </div>

              {selected.data.observacoes && (
                <div className="documents-section">
                  <h3>Observacoes</h3>
                  <p>{selected.data.observacoes}</p>
                </div>
              )}

              <div className="action-buttons">
                {selected.data.statusManutencao !== 'CONCLUIDA' && (
                  <button
                    onClick={() => setModo('editar')}
                    className="btn-primary"
                  >
                    Editar
                  </button>
                )}
                <button
                  onClick={() => handleExportarPDF(selected.data)}
                  className="btn-primary"
                >
                  Exportar PDF
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
