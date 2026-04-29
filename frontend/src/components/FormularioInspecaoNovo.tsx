import React, { useState } from 'react';
import { InspecaoMontagem, CreateInspecaoMontageDto } from '../types/inspecao';
import './FormularioInspecao.css';

// Dados Mock para testes
const MOCK_INSPECAO_APROVADA: CreateInspecaoMontageDto = {
  numeroSerie: 'CSEX420ACM-0559',
  dataInspecao: '2026-04-24',
  modelo: 'CSEX420ACM',
  instrumentosAferição: [
    {
      id: 'inst-0',
      nome: 'Os Instrumentos encontram-se limpos e em perfeitas condições de uso? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
      conformidade: 'SIM'
    },
    {
      id: 'inst-1',
      nome: 'Os instrumentos encontram-se com seus certificados de calibração em dia? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
      conformidade: 'SIM'
    }
  ],
  verificacoesGeraisPremontagem: [
    {
      id: 'vgpm-0',
      nome: 'Check dos Itens dos Seriados (Números de série do motor, caixa elétrica e plug conferem com Ordem Produção?)',
      valorObservado: 'OK - Conferidos',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-1',
      nome: '@SECTION:Análise Dimensional de Carcaça',
      conformidade: ''
    },
    {
      id: 'vgpm-2',
      nome: 'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
      valorObservado: '420mm',
      instrumentoMedicao: 'Paquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-3',
      nome: 'Resultado Esperado: Modelo CSC3420AC entre 415 e 430mm',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-4',
      nome: 'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-5',
      nome: 'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-6',
      nome: 'Teste de Aterramento do Motor (Resultado Esperado: >=0)',
      valorObservado: '0.2',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-7',
      nome: 'Teste de Isolação do Motor(Resultado Esperado: >=0)',
      valorObservado: '500',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-8',
      nome: 'Aplicação e aferição de Torque do Motor (Resultado esperado para rosca M4: 1,5)',
      valorObservado: '1.5',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-9',
      nome: 'Aplicação e aferição de Torque do motor (Resultado esperado para rosca M5: 2)',
      valorObservado: '2.0',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-10',
      nome: 'Aplicação e aferição de Torque (botoeira) (Resultado esperado: 2Nm)',
      valorObservado: '2.0',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-11',
      nome: 'Teste de Funcionamento do Motor (Inspeção visual de estado de funcionamento do equipamento)',
      valorObservado: 'Motor funcionando normalmente',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-12',
      nome: 'Teste de Rotação do Motor - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
      valorObservado: '3390',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-13',
      nome: 'Teste de Rotação do Motor - Modelo CSEX420AC (3.000 rpm, com tolerância de 150 rpm)',
      valorObservado: '3000',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-14',
      nome: 'Teste de Rotação do Motor - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-15',
      nome: 'Teste de Rotação do Motor - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    }
  ],
  verificacaoPosmontagem: [
    {
      id: 'pos-0',
      nome: 'Teste de Aterramento (Resultado Esperado: >=0)',
      valorObservado: '0.2',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-1',
      nome: 'Teste de Isolação (Resultado Esperado: >=0)',
      valorObservado: '500',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-2',
      nome: 'Teste de Funcionamento (Inspeção visual de estado de funcionamento do equipamento)',
      valorObservado: 'Motor funcionando normalmente',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'SIM'
    },
    {
      id: 'pos-3',
      nome: 'Teste de Rotação - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
      valorObservado: '3390',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-4',
      nome: 'Teste de Rotação - Modelo CSEX42DAC (3.600 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-5',
      nome: 'Teste de Rotação - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-6',
      nome: 'Teste de Rotação - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-7',
      nome: 'Teste de Temperatura (Range: 30 a 40 graus C)',
      valorObservado: '35',
      instrumentoMedicao: 'Termômetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-8',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420RM ou T<=96.2 SPL(a) dB]',
      valorObservado: '95.8',
      instrumentoMedicao: 'Decibelímetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-9',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420AC ou T<=97 SPL(a) dB]',
      valorObservado: '96.5',
      instrumentoMedicao: 'Decibelímetro',
      conformidade: 'SIM'
    },
    {
      id: 'pos-10',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX550AC ou T<=89 SPL(a) dB]',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-11',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX550SS ou T<=89 SPL(a) dB]',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-12',
      nome: 'Teste de Continuidade (Resultado: >=0)',
      valorObservado: '0',
      instrumentoMedicao: 'Multímetro',
      conformidade: 'SIM'
    }
  ],
  resultadoFinal: 'APROVADO',
  responsavel: 'João da Silva',
  data: '2026-04-24'
};

