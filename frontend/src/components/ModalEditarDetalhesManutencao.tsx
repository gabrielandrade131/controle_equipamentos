import React, { useState } from 'react';
import { InspecaoManutencao, ObservacaoHistorico } from '../types/manutencao';
import './ModalEditarDetalhesManutencao.css';

interface ModalEditarDetalhesManutencaoProps {
  inspecao: InspecaoManutencao;
  onSalvar?: (inspecaoAtualizada: InspecaoManutencao) => void;
  onCancelar?: () => void;
}

export const ModalEditarDetalhesManutencao: React.FC<ModalEditarDetalhesManutencaoProps> = ({
  inspecao,
  onSalvar,
  onCancelar,
}) => {
  const [formData, setFormData] = useState<InspecaoManutencao>(inspecao);
  const [novaObservacao, setNovaObservacao] = useState('');

  const handleInputChange = (campo: keyof InspecaoManutencao, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleAdicionarObservacao = () => {
    if (!novaObservacao.trim()) {
      alert('Digite uma observação antes de adicionar.');
      return;
    }

    const observacao: ObservacaoHistorico = {
      id: `obs_${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      texto: novaObservacao,
    };

    setFormData((prev) => ({
      ...prev,
      observacoesHistorico: [...(prev.observacoesHistorico || []), observacao],
    }));

    setNovaObservacao('');
  };

  const handleSalvar = () => {
    onSalvar?.(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Detalhes da Manutenção</h2>
          <button
            onClick={onCancelar}
            className="modal-close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group read-only">
              <label>Ordem de Manutenção</label>
              <input
                type="text"
                value={formData.numeroOrdemManutencao ?? '-'}
                readOnly
              />
            </div>

            <div className="form-group read-only">
              <label>TAG</label>
              <input
                type="text"
                value={formData.tag || '-'}
                readOnly
              />
            </div>

            <div className="form-group read-only">
              <label>Fabricante</label>
              <input
                type="text"
                value={formData.fabricante || '-'}
                readOnly
              />
            </div>

            <div className="form-group read-only">
              <label>Modelo</label>
              <input
                type="text"
                value={formData.modelo || '-'}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Data de Início</label>
              <input
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Retorno a Base</label>
              <input
                type="date"
                value={formData.dataRetornoBase || ''}
                onChange={(e) => handleInputChange('dataRetornoBase', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Previsão de Término</label>
              <input
                type="date"
                value={formData.previsaoTermino || ''}
                onChange={(e) => handleInputChange('previsaoTermino', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Data de Término</label>
              <input
                type="date"
                value={formData.dataTermino || ''}
                onChange={(e) => handleInputChange('dataTermino', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Responsável</label>
              <input
                type="text"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Status da Manutenção</label>
              <select
                value={formData.statusManutencao}
                onChange={(e) => handleInputChange('statusManutencao', e.target.value)}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="EM_MANUTENCAO">Em Manutenção</option>
                <option value="PARALISADA">Paralisada</option>
                <option value="CONCLUIDA">Concluída</option>
              </select>
            </div>

            <div className="form-group read-only">
              <label>Dias em Espera</label>
              <input
                type="text"
                value={formData.diasEsperaManutencao ?? '-'}
                readOnly
              />
            </div>

            <div className="form-group read-only">
              <label>Dias em Manutenção</label>
              <input
                type="text"
                value={formData.diasManutencao ?? '-'}
                readOnly
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Histórico de Observações</label>
            <div className="observacoes-historico">
              {formData.observacoesHistorico && formData.observacoesHistorico.length > 0 ? (
                <div className="observacoes-lista">
                  {formData.observacoesHistorico.map((obs, index) => (
                    <div key={obs.id || index} className="observacao-item">
                      <div className="observacao-header">
                        <strong>{new Date(obs.data).toLocaleDateString('pt-BR')}</strong>
                      </div>
                      <p className="observacao-texto">{obs.texto}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sem-observacoes">Nenhuma observação registrada.</p>
              )}
            </div>
          </div>

          <div className="form-group full">
            <label>Adicionar Nova Observação</label>
            <div className="adicionar-observacao">
              <textarea
                value={novaObservacao}
                onChange={(e) => setNovaObservacao(e.target.value)}
                placeholder="Digite a observação e clique em 'Adicionar'"
                rows={3}
              />
              <button
                onClick={handleAdicionarObservacao}
                className="btn-adicionar-obs"
              >
                + Adicionar Observação
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onCancelar}
            className="btn-primary"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="btn-primary"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
