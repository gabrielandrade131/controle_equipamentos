import React, { useMemo, useState } from 'react';
import { FormularioInspecaoNovo } from '../components/FormularioInspecaoNovo';
import { FilterPanel } from '../components/FilterPanel';
import { useFilters } from '../hooks/useFilters';
import { PdfExporterInspecao } from '../components/PdfExporterInspecao';
import { Pagination } from '../components/Pagination';
import { usePaginatedSelection } from '../hooks/usePaginatedSelection';
import { useInspecoes } from '../hooks/useInspecoes';
import { InspecaoMontagem } from '../types/inspecao';
import { buildSelectOptions } from '../utils/filterOptions';
import { formatDatePtBr, getLocalDateInput } from '../utils/date';
import '../pages/Producao.css';

const getResultadoColor = (resultado?: string) => {
  if (resultado === 'APROVADO') return '#4caf50';
  if (resultado === 'REPROVADO') return '#f44336';
  return '#666';
};

const matchesTextFilter = (
  value: string | number | null | undefined,
  filter?: string,
) => {
  const normalizedFilter = String(filter ?? '').trim().toLowerCase();
  if (!normalizedFilter) return true;

  return String(value ?? '').trim().toLowerCase().includes(normalizedFilter);
};

const InspecaoMontagemPage: React.FC = () => {
  const { inspecoes, loading, atualizarInspecao } = useInspecoes();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { filters, updateFilters } = useFilters('inspecao-filters', {});
  const loteOptions = useMemo(
    () => buildSelectOptions(inspecoes.map((inspecao) => inspecao.numeroLote)),
    [inspecoes],
  );
  const tagOptions = useMemo(
    () => buildSelectOptions(inspecoes.map((inspecao) => inspecao.tag)),
    [inspecoes],
  );
  const numeroSerieOptions = useMemo(
    () => buildSelectOptions(inspecoes.map((inspecao) => inspecao.numeroSerie)),
    [inspecoes],
  );
  const tipoEquipamentoOptions = useMemo(
    () =>
      buildSelectOptions(
        inspecoes.map((inspecao) => inspecao.tipoEquipamentoNome),
      ),
    [inspecoes],
  );
  const modeloOptions = useMemo(
    () => buildSelectOptions(inspecoes.map((inspecao) => inspecao.modelo)),
    [inspecoes],
  );

  const filteredInspecoes = useMemo(() => {
    return inspecoes.filter((i) => {
      if (filters.resultado && i.resultadoFinal !== filters.resultado) return false;
      if (filters.status && i.statusProducao !== filters.status) return false;
      if (!matchesTextFilter(i.numeroLote, filters.numeroLote)) return false;
      if (!matchesTextFilter(i.tag, filters.tag)) return false;
      if (!matchesTextFilter(i.numeroSerie, filters.numeroSerie)) return false;
      if (!matchesTextFilter(i.tipoEquipamentoNome, filters.tipoEquipamento))
        return false;
      if (!matchesTextFilter(i.modelo, filters.modelo)) return false;
      if (filters.dataInicio || filters.dataTermino) {
        const inicioTrabalho = i.dataInicio;

        if (!inicioTrabalho) return false;
        const fimTrabalho =
          i.dataTermino ||
          (i.statusProducao === 'CONCLUIDA'
            ? inicioTrabalho
            : getLocalDateInput());

        if (filters.dataTermino && inicioTrabalho > filters.dataTermino)
          return false;
        if (filters.dataInicio && fimTrabalho < filters.dataInicio) return false;
      }
      return true;
    });
  }, [inspecoes, filters]);
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
    items: filteredInspecoes,
    getId: (inspecao) => inspecao.id,
  });

  const handleSalvarInspecao = async (inspecaoAtualizada: InspecaoMontagem) => {
    if (!selectedItem?.id) return;

    try {
      setSalvando(true);
      await atualizarInspecao(selectedItem.id, inspecaoAtualizada);
      setEditando(false);
      alert('Inspeção de montagem salva com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar inspeção de montagem.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    );
  }

  if (editando && selectedItem) {
    return (
      <div className="container">
        <FormularioInspecaoNovo
          key={selectedItem.id}
          inspecaoInicial={selectedItem}
          titulo={`Inspeção de montagem - ${selectedItem.numeroSerie || selectedItem.modelo}`}
          onSubmit={handleSalvarInspecao}
          onCancel={() => setEditando(false)}
        />
        {salvando && <p>Salvando...</p>}
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Inspeção de Montagem</h2>

      <div className="page-content">
        <div className="page-list-section">
          <FilterPanel
            filters={filters}
            onFiltersChange={updateFilters}
            fields={[
              {
                key: 'resultado',
                label: 'Resultado',
                type: 'select',
                options: [
                  { value: 'APROVADO', label: 'Aprovado' },
                  { value: 'REPROVADO', label: 'Reprovado' },
                ],
              },
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { value: 'PROGRAMADA', label: 'Programada' },
                  { value: 'EM_ANDAMENTO', label: 'Em andamento' },
                  { value: 'CONCLUIDA', label: 'Concluída' },
                  { value: 'PARALISADA', label: 'Paralisada' },
                ],
              },
              {
                key: 'numeroLote',
                label: 'Lote',
                type: 'text',
                placeholder: 'Digite o lote',
                options: loteOptions,
              },
              {
                key: 'tag',
                label: 'TAG',
                type: 'text',
                placeholder: 'Digite a TAG',
                options: tagOptions,
              },
              {
                key: 'numeroSerie',
                label: 'Número de Série',
                type: 'text',
                placeholder: 'Digite a série',
                options: numeroSerieOptions,
              },
              {
                key: 'tipoEquipamento',
                label: 'Tipo de equipamento',
                type: 'text',
                placeholder: 'Digite o tipo',
                options: tipoEquipamentoOptions,
              },
              {
                key: 'modelo',
                label: 'Modelo',
                type: 'text',
                placeholder: 'Digite o modelo',
                options: modeloOptions,
              },
              {
                key: 'dataInicio',
                label: 'Data início',
                type: 'date',
              },
              {
                key: 'dataTermino',
                label: 'Data fim',
                type: 'date',
              },
            ]}
            titulo="Filtros"
          />
          <h3>Produções ({filteredInspecoes.length})</h3>
          {filteredInspecoes.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
          ) : (
            <>
              <ul className="page-list">
                {paginatedItems.map((inspecao) => (
                <li
                  key={inspecao.id}
                  className={selectedId === inspecao.id ? 'active' : ''}
                  onClick={() => {
                    selectItem(inspecao);
                    setEditando(false);
                  }}
                >
                  <strong>{inspecao.numeroSerie || 'Sem série'}</strong>
                  <small>{inspecao.modelo || 'Sem modelo'}</small>
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
            <div className="inspecao-detail">
              <h3>Inspeção vinculada à produção</h3>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Número de série:</label>
                  <p>{selectedItem.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Lote:</label>
                  <p>{selectedItem.numeroLote ?? '-'}</p>
                </div>
                <div className="detail-item">
                  <label>TAG:</label>
                  <p>{selectedItem.tag || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <p>{selectedItem.statusProducao || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo de equipamento:</label>
                  <p>{selectedItem.tipoEquipamentoNome || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selectedItem.modelo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data de início:</label>
                  <p>{formatDatePtBr(selectedItem.dataInicio) || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data de término:</label>
                  <p>{formatDatePtBr(selectedItem.dataTermino) || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data da inspeção:</label>
                  <p>{selectedItem.data}</p>
                </div>
                <div className="detail-item">
                  <label>Executado por:</label>
                  <p>{selectedItem.responsavelServico || selectedItem.responsavel || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Revisado por:</label>
                  <p>
                    {selectedItem.statusProducao === 'CONCLUIDA'
                      ? 'Douglas Moreira Alves'
                      : selectedItem.responsavelRevisao || '-'}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Resultado:</label>
                  <p>
                    <strong style={{ color: getResultadoColor(selectedItem.resultadoFinal) }}>
                      {selectedItem.resultadoFinal || 'Não preenchida'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="page-toolbar" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    if (
                      selectedItem.statusProducao === 'EM_ANDAMENTO' ||
                      selectedItem.statusProducao === 'CONCLUIDA'
                    ) {
                      setEditando(true);
                    } else {
                      alert(
                        "A inspeção de montagem só pode ser preenchida quando a produção estiver com status 'Em andamento'.",
                      );
                    }
                  }}
                >
                  {selectedItem.statusProducao === 'CONCLUIDA'
                    ? 'Visualizar inspeção'
                    : 'Preencher inspeção'}
                </button>
                <PdfExporterInspecao inspecao={selectedItem} />
              </div>
            </div>
          ) : (
            <div className="page-detail-section no-selection">
              <p>Selecione uma produção para preencher a inspeção de montagem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspecaoMontagemPage;
