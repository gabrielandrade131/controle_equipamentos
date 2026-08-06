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
import { isOperationalUser } from "../utils/auth";
import "./Manutencao.css";

const STATUS_LABELS: Record<string, string> = {
  EM_QUARENTENA: "Em quarentena",
  PENDENTE: "Pendente",
  EM_MANUTENCAO: "Em manutenção",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
};

const TIPO_MANUTENCAO_LABELS: Record<string, string> = {
  CORRETIVA: "Corretiva",
  PREVENTIVA: "Preventiva",
};

const matchesTextFilter = (
  value: string | number | null | undefined,
  filter?: string,
) => {
  const normalizedFilter = String(filter ?? "")
    .trim()
    .toLowerCase();
  if (!normalizedFilter) return true;

  return String(value ?? "")
    .trim()
    .toLowerCase()
    .includes(normalizedFilter);
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
  const isOperational = isOperationalUser();
  const [fotosRecebimento, setFotosRecebimento] = useState<
    FotoRecebimentoManutencao[]
  >([]);
  const [carregandoFotos, setCarregandoFotos] = useState(false);
  const [imagemAmpliada, setImagemAmpliada] = useState<{
    src: string;
    alt: string;
    legenda: string;
  } | null>(null);
  const [enviandoAnexoPdf, setEnviandoAnexoPdf] = useState(false);
  const [statusEscolhido, setStatusEscolhido] = useState<string | null>(null);
  const [confirmandoStatus, setConfirmandoStatus] = useState(false);
  const [salvandoStatus, setSalvandoStatus] = useState(false);
  const {
    historico,
    adicionarInspecao,
    atualizarInspecao,
    atualizarInspecaoConcluida,
    buscarFotosRecebimento,
    anexarPdf,
  } = useManutencao();
  const { exportInspecaoToPdf } = usePdfExportManutencao();
  const { filters, updateFilters } = useFilters("manutencao-filters", {});
  const tagOptions = useMemo(
    () => buildSelectOptions(historico.map((item) => item.tag)),
    [historico],
  );
  const numeroSerieOptions = useMemo(
    () => buildSelectOptions(historico.map((item) => item.numeroSerie)),
    [historico],
  );
  const tipoEquipamentoOptions = useMemo(
    () => buildSelectOptions(historico.map((item) => item.tipoEquipamento)),
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
      if (
        filters.tipoManutencao &&
        item.tipoManutencao !== filters.tipoManutencao
      )
        return false;
      if (!matchesTextFilter(item.tag, filters.tag)) return false;
      if (!matchesTextFilter(item.numeroSerie, filters.numeroSerie))
        return false;
      if (!matchesTextFilter(item.tipoEquipamento, filters.tipoEquipamento))
        return false;
      if (!matchesTextFilter(item.fabricante, filters.fabricante)) return false;
      if (!matchesTextFilter(item.responsavel, filters.responsavel))
        return false;
      if (filters.dataInicio || filters.dataTermino) {
        const inicioTrabalho = item.dataInicio;

        if (!inicioTrabalho) return false;
        const fimTrabalho =
          item.dataTermino ||
          (item.statusManutencao === "CONCLUIDA"
            ? inicioTrabalho
            : getLocalDateInput());

        if (filters.dataTermino && inicioTrabalho > filters.dataTermino)
          return false;
        if (filters.dataInicio && fimTrabalho < filters.dataInicio)
          return false;
      }
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

  useEffect(() => {
    if (!imagemAmpliada) return;

    const fecharComEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImagemAmpliada(null);
    };
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", fecharComEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", fecharComEscape);
    };
  }, [imagemAmpliada]);

  const handleExportarPDF = async (inspecao: InspecaoManutencao) => {
    try {
      const nomeArquivo = `inspecao_manutencao_${inspecao.tag || "equipamento"}_${getLocalDateInput()}.pdf`;
      const logoPath = "/logo.png";
      await exportInspecaoToPdf(inspecao, nomeArquivo, logoPath);
    } catch (error) {
      alert("Erro ao gerar PDF: " + error);
    }
  };

  const handleAnexarPdf = async (arquivo?: File) => {
    if (!arquivo || !selectedItem?.id) return;

    const extensaoPdf = arquivo.name.toLowerCase().endsWith(".pdf");

    // The browser MIME is not reliable for PDFs (it may be empty or custom).
    if (!extensaoPdf) {
      setAlertModal({
        isOpen: true,
        message: "Selecione um arquivo no formato PDF.",
      });
      return;
    }

    if (arquivo.size > 10 * 1024 * 1024) {
      setAlertModal({
        isOpen: true,
        message: "O PDF deve ter no máximo 10 MB.",
      });
      return;
    }

    try {
      setEnviandoAnexoPdf(true);
      await anexarPdf(selectedItem.id, arquivo);
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        message:
          error.response?.data?.message || "Não foi possível anexar o PDF.",
      });
    } finally {
      setEnviandoAnexoPdf(false);
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

  const handleStatusSelecionado = (status: string) => {
    if (!selectedItem || status === selectedItem.statusManutencao) {
      setStatusEscolhido(null);
      setConfirmandoStatus(false);
      return;
    }
    setStatusEscolhido(status);
    setConfirmandoStatus(false);
  };

  const confirmarAlteracaoStatus = async () => {
    if (!selectedItem || !statusEscolhido || !confirmandoStatus) return;
    if (statusEscolhido === "CONCLUIDA" && !selectedItem.responsavelRevisao?.trim()) {
      setAlertModal({
        isOpen: true,
        message: "Informe o campo Revisado por antes de concluir a manutenção.",
      });
      return;
    }

    const hoje = getLocalDateInput();
    const atualizacao: InspecaoManutencao = {
      ...selectedItem,
      statusManutencao: statusEscolhido as InspecaoManutencao["statusManutencao"],
      dataInicio:
        statusEscolhido === "EM_MANUTENCAO" && !selectedItem.dataInicio
          ? hoje
          : selectedItem.dataInicio,
      dataTermino:
        statusEscolhido === "CONCLUIDA" ? selectedItem.dataTermino || hoje : selectedItem.dataTermino,
      dataParalisacao:
        statusEscolhido === "PARALISADA" ? selectedItem.dataParalisacao || hoje : "",
    };

    try {
      setSalvandoStatus(true);
      await atualizarInspecao(selectedItem.id!, atualizacao);
      setStatusEscolhido(null);
      setConfirmandoStatus(false);
    } catch (error: any) {
      setAlertModal({
        isOpen: true,
        message: error.response?.data?.message || "Não foi possível alterar o status.",
      });
    } finally {
      setSalvandoStatus(false);
    }
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
          {!isOperational ? (
            <button
              className="btn-primary"
              onClick={() => setModo("criar-nova")}
            >
              Gerar Ordem de Manutenção
            </button>
          ) : null}
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
              {
                key: "tipoManutencao",
                label: "Tipo de manutenção",
                type: "select",
                options: [
                  { value: "CORRETIVA", label: "Corretiva" },
                  { value: "PREVENTIVA", label: "Preventiva" },
                ],
              },
              {
                key: "tag",
                label: "TAG",
                type: "text",
                placeholder: "Digite a TAG",
                options: tagOptions,
              },
              {
                key: "numeroSerie",
                label: "Série",
                type: "text",
                placeholder: "Digite a série",
                options: numeroSerieOptions,
              },
              {
                key: "tipoEquipamento",
                label: "Tipo de equipamento",
                type: "text",
                placeholder: "Digite o tipo",
                options: tipoEquipamentoOptions,
              },
              {
                key: "fabricante",
                label: "Fabricante",
                type: "text",
                placeholder: "Digite o fabricante",
                options: fabricanteOptions,
              },
              {
                key: "responsavel",
                label: "Executado por",
                type: "text",
                placeholder: "Digite o responsável",
                options: responsavelOptions,
              },
              {
                key: "dataInicio",
                label: "Data início",
                type: "date",
              },
              {
                key: "dataTermino",
                label: "Data fim",
                type: "date",
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
                    <strong className="equipamento-tipo-card">
                      {inspecao.tipoEquipamento || "Tipo não informado"}
                    </strong>
                    <small className="equipamento-tag-card">
                      {inspecao.tag || "TAG não informada"}
                    </small>
                    <small className="equipamento-status-card">
                      {STATUS_LABELS[inspecao.statusManutencao] ||
                        inspecao.statusManutencao ||
                        "-"}
                    </small>
                    <small className="equipamento-ordem-card">
                      OM #{inspecao.numeroOrdemManutencao ?? "-"}
                    </small>
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
                  <label>Série:</label>
                  <p>{selectedItem.numeroSerie || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo de Equipamento:</label>
                  <p>{selectedItem.tipoEquipamento || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo de Manutenção:</label>
                  <p>
                    {TIPO_MANUTENCAO_LABELS[selectedItem.tipoManutencao] ||
                      selectedItem.tipoManutencao ||
                      "-"}
                  </p>
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
                  <label>Validade do Equipamento:</label>
                  <p>
                    {selectedItem.validade
                      ? formatDatePtBr(selectedItem.validade)
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
                  <label>Executado por:</label>
                  <p>{selectedItem.responsavel || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Revisado por:</label>
                  <p>{selectedItem.responsavelRevisao || "-"}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <select
                    className="status-choice"
                    value={statusEscolhido ?? selectedItem.statusManutencao ?? ""}
                    disabled={selectedItem.statusManutencao === "CONCLUIDA" || salvandoStatus}
                    onChange={(event) => handleStatusSelecionado(event.target.value)}
                  >
                    <option value="EM_QUARENTENA">Em quarentena</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="EM_MANUTENCAO">Em manutenção</option>
                    <option value="PARALISADA">Paralisada</option>
                    <option value="CONCLUIDA">Concluída</option>
                  </select>
                  {statusEscolhido && (
                    <div className="status-confirmacao">
                      <label>
                        <input
                          type="checkbox"
                          checked={confirmandoStatus}
                          onChange={(event) => setConfirmandoStatus(event.target.checked)}
                        />
                        Confirmo que desejo alterar o status
                      </label>
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={!confirmandoStatus || salvandoStatus}
                        onClick={() => void confirmarAlteracaoStatus()}
                      >
                        {salvandoStatus ? "Salvando..." : "Confirmar status"}
                      </button>
                    </div>
                  )}
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
                        <button
                          type="button"
                          className="foto-ampliar-button"
                          aria-label={`Ampliar ${foto.tipoFoto}`}
                          onClick={() =>
                            setImagemAmpliada({
                              src: foto.url,
                              alt: `${foto.tipoFoto} - ${selectedItem.tag || "equipamento"}`,
                              legenda: foto.tipoFoto,
                            })
                          }
                        >
                          <img
                            src={foto.url}
                            alt={`${foto.tipoFoto} - ${selectedItem.tag || "equipamento"}`}
                            loading="lazy"
                          />
                        </button>
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

              {selectedItem.statusManutencao === "CONCLUIDA" && (
                <div className="documents-section">
                  <h3>Fotos da Inspeção de Manutenção</h3>
                  {selectedItem.imagensAnexadas &&
                  selectedItem.imagensAnexadas.length > 0 ? (
                    <div className="fotos-recebimento-grid">
                      {selectedItem.imagensAnexadas.map((imagem, index) => (
                        <figure
                          key={`${selectedItem.id}-inspecao-${index}`}
                          className="foto-recebimento-item"
                        >
                          <button
                            type="button"
                            className="foto-ampliar-button"
                            aria-label={`Ampliar foto ${index + 1}`}
                            onClick={() =>
                              setImagemAmpliada({
                                src: imagem,
                                alt: `Foto ${index + 1} da inspeção - ${selectedItem.tag || "equipamento"}`,
                                legenda: `Foto ${index + 1}`,
                              })
                            }
                          >
                            <img
                              src={imagem}
                              alt={`Foto ${index + 1} da inspeção - ${selectedItem.tag || "equipamento"}`}
                              loading="lazy"
                            />
                          </button>
                          <figcaption>
                            <span>Foto {index + 1}</span>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ) : (
                    <p className="sem-observacoes">
                      Nenhuma foto foi adicionada à inspeção.
                    </p>
                  )}
                </div>
              )}

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
                        <p>{obs.texto.trim()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="sem-observacoes">
                      Nenhuma observação registrada.
                    </p>
                  )}
                </div>
              </div>

              <div className="documents-section">
                <h3>Anexo PDF da Ordem de Manutenção</h3>
                {selectedItem.anexoPdf ? (
                  <a
                    className="anexo-pdf-link"
                    href={selectedItem.anexoPdf}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir PDF anexado
                  </a>
                ) : (
                  <p className="sem-observacoes">Nenhum PDF anexado.</p>
                )}
                <label className="anexo-pdf-upload">
                  <span>
                    {enviandoAnexoPdf
                      ? "Enviando PDF..."
                      : "Anexar ou substituir PDF"}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    disabled={enviandoAnexoPdf}
                    onChange={(event) => {
                      void handleAnexarPdf(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <small className="anexo-pdf-hint">
                  Somente PDF, até 10 MB.
                </small>
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
                                "A inspeção de manutenção só pode ser preenchida quando a manutenção estiver concluída.",
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

      {imagemAmpliada && (
        <div
          className="imagem-ampliada-overlay"
          onClick={() => setImagemAmpliada(null)}
        >
          <div
            className="imagem-ampliada-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Visualização ampliada: ${imagemAmpliada.legenda}`}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="imagem-ampliada-fechar"
              aria-label="Fechar imagem ampliada"
              onClick={() => setImagemAmpliada(null)}
              autoFocus
            >
              &times;
            </button>
            <img src={imagemAmpliada.src} alt={imagemAmpliada.alt} />
            <p>{imagemAmpliada.legenda}</p>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        title="Atenção"
        message={alertModal.message}
        onClose={() => setAlertModal({ isOpen: false, message: "" })}
        type="warning"
      />
    </div>
  );
};
