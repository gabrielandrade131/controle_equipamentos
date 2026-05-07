import React, { useState } from 'react';
import { FormularioInspecaoNovo } from '../components/FormularioInspecaoNovo';
import { PdfExporterInspecao } from '../components/PdfExporterInspecao';
import { useInspecoes } from '../hooks/useInspecoes';
import { InspecaoMontagem } from '../types/inspecao';
import '../pages/Producao.css';

interface SelectedInspecao {
  id: string;
  data: InspecaoMontagem;
}

const getResultadoColor = (resultado?: string) => {
  if (resultado === 'APROVADO') return '#4caf50';
  if (resultado === 'REPROVADO') return '#f44336';
  return '#666';
};

const InspecaoMontagemPage: React.FC = () => {
  const { inspecoes, loading, atualizarInspecao } = useInspecoes();
  const [selected, setSelected] = useState<SelectedInspecao | null>(null);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSelectInspecao = (inspecao: InspecaoMontagem) => {
    setSelected({
      id: inspecao.id || '',
      data: inspecao,
    });
    setEditando(false);
  };

  const handleSalvarInspecao = async (inspecaoAtualizada: InspecaoMontagem) => {
    if (!selected?.id) return;

    try {
      setSalvando(true);
      await atualizarInspecao(selected.id, inspecaoAtualizada);
      setSelected({
        id: selected.id,
        data: {
          ...inspecaoAtualizada,
          id: selected.id,
        },
      });
      setEditando(false);
      alert('Inspecao de montagem salva com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar inspecao de montagem.');
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

  if (editando && selected) {
    return (
      <div className="container">
        <FormularioInspecaoNovo
          key={selected.id}
          inspecaoInicial={selected.data}
          titulo={`Inspecao de montagem - ${selected.data.numeroSerie || selected.data.modelo}`}
          onSubmit={handleSalvarInspecao}
          onCancel={() => setEditando(false)}
        />
        {salvando && <p>Salvando...</p>}
      </div>
    );
  }

  return (
    <div className="producao-page">
      <h2>Inspecao de Montagem</h2>

      <div className="page-content">
        <div className="page-list-section">
          <h3>Producoes ({inspecoes.length})</h3>
          {inspecoes.length === 0 ? (
            <p>Nenhuma producao encontrada</p>
          ) : (
            <ul className="page-list">
              {inspecoes.map((inspecao) => (
                <li
                  key={inspecao.id}
                  className={selected?.id === inspecao.id ? 'active' : ''}
                  onClick={() => handleSelectInspecao(inspecao)}
                >
                  <strong>{inspecao.numeroSerie || 'Sem serie'}</strong>
                  <small>{inspecao.modelo || 'Sem modelo'}</small>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="page-detail-section">
          {selected ? (
            <div className="inspecao-detail">
              <h3>Inspecao vinculada a producao</h3>
              <div className="page-detail-grid">
                <div className="detail-item">
                  <label>Numero de serie:</label>
                  <p>{selected.data.numeroSerie || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Modelo:</label>
                  <p>{selected.data.modelo || '-'}</p>
                </div>
                <div className="detail-item">
                  <label>Data da inspecao:</label>
                  <p>{selected.data.data}</p>
                </div>
                <div className="detail-item">
                  <label>Resultado:</label>
                  <p>
                    <strong style={{ color: getResultadoColor(selected.data.resultadoFinal) }}>
                      {selected.data.resultadoFinal || 'Nao preenchida'}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="page-toolbar" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setEditando(true)}
                >
                  Preencher inspecao
                </button>
                <PdfExporterInspecao inspecao={selected.data} />
              </div>
            </div>
          ) : (
            <div className="page-detail-section">
              <p>Selecione uma producao para preencher a inspecao de montagem</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspecaoMontagemPage;