const MOCK_INSPECAO_REPROVADA: CreateInspecaoMontageDto = {
  numeroSerie: 'CSEX550AC-0342',
  dataInspecao: '2026-04-23',
  modelo: 'CSEX550AC',
  instrumentosAferição: [
    {
      id: 'inst-0',
      nome: 'Os Instrumentos encontram-se limpos e em perfeitas condições de uso? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
      conformidade: 'SIM'
    },
    {
      id: 'inst-1',
      nome: 'Os instrumentos encontram-se com seus certificados de calibração em dia? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
      conformidade: 'NÃO'
    }
  ],
  verificacoesGeraisPremontagem: [
    {
      id: 'vgpm-0',
      nome: 'Check dos Itens dos Seriados (Números de série do motor, caixa elétrica e plug conferem com Ordem Produção?)',
      valorObservado: 'Divergência encontrada',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-1',
      nome: '@SECTION:Análise Dimensional de Carcaça',
      conformidade: ''
    },
    {
      id: 'vgpm-2',
      nome: 'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-3',
      nome: 'Resultado Esperado: Modelo CSC3420AC entre 415 e 430mm',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-4',
      nome: 'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
      valorObservado: '555',
      instrumentoMedicao: 'Paquímetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-5',
      nome: 'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-6',
      nome: 'Teste de Aterramento do Motor (Resultado Esperado: >=0)',
      valorObservado: '50',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-7',
      nome: 'Teste de Isolação do Motor(Resultado Esperado: >=0)',
      valorObservado: '100',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-8',
      nome: 'Aplicação e aferição de Torque do Motor (Resultado esperado para rosca M4: 1,5)',
      valorObservado: '1.2',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-9',
      nome: 'Aplicação e aferição de Torque do motor (Resultado esperado para rosca M5: 2)',
      valorObservado: '1.8',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-10',
      nome: 'Aplicação e aferição de Torque (botoeira) (Resultado esperado: 2Nm)',
      valorObservado: '1.5',
      instrumentoMedicao: 'Torquímetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-11',
      nome: 'Teste de Funcionamento do Motor (Inspeção visual de estado de funcionamento do equipamento)',
      valorObservado: 'Motor não funciona',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-12',
      nome: 'Teste de Rotação do Motor - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
      valorObservado: '0',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'vgpm-13',
      nome: 'Teste de Rotação do Motor - Modelo CSEX420AC (3.000 rpm, com tolerância de 150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'vgpm-14',
      nome: 'Teste de Rotação do Motor - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: '1850',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'SIM'
    },
    {
      id: 'vgpm-15',
      nome: 'Teste de Rotação do Motor - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    }
  ],
  verificacaoPosmontagem: [
    {
      id: 'pos-0',
      nome: 'Teste de Aterramento (Resultado Esperado: >=0)',
      valorObservado: 'Sem resposta',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-1',
      nome: 'Teste de Isolação (Resultado Esperado: >=0)',
      valorObservado: 'Sem resposta',
      instrumentoMedicao: 'Megômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-2',
      nome: 'Teste de Funcionamento (Inspeção visual de estado de funcionamento do equipamento)',
      valorObservado: 'Motor não responde',
      instrumentoMedicao: 'Inspeção Visual',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-3',
      nome: 'Teste de Rotação - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
      valorObservado: '0',
      instrumentoMedicao: 'Tacômetro',
      conformidade: 'NÃO'
    },
    {
      id: 'pos-4',
      nome: 'Teste de Rotação - Modelo CSEX42DAC (3.600 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-5',
      nome: 'Teste de Rotação - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-6',
      nome: 'Teste de Rotação - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-7',
      nome: 'Teste de Temperatura (Range: 30 a 40 graus C)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-8',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420RM ou T<=96.2 SPL(a) dB]',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-9',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX420AC ou T<=97 SPL(a) dB]',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-10',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX550AC ou T<=89 SPL(a) dB]',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-11',
      nome: 'Teste de Decibéis (Resultado Esperado: Modelo CSEX550SS ou T<=89 SPL(a) dB]',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    },
    {
      id: 'pos-12',
      nome: 'Teste de Continuidade (Resultado: >=0)',
      valorObservado: 'N/A',
      instrumentoMedicao: '',
      conformidade: ''
    }
  ],
  resultadoFinal: 'REPROVADO',
  responsavel: 'Maria Santos',
  data: '2026-04-23'
};

