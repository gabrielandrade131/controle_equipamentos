import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import {
  CreateProducaoDto,
  Producao,
  StatusProducao,
  TipoEquipamento,
} from '../types/producao';
import './FormularioOrdem.css';

interface FormularioOrdemProps {
  producao?: Producao;
  onSalvar: (producao: CreateProducaoDto | Producao) => void;
  onCancelar: () => void;
  isEditing?: boolean;
}

const STATUS_OPTIONS: Array<{ value: StatusProducao; label: string }> = [
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
  { value: 'CONCLUIDA', label: 'Concluida' },
  { value: 'PARALISADA', label: 'Paralisada' },
];

const today = () => new Date().toISOString().split('T')[0];

const createEmptyProducao = (): CreateProducaoDto => ({
  numeroOrdem: '',
  numeroSerie: '',
  tag: '',
  dataSolicitacao: today(),
  dataInicio: '',
  dataPrevisao: '',
  dataTermino: '',
  statusProducao: 'PROGRAMADA',
  tipoEquipamentoId: '',
  tipoEquipamentoNome: '',
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

export const FormularioOrdem: React.FC<FormularioOrdemProps> = ({
  producao,
  onSalvar,
  onCancelar,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateProducaoDto | Producao>(
    producao || createEmptyProducao(),
  );
  const [tiposEquipamento, setTiposEquipamento] = useState<TipoEquipamento[]>([]);
  const [novoItem, setNovoItem] = useState({
    descricao: '',
    numeroSerie: '',
  });

  const tagPodeSerEditada = formData.statusProducao === 'CONCLUIDA';

  const tipoSelecionado = useMemo(
    () => tiposEquipamento.find((tipo) => tipo.id === formData.tipoEquipamentoId),
    [formData.tipoEquipamentoId, tiposEquipamento],
  );

  useEffect(() => {
    axiosInstance
      .get<TipoEquipamento[]>('/tipos-equipamento')
      .then((response) => {
        setTiposEquipamento(response.data.filter((tipo) => tipo.ativo));
      })
      .catch((error) => {
        console.error('Erro ao carregar tipos de equipamento:', error);
      });
  }, []);

  const updateFormData = (changes: Partial<CreateProducaoDto | Producao>) => {
    setFormData((current) => ({
      ...current,
      ...changes,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.currentTarget;
    updateFormData({ [name]: value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const statusProducao = e.currentTarget.value as StatusProducao;
    const changes: Partial<CreateProducaoDto | Producao> = { statusProducao };

    if (statusProducao === 'EM_ANDAMENTO' && !formData.dataInicio) {
      changes.dataInicio = today();
    }

    if (statusProducao === 'CONCLUIDA' && !formData.dataTermino) {
      changes.dataTermino = today();
    }

    if (statusProducao !== 'CONCLUIDA') {
      changes.tag = '';
    }

    updateFormData(changes);
  };

  const handleTipoEquipamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipoEquipamentoId = e.currentTarget.value;
    const tipo = tiposEquipamento.find((item) => item.id === tipoEquipamentoId);

    updateFormData({
      tipoEquipamentoId,
      tipoEquipamentoNome: tipo?.nome || '',
    });
  };

  const handleAdicionarItem = () => {
    const linhasDescricao = novoItem.descricao
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter((linha) => linha !== '');
    const numeroSerie = novoItem.numeroSerie.trim();
    const descricoes = linhasDescricao.length > 0 ? linhasDescricao : [''];

    if (linhasDescricao.length === 0 && !numeroSerie) {
      return;
    }

    const numeroBase = (formData.itensSeriados ?? []).length + 1;
    const itensNovos = descricoes.map((descricao, index) => ({
      id: `item-${Date.now()}-${index}`,
      numero: String(numeroBase + index),
      descricao,
      numeroSerie: index === 0 ? numeroSerie : '',
    }));

    updateFormData({
      itensSeriados: [...(formData.itensSeriados ?? []), ...itensNovos],
    });
    setNovoItem({ descricao: '', numeroSerie: '' });
  };

  const handleRemoverItem = (id: string) => {
    updateFormData({
      itensSeriados: formData.itensSeriados.filter((item) => item.id !== id),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvar(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="formulario-ordem">
      <div className="form-header">
        <h2>{isEditing ? 'Editar Ordem de Producao' : 'Nova Ordem de Producao'}</h2>
      </div>

      <div className="form-section">
        <h3>Informacoes basicas</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="numeroOrdem">Numero da ordem</label>
            <input
              type="text"
              id="numeroOrdem"
              name="numeroOrdem"
              value={formData.numeroOrdem || 'Gerado automaticamente'}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroSerie">Numero de serie</label>
            <input
              type="text"
              id="numeroSerie"
              name="numeroSerie"
              value={formData.numeroSerie || 'Gerado automaticamente'}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="statusProducao">Status</label>
            <select
              id="statusProducao"
              name="statusProducao"
              value={formData.statusProducao || 'PROGRAMADA'}
              onChange={handleStatusChange}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tag">TAG</label>
            <input
              type="text"
              id="tag"
              name="tag"
              value={formData.tag || ''}
              onChange={handleInputChange}
              placeholder={tagPodeSerEditada ? 'Ex: TAG-0001' : 'Disponivel ao concluir'}
              disabled={!tagPodeSerEditada}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataSolicitacao">Data solicitacao</label>
            <input
              type="date"
              id="dataSolicitacao"
              name="dataSolicitacao"
              value={formData.dataSolicitacao}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataInicio">Data inicio</label>
            <input
              type="date"
              id="dataInicio"
              name="dataInicio"
              value={formData.dataInicio || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataPrevisao">Previsao de termino</label>
            <input
              type="date"
              id="dataPrevisao"
              name="dataPrevisao"
              value={formData.dataPrevisao || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dataTermino">Data termino</label>
            <input
              type="date"
              id="dataTermino"
              name="dataTermino"
              value={formData.dataTermino || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipoEquipamentoId">Tipo de equipamento</label>
            <select
              id="tipoEquipamentoId"
              name="tipoEquipamentoId"
              value={formData.tipoEquipamentoId || ''}
              onChange={handleTipoEquipamentoChange}
            >
              <option value="">Selecione</option>
              {tiposEquipamento.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="modelo">Modelo</label>
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

          <div className="form-group full">
            <label htmlFor="descricao">Descricao complementar</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder={
                tipoSelecionado
                  ? `Complemento para ${tipoSelecionado.nome}`
                  : 'Ex: EXAUSTOR 420 MONOFASICO'
              }
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Itens Seriados</h3>

        <div className="form-group">
          <label htmlFor="descItem">Descricao do Item:</label>
          <input
            type="text"
            value={novoItem.descricao}
            onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
            placeholder="Descricao do item"
          />
          <input
            type="text"
            value={novoItem.numeroSerie}
            onChange={(e) => setNovoItem({ ...novoItem, numeroSerie: e.target.value })}
            placeholder="Serie"
          />
          <button type="button" onClick={handleAdicionarItem} className="btn-add">
            Adicionar
          </button>
        </div>

        {formData.itensSeriados.length > 0 && (
          <div className="items-list">
            {formData.itensSeriados.map((item) => (
              <div key={item.id} className="item-card">
                <div className="item-info">
                  <strong>Item {item.numero}</strong>
                  <p>{item.descricao}</p>
                  {item.numeroSerie && <small>Serie: {item.numeroSerie}</small>}
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
          <label htmlFor="listaPecas">Lista de Pecas:</label>
          <textarea
            id="listaPecas"
            name="listaPecas"
            value={formData.listaPecas}
            onChange={handleInputChange}
            placeholder="Descreva a lista de pecas ou deixe em branco se nao aplicavel"
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
            placeholder="Descreva o sequencial de montagem ou deixe em branco se nao aplicavel"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="inspecaoMontagem">Inspecao de Montagem:</label>
          <textarea
            id="inspecaoMontagem"
            name="inspecaoMontagem"
            value={formData.inspecaoMontagem}
            onChange={handleInputChange}
            placeholder="Descreva a inspecao de montagem ou deixe em branco se nao aplicavel"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="historicoEquipamento">Historico do Equipamento:</label>
          <textarea
            id="historicoEquipamento"
            name="historicoEquipamento"
            value={formData.historicoEquipamento}
            onChange={handleInputChange}
            placeholder="Descreva o historico do equipamento ou deixe em branco se nao aplicavel"
            rows={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="procedimento">Procedimento para Testes e Inspecao de Montagem:</label>
          <input
            type="text"
            id="procedimento"
            value={formData.procedimentoTestes || ''}
            onChange={(e) => setFormData({ ...formData, procedimentoTestes: e.target.value })}
            placeholder="Ex: PR-MAN-003"
          />
        </div>

        <div className="form-group">
          <label htmlFor="observacoes">Observacoes Adicionais:</label>
          <textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            placeholder="Observacoes adicionais"
            rows={3}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-salvar">
          {isEditing ? 'Atualizar ordem' : 'Salvar ordem'}
        </button>
        <button type="button" onClick={onCancelar} className="btn-cancelar">
          Cancelar
        </button>
      </div>
    </form>
  );
};
