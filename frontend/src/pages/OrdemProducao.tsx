import React, { useState } from 'react';
import { useProducoes } from '../hooks/useProducoes';
import { Producao, CreateProducaoDto } from '../types/producao';
import { PdfExporter } from '../components/PdfExporter';
import { FormularioOrdem } from '../components/FormularioOrdem';
import '../pages/Producao.css';

interface SelectedProducao {
  id: string;
  data: Producao;
}

const calcularDiasProducao = (dataSolicitacao: string, dataTermino?: string): number | null => {
  if (!dataTermino) return null;
  
  const inicio = new Date(dataSolicitacao);
  const fim = new Date(dataTermino);
  const differenceInMs = fim.getTime() - inicio.getTime();
  const dias = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
  
  return Math.max(0, dias);
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
    criarProducao(novaProducao);
    setModo('lista');
    alert('Ordem de produção criada com sucesso!');
  };

  const handleEditarOrdem = (producaoAtualizada: Producao | CreateProducaoDto) => {
    if (selected && 'id' in producaoAtualizada) {
      atualizarProducao(selected.id, producaoAtualizada as Producao);
      setSelected(null);
      setModo('lista');
      alert('Ordem de produção atualizada com sucesso!');
    }
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
      <h2>Ordem de Produção</h2>
      
      <div className="page-toolbar">
        <button 
          onClick={() => setModo('criar')}
          className="btn-primary"
        >
          Gerar Ordem de Produção
        </button>
      </div>
      
      <div className="page-content">
        <div className="page-list-section">
          <h3>Produções ({producoes.length})</h3>
          {producoes.length === 0 ? (
            <p>Nenhuma produção encontrada</p>
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
                  <label>Número Ordem:</label>
                  <p>{selected.data.numeroOrdem}</p>
                </div>
                <div className="detail-item">
                  <label>Série:</label>
                  <p>{selected.data.numeroSerie}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo}</p>
                </div>
                <div className="detail-item">
                  <label>Data Solicitação:</label>
                  <p>{selected.data.dataSolicitacao}</p>
                </div>
                {selected.data.dataTermino && (
                  <>
                    <div className="detail-item">
                      <label>Data Término:</label>
                      <p>{selected.data.dataTermino}</p>
                    </div>
                    <div className="detail-item">
                      <label>Dias de Produção:</label>
                      <p><strong>{calcularDiasProducao(selected.data.dataSolicitacao, selected.data.dataTermino)}</strong></p>
                    </div>
                  </>
                )}
              </div>
              <div className="detail-item full">
                <label>Descrição:</label>
                <p>{selected.data.descricao}</p>
              </div>

              {selected.data.itensSeriados && selected.data.itensSeriados.length > 0 && (
                <div className="documents-section">
                  <h3>Itens Serializados</h3>
                  {selected.data.itensSeriados.map((item) => (
                    <div key={item.id} className="doc-item">
                      <strong>Item {item.numero}</strong>
                      <p>{item.descricao}</p>
                      {item.numeroSerie && <small>Série: {item.numeroSerie}</small>}
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

              {selected.data.observacoes && (
                <div className="documents-section">
                  <h3>Observações Adicionais</h3>
                  <p>{selected.data.observacoes}</p>
                </div>
              )}

              <div className="action-buttons">
                <button 
                  onClick={() => setModo('editar')}
                  className="btn-primary"
                >
                  Editar
                </button>
                <PdfExporter 
                  producao={selected.data}
                />
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
