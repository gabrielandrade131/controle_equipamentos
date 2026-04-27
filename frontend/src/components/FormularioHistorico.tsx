import React, { useState } from 'react';
import { HistoricoEquipamentoData, CreateHistoricoDto, RegistroHistorico } from '../types/historico';
import './FormularioHistorico.css';

interface FormularioHistoricoProps {
  historico?: HistoricoEquipamentoData;
  onSalvar: (data: any) => void;
  onCancelar: () => void;
  isEditing?: boolean;
}

export const FormularioHistorico: React.FC<FormularioHistoricoProps> = ({
  historico,
  onSalvar,
  onCancelar,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<HistoricoEquipamentoData>(
    historico || {
      numeroSerie: '',
      modelo: '',
      registros: [],
      notas: ''
    }
  );

  // Rastrear IDs de registros originais (imutáveis)
  const [registrosOriginaisIds] = useState<Set<string>>(
    new Set((historico?.registros.map(r => r.id) || []).filter((id): id is string => !!id))
  );

  const [novoRegistro, setNovoRegistro] = useState<RegistroHistorico>({
    data: new Date().toISOString().split('T')[0],
    historico: '',
    assinatura: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistroInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNovoRegistro(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const adicionarRegistro = () => {
    if (!novoRegistro.data || !novoRegistro.historico || !novoRegistro.assinatura) {
      alert('Preencha todos os campos do registro');
      return;
    }

    const registroComId = {
      ...novoRegistro,
      id: Date.now().toString()
    };

    setFormData(prev => ({
      ...prev,
      registros: [...prev.registros, registroComId]
    }));

    setNovoRegistro({
      data: new Date().toISOString().split('T')[0],
      historico: '',
      assinatura: ''
    });
  };

  const removerRegistro = (id: string | undefined) => {
    if (!id) return;
    
    // Em modo edição, bloquear remoção de registros originais
    if (isEditing && registrosOriginaisIds.has(id)) {
      alert('Registros já criados não podem ser removidos. Eles são imutáveis.');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      registros: prev.registros.filter(r => r.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numeroSerie || !formData.modelo) {
      alert('Preencha os campos obrigatórios: Número de Série e Modelo');
      return;
    }

    if (formData.registros.length === 0) {
      alert('Adicione pelo menos um registro');
      return;
    }

    if (isEditing) {
      onSalvar(formData);
    } else {
      const { id, createdAt, updatedAt, ...dados } = formData;
      onSalvar(dados as CreateHistoricoDto);
    }
  };

  return (
    <div className="formulario-container">
      <h1>{isEditing ? 'Editar Histórico' : 'Novo Histórico do Equipamento'}</h1>

      <form onSubmit={handleSubmit} className="formulario-historico">
        <div className="form-section">
          <h2>FOR-MAN-008 - Histórico do Equipamento</h2>

          <div className="form-group">
            <label>Número de Série *</label>
            <input
              type="text"
              name="numeroSerie"
              value={formData.numeroSerie}
              onChange={handleInputChange}
              placeholder="Ex: CSEX420ACM-0559"
              disabled={isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Modelo *</label>
            <input
              type="text"
              name="modelo"
              value={formData.modelo}
              onChange={handleInputChange}
              placeholder="Ex: CSEX420ACM"
              disabled={isEditing}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Registros</h2>

          <div className="novo-registro">
            <h3>Adicionar Novo Registro</h3>

            <div className="form-group">
              <label>Data *</label>
              <input
                type="date"
                name="data"
                value={novoRegistro.data}
                onChange={handleRegistroInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Histórico *</label>
              <textarea
                name="historico"
                value={novoRegistro.historico}
                onChange={handleRegistroInputChange}
                placeholder="Descreva o histórico do equipamento..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Assinatura *</label>
              <input
                type="text"
                name="assinatura"
                value={novoRegistro.assinatura}
                onChange={handleRegistroInputChange}
                placeholder="Nome de quem responsável"
                required
              />
            </div>

            <button
              type="button"
              onClick={adicionarRegistro}
              className="btn-adicionar-registro"
            >
              + Adicionar Registro
            </button>
          </div>

          {formData.registros.length > 0 && (
            <div className="registros-list">
              <h3>Registros Adicionados ({formData.registros.length})</h3>
              <table className="registros-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Histórico</th>
                    <th>Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.registros.map((registro) => {
                    const ehOriginal = isEditing && registrosOriginaisIds.has(registro.id || '');
                    return (
                      <tr key={registro.id} style={{ backgroundColor: ehOriginal ? '#f0f0f0' : 'transparent' }}>
                        <td>{new Date(registro.data).toLocaleDateString('pt-BR')}</td>
                        <td>{registro.historico.substring(0, 50)}...</td>
                        <td>{registro.assinatura}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-group">
            <label>Notas (Observações)</label>
            <textarea
              name="notas"
              value={formData.notas || ''}
              onChange={handleInputChange}
              placeholder="Notas adicionais sobre o equipamento..."
              rows={4}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-salvar">
            {isEditing ? 'Atualizar' : 'Salvar'} Histórico
          </button>
          <button type="button" onClick={onCancelar} className="btn-cancelar">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
