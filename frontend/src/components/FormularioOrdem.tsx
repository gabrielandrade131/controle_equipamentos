import React, { useState } from 'react';
import { CreateProducaoDto } from '../types/producao';
import './FormularioOrdem.css';

interface FormularioOrdemProps {
  onSalvar: (producao: CreateProducaoDto) => void;
  onCancelar: () => void;
}

export const FormularioOrdem: React.FC<FormularioOrdemProps> = ({ onSalvar, onCancelar }) => {
  const [formData, setFormData] = useState<CreateProducaoDto>({
    numeroOrdem: '',
    numeroSerie: '',
    dataSolicitacao: '',
    modelo: '',
    descricao: '',
    itensSeriados: [],
    documentos: [],
    observacoes: '',
    listaPecas: '',
    sequencialMontagem: '',
    inspecaoMontagem: '',
    historicoEquipamento: '',
    procedimentoTestes: '',
  });

  const [novoItem, setNovoItem] = useState({
    numero: '',
    descricao: '',
    numeroSerie: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.currentTarget;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAdicionarItem = () => {
    if (novoItem.numero && novoItem.descricao) {
      const novoItemComId = {
        id: `item-${Date.now()}`,
        ...novoItem,
      };

      setFormData({
        ...formData,
        itensSeriados: [...formData.itensSeriados, novoItemComId],
      });
      setNovoItem({ numero: '', descricao: '', numeroSerie: '' });
    }
  };

  const handleRemoverItem = (id: string) => {
    setFormData({
      ...formData,
      itensSeriados: formData.itensSeriados.filter((item) => item.id !== id),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-ordem">
      <h2>Nova Ordem de Produção</h2>

      <div className="form-section">
        <h3>Informações Básicas</h3>
        
        <div className="form-group">
          <label htmlFor="numeroOrdem">Número da Ordem:</label>
          <input
            type="text"
            id="numeroOrdem"
            name="numeroOrdem"
            value={formData.numeroOrdem}
            onChange={handleInputChange}
            placeholder="Ex: 0559"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="numeroSerie">Número da Série:</label>
          <input
            type="text"
            id="numeroSerie"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleInputChange}
            placeholder="Ex: CSEX420ACM-0559"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="dataSolicitacao">Data Solicitação:</label>
          <input
            type="date"
            id="dataSolicitacao"
            name="dataSolicitacao"
            value={formData.dataSolicitacao}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="modelo">Modelo:</label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleInputChange}
            placeholder="Ex: CSEX420ACM"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            placeholder="Ex: EXAUSTOR 420 MONOFASICO"
            rows={3}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Itens Seriados</h3>
        
        <div className="form-group">
          <label htmlFor="numero">Número do Item:</label>
          <input
            type="text"
            id="numero"
            value={novoItem.numero}
            onChange={(e) => setNovoItem({ ...novoItem, numero: e.target.value })}
            placeholder="Número do item"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descItem">Descrição do Item:</label>
          <input
            type="text"
            id="descItem"
            value={novoItem.descricao}
            onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
            placeholder="Descrição"
          />
        </div>

        <div className="form-group">
          <label htmlFor="numeroSerie2">Número de Série do Item:</label>
          <input
            type="text"
            id="numeroSerie2"
            value={novoItem.numeroSerie}
            onChange={(e) => setNovoItem({ ...novoItem, numeroSerie: e.target.value })}
            placeholder="Número de série"
          />
        </div>

        <button type="button" onClick={handleAdicionarItem} className="btn-add">
          Adicionar Item
        </button>

        {formData.itensSeriados.length > 0 && (
          <div className="items-list">
            <h4>Itens Adicionados:</h4>
            {formData.itensSeriados.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <strong>{item.numero}</strong>
                  <p>{item.descricao}</p>
                  <small>Série: {item.numeroSerie}</small>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoverItem(item.id)}
                  className="btn-remove"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <h3>Documentos Relacionados</h3>
        
        <div className="form-group">
          <label htmlFor="listaPecas">Lista de Peças:</label>
          <textarea
            id="listaPecas"
            name="listaPecas"
            value={formData.listaPecas}
            onChange={handleInputChange}
            placeholder="Descreva a lista de peças ou deixe em branco se não aplicável"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sequencialMontagem">Sequencial de Montagem:</label>
          <textarea
            id="sequencialMontagem"
            name="sequencialMontagem"
            value={formData.sequencialMontagem}
            onChange={handleInputChange}
            placeholder="Descreva o sequencial de montagem ou deixe em branco se não aplicável"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="inspecaoMontagem">Inspeção de Montagem:</label>
          <textarea
            id="inspecaoMontagem"
            name="inspecaoMontagem"
            value={formData.inspecaoMontagem}
            onChange={handleInputChange}
            placeholder="Descreva a inspeção de montagem ou deixe em branco se não aplicável"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="historicoEquipamento">Histórico do Equipamento:</label>
          <textarea
            id="historicoEquipamento"
            name="historicoEquipamento"
            value={formData.historicoEquipamento}
            onChange={handleInputChange}
            placeholder="Descreva o histórico do equipamento ou deixe em branco se não aplicável"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="procedimento">Procedimento para Testes e Inspeção de Montagem:</label>
          <input
            type="text"
            id="procedimento"
            value={formData.procedimentoTestes || ''}
            onChange={(e) => setFormData({ ...formData, procedimentoTestes: e.target.value })}
            placeholder="Ex: PR-MAN-003"
          />
        </div>

        <div className="form-group">
          <label htmlFor="observacoes">Observações Adicionais:</label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            placeholder="Observações adicionais"
            rows={3}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-salvar">
          Salvar Ordem
        </button>
        <button type="button" onClick={onCancelar} className="btn-cancelar">
          Cancelar
        </button>
      </div>
    </form>
  );
};
