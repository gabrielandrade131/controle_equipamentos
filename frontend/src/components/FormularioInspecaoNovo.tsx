import React, { useState } from 'react';
import { InspecaoMontagem, CreateInspecaoMontageDto } from '../types/inspecao';
import { criarFormularioInspecaoMontagemVazio } from '../constants/inspecaoMontagem';
import { CampoAssinaturaDigital } from './CampoAssinaturaDigital';
import './FormularioInspecao.css';

interface FormularioInspecaoProps {
  onSubmit: (inspecao: InspecaoMontagem) => void;
  onCancel: () => void;
  inspecaoInicial?: InspecaoMontagem;
  titulo?: string;
}

type LinhaVerificacaoFormulario = {
  itemIndex: number;
  titulo: string;
  detalhes: string[];
  instrumentoFixo: string;
  solicitarNumeroSerie: boolean;
  instrumentosMarcaveis?: string[];
};

export const FormularioInspecaoNovo: React.FC<FormularioInspecaoProps> = ({
  onSubmit,
  onCancel,
  inspecaoInicial,
  titulo = 'Inspeção de Montagem',
}) => {
  const formularioPadrao = criarFormularioInspecaoMontagemVazio();
  const PREFIXO_NUMERO_SERIE = 'NºSérie:';

  const [formData, setFormData] = useState<CreateInspecaoMontageDto>(() => ({
    ...criarFormularioInspecaoMontagemVazio(),
    ...inspecaoInicial,
  }));

  const documentoBloqueado =
    (inspecaoInicial?.statusProducao || formData.statusProducao) !== 'EM_ANDAMENTO';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (documentoBloqueado) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (documentoBloqueado) return;
    const files = e.target.files;
    if (!files) return;

    const maxImages = 5;
    const currentCount = (formData.imagensAnexadas || []).length;
    
    if (currentCount >= maxImages) {
      alert(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const availableSlots = maxImages - currentCount;
    const filesToAdd = Array.from(files).slice(0, availableSlots);

    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          imagensAnexadas: [...(prev.imagensAnexadas || []), base64],
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoverImagem = (index: number) => {
    if (documentoBloqueado) return;
    setFormData((prev) => ({
      ...prev,
      imagensAnexadas: (prev.imagensAnexadas || []).filter((_, i) => i !== index),
    }));
  };

  const handleVerificacaoChange = (
    secao: 'instrumentosAferição' | 'verificacoesGeraisPremontagem' | 'verificacaoPosmontagem',
    id: string,
    field: 'conformidade' | 'valorObservado' | 'instrumentoMedicao',
    value: string
  ) => {
    if (documentoBloqueado) return;
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
    if (documentoBloqueado) return;
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

    if (documentoBloqueado) {
      alert(
        "A inspeção de montagem não pode ser modificada quando a produção não estiver com status 'Em andamento'.",
      );
      return;
    }

    if (!formData.numeroSerie.trim() || !formData.modelo.trim()) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const aplicarInstrumentosFixosPremontagem = (
      itens: CreateInspecaoMontageDto['verificacoesGeraisPremontagem'],
    ) => {
      const itensAtualizados = [...itens];

      linhasPremontagem.forEach((linha) => {
        const itemAtual =
          itensAtualizados[linha.itemIndex] ?? formularioPadrao.verificacoesGeraisPremontagem[linha.itemIndex];

        if (!itemAtual) {
          return;
        }

        const numeroSerie = extrairNumeroSerieInstrumento(itemAtual.instrumentoMedicao);
        const instrumentosMarcados = extrairInstrumentosMarcados(
          itemAtual.instrumentoMedicao,
          linha.instrumentosMarcaveis,
        );
        itensAtualizados[linha.itemIndex] = {
          ...itemAtual,
          instrumentoMedicao: formatarInstrumentoMedicao(
            linha.instrumentoFixo,
            numeroSerie,
            linha.solicitarNumeroSerie,
            instrumentosMarcados,
            linha.instrumentosMarcaveis,
          ),
        };
      });

      return itensAtualizados;
    };

    const aplicarInstrumentosFixosPosmontagem = (
      itens: CreateInspecaoMontageDto['verificacaoPosmontagem'],
    ) => {
      const itensAtualizados = [...itens];

      linhasPosmontagem.forEach((linha) => {
        const itemAtual =
          itensAtualizados[linha.itemIndex] ?? formularioPadrao.verificacaoPosmontagem[linha.itemIndex];

        if (!itemAtual) {
          return;
        }

        const numeroSerie = extrairNumeroSerieInstrumento(itemAtual.instrumentoMedicao);
        const instrumentosMarcados = extrairInstrumentosMarcados(
          itemAtual.instrumentoMedicao,
          linha.instrumentosMarcaveis,
        );
        itensAtualizados[linha.itemIndex] = {
          ...itemAtual,
          instrumentoMedicao: formatarInstrumentoMedicao(
            linha.instrumentoFixo,
            numeroSerie,
            linha.solicitarNumeroSerie,
            instrumentosMarcados,
            linha.instrumentosMarcaveis,
          ),
        };
      });

      return itensAtualizados;
    };

    const aprovado =
      formData.aprovado === true
        ? true
        : formData.aprovado === false
        ? false
        : undefined;

    const resultadoFinal =
      aprovado === true
        ? 'APROVADO'
        : aprovado === false
        ? 'REPROVADO'
        : formData.resultadoFinal || '';

    const formDataNormalizado: CreateInspecaoMontageDto = {
      ...formData,
      aprovado,
      resultadoFinal,
      assinatura: formData.assinatura,
      responsavel: formData.responsavelServico || formData.responsavel,
      responsavelServico: formData.responsavelServico || formData.responsavel,
      verificacoesGeraisPremontagem: aplicarInstrumentosFixosPremontagem(
        formData.verificacoesGeraisPremontagem,
      ),
      verificacaoPosmontagem: aplicarInstrumentosFixosPosmontagem(
        formData.verificacaoPosmontagem,
      ),
    };

    const novaInspecao: InspecaoMontagem = {
      ...formDataNormalizado,
      id: inspecaoInicial?.id || String(Date.now()),
      createdAt: inspecaoInicial?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(novaInspecao);
  };

  const extrairNumeroSerieInstrumento = (instrumentoMedicao?: string) => {
    if (!instrumentoMedicao) {
      return '';
    }

    const match = instrumentoMedicao.match(/N[ºo]\s*S[ée]rie:\s*(.*)$/i);
    if (match) {
      return match[1]?.trim() || '';
    }

    return '';
  };

  const formatarInstrumentoMedicao = (
    instrumentoFixo: string,
    numeroSerie: string,
    solicitarNumeroSerie: boolean,
    instrumentosMarcados?: string[],
    instrumentosMarcaveis?: readonly string[],
  ) => {
    const instrumentoFormatado =
      instrumentosMarcaveis && instrumentosMarcaveis.length > 0
        ? instrumentosMarcaveis
            .map((instrumento) =>
              `${instrumento}${instrumentosMarcados?.includes(instrumento) ? '☑' : '☐'}`,
            )
            .join('/')
        : instrumentoFixo;

    if (!solicitarNumeroSerie) {
      return instrumentoFormatado;
    }

    return numeroSerie.trim()
      ? `${instrumentoFormatado}\n${PREFIXO_NUMERO_SERIE} ${numeroSerie.trim()}`
      : `${instrumentoFormatado}\n${PREFIXO_NUMERO_SERIE}`;
  };

  const extrairInstrumentosMarcados = (
    instrumentoMedicao: string | undefined,
    instrumentosMarcaveis?: readonly string[],
  ) => {
    if (!instrumentoMedicao || !instrumentosMarcaveis?.length) {
      return [] as string[];
    }

    return instrumentosMarcaveis.filter((instrumento) => {
      const escaped = instrumento.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`${escaped}☑`, 'i').test(instrumentoMedicao);
    });
  };

  const linhasPremontagem: LinhaVerificacaoFormulario[] = [
    {
      itemIndex: 0,
      titulo: 'Check dos Itens dos Seriados',
      detalhes: ['(Números de série do motor, caixa elétrica e plug conferem com a Ordem de Produção?)'],
      instrumentoFixo: 'AVALIAÇÃO VISUAL',
      solicitarNumeroSerie: false,
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
      instrumentoFixo: 'TRENA',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 6,
      titulo: 'Teste de Aterramento do Motor',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoFixo: 'MEGÔMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 7,
      titulo: 'Teste de Isolação do Motor',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoFixo: 'MULTÍMETRO☐/MEGÔMETRO☐',
      solicitarNumeroSerie: true,
      instrumentosMarcaveis: ['MULTÍMETRO', 'MEGÔMETRO'],
    },
    {
      itemIndex: 8,
      titulo: 'Aplicação e aferição de Torque do Motor',
      detalhes: ['Resultado Esperado para rosca M4: 1,5'],
      instrumentoFixo: 'TORQUÍMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 9,
      titulo: 'Aplicação e aferição de Torque do motor',
      detalhes: ['Resultado Esperado para rosca M5: 2'],
      instrumentoFixo: 'TORQUÍMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 10,
      titulo: 'Aplicação e aferição de Torque (botoeira)',
      detalhes: ['Resultado esperado: 2Nm'],
      instrumentoFixo: 'TORQUÍMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 11,
      titulo: 'Teste de Funcionamento do Motor',
      detalhes: ['Inspeção visual do estado de funcionamento do equipamento'],
      instrumentoFixo: 'AMPERÍMETRO',
      solicitarNumeroSerie: true,
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
      instrumentoFixo: 'TACÔMETRO',
      solicitarNumeroSerie: true,
    },
  ];

  const linhasPosmontagem: LinhaVerificacaoFormulario[] = [
    {
      itemIndex: 0,
      titulo: 'Teste de Aterramento',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoFixo: 'MULTÍMETRO☐/MEGÔMETRO☐',
      solicitarNumeroSerie: true,
      instrumentosMarcaveis: ['MULTÍMETRO', 'MEGÔMETRO'],
    },
    {
      itemIndex: 1,
      titulo: 'Teste de Isolação',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoFixo: 'MEGÔMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 2,
      titulo: 'Teste de Funcionamento',
      detalhes: ['Inspeção visual de estado de funcionamento do equipamento'],
      instrumentoFixo: 'AMPERÍMETRO',
      solicitarNumeroSerie: true,
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
      instrumentoFixo: 'TACÔMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 7,
      titulo: 'Teste de Temperatura',
      detalhes: ['Range: 30 a 40 graus Celsius'],
      instrumentoFixo: 'TERMÔMETRO LASER',
      solicitarNumeroSerie: true,
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
      instrumentoFixo: 'DECIBELÍMETRO',
      solicitarNumeroSerie: true,
    },
    {
      itemIndex: 12,
      titulo: 'Teste de Continuidade',
      detalhes: ['Resultado Esperado: >=0'],
      instrumentoFixo: 'MULTÍMETRO',
      solicitarNumeroSerie: true,
    },
  ];

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
                <td data-label="Item">{item.nome}</td>
                {mostrarCampos && (
                  <td data-label="Valor Observado">
                    <input
                      type="text"
                      value={item.valorObservado || ''}
                      onChange={(e) =>
                        handleVerificacaoChange(secao, item.id, 'valorObservado', e.target.value)
                      }
                      placeholder="Ex: 150mm"
                      disabled={documentoBloqueado}
                    />
                  </td>
                )}
                {mostrarCampos && (
                  <td data-label="Instrumento de Medição">
                    <input
                      type="text"
                      value={item.instrumentoMedicao || ''}
                      onChange={(e) =>
                        handleVerificacaoChange(secao, item.id, 'instrumentoMedicao', e.target.value)
                      }
                      disabled={documentoBloqueado}
                    />
                  </td>
                )}
                <td data-label="Conformidades">
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
                        disabled={documentoBloqueado}
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
                        disabled={documentoBloqueado}
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
            const numeroSerieInstrumento = extrairNumeroSerieInstrumento(item.instrumentoMedicao);
            const instrumentosMarcados = extrairInstrumentosMarcados(
              item.instrumentoMedicao,
              linha.instrumentosMarcaveis,
            );

            return (
              <tr key={`premontagem-${linha.itemIndex}`}>
                <td className="verificacoes-pm-item" data-label="Item">
                  <span className="verificacoes-pm-titulo">{linha.titulo}</span>
                  {linha.detalhes.map((detalhe) => (
                    <span key={detalhe} className="verificacoes-pm-detalhe">
                      {detalhe}
                    </span>
                  ))}
                </td>
                <td data-label="Valor Observado">
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={item.valorObservado || ''}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'valorObservado', e.target.value)
                    }
                    title="Valor observado"
                    placeholder="Valor observado"
                    disabled={documentoBloqueado}
                  />
                </td>
                <td data-label="Instrumento de Medição">
                  {linha.instrumentosMarcaveis ? (
                    <div className="verificacoes-pm-instrumentos-marcaveis">
                      {linha.instrumentosMarcaveis.map((instrumentoMarcavel) => (
                        <label key={instrumentoMarcavel} className="verificacoes-pm-checkbox-label">
                          <input
                            type="checkbox"
                            checked={instrumentosMarcados.includes(instrumentoMarcavel)}
                            disabled={documentoBloqueado}
                            onChange={(e) => {
                              const proximosMarcados = e.target.checked
                                ? [...instrumentosMarcados, instrumentoMarcavel]
                                : instrumentosMarcados.filter((itemMarcado) => itemMarcado !== instrumentoMarcavel);

                              handleVerificacaoChangePorIndice(
                                'verificacoesGeraisPremontagem',
                                linha.itemIndex,
                                'instrumentoMedicao',
                                formatarInstrumentoMedicao(
                                  linha.instrumentoFixo,
                                  numeroSerieInstrumento,
                                  linha.solicitarNumeroSerie,
                                  proximosMarcados,
                                  linha.instrumentosMarcaveis,
                                ),
                              );
                            }}
                          />
                          <span>{instrumentoMarcavel}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <span className="verificacoes-pm-instrumento">{linha.instrumentoFixo}</span>
                  )}
                  {linha.solicitarNumeroSerie && (
                    <>
                      <span className="verificacoes-pm-numero-serie-label">{PREFIXO_NUMERO_SERIE}</span>
                      <input
                        type="text"
                        className="verificacoes-pm-input"
                        value={numeroSerieInstrumento}
                        disabled={documentoBloqueado}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice(
                            'verificacoesGeraisPremontagem',
                            linha.itemIndex,
                            'instrumentoMedicao',
                            formatarInstrumentoMedicao(
                              linha.instrumentoFixo,
                              e.target.value,
                              linha.solicitarNumeroSerie,
                              instrumentosMarcados,
                              linha.instrumentosMarcaveis,
                            ),
                          )
                        }
                        title="Número de série do instrumento"
                        placeholder="Preencher nº de série"
                      />
                    </>
                  )}
                </td>
                <td data-label="Conformidades">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="radio"
                        name={`conf-premontagem-${linha.itemIndex}`}
                        value="SIM"
                        checked={item.conformidade === 'SIM'}
                        disabled={documentoBloqueado}
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
                        disabled={documentoBloqueado}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      NÃO
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`conf-premontagem-${linha.itemIndex}`}
                        value="N/A"
                        checked={item.conformidade === 'N/A'}
                        disabled={documentoBloqueado}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacoesGeraisPremontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      N/A
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
            const numeroSerieInstrumento = extrairNumeroSerieInstrumento(item.instrumentoMedicao);
            const instrumentosMarcados = extrairInstrumentosMarcados(
              item.instrumentoMedicao,
              linha.instrumentosMarcaveis,
            );

            return (
              <tr key={`posmontagem-${linha.itemIndex}`}>
                <td className="verificacoes-pm-item" data-label="Item">
                  <span className="verificacoes-pm-titulo">{linha.titulo}</span>
                  {linha.detalhes.map((detalhe) => (
                    <span key={detalhe} className="verificacoes-pm-detalhe">
                      {detalhe}
                    </span>
                  ))}
                </td>
                <td data-label="Valor Observado">
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={item.valorObservado || ''}
                    disabled={documentoBloqueado}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'valorObservado', e.target.value)
                    }
                    title="Valor observado"
                    placeholder="Valor observado"
                  />
                </td>
                <td data-label="Instrumento de Medição">
                  {linha.instrumentosMarcaveis ? (
                    <div className="verificacoes-pm-instrumentos-marcaveis">
                      {linha.instrumentosMarcaveis.map((instrumentoMarcavel) => (
                        <label key={instrumentoMarcavel} className="verificacoes-pm-checkbox-label">
                          <input
                            type="checkbox"
                            checked={instrumentosMarcados.includes(instrumentoMarcavel)}
                            disabled={documentoBloqueado}
                            onChange={(e) => {
                              const proximosMarcados = e.target.checked
                                ? [...instrumentosMarcados, instrumentoMarcavel]
                                : instrumentosMarcados.filter((itemMarcado) => itemMarcado !== instrumentoMarcavel);

                              handleVerificacaoChangePorIndice(
                                'verificacaoPosmontagem',
                                linha.itemIndex,
                                'instrumentoMedicao',
                                formatarInstrumentoMedicao(
                                  linha.instrumentoFixo,
                                  numeroSerieInstrumento,
                                  linha.solicitarNumeroSerie,
                                  proximosMarcados,
                                  linha.instrumentosMarcaveis,
                                ),
                              );
                            }}
                          />
                          <span>{instrumentoMarcavel}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <span className="verificacoes-pm-instrumento">{linha.instrumentoFixo}</span>
                  )}
                  <span className="verificacoes-pm-numero-serie-label">{PREFIXO_NUMERO_SERIE}</span>
                  <input
                    type="text"
                    className="verificacoes-pm-input"
                    value={numeroSerieInstrumento}
                    disabled={documentoBloqueado}
                    onChange={(e) =>
                      handleVerificacaoChangePorIndice(
                        'verificacaoPosmontagem',
                        linha.itemIndex,
                        'instrumentoMedicao',
                        formatarInstrumentoMedicao(
                          linha.instrumentoFixo,
                          e.target.value,
                          linha.solicitarNumeroSerie,
                          instrumentosMarcados,
                          linha.instrumentosMarcaveis,
                        ),
                      )
                    }
                    title="Número de série do instrumento"
                    placeholder="Preencher nº de série"
                  />
                </td>
                <td data-label="Conformidades">
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="radio"
                        name={`conf-posmontagem-${linha.itemIndex}`}
                        value="SIM"
                        checked={item.conformidade === 'SIM'}
                        disabled={documentoBloqueado}
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
                        disabled={documentoBloqueado}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      NÃO
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`conf-posmontagem-${linha.itemIndex}`}
                        value="N/A"
                        checked={item.conformidade === 'N/A'}
                        disabled={documentoBloqueado}
                        onChange={(e) =>
                          handleVerificacaoChangePorIndice('verificacaoPosmontagem', linha.itemIndex, 'conformidade', e.target.value)
                        }
                      />
                      N/A
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
          <label htmlFor="responsavelServico">Executado por:</label>
          <input
            type="text"
            id="responsavelServico"
            name="responsavelServico"
            value={formData.responsavelServico || formData.responsavel || ''}
            onChange={handleInputChange}
            placeholder="Digite o nome de quem executou"
            disabled={documentoBloqueado}
            required
          />
        </div>
        <CampoAssinaturaDigital
          label="Assinatura do Executante:"
          value={formData.assinatura}
          disabled={documentoBloqueado}
          onChange={(assinatura) =>
            setFormData((prev) => ({ ...prev, assinatura }))
          }
        />
        <div className="form-group">
          <label htmlFor="data">Data:</label>
          <input
            type="date"
            id="data"
            name="data"
            value={formData.data}
            onChange={handleInputChange}
            disabled={documentoBloqueado}
            required
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
                disabled={documentoBloqueado}
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
                disabled={documentoBloqueado}
                onChange={() =>
                  setFormData({ ...formData, aprovado: false })
                }
              />
              NÃO
            </label>
          </div>
        </div>
      </div>

      <div className="form-section">
       <h3>Fotos/Imagens da Montagem (Máx. 5)</h3>
        
       <div className="upload-imagens">
         <div className="upload-acoes">
           <label className={`upload-label${documentoBloqueado || (formData.imagensAnexadas || []).length >= 5 ? ' disabled' : ''}`}>
             <input
               type="file"
               multiple
               accept="image/*"
               capture="environment"
               onChange={handleImagensChange}
               disabled={documentoBloqueado || (formData.imagensAnexadas || []).length >= 5}
               className="file-input"
             />
             <span className="upload-text">
               Abrir câmera ({(formData.imagensAnexadas || []).length}/5)
             </span>
           </label>
           <label className={`upload-label${documentoBloqueado || (formData.imagensAnexadas || []).length >= 5 ? ' disabled' : ''}`}>
             <input
               type="file"
               multiple
               accept="image/*"
               onChange={handleImagensChange}
               disabled={documentoBloqueado || (formData.imagensAnexadas || []).length >= 5}
               className="file-input"
             />
             <span className="upload-text">
               Escolher da galeria ({(formData.imagensAnexadas || []).length}/5)
             </span>
           </label>
         </div>
       </div>

       {(formData.imagensAnexadas || []).length > 0 && (
         <div className="galeria-imagens">
           {formData.imagensAnexadas!.map((imagem, index) => (
             <div key={index} className="imagem-container">
               <img src={imagem} alt={`Imagem ${index + 1}`} className="imagem-preview" />
               <button
                 type="button"
                 onClick={() => handleRemoverImagem(index)}
                 className="btn-remover-imagem"
                 disabled={documentoBloqueado}
               >
                 ✕
               </button>
             </div>
           ))}
         </div>
       )}
      </div>

      <div className="form-actions">
        {!documentoBloqueado && (
          <button type="submit" className="btn-salvar">
            Salvar Inspeção
          </button>
        )}
        <button type="button" onClick={onCancel} className="btn-cancelar">
          {documentoBloqueado ? 'Voltar' : 'Cancelar'}
        </button>
      </div>
    </form>
  );
};