interface FormularioInspecaoProps {
  onSubmit: (inspecao: InspecaoMontagem) => void;
  onCancel: () => void;
}

// Itens FIXOS conforme FOR-MAN-006 Rev. 5 (Ambipar Response) - LEITURA EXATA
const INSTRUMENTOS_AFERIÇÃO = [
  'Os Instrumentos encontram-se limpos e em perfeitas condições de uso? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)',
  'Os instrumentos encontram-se com seus certificados de calibração em dia? (Megômetro, Multímetro, Torquímetro, Decibelímetro, Anemômetro e Alicate Amperímetro)'
];

const VERIFICACOES_GERAIS_PREMONTAGEM = [
  'Check dos Itens dos Seriados (Números de série do motor, caixa elétrica e plug conferem com Ordem Produção?)',
  '@SECTION:Análise Dimensional de Carcaça',
  'Resultado Esperado: Modelo CSEX420RM entre 415 e 430mm',
  'Resultado Esperado: Modelo CSC3420AC entre 415 e 430mm',
  'Resultado Esperado: Modelo CSEX550AC entre 545 e 560mm',
  'Resultado Esperado: Modelo CSEX550SS entre 545 e 560mm',
  'Teste de Aterramento do Motor (Resultado Esperado: >=0)',
  'Teste de Isolação do Motor(Resultado Esperado: >=0)',
  'Aplicação e aferição de Torque do Motor (Resultado esperado para rosca M4: 1,5)',
  'Aplicação e aferição de Torque do motor (Resultado esperado para rosca M5: 2)',
  'Aplicação e aferição de Torque (botoeira) (Resultado esperado: 2Nm)',
  'Teste de Funcionamento do Motor (Inspeção visual de estado de funcionamento do equipamento)',
  'Teste de Rotação do Motor - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação do Motor - Modelo CSEX420AC (3.000 rpm, com tolerância de 150 rpm)',
  'Teste de Rotação do Motor - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação do Motor - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)'
];

const VERIFICACAO_POSMONTAGEM = [
  'Teste de Aterramento (Resultado Esperado: >=0)',
  'Teste de Isolação (Resultado Esperado: >=0)',
  'Teste de Funcionamento (Inspeção visual de estado de funcionamento do equipamento)',
  'Teste de Rotação - Modelo CSEX420RM (3.390 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação - Modelo CSEX42DAC (3.600 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação - Modelo CSEX550AC (1.800 rpm, com tolerância de -150 rpm)',
  'Teste de Rotação - Modelo CSEX550SS (1.800 rpm, com tolerância de -150 rpm)',
  'Teste de Temperatura (Range: 30 a 40 graus C)',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX420RM ou T<=96.2 SPL(a) dB]',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX420AC ou T<=97 SPL(a) dB]',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX550AC ou T<=89 SPL(a) dB]',
  'Teste de Decibéis (Resultado Esperado: Modelo CSEX550SS ou T<=89 SPL(a) dB]',
  'Teste de Continuidade (Resultado: >=0)'
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
    verificacoesGeraisPremontagem: VERIFICACOES_GERAIS_PREMONTAGEM.map((nome, i) => ({
      id: `vgpm-${i}`,
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
    observacoes: undefined,
    responsavel: '',
    data: new Date().toISOString().split('T')[0],
    nomeAssinante: '',
    aprovado: false,
  });

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
            // Verifica se é um marcador de seção (começa com @SECTION:)
            const isSection = item.nome.startsWith('@SECTION:');
            
            if (isSection) {
              const sectionTitle = item.nome.replace('@SECTION:', '');
              return (
                <tr key={item.id} style={{ backgroundColor: '#e8e8e8' }}>
                  <td colSpan={mostrarCampos ? 4 : 2} style={{ fontWeight: 'bold', padding: '10px', textAlign: 'left' }}>
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
            );
          })}
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

      {/* VERIFICAÇÕES GERAIS PRÉ MONTAGEM */}
      {renderSecaoVerificacoes(
        'Verificações Gerais Pré Montagem',
        'verificacoesGeraisPremontagem',
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
