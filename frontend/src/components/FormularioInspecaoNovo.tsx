import React, { useState } from 'react';
import { InspecaoMontagem, CreateInspecaoMontageDto } from '../types/inspecao';
import './FormularioInspecao.css';

interface FormularioInspecaoProps {
  onSubmit: (inspecao: InspecaoMontagem) => void;
  onCancel: () => void;
}

// Itens FIXOS conforme a imagem FOR-MAN-005 - LEITURA EXATA
const INSTRUMENTOS_AFERIÇÃO = [
  '(Micrômetro, Multímetro, Paquímetro, Decibalímetro, Anemômetro e Alicate Amperímetro)',
  '(Micrômetro, Multímetro, Paquímetro, Decibalímetro, Anemômetro e Alicate Amperímetro)'
];

const VERIFICACAO_PREMONTAGEM = [
  'Chuva (tem que estar seco)',
  'Óleo (tem que estar com óleo certificado e sem partículas)',
  'Vazamentos (Não deve ocorrer Produto(i))',
  'Aperto (tem que estar com as junções apertadas)',
  'Conexões',
  'Limpeza'
];

const ANALISE_DIMENSIONAL = [
  'Medida Específica: Modelo CEEX240ACM entre 63 x 63 mm',
  'Resultado: Modelo CEEX240ACM entre 63 x 63 mm'
];

const TESTES = [
  'Teste de Afastamento do Motor',
  'Teste de Isolamento',
  'Teste de Funcionamento do Motor',
  'Teste de Rotação do Motor',
  'Aplicação e Aferição de Torque (Correia)',
  'Aplicação e Aferição de Torque (Ventilador)',
  'Aplicação e Aferição de Torque (Botoeira)',
  'Teste de Funcionamento da Motor',
  'Teste de Rotação do Motor',
  'Teste de Continuidade'
];

const VERIFICACAO_POSMONTAGEM = [
  'Teste de Isolamento',
  'Teste de Funcionamento',
  'Teste de Rotação',
  'Teste de Continuidade da Motor',
  'Teste de Dacímetro',
  'Teste de Continuidade'
];

export const FormularioInspecaoNovo: React.FC<FormularioInspecaoProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateInspecaoMontageDto>({
    numeroSerie: '',
    dataInspecao: new Date().toISOString().split('T')[0],
    modelo: '',
    // Inicializar itens fixos vazios
    instrumentosAferição: INSTRUMENTOS_AFERIÇÃO.map((nome, i) => ({
      id: `inst-${i}`,
      nome,
      conformidade: ''
    })),
    verificacaoPremontagem: VERIFICACAO_PREMONTAGEM.map((nome, i) => ({
      id: `prem-${i}`,
      nome,
      valorObservado: '',
      instrumentoMedicao: '',
      conformidade: ''
    })),
    analiseDimensional: ANALISE_DIMENSIONAL.map((nome, i) => ({
      id: `dim-${i}`,
      nome,
      valorObservado: '',
      instrumentoMedicao: '',
      conformidade: ''
    })),
    testes: TESTES.map((nome, i) => ({
      id: `test-${i}`,
      nome,
      valorObservado: '',
      instrumentoMedicao: '',
      conformidade: ''
    })),
    verificacaoPosmontagem: VERIFICACAO_POSMONTAGEM.map((nome, i) => ({
      id: `pos-${i}`,
      nome,
      valorObservado: '',
      instrumentoMedicao: '',
      conformidade: ''
    })),
    resultadoFinal: '',
    observacoes: '',
    responsavel: '',
    data: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerificacaoChange = (
    secao: 'instrumentosAferição' | 'verificacaoPremontagem' | 'analiseDimensional' | 'testes' | 'verificacaoPosmontagem',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.numeroSerie.trim() || !formData.modelo.trim() || !formData.responsavel.trim()) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const novaInspecao: InspecaoMontagem = {
      ...formData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(novaInspecao);
  };

  const renderSecaoVerificacoes = (
    titulo: string,
    secao: 'instrumentosAferição' | 'verificacaoPremontagem' | 'analiseDimensional' | 'testes' | 'verificacaoPosmontagem',
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
          {formData[secao].map((item) => (
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
                    placeholder="Ex: Paquímetro"
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
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="formulario-inspecao">
      <h2>Nova Inspeção de Montagem</h2>

      {/* DESCRIÇÃO */}
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
          />
        </div>
      </div>

      {/* VERIFICAÇÕES NOS INSTRUMENTOS DE AFEIÇÃO */}
      {renderSecaoVerificacoes(
        'Verificações nos Instrumentos de Afeição',
        'instrumentosAferição',
        false
      )}

      {/* VERIFICAÇÃO GERAL PRÉ MONTAGEM */}
      {renderSecaoVerificacoes(
        'Verificação Geral Pré Montagem',
        'verificacaoPremontagem',
        true
      )}

      {/* ANÁLISE DIMENSIONAL DE CARCAÇA */}
      {renderSecaoVerificacoes(
        'Análise Dimensional de Carcaça',
        'analiseDimensional',
        true
      )}

      {/* TESTES */}
      {renderSecaoVerificacoes(
        'Testes',
        'testes',
        true
      )}

      {/* VERIFICAÇÕES GERAIS PÓS MONTAGEM */}
      {renderSecaoVerificacoes(
        'Verificações Gerais Pós Montagem',
        'verificacaoPosmontagem',
        true
      )}

      {/* RESULTADO DE INSPEÇÃO */}
      <div className="form-section">
        <h3>Resultado de Inspeção</h3>
        
        <div className="form-group">
          <label htmlFor="resultadoFinal">Resultado Final:</label>
          <div className="checkbox-group">
            <label>
              <input
                type="radio"
                name="resultadoFinal"
                value="APROVADO"
                checked={formData.resultadoFinal === 'APROVADO'}
                onChange={(e) =>
                  setFormData({ ...formData, resultadoFinal: e.target.value as 'APROVADO' | 'REPROVADO' })
                }
              />
              APROVADO
            </label>
            <label>
              <input
                type="radio"
                name="resultadoFinal"
                value="REPROVADO"
                checked={formData.resultadoFinal === 'REPROVADO'}
                onChange={(e) =>
                  setFormData({ ...formData, resultadoFinal: e.target.value as 'APROVADO' | 'REPROVADO' })
                }
              />
              REPROVADO
            </label>
          </div>
        </div>
      </div>

      {/* OBSERVAÇÕES */}
      <div className="form-section">
        <h3>Observações Adicionais</h3>
        
        <div className="form-group">
          <textarea
            name="observacoes"
            value={formData.observacoes}
            onChange={handleInputChange}
            placeholder="Observações adicionais"
            rows={3}
          />
        </div>
      </div>

      {/* ASSINATURA */}
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
