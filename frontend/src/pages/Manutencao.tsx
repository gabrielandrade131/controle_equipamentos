import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioInspecaoManutencao } from '../components/FormularioInspecaoManutencao';
import { ModalEditarDetalhesManutencao } from '../components/ModalEditarDetalhesManutencao';
import { AlertModal } from '../components/AlertModal';
import { useManutencao } from '../hooks/useManutencao';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import './Manutencao.css';

const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_MANUTENCAO: 'Em manutenção',
  PARALISADA: 'Paralisada',
  CONCLUIDA: 'Concluída',
};

interface SelectedInspecao {
  id: string;
  data: InspecaoManutencao;
}

export const Manutencao: React.FC = () => {
  const [selected, setSelected] = useState<SelectedInspecao | null>(null);
  const [modo, setModo] = useState<'lista' | 'editar-formulario' | 'editar-detalhes' | 'editar-inspecao'>('lista');
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const { historico, atualizarInspecao } = useManutencao();
  const { exportInspecaoToPdf } = usePdfExportManutencao();
  const navigate = useNavigate();

  const handleSelectInspecao = (inspecao: InspecaoManutencao) => {
    setSelected({
      id: inspecao.id || '',
      data: inspecao,
    });
  };

  const handleExportarPDF = async (inspecao: InspecaoManutencao) => {
    try {
      const nomeArquivo = `inspecao_manutencao_${inspecao.tag || 'equipamento'}_${new Date().toISOString().split('T')[0]}.pdf`;
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

  const handleEditarDetalhes = (inspecao: InspecaoManutencao) => {
    if (!selected) return;

    atualizarInspecao(selected.id, inspecao)
      .then((inspecaoAtualizada) => {
        setSelected({ id: inspecaoAtualizada.id || selected.id, data: inspecaoAtualizada });
        setModo('lista');
        alert('Detalhes atualizados com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao atualizar detalhes:', error);
        alert(error.response?.data?.message || 'Nao foi possivel atualizar os detalhes.');
      });
  };

  if (modo === 'editar-inspecao' && selected) {
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
      <div className="page-header">
        <h2>Manutenção</h2>
        <div className="page-toolbar">
          <button className="btn-primary" onClick={() => navigate('/manutencao/criar')}>Criar OM</button>
        </div>
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
                  <strong>{(inspecao.numeroOrdemManutencao ?? inspecao.tag) || 'Sem TAG'}</strong>
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
              <h2>Detalhes</h2>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Ordem de Manutenção:</label>
                  <p>{selected.data.numeroOrdemManutencao ?? '-'}</p>
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
                  <label>Data de Início:</label>
                  <p>{selected.data.dataInicio ? new Date(selected.data.dataInicio).toLocaleDateString('pt-BR') : '-'}</p>
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
                  <label>Data de Término:</label>
                  <p>{selected.data.dataTermino ? new Date(selected.data.dataTermino).toLocaleDateString('pt-BR') : '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Responsavel:</label>
                  <p>{selected.data.responsavel || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <p>{STATUS_LABELS[selected.data.statusManutencao || ''] || selected.data.statusManutencao || '-'}</p>
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

              <div className="documents-section">
                <h3>Observações</h3>
                <div className="observacoes-historico-view">
                  {selected.data.observacoesHistorico && selected.data.observacoesHistorico.length > 0 ? (
                    selected.data.observacoesHistorico.map((obs, index) => (
                      <div key={obs.id || index} className="observacao-item-view">
                        <strong>{new Date(obs.data).toLocaleDateString('pt-BR')}</strong>
                        <p>{obs.texto}</p>
                      </div>
                    ))
                  ) : (
                    <p className="sem-observacoes">Nenhuma observação registrada.</p>
                  )}
                </div>
              </div>

              <div className="inspecao-mini-tab">
                <h3>Inspeção</h3>
                <div className="inspecao-content">
                  <div className="avaliacao-item">
                    <label>Avaliação Final:</label>
                    <span className={`badge badge-${selected.data.avaliacaoFinal === 'CONFORME' ? 'success' : 'danger'}`}>
                      {selected.data.avaliacaoFinal || '-'}
                    </span>
                  </div>
                  <div className="inspecao-actions">
                    <button
                      onClick={() => selected.data.statusManutencao === 'CONCLUIDA' ? setModo('editar-inspecao') : setAlertModal({ isOpen: true, message: 'Não é possível criar inspeção pois a manutenção ainda não foi concluída.' })}
                      className="btn-primary"
                    >
                      Criar Inspeção
                    </button>
                    <button
                      onClick={() => handleExportarPDF(selected.data)}
                      className="btn-primary"
                    >
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => setModo('editar-detalhes')}
                  className="btn-primary"
                >
                  Editar Detalhes
                </button>
              </div>

              {modo === 'editar-detalhes' && (
                <ModalEditarDetalhesManutencao
                  inspecao={selected.data}
                  onSalvar={handleEditarDetalhes}
                  onCancelar={() => setModo('lista')}
                />
              )}
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecione uma manutenção para visualizar detalhes</p>
            </div>
          )}
        </div>
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        title="Operação não permitida"
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: '' })}
        type="warning"
      />
    </div>
  );
};
