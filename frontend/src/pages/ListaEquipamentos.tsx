import React, { useMemo, useState } from 'react';
import { useProducoes } from '../hooks/useProducoes';
import { Producao } from '../types/producao';
import { formatDatePtBr } from '../utils/date';
import './ListaEquipamentos.css';

const ListaEquipamentos: React.FC = () => {
  const { producoes, loading, error } = useProducoes();
  const [buscaSerie, setBuscaSerie] = useState('');
  const [buscaModelo, setBuscaModelo] = useState('');
  const [buscaTipo, setBuscaTipo] = useState('');

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

  if (loading) {
    return <div className="equipamentos-loading">Carregando lista de equipamentos...</div>;
  }

  if (error) {
    return <div className="equipamentos-error">Erro ao carregar equipamentos: {error}</div>;
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
                <tr key={equipamento.numeroSerie}>
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
    </main>
  );
};

export default ListaEquipamentos;