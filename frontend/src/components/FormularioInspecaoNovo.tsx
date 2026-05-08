import React, { useState } from 'react';
import { InspecaoMontagem, CreateInspecaoMontageDto } from '../types/inspecao';
import { criarFormularioInspecaoMontagemVazio } from '../constants/inspecaoMontagem';
import './FormularioInspecao.css';

interface FormularioInspecaoProps {
  onSubmit: (inspecao: InspecaoMontagem) => void;
  onCancel: () => void;
  inspecaoInicial?: InspecaoMontagem;
  titulo?: string;
}

export const FormularioInspecaoNovo: React.FC<FormularioInspecaoProps> = ({
  onSubmit,
  onCancel,
  inspecaoInicial,
  titulo = 'Inspecao de Montagem',
}) => {
  const formularioPadrao = criarFormularioInspecaoMontagemVazio();

  const [formData, setFormData] = useState<CreateInspecaoMontageDto>(() => ({
    ...criarFormularioInspecaoMontagemVazio(),
    ...inspecaoInicial,
  }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerificacaoChange = (
    secao: 'instrumentosAferição' | 'verificacoesGeraisPremontagem' | 'verificacaoPosmontagem',
    id: string,
    field: 'conformidade' | 'valorObservado' | 'instrumentoMedicao',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [secao]: prev[secao].map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleVerificacaoChangePorIndice = (
    secao: 'verificacoesGeraisPremontagem' | 'verificacaoPosmontagem',
    itemIndex: number,
    field: 'conformidade' | 'valorObservado' | 'instrumentoMedicao',
    value: string
  ) => {
    setFormData((prev) => {
      const itens = [...prev[secao]];
      const itemAtual = itens[itemIndex] ?? formularioPadrao[secao][itemIndex];

      if (!itemAtual) {
        return prev;
      }

      itens[itemIndex] = { ...itemAtual, [field]: value };

      return {
        ...prev,
        [secao]: itens,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numeroSerie.trim() || !formData.modelo.trim()) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const novaInspecao: InspecaoMontagem = {
      ...formData,
      id: inspecaoInicial?.id || String(Date.now()),
      createdAt: inspecaoInicial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(novaInspecao);
  };

  const linhasPremontagem = [
    {
      itemIndex: 0,
      titulo: 'Check dos Itens dos Seriados',
      detalhes: ['(Números de série do motor, caixa elétrica e plug conferem com Ordem Produção?)'],
      instrumentoMedicao: 'AVALIAÇÃO VISUAL',
    },
    {
      itemIndex: 1,
      titulo: 'Análise Dimensional da Carcaça',
      detalhes: [
        'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
        'Resultado Esperado: Modelo CSEX420AC entre 415 e 430mm',
        'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
        'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
      ],
      instrumentoMedicao: 'TRENA / Nº Série',
    },
    {
      itemIndex: 6,
      titulo: 'Teste de Aterramento do Motor',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoMedicao: 'MEGÔMETRO / Nº Série',
    },
    {
      itemIndex: 7,
      titulo: 'Teste de Isolação do Motor',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoMedicao: 'MULTÍMETRO ( ) / MEGÔMETRO ( ) / Nº Série',
    },
    {
      itemIndex: 8,
      titulo: 'Aplicação e aferição de Torque do Motor',
      detalhes: ['Resultado Esperado para rosca M4: 1,5'],
      instrumentoMedicao: 'TORQUÍMETRO / Nº Série',
    },
    {
      itemIndex: 9,
      titulo: 'Aplicação e aferição de Torque do motor',
      detalhes: ['Resultado Esperado para rosca M5: 2'],
      instrumentoMedicao: 'TORQUÍMETRO / Nº Série',
    },
    {
      itemIndex: 10,
      titulo: 'Aplicação e aferição de Torque (botoeira)',
      detalhes: ['Resultado esperado: 2Nm'],
      instrumentoMedicao: 'TORQUÍMETRO / Nº Série',
    },
    {
      itemIndex: 11,
      titulo: 'Teste de Funcionamento do Motor',
      detalhes: ['Inspeção visual do estado de funcionamento do equipamento'],
      instrumentoMedicao: 'AMPERÍMETRO / Nº Série',
    },
    {
      itemIndex: 12,
      titulo: 'Teste de Rotação do Motor',
      detalhes: [
        'Resultado Esperado: Modelo CSEX420RM 3.390 rpm, com tolerância de -150 rpm',
        'Resultado Esperado: Modelo CSEX420AC 3.600 rpm, com tolerância de -150 rpm',
        'Resultado Esperado: Modelo CSEX550AC 1.800 rpm, com tolerância de -150 rpm',
        'Resultado Esperado: Modelo CSEX550SS 1.800 rpm, com tolerância de -150 rpm',
      ],
      instrumentoMedicao: 'TACÔMETRO / Nº Série',
    },
  ] as const;

  const linhasPosmontagem = [
    {
      itemIndex: 0,
      titulo: 'Teste de Aterramento',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoMedicao: 'MULTÍMETRO ( ) / MEGÔMETRO ( ) / Nº Série',
    },
    {
      itemIndex: 1,
      titulo: 'Teste de Isolação',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoMedicao: 'MEGÔMETRO / Nº Série',
    },
    {
      itemIndex: 2,
      titulo: 'Teste de Funcionamento',
      detalhes: ['Inspeção visual de estado de funcionamento do equipamento'],
      instrumentoMedicao: 'AMPERÍMETRO / Nº Série',
    },
    {
      itemIndex: 3,
      titulo: 'Teste de Rotação',
      detalhes: [
        'Resultado Esperado: Modelo CSEX420RM 3.390 rpm, com tolerância de -150 rpm',
        'Resultado Esperado: Modelo CSEX420AC 3.600 rpm, com tolerância de -150 rpm',
        'Resultado Esperado: Modelo CSEX550AC 1.800 rpm, com tolerância de -150 rpm',
        'Resultado Esperado: Modelo CSEX550SS 1.800 rpm, com tolerância de -150 rpm',
      ],
      instrumentoMedicao: 'TACÔMETRO / Nº Série',
    },
    {
      itemIndex: 7,
      titulo: 'Teste de Temperatura',
      detalhes: ['Range: 30 a 40 graus celsius'],
      instrumentoMedicao: 'TERMÔMETRO LASER / Nº Série',
    },
    {
      itemIndex: 8,
      titulo: 'Teste de Decibéis',
      detalhes: [
        'Resultado Esperado: Modelo CSEX420RM ou T <= 96.2 SPL(A) dB',
        'Resultado Esperado: Modelo CSEX420AC ou T <= 97 SPL(A) dB',
        'Resultado Esperado: Modelo CSEX550AC ou T <= 89 SPL(A) dB',
        'Resultado Esperado: Modelo CSEX550SS ou T <= 89 SPL(A) dB',
      ],
      instrumentoMedicao: 'DECIBELÍMETRO / Nº Série',
    },
    {
      itemIndex: 12,
      titulo: 'Teste de Continuidade',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoMedicao: 'MULTÍMETRO / Nº Série',
    },
  ] as const;

  const renderSecaoVerificacoes = (
    titulo: string,
    secao: 'instrumentosAferição' | 'verificacoesGeraisPremontagem' | 'verificacaoPosmontagem',
    mostrarCampos: boolean
  ) => (
    <div className="form-section">
      <h3>{titulo}</h3>
      <table className="verificacoes-table">
        <thead>
          <tr>
            <th>Item</th>
            {mostrarCampos && <th>Valor Observado</th>}
            {mostrarCampos && <th>Instrumento de Medição</th>}
            <th>Conformidades</th>
          </tr>
        </thead>
        <tbody>
          {formData[secao].map((item) => {
            const isSection = item.nome.startsWith('@SECTION:');
            if (isSection) {
              const sectionTitle = item.nome.replace('@SECTION:', '');
              return (
                <tr key={item.id} className="verificacoes-section-row">
                  <td colSpan={mostrarCampos ? 4 : 2} className="verificacoes-section-cell">
                    {sectionTitle}
                  </td>
                </tr>
              );
            }
            return (
              <tr key={item.id}>
                <td>{item.nome}</td>
                {mostrarCampos && (
                  <td>
                    <input
                      type="text"
                      value={item.valorObservado || ''}
                      onChange={(e) =>
                        handleVerificacaoChange(secao, item.id, 'valorObservado', e.target.value)
                      }
                      placeholder="Ex: 150mm"
                    />
                  </td>
                )}
                {mostrarCampos && (
                  <td>
                    <input
                      type="text"
                      value={item.instrumentoMedicao || ''}
                      onChange={(e) =>
                        handleVerificacaoChange(secao, item.id, 'instrumentoMedicao', e.target.value)
                      }
                      
                    />
                  </td>
                )}
                <td>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="radio"
                        name={`conf-${item.id}`}
                        value="SIM"
                        checked={item.conformidade === 'SIM'}
                        onChange={(e) =>
                          handleVerificacaoChange(secao, item.id, 'conformidade', e.target.value)
                        }
                      />
                      SIM
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`conf-${item.id}`}
                        value="NÃO"
                        checked={item.conformidade === 'NÃO'}
                        onChange={(e) =>
                          handleVerificacaoChange(secao, item.id, 'conformidade', e.target.value)
                        }
                      />
                      NÃO
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderSecaoVerificacoesPremontagem = () => (
    <div className="form-section">
      <h3>Verificações Gerais Pré Montagem</h3>
      <table className="verificacoes-table verificacoes-table-premontagem">
        <thead>
          <tr>
            <th>Item</th>
            <th>Valor Observado</th>
            <th>Instrumento de Medição</th>
            <th>Conformidades</th>
          </tr>
        </thead>
        <tbody>
          {linhasPremontagem.map((linha) => {
            const item = formData.verificacoesGeraisPremontagem[linha.itemIndex] ?? formularioPadrao.verificacoesGeraisPremontagem[linha.itemIndex];

            return (
              <tr key={`premontagem-${linha.itemIndex}`}>
                <td className="verificacoes-pm-item">
                  <span className="verificacoes-pm-titulo">{linha.titulo}</span>
                  {linha.detalhes.map((detalhe) => (
                    <span key={detalhe} className="verificacoes-pm-detalhe">
                      {detalhe}
                    </span>
                  ))}
                </td>
                <td>
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={item.valorObservado || ''}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'valorObservado', e.target.value)
                    }
                    title="Valor observado"
                    placeholder="Valor observado"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={item.instrumentoMedicao || ''}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'instrumentoMedicao', e.target.value)
                    }
                    title="Instrumento de medição"
                    
                  />
                </td>
                <td>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="radio"
                        name={`conf-premontagem-${linha.itemIndex}`}
                        value="SIM"
                        checked={item.conformidade === 'SIM'}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      SIM
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`conf-premontagem-${linha.itemIndex}`}
                        value="NÃO"
                        checked={item.conformidade === 'NÃO'}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      NÃO
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderSecaoVerificacoesPosmontagem = () => (
    <div className="form-section">
      <h3>Verificações Gerais Pós Montagem</h3>
      <table className="verificacoes-table verificacoes-table-posmontagem">
        <thead>
          <tr>
            <th>Item</th>
            <th>Valor Observado</th>
            <th>Instrumento de Medição</th>
            <th>Conformidades</th>
          </tr>
        </thead>
        <tbody>
          {linhasPosmontagem.map((linha) => {
            const item = formData.verificacaoPosmontagem[linha.itemIndex] ?? formularioPadrao.verificacaoPosmontagem[linha.itemIndex];

            return (
              <tr key={`posmontagem-${linha.itemIndex}`}>
                <td className="verificacoes-pm-item">
                  <span className="verificacoes-pm-titulo">{linha.titulo}</span>
                  {linha.detalhes.map((detalhe) => (
                    <span key={detalhe} className="verificacoes-pm-detalhe">
                      {detalhe}
                    </span>
                  ))}
                </td>
                <td>
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={item.valorObservado || ''}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'valorObservado', e.target.value)
                    }
                    title="Valor observado"
                    placeholder="Valor observado"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={item.instrumentoMedicao || ''}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'instrumentoMedicao', e.target.value)
                    }
                    title="Instrumento de medição"
                    
                  />
                </td>
                <td>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="radio"
                        name={`conf-posmontagem-${linha.itemIndex}`}
                        value="SIM"
                        checked={item.conformidade === 'SIM'}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      SIM
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`conf-posmontagem-${linha.itemIndex}`}
                        value="NÃO"
                        checked={item.conformidade === 'NÃO'}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      NÃO
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="formulario-inspecao">
      <h2>{titulo}</h2>

      <div className="form-section">
        <h3>Descrição</h3>
        <div className="form-group">
          <label htmlFor="numeroSerie">Número de Série:</label>
          <input
            type="text"
            id="numeroSerie"
            name="numeroSerie"
            value={formData.numeroSerie}
            onChange={handleInputChange}
            placeholder="Ex: CSEX420ACM-0559"
            required
            readOnly={Boolean(inspecaoInicial)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="modelo">Modelo:</label>
          <input
            type="text"
            id="modelo"
            name="modelo"
            value={formData.modelo}
            onChange={handleInputChange}
            placeholder="Ex: CSEX420ACM"
            required
            readOnly={Boolean(inspecaoInicial)}
          />
        </div>
      </div>

      {renderSecaoVerificacoes(
        'Verificações nos Instrumentos de Aferição',
        'instrumentosAferição',
        false
      )}

      {renderSecaoVerificacoesPremontagem()}

      {renderSecaoVerificacoesPosmontagem()}

      <div className="form-section">
        <h3>Assinatura</h3>
        <div className="form-group">
          <label htmlFor="responsavel">Responsável:</label>
          <input
            type="text"
            id="responsavel"
            name="responsavel"
            value={formData.responsavel}
            onChange={handleInputChange}
            placeholder="Nome do responsável"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="data">Data:</label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nomeAssinante">Nome (Assinante):</label>
          <input
            type="text"
            id="nomeAssinante"
            name="nomeAssinante"
            value={formData.nomeAssinante || ''}
            onChange={handleInputChange}
            placeholder="Nome de quem assina o documento"
          />
        </div>
        <div className="form-group">
          <label htmlFor="aprovado">Aprovado:</label>
          <div className="checkbox-group">
            <label>
              <input
                type="radio"
                name="aprovado"
                value="true"
                checked={formData.aprovado === true}
                onChange={() =>
                  setFormData({ ...formData, aprovado: true })
                }
              />
              SIM
            </label>
            <label>
              <input
                type="radio"
                name="aprovado"
                value="false"
                checked={formData.aprovado === false}
                onChange={() =>
                  setFormData({ ...formData, aprovado: false })
                }
              />
              NÃO
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-salvar">
          Salvar Inspeção
        </button>
        <button type="button" onClick={onCancel} className="btn-cancelar">
          Cancelar
        </button>
      </div>
    </form>
  );
};
