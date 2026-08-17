import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducoes } from '../hooks/useProducoes';
import { useManutencao } from '../hooks/useManutencao';
import { formatDatePtBr } from '../utils/date';
import './ListaEquipamentos.css';

interface EquipamentoItem {
  numeroSerie: string;
  tag: string;
  tipoEquipamentoNome: string;
  modelo: string;
  descricao: string;
  validade: string;
  numeroOrdem: string | number;
}

const ListaEquipamentos: React.FC = () => {
  const navigate = useNavigate();
  const { producoes, loading: loadingProducoes, error: errorProducoes } = useProducoes();
  const { historico: manutencoes, loading: loadingManutencoes, error: errorManutencoes } = useManutencao();

  const [buscaSerie, setBuscaSerie] = useState('');
  const [buscaTag, setBuscaTag] = useState('');
  const [buscaModelo, setBuscaModelo] = useState('');
  const [buscaTipo, setBuscaTipo] = useState('');
  const [buscaTag, setBuscaTag] = useState('');

  // Agrupa os equipamentos pelo número de série para garantir chave única, combinando Produção e Manutenção
  const equipamentosUnicos = useMemo(() => {
    const map = new Map<string, EquipamentoItem>();
    
    // Insere os equipamentos vindos da produção
    producoes.forEach((p) => {
      const serie = (p.numeroSerie || '').trim();
      if (serie && !map.has(serie)) {
        map.set(serie, {
          numeroSerie: serie,
          tag: p.tag || '',
          tipoEquipamentoNome: p.tipoEquipamentoNome || '',
          modelo: p.modelo || '',
          descricao: p.descricao || '',
          validade: p.validade || '',
          numeroOrdem: p.numeroOrdem || '',
        });
      }
    });

    // Insere/mescla os equipamentos vindos da manutenção
    manutencoes.forEach((m) => {
      const serie = (m.numeroSerie || '').trim();
      if (serie) {
        const itemExistente = map.get(serie);
        if (!itemExistente) {
          map.set(serie, {
            numeroSerie: serie,
            tag: m.tag || '',
            tipoEquipamentoNome: m.tipoEquipamento || '',
            modelo: m.modelo || '',
            descricao: m.observacoes || '',
            validade: m.validade || '',
            numeroOrdem: m.numeroOrdemManutencao || '',
          });
        } else {
          // Preenche campos que estiverem em branco no item de produção
          if (!itemExistente.tag && m.tag) itemExistente.tag = m.tag;
          if (!itemExistente.tipoEquipamentoNome && m.tipoEquipamento) itemExistente.tipoEquipamentoNome = m.tipoEquipamento;
          if (!itemExistente.modelo && m.modelo) itemExistente.modelo = m.modelo;
          if (!itemExistente.validade && m.validade) itemExistente.validade = m.validade;
          if (!itemExistente.numeroOrdem && m.numeroOrdemManutencao) itemExistente.numeroOrdem = m.numeroOrdemManutencao;
        }
      }
    });

    return Array.from(map.values());
  }, [producoes, manutencoes]);

  // Aplica os filtros de busca
  const equipamentosFiltrados = useMemo(() => {
    return equipamentosUnicos.filter((equipamento) => {
      const matchSerie = (equipamento.numeroSerie || '')
        .toLowerCase()
        .includes(buscaSerie.toLowerCase().trim());
      
      const matchTag = (equipamento.tag || '')
        .toLowerCase()
        .includes(buscaTag.toLowerCase().trim());
      
      const matchModelo = (equipamento.modelo || '')
        .toLowerCase()
        .includes(buscaModelo.toLowerCase().trim());

      const matchTipo = (equipamento.tipoEquipamentoNome || '')
        .toLowerCase()
        .includes(buscaTipo.toLowerCase().trim());

<<<<<<< HEAD
      const matchTag = (equipamento.tag || '')
        .toLowerCase()
        .includes(buscaTag.toLowerCase().trim());

      return matchSerie && matchModelo && matchTipo && matchTag;
    });
  }, [equipamentosUnicos, buscaSerie, buscaModelo, buscaTipo, buscaTag]);
=======
      return matchSerie && matchTag && matchModelo && matchTipo;
    });
  }, [equipamentosUnicos, buscaSerie, buscaTag, buscaModelo, buscaTipo]);
>>>>>>> 0911f89f2823337b2ee3c17d59c0367719c3c569

  const handleSelectEquipamento = (equipamento: EquipamentoItem) => {
    // Define o filtro da tela de Manutenção para carregar as OMs do equipamento
    localStorage.setItem('manutencao-filters', JSON.stringify({ numeroSerie: equipamento.numeroSerie }));
    navigate('/manutencao');
  };

  if (loadingProducoes || loadingManutencoes) {
    return <div className="equipamentos-loading">Carregando lista de equipamentos...</div>;
  }

  if (errorProducoes || errorManutencoes) {
    return (
      <div className="equipamentos-error">
        Erro ao carregar equipamentos: {errorProducoes || errorManutencoes}
      </div>
    );
  }

  return (
    <main className="equipamentos-page">
      <header className="equipamentos-header">
        <div>
          <h2>Lista de Equipamentos</h2>
          <p>Consulte todos os equipamentos cadastrados no sistema pelo seu número de série único. Clique em um equipamento para visualizar seu histórico de OMs.</p>
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
            <label htmlFor="buscaTag">TAG</label>
            <input
              id="buscaTag"
              type="text"
              placeholder="Buscar por TAG..."
              value={buscaTag}
              onChange={(e) => setBuscaTag(e.target.value)}
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

          <div className="equipamentos-filter-item">
            <label htmlFor="buscaTag">TAG</label>
            <input
              id="buscaTag"
              type="text"
              placeholder="Buscar por TAG..."
              value={buscaTag}
              onChange={(e) => setBuscaTag(e.target.value)}
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
                <th>Série</th>
                <th>TAG</th>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Descrição</th>
                <th>Validade</th>
              </tr>
            </thead>
            <tbody>
              {equipamentosFiltrados.map((equipamento) => (
                <tr 
                  key={equipamento.numeroSerie}
                  onClick={() => handleSelectEquipamento(equipamento)}
                  className="equipamentos-row-clickable"
                >
                  <td><strong>{equipamento.numeroSerie}</strong></td>
                  <td>{equipamento.tag || '-'}</td>
                  <td>{equipamento.tipoEquipamentoNome || '-'}</td>
                  <td>{equipamento.modelo || '-'}</td>
                  <td>{equipamento.descricao || '-'}</td>
                  <td>{formatDatePtBr(equipamento.validade) || '-'}</td>
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