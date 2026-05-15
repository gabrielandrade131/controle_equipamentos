import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../services/axiosConfig';
import {
  CreateProducaoDto,
  HistoricoProducaoItem,
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

type CampoDocumentoAnexo =
  | 'listaPecas'
  | 'sequencialMontagem'
  | 'inspecaoMontagem'
  | 'historicoEquipamento'
  | 'procedimentoTestes';

const CAMPOS_DOCUMENTOS_ANEXOS: Array<{ campo: CampoDocumentoAnexo; label: string }> = [
  { campo: 'listaPecas', label: 'Lista de Pecas' },
  { campo: 'sequencialMontagem', label: 'Sequencial de Montagem' },
  { campo: 'inspecaoMontagem', label: 'Inspecao de Montagem' },
  { campo: 'historicoEquipamento', label: 'Historico do equipamento' },
  {
    campo: 'procedimentoTestes',
    label: 'Procedimento para Testes e Inspecao de Montagem',
  },
];

const parseAnexos = (valor?: string): string[] => {
  const texto = (valor ?? '').trim();
  if (!texto) return [];

  try {
    const parsed = JSON.parse(texto);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // mantém compatibilidade com registros legados em texto puro
  }

  return texto
    .split(/\r?\n/)
    .map((linha) => linha.replace(/^-+\s*/, '').trim())
    .filter(Boolean);
};

const serializeAnexos = (anexos: string[]) => anexos.join('\n');

const createEmptyProducao = (): CreateProducaoDto => ({
  numeroOrdem: '',
  numeroSerie: '',
  tag: '',
  dataSolicitacao: today(),
  dataNecessidade: '',
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
  historicoProducao: [],
});

const criarHistoricoItem = (descricao: string): HistoricoProducaoItem => ({
  id: `novo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  descricao,
  responsavel: '',
  criadoEm: new Date().toISOString(),
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
  const [novaObservacao, setNovaObservacao] = useState('');
  const [novoResponsavelHistorico, setNovoResponsavelHistorico] = useState('');
  const [anexosPorCampo, setAnexosPorCampo] = useState<Record<CampoDocumentoAnexo, string[]>>({
    listaPecas: parseAnexos(producao?.listaPecas),
    sequencialMontagem: parseAnexos(producao?.sequencialMontagem),
    inspecaoMontagem: parseAnexos(producao?.inspecaoMontagem),
    historicoEquipamento: parseAnexos(producao?.historicoEquipamento),
    procedimentoTestes: parseAnexos(producao?.procedimentoTestes),
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

  useEffect(() => {
    if (!producao) return;

    setAnexosPorCampo({
      listaPecas: parseAnexos(producao.listaPecas),
      sequencialMontagem: parseAnexos(producao.sequencialMontagem),
      inspecaoMontagem: parseAnexos(producao.inspecaoMontagem),
      historicoEquipamento: parseAnexos(producao.historicoEquipamento),
      procedimentoTestes: parseAnexos(producao.procedimentoTestes),
    });
  }, [producao]);

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

  const historicoProducao = formData.historicoProducao ?? [];

  const handleAdicionarHistorico = () => {
    const descricao = novaObservacao.trim();
    const responsavel = novoResponsavelHistorico.trim();

    if (!descricao || !responsavel) {
      return;
    }

    updateFormData({
      historicoProducao: [...historicoProducao, {
        ...criarHistoricoItem(descricao),
        responsavel,
      }],
    });
    setNovaObservacao('');
    setNovoResponsavelHistorico('');
  };

  const handleAnexosChange = (campo: CampoDocumentoAnexo, arquivosSelecionados: FileList | null) => {
    if (!arquivosSelecionados || arquivosSelecionados.length === 0) {
      return;
    }

    const nomesNovos = Array.from(arquivosSelecionados).map((arquivo) => arquivo.name);
    const anexosAtualizados = Array.from(new Set([...(anexosPorCampo[campo] ?? []), ...nomesNovos]));

    setAnexosPorCampo((prev) => ({ ...prev, [campo]: anexosAtualizados }));
    updateFormData({
      [campo]: serializeAnexos(anexosAtualizados),
    });
  };

  const handleRemoverAnexo = (campo: CampoDocumentoAnexo, anexo: string) => {
    const anexosAtualizados = (anexosPorCampo[campo] ?? []).filter((item) => item !== anexo);
    setAnexosPorCampo((prev) => ({ ...prev, [campo]: anexosAtualizados }));
    updateFormData({
      [campo]: serializeAnexos(anexosAtualizados),
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

          {!isEditing && (
            <>
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
                <label htmlFor="dataNecessidade">Data necessidade</label>
                <input
                  type="date"
                  id="dataNecessidade"
                  name="dataNecessidade"
                  value={formData.dataNecessidade || ''}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          {isEditing && (
            <>
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
            </>
          )}

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

        {CAMPOS_DOCUMENTOS_ANEXOS.map(({ campo, label }) => (
          <div className="form-group" key={campo}>
            <label htmlFor={`anexo-${campo}`}>{label}:</label>
            <div className="anexo-upload">
              <input
                id={`anexo-${campo}`}
                type="file"
                multiple
                onChange={(e) => {
                  handleAnexosChange(campo, e.target.files);
                  e.currentTarget.value = '';
                }}
              />
              {anexosPorCampo[campo].length > 0 ? (
                <div className="anexo-lista">
                  {anexosPorCampo[campo].map((anexo) => (
                    <div key={`${campo}-${anexo}`} className="anexo-item">
                      <span>{anexo}</span>
                      <button
                        type="button"
                        className="btn-remove-anexo"
                        onClick={() => handleRemoverAnexo(campo, anexo)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <small className="anexo-placeholder">Nenhum anexo selecionado</small>
              )}
            </div>
          </div>
        ))}

        <div className="form-group full">
          <label htmlFor="novaObservacao">Histórico de Produção:</label>
          <div className="historico-producao-input">
            <input
              type="text"
              value={novoResponsavelHistorico}
              onChange={(e) => setNovoResponsavelHistorico(e.target.value)}
              placeholder="Responsável pelo registro"
            />
            <textarea
              id="novaObservacao"
              value={novaObservacao}
              onChange={(e) => setNovaObservacao(e.target.value)}
              placeholder="Escreva um registro para o histórico de produção"
              rows={3}
            />
            <button type="button" onClick={handleAdicionarHistorico} className="btn-add">
              Adicionar registro
            </button>
          </div>
        </div>

        {historicoProducao.length > 0 && (
          <div className="historico-producao-list">
            <h4>Registros do Histórico ({historicoProducao.length})</h4>
            <div className="items-list historico-producao-items">
              {historicoProducao.map((item) => (
                <div key={item.id} className="item-card historico-producao-item">
                  <div className="item-info">
                    <strong>{item.criadoEm ? new Date(item.criadoEm).toLocaleDateString('pt-BR') : 'Novo registro'}</strong>
                    <small>Responsável: {item.responsavel || '-'}</small>
                    <p>{item.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
