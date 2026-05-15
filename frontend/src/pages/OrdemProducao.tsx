import React, { useState } from 'react';
import { useProducoes } from '../hooks/useProducoes';
import { CreateProducaoDto, Producao } from '../types/producao';
import { PdfExporter } from '../components/PdfExporter';
import { FormularioOrdem } from '../components/FormularioOrdem';
import '../pages/Producao.css';

interface SelectedProducao {

  id: string;
  data: Producao;
}

const calcularDiasProducao = (dataInicio: string, dataTermino?: string): number | null => {
  if (!dataTermino) return null;

  const inicio = new Date(dataInicio);
  const fim = new Date(dataTermino);
  const differenceInMs = fim.getTime() - inicio.getTime();
  const dias = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

  return Math.max(0, dias);
};

const formatarRotulo = (valor?: string | null) => {
  if (!valor) return '-';

  return valor.replace(/_/g, ' ');
};

const OrdemProducao: React.FC = () => {
  const { producoes, loading, error, criarProducao, atualizarProducao } = useProducoes();
  const [selected, setSelected] = useState<SelectedProducao | null>(null);
  const [modo, setModo] = useState<'lista' | 'criar' | 'editar'>('lista');

  const handleSelectProducao = (producao: Producao) => {
    setSelected({
      id: producao.id || '',
      data: producao,
    });
  };

  const handleCriarOrdem = (novaProducao: CreateProducaoDto) => {
    criarProducao(novaProducao)
      .then(() => {
        setModo('lista');
        alert('Ordem de producao criada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao criar ordem de producao:', error);
        alert(error.response?.data?.message || 'Nao foi possivel criar a ordem de producao.');
      });
  };

  const handleEditarOrdem = (producaoAtualizada: Producao | CreateProducaoDto) => {
    if (!selected) return;

    atualizarProducao(selected.id, producaoAtualizada as Producao)
      .then((producao) => {
        setSelected({ id: producao.id, data: producao });
        setModo('lista');
        alert('Ordem de producao atualizada com sucesso!');
      })
      .catch((error) => {
        console.error('Erro ao atualizar ordem de producao:', error);
        alert(error.response?.data?.message || 'Nao foi possivel atualizar a ordem de producao.');
      });
  };

  if (loading) return <div className="container"><p>Carregando...</p></div>;
  if (error) return <div className="container error"><p>Erro: {error}</p></div>;

  if (modo === 'criar') {
    return (
      <div className="container">
        <FormularioOrdem
          onSalvar={handleCriarOrdem}
          onCancelar={() => setModo('lista')}
        />
      </div>
    );
  }

  if (modo === 'editar' && selected) {
    return (
      <div className="container">
        <FormularioOrdem
          producao={selected.data}
          onSalvar={handleEditarOrdem}
          onCancelar={() => {
            setModo('lista');
            setSelected(null);
          }}
          isEditing
        />
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Ordem de Producao</h2>

      <div className="page-toolbar">
        <button
          onClick={() => setModo('criar')}
          className="btn-primary"
        >
          Gerar Ordem de Producao
        </button>
      </div>

      <div className="page-content">
        <div className="page-list-section">
          <h3>Producoes ({producoes.length})</h3>
          {producoes.length === 0 ? (
            <p>Nenhuma producao encontrada</p>
          ) : (
            <ul className="page-list">
              {producoes.map((producao: Producao) => (
                <li
                  key={producao.id}
                  className={selected?.id === producao.id ? 'active' : ''}
                  onClick={() => handleSelectProducao(producao)}
                >
                  <strong>{producao.numeroOrdem}</strong>
                  <small>{producao.modelo}</small>
                  <small>{producao.statusProducao}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="producao-detail">
              <h2>Detalhes da Ordem</h2>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Numero Ordem:</label>
                  <p>{selected.data.numeroOrdem}</p>
                </div>
                <div className="detail-item">
                  <label>Serie:</label>
                  <p>{selected.data.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <p>{selected.data.statusProducao || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>TAG:</label>
                  <p>{selected.data.tag || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Tipo Equipamento:</label>
                  <p>{selected.data.tipoEquipamentoNome || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo}</p>
                </div>
                <div className="detail-item">
                  <label>Data Solicitacao:</label>
                  <p>{selected.data.dataSolicitacao}</p>
                </div>
                <div className="detail-item">
                  <label>Data Necessidade:</label>
                  <p>{selected.data.dataNecessidade || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data Inicio:</label>
                  <p>{selected.data.dataInicio || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data Previsao:</label>
                  <p>{selected.data.dataPrevisao || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data Termino:</label>
                  <p>{selected.data.dataTermino || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Dias Solicitacao:</label>
                  <p>{selected.data.diasSolicitacao ?? '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Dias Producao:</label>
                  <p>
                    {selected.data.diasProducao ??
                      calcularDiasProducao(
                        selected.data.dataInicio || selected.data.dataSolicitacao,
                        selected.data.dataTermino,
                      ) ??
                      '-'}
                  </p>
                </div>
                <div className="detail-item">
                  <label>Situacao Prazo:</label>
                  <p>{formatarRotulo(selected.data.situacaoPrazo)}</p>
                </div>
                <div className="detail-item">
                  <label>Resultado Prazo:</label>
                  <p>{formatarRotulo(selected.data.resultadoPrazo)}</p>
                </div>
              </div>

              <div className="detail-item full">
                <label>Descricao:</label>
                <p>{selected.data.descricao}</p>
              </div>

              {selected.data.itensSeriados && selected.data.itensSeriados.length > 0 && (
                <div className="documents-section">
                  <h3>Itens Serializados</h3>
                  {selected.data.itensSeriados.map((item) => (
                    <div key={item.id} className="doc-item">
                      <strong>Item {item.numero}</strong>
                      <p>{item.descricao}</p>
                      {item.numeroSerie && <small>Serie: {item.numeroSerie}</small>}
                    </div>
                  ))}
                </div>
              )}

              {selected.data.documentos && selected.data.documentos.length > 0 && (
                <div className="documents-section">
                  <h3>Documentos Relacionados</h3>
                  {selected.data.documentos.map((doc) => (
                    <div key={doc.id} className="doc-item">
                      <strong>{doc.nome}:</strong> {doc.codigo}
                    </div>
                  ))}
                </div>
              )}

              {selected.data.historicoProducao && selected.data.historicoProducao.length > 0 ? (
                <div className="documents-section">
                  <h3>Histórico de Produção</h3>
                  <div className="historico-producao-view">
                    {selected.data.historicoProducao.map((registro) => (
                      <div key={registro.id} className="historico-producao-item-view">
                        <strong>
                          {registro.criadoEm
                            ? new Date(registro.criadoEm).toLocaleDateString('pt-BR')
                            : 'Registro'}
                        </strong>
                        <small>Responsável: {registro.responsavel || '-'}</small>
                        <p>{registro.descricao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selected.data.observacoes ? (
                <div className="documents-section">
                  <h3>Histórico de Produção</h3>
                  <p>{selected.data.observacoes}</p>
                </div>
              ) : null}

              <div className="action-buttons">
                <button
                  onClick={() => setModo('editar')}
                  className="btn-primary"
                >
                  Editar
                </button>
                <PdfExporter producao={selected.data} />
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
