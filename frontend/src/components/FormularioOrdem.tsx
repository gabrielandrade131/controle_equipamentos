import React, { useEffect, useMemo, useState } from "react";
import {
  CreateProducaoDto,
  HistoricoProducaoItem,
  Producao,
  StatusProducao,
} from "../types/producao";
import { useTiposEquipamento } from "../hooks/useTiposEquipamento";
import { getLocalDateInput } from "../utils/date";
import { isAdminUser, isVerifiedUser } from "../utils/auth";
import "./FormularioOrdem.css";

interface FormularioOrdemProps {
  producao?: Producao;
  onSalvar: (producao: CreateProducaoDto | Producao) => void;
  onCancelar: () => void;
  isEditing?: boolean;
}

const STATUS_OPTIONS: Array<{ value: StatusProducao; label: string }> = [
  { value: "PROGRAMADA", label: "Programada" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDA", label: "Concluída" },
  { value: "PARALISADA", label: "Paralisada" },
];

const today = () => getLocalDateInput();

type CampoDocumentoAnexo =
  | "listaPecas"
  | "sequencialMontagem"
  | "inspecaoMontagem"
  | "historicoEquipamento"
  | "procedimentoTestes";

const CAMPOS_DOCUMENTOS_ANEXOS: Array<{
  campo: CampoDocumentoAnexo;
  label: string;
}> = [
  { campo: "listaPecas", label: "Lista de Peças" },
  { campo: "sequencialMontagem", label: "Sequencial de Montagem" },
  { campo: "inspecaoMontagem", label: "Inspeção de Montagem" },
  { campo: "historicoEquipamento", label: "Histórico do equipamento" },
  {
    campo: "procedimentoTestes",
    label: "Procedimento para Testes e Inspeção de Montagem",
  },
];

const parseAnexos = (valor?: string): string[] => {
  const texto = (valor ?? "").trim();
  if (!texto) return [];

  try {
    const parsed = JSON.parse(texto);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }
  } catch {
    // mantém compatibilidade com registros legados em texto puro
  }

  return texto
    .split(/\r?\n/)
    .map((linha) => linha.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
};

const serializeAnexos = (anexos: string[]) => anexos.join("\n");

const createEmptyProducao = (): CreateProducaoDto => ({
  numeroOrdem: "",
  quantidade: 1,
  numeroSerie: "",
  tag: "",
  dataSolicitacao: today(),
  dataNecessidade: "",
  dataInicio: "",
  dataParalisacao: "",
  dataPrevisao: "",
  dataTermino: "",
  validade: "",
  statusProducao: "PROGRAMADA",
  tipoEquipamentoId: "",
  tipoEquipamentoNome: "",
  modelo: "",
  descricao: "",
  itensSeriados: [],
  documentos: [],
  observacoes: "",
  listaPecas: "",
  sequencialMontagem: "",
  inspecaoMontagem: "",
  historicoEquipamento: "",
  procedimentoTestes: "",
  historicoProducao: [],
});

const criarHistoricoItem = (descricao: string): HistoricoProducaoItem => ({
  id: `novo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  descricao,
  responsavel: "",
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
  const { tiposEquipamento } = useTiposEquipamento();
  const [novoItem, setNovoItem] = useState({
    descricao: "",
    numeroSerie: "",
  });
  const [novaObservacao, setNovaObservacao] = useState("");
  const [novoResponsavelHistorico, setNovoResponsavelHistorico] = useState("");
  const [anexosPorCampo, setAnexosPorCampo] = useState<
    Record<CampoDocumentoAnexo, string[]>
  >({
    listaPecas: parseAnexos(producao?.listaPecas),
    sequencialMontagem: parseAnexos(producao?.sequencialMontagem),
    inspecaoMontagem: parseAnexos(producao?.inspecaoMontagem),
    historicoEquipamento: parseAnexos(producao?.historicoEquipamento),
    procedimentoTestes: parseAnexos(producao?.procedimentoTestes),
  });

  const isMasterUser = isAdminUser() || isVerifiedUser();
  const tagPodeSerEditada = formData.statusProducao === "CONCLUIDA" || isMasterUser;

  const tipoSelecionado = useMemo(
    () =>
      tiposEquipamento.find((tipo) => tipo.id === formData.tipoEquipamentoId),
    [formData.tipoEquipamentoId, tiposEquipamento],
  );

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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.currentTarget;
    updateFormData({ [name]: value });
  };

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData({
      quantidade: Math.max(1, Number(e.currentTarget.value || 1)),
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const statusProducao = e.currentTarget.value as StatusProducao;
    const changes: Partial<CreateProducaoDto | Producao> = { statusProducao };

    if (statusProducao === "EM_ANDAMENTO" && !formData.dataInicio) {
      changes.dataInicio = today();
    }

    if (statusProducao === "PARALISADA" && !formData.dataParalisacao) {
      changes.dataParalisacao = today();
    }

    if (statusProducao === "CONCLUIDA" && !formData.dataTermino) {
      changes.dataTermino = today();
    }

    if (statusProducao !== "PARALISADA") {
      changes.dataParalisacao = "";
    }

    if (statusProducao !== "CONCLUIDA") {
      changes.tag = "";
    }

    updateFormData(changes);
  };

  const handleTipoEquipamentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const tipoEquipamentoId = e.currentTarget.value;
    const tipo = tiposEquipamento.find((item) => item.id === tipoEquipamentoId);

    updateFormData({
      tipoEquipamentoId,
      tipoEquipamentoNome: tipo?.nome || "",
    });
  };

  const handleAdicionarItem = () => {
    const linhasDescricao = novoItem.descricao
      .split(/\r?\n/)
      .map((linha) => linha.trim())
      .filter((linha) => linha !== "");
    const numeroSerie = novoItem.numeroSerie.trim();
    const descricoes = linhasDescricao.length > 0 ? linhasDescricao : [""];

    if (linhasDescricao.length === 0 && !numeroSerie) {
      return;
    }

    const numeroBase = (formData.itensSeriados ?? []).length + 1;
    const itensNovos = descricoes.map((descricao, index) => ({
      id: `item-${Date.now()}-${index}`,
      numero: String(numeroBase + index),
      descricao,
      numeroSerie: index === 0 ? numeroSerie : "",
    }));

    updateFormData({
      itensSeriados: [...(formData.itensSeriados ?? []), ...itensNovos],
    });
    setNovoItem({ descricao: "", numeroSerie: "" });
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
      historicoProducao: [
        ...historicoProducao,
        {
          ...criarHistoricoItem(descricao),
          responsavel,
        },
      ],
    });
    setNovaObservacao("");
    setNovoResponsavelHistorico("");
  };

  const handleAnexosChange = (
    campo: CampoDocumentoAnexo,
    arquivosSelecionados: FileList | null,
  ) => {
    if (!arquivosSelecionados || arquivosSelecionados.length === 0) {
      return;
    }

    const nomesNovos = Array.from(arquivosSelecionados).map(
      (arquivo) => arquivo.name,
    );
    const anexosAtualizados = Array.from(
      new Set([...(anexosPorCampo[campo] ?? []), ...nomesNovos]),
    );

    setAnexosPorCampo((prev) => ({ ...prev, [campo]: anexosAtualizados }));
    updateFormData({
      [campo]: serializeAnexos(anexosAtualizados),
    });
  };

  const handleRemoverAnexo = (campo: CampoDocumentoAnexo, anexo: string) => {
    const anexosAtualizados = (anexosPorCampo[campo] ?? []).filter(
      (item) => item !== anexo,
    );
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
        <h2>
          {isEditing ? "Editar Ordem de Produção" : "Nova Ordem de Produção"}
        </h2>
      </div>

      <div className="form-section">
        <h3>Informações básicas</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="numeroOrdem">Número da ordem</label>
            <input
              type="text"
              id="numeroOrdem"
              name="numeroOrdem"
              value={formData.numeroOrdem || "Gerado automaticamente"}
              readOnly
            />
          </div>

          <div className="form-group">
            <label htmlFor="numeroSerie">Número de série</label>
            <input
              type="text"
              id="numeroSerie"
              name="numeroSerie"
              value={formData.numeroSerie || "Gerado automaticamente"}
              readOnly
            />
          </div>

          {!isEditing && (
            <div className="form-group">
              <label htmlFor="quantidade">Quantidade de equipamentos</label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                min={1}
                step={1}
                value={formData.quantidade ?? 1}
                onChange={handleQuantidadeChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="statusProducao">Status</label>
            <select
              id="statusProducao"
              name="statusProducao"
              value={formData.statusProducao || "PROGRAMADA"}
              onChange={handleStatusChange}
              disabled={isEditing && formData.statusProducao === "CONCLUIDA"}
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
              value={formData.tag || ""}
              onChange={handleInputChange}
              placeholder={
                tagPodeSerEditada ? "Ex: TAG-0001" : "Disponível ao concluir"
              }
              disabled={!tagPodeSerEditada}
            />
          </div>

          <div className="form-group">
            <label htmlFor="validade">Validade do equipamento</label>
            <input
              type="date"
              id="validade"
              name="validade"
              value={formData.validade || ""}
              onChange={handleInputChange}
            />
            <small>
              Informe a data do item, peça, componente ou certificado que vence
              primeiro.
            </small>
          </div>

          {!isEditing && (
            <>
              <div className="form-group">
                <label htmlFor="dataSolicitacao">Data solicitação</label>
                <input
                  type="date"
                  id="dataSolicitacao"
                  name="dataSolicitacao"
                  value={formData.dataSolicitacao}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataNecessidade">Data de Necessidade</label>
                <input
                  type="date"
                  id="dataNecessidade"
                  name="dataNecessidade"
                  value={formData.dataNecessidade || ""}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          {isEditing && (
            <>
              <div className="form-group">
                <label htmlFor="dataInicio">Data de início</label>
                <input
                  type="date"
                  id="dataInicio"
                  name="dataInicio"
                  value={formData.dataInicio || ""}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataPrevisao">Previsão de término</label>
                <input
                  type="date"
                  id="dataPrevisao"
                  name="dataPrevisao"
                  value={formData.dataPrevisao || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataParalisacao">Data de paralisação</label>
                <input
                  type="date"
                  id="dataParalisacao"
                  name="dataParalisacao"
                  value={formData.dataParalisacao || ""}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label htmlFor="dataTermino">Data de término</label>
                <input
                  type="date"
                  id="dataTermino"
                  name="dataTermino"
                  value={formData.dataTermino || ""}
                  readOnly
                  disabled
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="tipoEquipamentoId">Tipo de equipamento</label>
            <select
              id="tipoEquipamentoId"
              name="tipoEquipamentoId"
              value={formData.tipoEquipamentoId || ""}
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
            <label htmlFor="descricao">Descrição complementar</label>
            <textarea
              id="descricao"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder={
                tipoSelecionado
                  ? `Complemento para ${tipoSelecionado.nome}`
                  : "Ex: EXAUSTOR 420 MONOFÁSICO"
              }
              rows={3}
            />
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="form-section">
          <h3>Itens Seriados</h3>

          <div className="form-group">
            <label htmlFor="descItem">Descrição do Item:</label>
            <input
              type="text"
              value={novoItem.descricao}
              onChange={(e) =>
                setNovoItem({ ...novoItem, descricao: e.target.value })
              }
              placeholder="Descrição do item"
            />
            <input
              type="text"
              value={novoItem.numeroSerie}
              onChange={(e) =>
                setNovoItem({ ...novoItem, numeroSerie: e.target.value })
              }
              placeholder="Série"
            />
            <button
              type="button"
              onClick={handleAdicionarItem}
              className="btn-add"
            >
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
                    {item.numeroSerie && (
                      <small>Série: {item.numeroSerie}</small>
                    )}
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
      )}

      {isEditing && (
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
                    e.currentTarget.value = "";
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
                  <small className="anexo-placeholder">
                    Nenhum anexo selecionado
                  </small>
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
              <button
                type="button"
                onClick={handleAdicionarHistorico}
                className="btn-add"
              >
                Adicionar registro
              </button>
            </div>
          </div>

          {historicoProducao.length > 0 && (
            <div className="historico-producao-list">
              <h4>Registros do Histórico ({historicoProducao.length})</h4>
              <div className="items-list historico-producao-items">
                {historicoProducao.map((item) => (
                  <div
                    key={item.id}
                    className="item-card historico-producao-item"
                  >
                    <div className="item-info">
                      <strong>
                        {item.criadoEm
                          ? new Date(item.criadoEm).toLocaleDateString("pt-BR")
                          : "Novo registro"}
                      </strong>
                      <small>Responsável: {item.responsavel || "-"}</small>
                      <p>{item.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-salvar">
          {isEditing ? "Atualizar ordem" : "Gerar lote"}
        </button>
        <button type="button" onClick={onCancelar} className="btn-cancelar">
          Cancelar
        </button>
      </div>
    </form>
  );
};
