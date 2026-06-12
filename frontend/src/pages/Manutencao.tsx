import React, { useEffect, useMemo, useState } from "react";
import { FormularioInspecaoManutencao } from "../components/FormularioInspecaoManutencao";
import { ModalEditarDetalhesManutencao } from "../components/ModalEditarDetalhesManutencao";
import { AlertModal } from "../components/AlertModal";
import { FilterPanel } from "../components/FilterPanel";
import { Pagination } from "../components/Pagination";
import {
  FotoRecebimentoManutencao,
  useManutencao,
} from "../hooks/useManutencao";
import { usePdfExportManutencao } from "../hooks/usePdfExportManutencao";
import { useFilters } from "../hooks/useFilters";
import { usePaginatedSelection } from "../hooks/usePaginatedSelection";
import { criarInspecaoVazia } from "../constants/inspecaoManutencao";
import { InspecaoManutencao } from "../types/manutencao";
import { formatDatePtBr, getLocalDateInput } from "../utils/date";
import { buildSelectOptions } from "../utils/filterOptions";
import "./Manutencao.css";

const STATUS_LABELS: Record<string, string> = {
  EM_QUARENTENA: "Em quarentena",
  PENDENTE: "Pendente",
  EM_MANUTENCAO: "Em manutenção",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};

