import React, { useMemo, useState } from 'react';
import { useProducoes } from '../hooks/useProducoes';
import { useManutencao } from '../hooks/useManutencao';
import { Producao } from '../types/producao';
import { InspecaoManutencao, ItemInspecao } from '../types/manutencao';
import { formatDatePtBr } from '../utils/date';
import './ListaEquipamentos.css';

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

const SECOES_CHECKLIST = [
  { key: 'certificacoes', label: 'Certificações e Documentação' },
  { key: 'estruturaMecanica', label: 'Estrutura e Integridade Mecânica' },
  { key: 'sistemaHidraulico', label: 'Sistema Hidráulico' },
  { key: 'sistemaPneumatico', label: 'Sistema Pneumático' },
  { key: 'sistemaEletrico', label: 'Sistema Elétrico' },
  { key: 'dispositivoSeguranca', label: 'Dispositivos de Segurança' },
  { key: 'componentesOperacionais', label: 'Componentes Operacionais' },
  { key: 'acessorios', label: 'Acessórios e Itens Específicos' },
  { key: 'testesOperacionais', label: 'Testes Operacionais' },
] as const;

const ListaEquipamentos: React.FC = () => {
  const { producoes, loading: loadingProducoes, error: errorProducoes } = useProducoes();
  const { historico: todasManutencoes, loading: loadingManutencoes } = useManutencao();
  
  const [buscaSerie, setBuscaSerie] = useState('');
  const [buscaModelo, setBuscaModelo] = useState('');
  const [buscaTipo, setBuscaTipo] = useState('');
  
  const [selectedEquipamento, setSelectedEquipamento] = useState<Producao | null>(null);
  const [selectedOm, setSelectedOm] = useState<InspecaoManutencao | null>(null);
  const [activeTab, setActiveTab] = useState<'geral' | 'checklist' | 'observacoes'>('geral');
  const [activeSecaoChecklist, setActiveSecaoChecklist] = useState<string>('certificacoes');

  // Agrupa os equipamentos pelo número de série para garantir chave única
  const equipamentosUnicos = useMemo(() => {
    const map = new Map<string, Producao>();
    
    // Ordena para que os registros mais novos ou preenchidos tenham prioridade se houver duplicados,
    // ou simplesmente filtra. Aqui, usaremos a ordem natural vinda da API.
    producoes.forEach((producao) => {
      const serie = (producao.numeroSerie || '').trim();
      if (serie) {
        if (!map.has(serie)) {
          map.set(serie, producao);
        }
      }
    });

    return Array.from(map.values());
  }, [producoes]);

  // Aplica os filtros de busca
  const equipamentosFiltrados = useMemo(() => {
    return equipamentosUnicos.filter((equipamento) => {
      const matchSerie = (equipamento.numeroSerie || '')
        .toLowerCase()
        .includes(buscaSerie.toLowerCase().trim());
      
      const matchModelo = (equipamento.modelo || '')
        .toLowerCase()
        .includes(buscaModelo.toLowerCase().trim());

      const matchTipo = (equipamento.tipoEquipamentoNome || '')
        .toLowerCase()
        .includes(buscaTipo.toLowerCase().trim());

      return matchSerie && matchModelo && matchTipo;
    });
  }, [equipamentosUnicos, buscaSerie, buscaModelo, buscaTipo]);

  // Filtra as OMs do equipamento selecionado
  const omsDoEquipamento = useMemo(() => {
    if (!selectedEquipamento) return [];
    return todasManutencoes.filter(
      (m) => (m.numeroSerie || '').trim().toLowerCase() === (selectedEquipamento.numeroSerie || '').trim().toLowerCase()
    );
  }, [selectedEquipamento, todasManutencoes]);

  const handleSelectEquipamento = (equipamento: Producao) => {
    setSelectedEquipamento(equipamento);
    const OMs = todasManutencoes.filter(
      (m) => (m.numeroSerie || '').trim().toLowerCase() === (equipamento.numeroSerie || '').trim().toLowerCase()
    );
    if (OMs.length > 0) {
      setSelectedOm(OMs[0]);
    } else {
      setSelectedOm(null);
    }
    setActiveTab('geral');
  };

  const handleCloseDrawer = () => {
    setSelectedEquipamento(null);
    setSelectedOm(null);
  };

  if (loadingProducoes || loadingManutencoes) {
    return <div className="equipamentos-loading">Carregando lista de equipamentos...</div>;
  }

  if (errorProducoes) {
    return <div className="equipamentos-error">Erro ao carregar equipamentos: {errorProducoes}</div>;
  }

  return (
    <main className="equipamentos-page">
      <header className="equipamentos-header">
        <div>
          <h2>Lista de Equipamentos</h2>
          <p>Consulte todos os equipamentos cadastrados no sistema pelo seu número de série único.</p>
        </div>
      </header>

      <section className="equipamentos-filters-card">
        <div className="equipamentos-filters-grid">
          <div className="equipamentos-filter-item">
            <label htmlFor="buscaSerie">Número de Série</label>
            <input
              id="buscaSerie"
              type="text"
              placeholder="Buscar por série..."
              value={buscaSerie}
              onChange={(e) => setBuscaSerie(e.target.value)}
            />
          </div>

          <div className="equipamentos-filter-item">
            <label htmlFor="buscaModelo">Modelo</label>
            <input
              id="buscaModelo"
              type="text"
              placeholder="Buscar por modelo..."
              value={buscaModelo}
              onChange={(e) => setBuscaModelo(e.target.value)}
            />
          </div>

          <div className="equipamentos-filter-item">
            <label htmlFor="buscaTipo">Tipo de Equipamento</label>
            <input
              id="buscaTipo"
              type="text"
              placeholder="Buscar por tipo..."
              value={buscaTipo}
              onChange={(e) => setBuscaTipo(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="equipamentos-table-wrap">
        {equipamentosFiltrados.length === 0 ? (
          <div className="equipamentos-empty">
            Nenhum equipamento encontrado com os filtros informados.
          </div>
        ) : (
          <table className="equipamentos-table">
            <thead>
              <tr>
                <th>Série (Chave Única)</th>
                <th>TAG</th>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Descrição</th>
                <th>Validade</th>
                <th>Última Ordem</th>
              </tr>
            </thead>
            <tbody>
              {equipamentosFiltrados.map((equipamento) => (
                <tr 
                  key={equipamento.numeroSerie}
                  onClick={() => handleSelectEquipamento(equipamento)}
                  className={`equipamentos-row-clickable ${selectedEquipamento?.numeroSerie === equipamento.numeroSerie ? 'row-selected' : ''}`}
                >
                  <td><strong>{equipamento.numeroSerie}</strong></td>
                  <td>{equipamento.tag || '-'}</td>
                  <td>{equipamento.tipoEquipamentoNome || '-'}</td>
                  <td>{equipamento.modelo || '-'}</td>
                  <td>{equipamento.descricao || '-'}</td>
                  <td>{formatDatePtBr(equipamento.validade) || '-'}</td>
                  <td>{equipamento.numeroOrdem || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Drawer lateral de histórico e OMs */}
      {selectedEquipamento && (
        <div className="equipamentos-drawer-backdrop" onClick={handleCloseDrawer}>
          <div className="equipamentos-drawer" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-header">
              <div className="drawer-title-area">
                <h3>Histórico: {selectedEquipamento.numeroSerie}</h3>
                <span className="drawer-subtitle">{selectedEquipamento.modelo || 'Sem Modelo'} - {selectedEquipamento.tipoEquipamentoNome || 'Sem Tipo'}</span>
              </div>
              <button className="drawer-close-btn" onClick={handleCloseDrawer} aria-label="Fechar painel">&times;</button>
            </header>

            <div className="drawer-body">
              {/* Lista de OMs do lado esquerdo (ou em cima no mobile) */}
              <div className="drawer-om-list-section">
                <h4>Ordens de Manutenção ({omsDoEquipamento.length})</h4>
                {omsDoEquipamento.length === 0 ? (
                  <p className="no-oms-msg">Nenhuma OM cadastrada para este equipamento.</p>
                ) : (
                  <ul className="drawer-om-list">
                    {omsDoEquipamento.map((om) => (
                      <li 
                        key={om.id} 
                        className={`drawer-om-item ${selectedOm?.id === om.id ? 'active' : ''}`}
                        onClick={() => setSelectedOm(om)}
                      >
                        <div className="om-item-header">
                          <span className="om-number">OM: {om.numeroOrdemManutencao || 'N/A'}</span>
                          <span className={`status-badge status-${om.statusManutencao?.toLowerCase()}`}>
                            {STATUS_LABELS[om.statusManutencao] || om.statusManutencao}
                          </span>
                        </div>
                        <div className="om-item-details">
                          <span>Tipo: {TIPO_MANUTENCAO_LABELS[om.tipoManutencao] || om.tipoManutencao}</span>
                          <span>Início: {formatDatePtBr(om.dataInicio)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Detalhes da OM selecionada do lado direito */}
              <div className="drawer-om-detail-section">
                {selectedOm ? (
                  <div className="om-detail-container">
                    <div className="om-detail-tabs">
                      <button 
                        className={`tab-btn ${activeTab === 'geral' ? 'active' : ''}`}
                        onClick={() => setActiveTab('geral')}
                      >
                        Geral
                      </button>
                      <button 
                        className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('checklist')}
                      >
                        Checklist
                      </button>
                      <button 
                        className={`tab-btn ${activeTab === 'observacoes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('observacoes')}
                      >
                        Observações ({selectedOm.observacoesHistorico?.length || 0})
                      </button>
                    </div>

                    <div className="om-tab-content">
                      {activeTab === 'geral' && (
                        <div className="om-info-grid">
                          <div className="info-card">
                            <span className="info-label">Número da OM:</span>
                            <span className="info-value">{selectedOm.numeroOrdemManutencao || 'Não informado'}</span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Status da Manutenção:</span>
                            <span className={`status-badge status-${selectedOm.statusManutencao?.toLowerCase()}`}>
                              {STATUS_LABELS[selectedOm.statusManutencao] || selectedOm.statusManutencao}
                            </span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Tipo de Manutenção:</span>
                            <span className="info-value">{TIPO_MANUTENCAO_LABELS[selectedOm.tipoManutencao] || selectedOm.tipoManutencao}</span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Responsável:</span>
                            <span className="info-value">{selectedOm.responsavel || '-'}</span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Data de Início:</span>
                            <span className="info-value">{formatDatePtBr(selectedOm.dataInicio) || '-'}</span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Previsão de Término:</span>
                            <span className="info-value">{formatDatePtBr(selectedOm.previsaoTermino) || '-'}</span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Data de Término:</span>
                            <span className="info-value">{formatDatePtBr(selectedOm.dataTermino) || '-'}</span>
                          </div>
                          <div className="info-card">
                            <span className="info-label">Local / Destino:</span>
                            <span className="info-value">{selectedOm.destino || '-'}</span>
                          </div>
                          <div className="info-card info-card-full">
                            <span className="info-label">Avaliação Final:</span>
                            <span className={`eval-badge eval-${selectedOm.avaliacaoFinal?.toLowerCase().replace(' ', '-')}`}>
                              {selectedOm.avaliacaoFinal || 'Pendente'}
                            </span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'checklist' && (
                        <div className="om-checklist-container">
                          <div className="checklist-sections-nav">
                            <select 
                              value={activeSecaoChecklist} 
                              onChange={(e) => setActiveSecaoChecklist(e.target.value)}
                              className="checklist-section-select"
                            >
                              {SECOES_CHECKLIST.map((secao) => (
                                <option key={secao.key} value={secao.key}>
                                  {secao.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="checklist-items-list">
                            {(() => {
                              const itens = selectedOm[activeSecaoChecklist as keyof InspecaoManutencao] as ItemInspecao[];
                              if (!itens || itens.length === 0) {
                                return <p className="no-items-msg">Nenhum item registrado nesta seção.</p>;
                              }
                              return (
                                <table className="checklist-table">
                                  <thead>
                                    <tr>
                                      <th>Item</th>
                                      <th>Resposta</th>
                                      <th>Observações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {itens.map((item) => (
                                      <tr key={item.id}>
                                        <td className="item-title">{item.titulo}</td>
                                        <td>
                                          <span className={`answer-badge answer-${item.resposta?.toLowerCase().replace('/', '')}`}>
                                            {item.resposta || 'Não Resp.'}
                                          </span>
                                        </td>
                                        <td className="item-obs">{item.observacoes || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {activeTab === 'observacoes' && (
                        <div className="om-observations-container">
                          {selectedOm.observacoes && (
                            <div className="om-current-obs">
                              <h5>Diagnóstico Geral:</h5>
                              <p className="obs-text">{selectedOm.observacoes}</p>
                            </div>
                          )}

                          <h5>Histórico de Observações Diárias:</h5>
                          {!selectedOm.observacoesHistorico || selectedOm.observacoesHistorico.length === 0 ? (
                            <p className="no-obs-msg">Nenhuma observação diária registrada.</p>
                          ) : (
                            <div className="obs-history-timeline">
                              {selectedOm.observacoesHistorico.map((obs, idx) => (
                                <div key={obs.id || idx} className="timeline-item">
                                  <div className="timeline-meta">
                                    <span className="timeline-date">{formatDatePtBr(obs.data)}</span>
                                  </div>
                                  <div className="timeline-content">
                                    <p>{obs.texto}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="no-om-selected">
                    <p>Selecione uma ordem de manutenção para visualizar os detalhes.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ListaEquipamentos;