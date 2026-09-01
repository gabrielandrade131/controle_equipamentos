import React, { useState } from "react";
import { InspecaoManutencao, ObservacaoHistorico } from "../types/manutencao";
import { useTiposEquipamento } from "../hooks/useTiposEquipamento";
import { aplicarChecklistManutencao } from "../constants/inspecaoManutencao";
import { formatDatePtBr, getLocalDateInput } from "../utils/date";
import { isDouglasUser } from "../utils/auth";
import "./ModalEditarDetalhesManutencao.css";

interface ModalEditarDetalhesManutencaoProps {
  inspecao: InspecaoManutencao;
  onSalvar?: (inspecaoAtualizada: InspecaoManutencao) => void;
  onCancelar?: () => void;
  titulo?: string;
  isCreating?: boolean;
}

export const ModalEditarDetalhesManutencao: React.FC<
  ModalEditarDetalhesManutencaoProps
> = ({ inspecao, onSalvar, onCancelar, titulo, isCreating }) => {
  const [formData, setFormData] = useState<InspecaoManutencao>(inspecao);
  const [novaObservacao, setNovaObservacao] = useState("");
  const [confirmouConclusao, setConfirmouConclusao] = useState(false);
  const { tiposEquipamento } = useTiposEquipamento();
  const statusInicial = inspecao.statusManutencao;
  const statusBloqueado =
    !isCreating && statusInicial === "CONCLUIDA";
  const conclusaoPendente =
    formData.statusManutencao === "CONCLUIDA" &&
    statusInicial !== "CONCLUIDA";

  const handleInputChange = (campo: keyof InspecaoManutencao, valor: any) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleStatusChange = (valor: string) => {
    if (valor === "CONCLUIDA" && !isDouglasUser()) {
      alert("Você não tem autorização para concluir o status.");
      return;
    }
    setFormData((prev) => {
      const statusManutencao = valor as InspecaoManutencao["statusManutencao"];
      const changes: Partial<InspecaoManutencao> = { statusManutencao };
      setConfirmouConclusao(false);

      if (statusManutencao === "CONCLUIDA") {
        changes.responsavelRevisao = "Douglas Moreira Alves";
      }

      if (statusManutencao === "EM_MANUTENCAO" && !prev.dataInicio) {
        changes.dataInicio = getLocalDateInput();
      }

      if (statusManutencao === "PARALISADA" && !prev.dataParalisacao) {
        changes.dataParalisacao = getLocalDateInput();
      }

      if (statusManutencao === "CONCLUIDA" && !prev.dataTermino) {
        changes.dataTermino = getLocalDateInput();
      }

      if (statusManutencao !== "PARALISADA") {
        changes.dataParalisacao = "";
      }

      return {
        ...prev,
        ...changes,
      };
    });
  };

  const handleAdicionarObservacao = () => {
    if (!novaObservacao.trim()) {
      alert("Digite uma observação antes de adicionar.");
      return;
    }

    const observacao: ObservacaoHistorico = {
      id: `obs_${Date.now()}`,
      data: getLocalDateInput(),
      texto: novaObservacao.trim(),
    };

    setFormData((prev) => ({
      ...prev,
      observacoes: observacao.texto,
      observacoesHistorico: [...(prev.observacoesHistorico || []), observacao],
    }));

    setNovaObservacao("");
  };

  const handleSalvar = () => {
    if (statusBloqueado) {
      alert("Manutenções concluídas não podem ser alteradas.");
      return;
    }

    if (formData.statusManutencao === "CONCLUIDA" && !isDouglasUser()) {
      alert("Você não tem autorização para concluir o status.");
      return;
    }

    if (conclusaoPendente && !confirmouConclusao) {
      alert(
        "Confirme que deseja concluir a manutenção. Essa ação não poderá ser desfeita.",
      );
      return;
    }

    onSalvar?.(formData);
  };

  return (
    <div className="manutencao-modal-overlay">
      <div className="manutencao-modal-content">
        <div className="manutencao-modal-header">
          <h2>{titulo || "Editar Detalhes da Manutenção"}</h2>
          <button onClick={onCancelar} className="manutencao-modal-close">
            ✕
          </button>
        </div>

        <div className="manutencao-modal-body">
          <div className="form-grid">
            <div className={isCreating ? "form-group" : "form-group read-only"}>
              <label>Ordem de Manutenção</label>
              <input
                type="text"
                value={formData.numeroOrdemManutencao ?? "-"}
                readOnly
              />
            </div>

            <div className={isCreating ? "form-group" : "form-group read-only"}>
              <label>TAG</label>
              <input
                type="text"
                value={formData.tag || ""}
                onChange={(e) => handleInputChange("tag", e.target.value)}
                readOnly={!isCreating}
                placeholder={isCreating ? "Digite a TAG" : "-"}
              />
            </div>

            <div className="form-group">
              <label>Tipo de equipamento</label>
              <select
                value={formData.tipoEquipamentoId || ""}
                disabled={statusBloqueado}
                onChange={(e) => {
                  const tipoSelecionado = tiposEquipamento.find(
                    (tipo) => tipo.id === e.target.value,
                  );
                  setFormData((prev) => {
                    const proximaInspecao = {
                      ...prev,
                      tipoEquipamentoId: e.target.value,
                      tipoEquipamento: tipoSelecionado?.nome || "",
                    };

                    return aplicarChecklistManutencao(proximaInspecao, {
                      tipoEquipamento: proximaInspecao.tipoEquipamento,
                      modeloEquipamento: proximaInspecao.modelo,
                    });
                  });
                }}
              >
                <option value="">Selecione o tipo</option>
                {tiposEquipamento.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Tipo de manutenção</label>
              <select
                value={formData.tipoManutencao || "CORRETIVA"}
                disabled={statusBloqueado}
                onChange={(e) =>
                  handleInputChange("tipoManutencao", e.target.value)
                }
              >
                <option value="CORRETIVA">Corretiva</option>
                <option value="PREVENTIVA">Preventiva</option>
              </select>
            </div>

            <div className={isCreating ? "form-group" : "form-group read-only"}>
              <label>Fabricante</label>
              <input
                type="text"
                value={formData.fabricante || ""}
                onChange={(e) =>
                  handleInputChange("fabricante", e.target.value)
                }
                readOnly={!isCreating}
                disabled={statusBloqueado}
                placeholder={isCreating ? "Digite o fabricante" : "-"}
              />
            </div>

            <div className={isCreating ? "form-group" : "form-group read-only"}>
              <label>Modelo</label>
              <input
                type="text"
                value={formData.modelo || ""}
                onChange={(e) =>
                  setFormData((prev) => {
                    const proximaInspecao = { ...prev, modelo: e.target.value };
                    return aplicarChecklistManutencao(proximaInspecao, {
                      tipoEquipamento: proximaInspecao.tipoEquipamento,
                      modeloEquipamento: proximaInspecao.modelo,
                    });
                  })
                }
                readOnly={!isCreating}
                disabled={statusBloqueado}
                placeholder={isCreating ? "Digite o modelo" : "-"}
              />
            </div>

            <div className={isCreating ? "form-group" : "form-group read-only"}>
              <label>Número de Série</label>
              <input
                type="text"
                value={formData.numeroSerie || ""}
                onChange={(e) =>
                  handleInputChange("numeroSerie", e.target.value)
                }
                readOnly={!isCreating}
                disabled={statusBloqueado}
                placeholder={isCreating ? "Digite o número de série" : "-"}
              />
            </div>

            <div className="form-group">
              <label>Data de Início</label>
              <input
                type="date"
                value={formData.dataInicio}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label>Retorno à Base</label>
              <input
                type="date"
                value={formData.dataRetornoBase || ""}
                disabled={statusBloqueado}
                onChange={(e) =>
                  handleInputChange("dataRetornoBase", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Previsão de Término</label>
              <input
                type="date"
                value={formData.previsaoTermino || ""}
                disabled={statusBloqueado}
                onChange={(e) =>
                  handleInputChange("previsaoTermino", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Data de Término</label>
              <input
                type="date"
                value={formData.dataTermino || ""}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label>Data de Paralisação</label>
              <input
                type="date"
                value={formData.dataParalisacao || ""}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label>Executado por</label>
              <input
                type="text"
                value={formData.responsavel}
                disabled={statusBloqueado}
                onChange={(e) =>
                  handleInputChange("responsavel", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Revisado por</label>
              <input
                type="text"
                value={
                  formData.statusManutencao === "CONCLUIDA"
                    ? "Douglas Moreira Alves"
                    : formData.responsavelRevisao || ""
                }
                disabled={statusBloqueado || formData.statusManutencao === "CONCLUIDA"}
                onChange={(e) =>
                  handleInputChange("responsavelRevisao", e.target.value)
                }
              />
            </div>

            <div className="form-group">
              <label>Status da Manutenção</label>
              <select
                value={formData.statusManutencao}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusBloqueado}
              >
                <option value="EM_QUARENTENA">Em quarentena</option>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_MANUTENCAO">Em Manutenção</option>
                <option value="PARALISADA">Paralisada</option>
                {!isCreating && (
                  <option
                    value="CONCLUIDA"
                    disabled={!isDouglasUser() && formData.statusManutencao !== "CONCLUIDA"}
                  >
                    Concluída{!isDouglasUser() && formData.statusManutencao !== "CONCLUIDA" ? " (Sem autorização)" : ""}
                  </option>
                )}
              </select>
              {conclusaoPendente && (
                <div className="confirmacao-conclusao">
                  <label>
                    <input
                      type="checkbox"
                      checked={confirmouConclusao}
                      onChange={(e) =>
                        setConfirmouConclusao(e.target.checked)
                      }
                    />
                    Confirmo que desejo concluir esta manutenção
                  </label>
                  <small>
                    Depois de salva como concluída, essa ação não poderá ser desfeita.
                  </small>
                </div>
              )}
            </div>

            <div className="form-group read-only">
              <label>Dias em Espera</label>
              <input
                type="text"
                value={formData.diasEsperaManutencao ?? "-"}
                readOnly
              />
            </div>

            <div className="form-group read-only">
              <label>Dias em Manutenção</label>
              <input
                type="text"
                value={formData.diasManutencao ?? "-"}
                readOnly
              />
            </div>

            <div className="form-group read-only">
              <label>Dias em Paralisação</label>
              <input
                type="text"
                value={formData.diasParalisacao ?? "-"}
                readOnly
              />
            </div>
          </div>

          <div className="form-group full">
            <label>Histórico de Observações</label>
            <div className="observacoes-historico">
              {formData.observacoesHistorico &&
              formData.observacoesHistorico.length > 0 ? (
                <div className="observacoes-lista">
                  {formData.observacoesHistorico.map((obs, index) => (
                    <div key={obs.id || index} className="observacao-item">
                      <div className="observacao-header">
                        <strong>{formatDatePtBr(obs.data)}</strong>
                      </div>
                      <p className="observacao-texto">{obs.texto.trim()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sem-observacoes">
                  Nenhuma observação registrada.
                </p>
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

        <div className="manutencao-modal-footer">
          <button onClick={onCancelar} className="btn-primary">
            {statusBloqueado ? "Fechar" : "Cancelar"}
          </button>
          {!statusBloqueado && (
            <button onClick={handleSalvar} className="btn-primary">
              Salvar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