export const Manutencao: React.FC = () => {
  const [modo, setModo] = useState<
    | "lista"
    | "editar-formulario"
    | "editar-detalhes"
    | "editar-inspecao"
    | "criar-nova"
  >("lista");
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({ isOpen: false, message: "" });
  const [fotosRecebimento, setFotosRecebimento] = useState<
    FotoRecebimentoManutencao[]
  >([]);
  const [carregandoFotos, setCarregandoFotos] = useState(false);
  const {
    historico,
    adicionarInspecao,
    atualizarInspecao,
    atualizarInspecaoConcluida,
    buscarFotosRecebimento,
  } = useManutencao();
  const { exportInspecaoToPdf } = usePdfExportManutencao();
  const { filters, updateFilters } = useFilters("manutencao-filters", {});
  const tagOptions = useMemo(
    () => buildSelectOptions(historico.map((item) => item.tag)),
    [historico],
  );
  const fabricanteOptions = useMemo(
    () => buildSelectOptions(historico.map((item) => item.fabricante)),
    [historico],
  );
  const responsavelOptions = useMemo(
    () => buildSelectOptions(historico.map((item) => item.responsavel)),
    [historico],
  );

  const filteredHistorico = useMemo(() => {
    return historico.filter((item) => {
      if (filters.status && item.statusManutencao !== filters.status)
        return false;
      if (filters.tag && String(item.tag ?? "").trim() !== filters.tag)
        return false;
      if (
        filters.fabricante &&
        String(item.fabricante ?? "").trim() !== filters.fabricante
      )
        return false;
      if (
        filters.responsavel &&
        String(item.responsavel ?? "").trim() !== filters.responsavel
      )
        return false;
      return true;
    });
  }, [historico, filters]);
  const {
    currentPage,
    pageSize,
    pageSizeOptions,
    paginatedItems,
    selectedId,
    selectedItem,
    selectItem,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
  } = usePaginatedSelection({
    items: filteredHistorico,
    getId: (inspecao) => inspecao.id,
  });

  useEffect(() => {
    let ativo = true;

    if (!selectedItem?.id) {
      setFotosRecebimento([]);
      setCarregandoFotos(false);
      return;
    }

    setCarregandoFotos(true);
    buscarFotosRecebimento(selectedItem.id)
      .then((fotos) => {
        if (ativo) setFotosRecebimento(fotos);
      })
      .catch(() => {
        if (ativo) setFotosRecebimento([]);
      })
      .finally(() => {
        if (ativo) setCarregandoFotos(false);
      });

    return () => {
      ativo = false;
    };
  }, [selectedItem?.id, buscarFotosRecebimento]);

  const handleExportarPDF = async (inspecao: InspecaoManutencao) => {
    try {
      const nomeArquivo = `inspecao_manutencao_${inspecao.tag || "equipamento"}_${getLocalDateInput()}.pdf`;
      await exportInspecaoToPdf(inspecao, nomeArquivo);
    } catch (error) {
      alert("Erro ao gerar PDF: " + error);
    }
  };

  const handleEditarInspecao = (inspecao: InspecaoManutencao) => {
    if (!selectedItem?.id) return;

    atualizarInspecaoConcluida(selectedItem.id, inspecao)
      .then(() => {
        setModo("lista");
        alert("Inspeção salva com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao salvar inspeção:", error);
        alert(
          error.response?.data?.message ||
            "Não foi possível salvar a inspeção.",
        );
      });
  };

  const handleEditarDetalhes = (inspecao: InspecaoManutencao) => {
    if (!selectedItem?.id) return;

    atualizarInspecao(selectedItem.id, inspecao)
      .then(() => {
        setModo("lista");
        alert("Detalhes atualizados com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao atualizar detalhes:", error);
        alert(
          error.response?.data?.message ||
            "Não foi possível atualizar os detalhes.",
        );
      });
  };

  const handleCriarNova = (inspecao: InspecaoManutencao) => {
    adicionarInspecao(inspecao)
      .then(() => {
        setModo("lista");
        alert("Manutenção criada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao criar manutenção:", error);
        alert(
          error.response?.data?.message ||
            "Não foi possível criar a manutenção.",
        );
      });
  };

  if (modo === "editar-inspecao" && selectedItem) {
    return (
      <div className="manutencao-container">
        <FormularioInspecaoManutencao
          inspecaoInicial={selectedItem}
          onSalvar={handleEditarInspecao}
          onCancelar={() => setModo("lista")}
          isEditing
        />
      </div>
    );
  }

  if (modo === "criar-nova") {
    const novaOM = criarInspecaoVazia();
    // Autocalcular número da OM
    const ultimoNumero = historico.reduce((max, item) => {
      const num = item.numeroOrdemManutencao || 0;
      return num > max ? num : max;
    }, 0);
    novaOM.numeroOrdemManutencao = ultimoNumero + 1;

    return (
      <div className="manutencao-page">
        <h2>Manutenção</h2>
        <ModalEditarDetalhesManutencao
          inspecao={novaOM}
          onSalvar={handleCriarNova}
          onCancelar={() => setModo("lista")}
          titulo="Criar Nova Manutenção"
          isCreating
        />
      </div>
    );
  }

  return (
    <div className="manutencao-page">
      <div className="page-header">
        <h2>Manutenção</h2>
        <div className="page-toolbar">
          <button className="btn-primary" onClick={() => setModo("criar-nova")}>
            Gerar Ordem de Manutenção
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="page-list-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={updateFilters}
            fields={[
              {
                key: "status",
                label: "Status",
                type: "select",
                options: [
                  { value: "EM_QUARENTENA", label: "Em quarentena" },
                  { value: "PENDENTE", label: "Pendente" },
                  { value: "EM_MANUTENCAO", label: "Em Manutenção" },
                  { value: "PARALISADA", label: "Paralisada" },
                  { value: "CONCLUIDA", label: "Concluída" },
                ],
              },
              { key: "tag", label: "TAG", type: "select", options: tagOptions },
              {
                key: "fabricante",
                label: "Fabricante",
                type: "select",
                options: fabricanteOptions,
              },
              {
                key: "responsavel",
                label: "Responsável",
                type: "select",
                options: responsavelOptions,
              },
            ]}
            titulo="Filtros"
          />
          <h3>Histórico de Manutenções ({filteredHistorico.length})</h3>
          {filteredHistorico.length === 0 ? (
            <p>Nenhuma manutenção registrada</p>
          ) : (
            <>
              <ul className="page-list">
                {paginatedItems.map((inspecao) => (
                  <li
                    key={inspecao.id}
                    className={selectedId === inspecao.id ? "active" : ""}
                    onClick={() => selectItem(inspecao)}
                  >
                    <strong>
                      {(inspecao.numeroOrdemManutencao ?? inspecao.tag) ||
                        "Sem TAG"}
                    </strong>
                    <small>{inspecao.fabricante || "-"}</small>
                    <small>{inspecao.statusManutencao || "-"}</small>
                  </li>
                ))}
              </ul>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={pageSizeOptions}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>

        <div className="page-detail-section">
          {selectedItem ? (
            <div className="manutencao-detail">
              <h2>Detalhes</h2>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Ordem de Manutenção:</label>
                  <p>{selectedItem.numeroOrdemManutencao ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>TAG:</label>
                  <p>{selectedItem.tag || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo de Equipamento:</label>
                  <p>{selectedItem.tipoEquipamento || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Fabricante:</label>
                  <p>{selectedItem.fabricante || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selectedItem.modelo || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Início:</label>
                  <p>
                    {selectedItem.dataInicio
                      ? formatDatePtBr(selectedItem.dataInicio)
                      : "-"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Retorno à Base:</label>
                  <p>
                    {selectedItem.dataRetornoBase
                      ? formatDatePtBr(selectedItem.dataRetornoBase)
                      : "-"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Previsão de Término:</label>
                  <p>
                    {selectedItem.previsaoTermino
                      ? formatDatePtBr(selectedItem.previsaoTermino)
                      : "-"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Data de Término:</label>
                  <p>
                    {selectedItem.dataTermino
                      ? formatDatePtBr(selectedItem.dataTermino)
                      : "-"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Data de Paralisação:</label>
                  <p>
                    {selectedItem.dataParalisacao
                      ? formatDatePtBr(selectedItem.dataParalisacao)
                      : "-"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Responsável:</label>
                  <p>{selectedItem.responsavel || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <p>
                    {STATUS_LABELS[selectedItem.statusManutencao || ""] ||
                      selectedItem.statusManutencao ||
                      "-"}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Dias em quarentena:</label>
                  <p>{selectedItem.diasEsperaManutencao ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Dias em Manutenção:</label>
                  <p>{selectedItem.diasManutencao ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Dias em Paralisação:</label>
                  <p>{selectedItem.diasParalisacao ?? "-"}</p>
                </div>
              </div>

              <div className="documents-section">
                <h3>Fotos do Recebimento (Axis Check)</h3>
                {carregandoFotos ? (
                  <p className="sem-observacoes">Carregando fotos...</p>
                ) : fotosRecebimento.length > 0 ? (
                  <div className="fotos-recebimento-grid">
                    {fotosRecebimento.map((foto) => (
                      <figure key={foto.id} className="foto-recebimento-item">
                        <img
                          src={foto.url}
                          alt={`${foto.tipoFoto} - ${selectedItem.tag || "equipamento"}`}
                          loading="lazy"
                        />
                        <figcaption>
                          <span>{foto.tipoFoto}</span>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <p className="sem-observacoes">
                    Nenhuma foto de recebimento vinculada.
                  </p>
                )}
              </div>

              <div className="documents-section">
                <h3>Observações</h3>
                <div className="observacoes-historico-view">
                  {selectedItem.observacoesHistorico &&
                  selectedItem.observacoesHistorico.length > 0 ? (
                    selectedItem.observacoesHistorico.map((obs, index) => (
                      <div
                        key={obs.id || index}
                        className="observacao-item-view"
                      >
                        <strong>{formatDatePtBr(obs.data)}</strong>
                        <p>{obs.texto}</p>
                      </div>
                    ))
                  ) : (
                    <p className="sem-observacoes">
                      Nenhuma observação registrada.
                    </p>
                  )}
                </div>
              </div>

              <div className="inspecao-mini-tab">
                <h3>Inspeção</h3>
                <div className="inspecao-content">
                  <div className="avaliacao-item">
                    <label>Avaliação Final:</label>
                    <span
                      className={`badge badge-${selectedItem.avaliacaoFinal === "CONFORME" ? "success" : "danger"}`}
                    >
                      {selectedItem.avaliacaoFinal || "-"}
                    </span>
                  </div>
                  <div className="inspecao-actions">
                    <button
                      onClick={() =>
                        selectedItem.statusManutencao === "CONCLUIDA"
                          ? setModo("editar-inspecao")
                          : setAlertModal({
                              isOpen: true,
                              message:
                                "Não é possível criar inspeção pois a manutenção ainda não foi concluída.",
                            })
                      }
                      className="btn-primary"
                    >
                      Criar Inspeção
                    </button>
                    <button
                      onClick={() => handleExportarPDF(selectedItem)}
                      className="btn-primary"
                    >
                      Exportar PDF
                    </button>
                  </div>
                </div>
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => setModo("editar-detalhes")}
                  className="btn-primary"
                >
                  Editar Detalhes
                </button>
              </div>

              {modo === "editar-detalhes" && (
                <ModalEditarDetalhesManutencao
                  inspecao={selectedItem}
                  onSalvar={handleEditarDetalhes}
                  onCancelar={() => setModo("lista")}
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
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        type="warning"
      />
    </div>
  );
};
