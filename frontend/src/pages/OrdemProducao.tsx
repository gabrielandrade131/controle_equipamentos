import React, { useMemo, useState } from "react";
import { useProducoes } from "../hooks/useProducoes";
import { FilterPanel } from "../components/FilterPanel";
import { Pagination } from "../components/Pagination";
import { useFilters } from "../hooks/useFilters";
import { usePaginatedSelection } from "../hooks/usePaginatedSelection";
import { CreateProducaoDto, Producao } from "../types/producao";
import { PdfExporter } from "../components/PdfExporter";
import { FormularioOrdem } from "../components/FormularioOrdem";
import { buildSelectOptions } from "../utils/filterOptions";
import { formatDatePtBr } from "../utils/date";
import { isCSafetyUser } from "../utils/auth";
import "../pages/Producao.css";

const formatarRotulo = (valor?: string | null) => {
  if (!valor) return "-";

  return valor.replace(/_/g, " ");
};

const OrdemProducao: React.FC = () => {
  const { producoes, loading, error, criarProducao, atualizarProducao } =
    useProducoes();
  const [modo, setModo] = useState<"lista" | "criar" | "editar">("lista");
  const { filters, updateFilters } = useFilters("ordem-filters", {});
  const isCSafety = isCSafetyUser();
  const loteOptions = useMemo(
    () => buildSelectOptions(producoes.map((producao) => producao.numeroLote)),
    [producoes],
  );
  const tagOptions = useMemo(
    () => buildSelectOptions(producoes.map((producao) => producao.tag)),
    [producoes],
  );
  const modeloOptions = useMemo(
    () => buildSelectOptions(producoes.map((producao) => producao.modelo)),
    [producoes],
  );

  const filteredProducoes = useMemo(() => {
    return producoes.filter((p) => {
      if (filters.status && p.statusProducao !== filters.status) return false;
      if (filters.tag && String(p.tag ?? "").trim() !== filters.tag)
        return false;
      if (filters.modelo && String(p.modelo ?? "").trim() !== filters.modelo)
        return false;
      if (filters.numeroLote) {
        const loteProducao =
          p.numeroLote != null ? String(p.numeroLote).trim() : "";
        if (loteProducao !== filters.numeroLote) return false;
      }
      return true;
    });
  }, [producoes, filters]);
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
    items: filteredProducoes,
    getId: (producao) => producao.id,
  });

  const handleCriarOrdem = (novaProducao: CreateProducaoDto) => {
    criarProducao(novaProducao)
      .then(() => {
        setModo("lista");
        alert("Ordem de produção criada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao criar ordem de produção:", error);
        alert(
          error.response?.data?.message ||
            "Não foi possível criar a ordem de produção.",
        );
      });
  };

  const handleEditarOrdem = (
    producaoAtualizada: Producao | CreateProducaoDto,
  ) => {
    if (!selectedItem) return;

    atualizarProducao(selectedItem.id, producaoAtualizada as Producao)
      .then(() => {
        setModo("lista");
        alert("Ordem de produção atualizada com sucesso!");
      })
      .catch((error) => {
        console.error("Erro ao atualizar ordem de produção:", error);
        alert(
          error.response?.data?.message ||
            "Não foi possível atualizar a ordem de produção.",
        );
      });
  };

  if (loading)
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    );
  if (error)
    return (
      <div className="container error">
        <p>Erro: {error}</p>
      </div>
    );

  if (modo === "criar") {
    return (
      <div className="container">
        <FormularioOrdem
          onSalvar={handleCriarOrdem}
          onCancelar={() => setModo("lista")}
        />
      </div>
    );
  }

  if (modo === "editar" && selectedItem && !isCSafety) {
    return (
      <div className="container">
        <FormularioOrdem
          producao={selectedItem}
          onSalvar={handleEditarOrdem}
          onCancelar={() => {
            setModo("lista");
          }}
          isEditing
        />
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Ordem de Produção</h2>

      <div className="page-toolbar">
        <button onClick={() => setModo("criar")} className="btn-primary">
          Gerar Ordem de Produção
        </button>
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
                  { value: "PROGRAMADA", label: "Programada" },
                  { value: "EM_ANDAMENTO", label: "Em andamento" },
                  { value: "CONCLUIDA", label: "Concluída" },
                  { value: "PARALISADA", label: "Paralisada" },
                ],
              },
              {
                key: "numeroLote",
                label: "Lote",
                type: "select",
                options: loteOptions,
              },
              { key: "tag", label: "TAG", type: "select", options: tagOptions },
              {
                key: "modelo",
                label: "Modelo",
                type: "select",
                options: modeloOptions,
              },
            ]}
            titulo="Filtros"
          />
          <h3>Produções ({filteredProducoes.length})</h3>
          {filteredProducoes.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
          ) : (
            <>
              <ul className="page-list">
                {paginatedItems.map((producao: Producao) => (
                  <li
                    key={producao.id}
                    className={selectedId === producao.id ? "active" : ""}
                    onClick={() => selectItem(producao)}
                  >
                    <strong>{producao.numeroOrdem}</strong>
                    <small>{producao.modelo}</small>
                    <small>{producao.statusProducao}</small>
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
            <div className="producao-detail">
              <h2>Detalhes da Ordem</h2>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Número da Ordem:</label>
                  <p>{selectedItem.numeroOrdem}</p>
                </div>
                <div className="detail-item">
                  <label>Número do Lote:</label>
                  <p>{selectedItem.numeroLote ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Série:</label>
                  <p>{selectedItem.numeroSerie || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <p>{selectedItem.statusProducao || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>TAG:</label>
                  <p>{selectedItem.tag || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo de Equipamento:</label>
                  <p>{selectedItem.tipoEquipamentoNome || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selectedItem.modelo}</p>
                </div>
                <div className="detail-item">
                  <label>Data Solicitação:</label>
                  <p>{formatDatePtBr(selectedItem.dataSolicitacao) || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Necessidade:</label>
                  <p>{formatDatePtBr(selectedItem.dataNecessidade) || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Início:</label>
                  <p>{formatDatePtBr(selectedItem.dataInicio) || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Paralisação:</label>
                  <p>{formatDatePtBr(selectedItem.dataParalisacao) || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Previsão:</label>
                  <p>{formatDatePtBr(selectedItem.dataPrevisao) || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Data de Término:</label>
                  <p>{formatDatePtBr(selectedItem.dataTermino) || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Dias Solicitação:</label>
                  <p>{selectedItem.diasSolicitacao ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Dias Produção:</label>
                  <p>{selectedItem.diasProducao ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Dias Paralisação:</label>
                  <p>{selectedItem.diasParalisacao ?? "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Situação do Prazo:</label>
                  <p>{formatarRotulo(selectedItem.situacaoPrazo)}</p>
                </div>
                <div className="detail-item">
                  <label>Resultado do Prazo:</label>
                  <p>{formatarRotulo(selectedItem.resultadoPrazo)}</p>
                </div>
              </div>

              <div className="detail-item full">
                <label>Descrição:</label>
                <p>{selectedItem.descricao}</p>
              </div>

              {selectedItem.itensSeriados &&
                selectedItem.itensSeriados.length > 0 && (
                  <div className="documents-section">
                    <h3>Itens Serializados</h3>
                    {selectedItem.itensSeriados.map((item) => (
                      <div key={item.id} className="doc-item">
                        <strong>Item {item.numero}</strong>
                        <p>{item.descricao}</p>
                        {item.numeroSerie && (
                          <small>Série: {item.numeroSerie}</small>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {selectedItem.documentos &&
                selectedItem.documentos.length > 0 && (
                  <div className="documents-section">
                    <h3>Documentos Relacionados</h3>
                    {selectedItem.documentos.map((doc) => (
                      <div key={doc.id} className="doc-item">
                        <strong>{doc.nome}:</strong> {doc.codigo}
                      </div>
                    ))}
                  </div>
                )}

              {selectedItem.historicoProducao &&
              selectedItem.historicoProducao.length > 0 ? (
                <div className="documents-section">
                  <h3>Histórico de Produção</h3>
                  <div className="historico-producao-view">
                    {selectedItem.historicoProducao.map((registro) => (
                      <div
                        key={registro.id}
                        className="historico-producao-item-view"
                      >
                        <strong>
                          {registro.criadoEm
                            ? new Date(registro.criadoEm).toLocaleDateString(
                                "pt-BR",
                              )
                            : "Registro"}
                        </strong>
                        <small>
                          Responsável: {registro.responsavel || "-"}
                        </small>
                        <p>{registro.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedItem.observacoes ? (
                <div className="documents-section">
                  <h3>Histórico de Produção</h3>
                  <p>{selectedItem.observacoes}</p>
                </div>
              ) : null}

              <div className="action-buttons">
                {!isCSafety && (
                  <button
                    onClick={() => setModo("editar")}
                    className="btn-primary"
                  >
                    Editar
                  </button>
                )}
                <PdfExporter producao={selectedItem} />
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Selecione uma ordem para visualizar detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdemProducao;
