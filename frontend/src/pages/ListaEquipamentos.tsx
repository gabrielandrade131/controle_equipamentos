import React from 'react';
import { useProducoes } from '../hooks/useProducoes';
import { Producao } from '../types/producao';

const ListaEquipamentos: React.FC = () => {
  const { producoes, loading, error } = useProducoes();

  if (loading) {
    return <div style={{ padding: '20px' }}>Carregando equipamentos...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Erro: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Lista de Equipamentos</h2>

      {producoes.length === 0 ? (
        <p>Nenhum equipamento encontrado</p>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Número Ordem</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Série</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Modelo</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Data Solicitação</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {producoes.map((producao: Producao) => (
              <tr key={producao.id}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{producao.numeroOrdem}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{producao.numeroSerie}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{producao.modelo}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{producao.dataSolicitacao}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{producao.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListaEquipamentos;