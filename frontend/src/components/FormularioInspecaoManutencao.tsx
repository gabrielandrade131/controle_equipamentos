import React, { useEffect, useState } from 'react';
import { ItemInspecao, InspecaoManutencao, RespostaBinaria } from '../types/manutencao';
import {
  aplicarChecklistManutencao,
  criarInspecaoVazia,
  SECOES_MANUTENCAO,
  SecaoInspecaoKey,
} from '../constants/inspecaoManutencao';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import { getAuthUserDisplayName } from '../utils/auth';
import './FormularioInspecaoManutencao.css';

interface FormularioInspecaoManutencaoProps {
  onSalvar?: (inspecao: InspecaoManutencao) => void;
  onCancelar?: () => void;
  inspecaoInicial?: InspecaoManutencao;
  isEditing?: boolean;
}

type CampoInspecao = keyof Omit<InspecaoManutencao, SecaoInspecaoKey>;

export const FormularioInspecaoManutencao: React.FC<FormularioInspecaoManutencaoProps> = ({
  onSalvar,
  onCancelar,
  inspecaoInicial,
  isEditing = false,
}) => {
  const usuarioExecutor = getAuthUserDisplayName();
  const [inspecao, setInspecao] = useState<InspecaoManutencao>(
    inspecaoInicial || criarInspecaoVazia()
  );
  usePdfExportManutencao();

  useEffect(() => {
    if (!usuarioExecutor) return;

    setInspecao((prev) => ({
      ...prev,
      responsavel: prev.responsavel || usuarioExecutor,
    }));
  }, [usuarioExecutor]);

  useEffect(() => {
    setInspecao((prev) =>
      aplicarChecklistManutencao(prev, {
        tipoEquipamento: prev.tipoEquipamento,
        modeloEquipamento: prev.modelo,
      })
    );
  }, [inspecao.tipoEquipamento, inspecao.modelo]);

  const documentoBloqueado = inspecao.statusManutencao !== 'EM_MANUTENCAO';
  const dadosManutencaoSomenteLeitura = true;

  const handleInputChange = (campo: CampoInspecao, valor: string) => {
    if (documentoBloqueado) {
      return;
    }

    let value: any = valor;
    
    // Converter para número quando necessário
    if (campo === 'numeroOrdemManutencao' || campo === 'diasEsperaManutencao' || campo === 'diasManutencao') {
      value = valor === '' ? null : parseInt(valor, 10);
    }
    
    setInspecao((prev) => ({
      ...prev,
      [campo]: value,
    }));
  };

  const handleRespostaChange = (
    secao: SecaoInspecaoKey,
    itemId: string,
    resposta: RespostaBinaria
  ) => {
    if (documentoBloqueado) {
      return;
    }

    setInspecao((prev) => ({
      ...prev,
      [secao]: prev[secao].map((item) =>
        item.id === itemId ? { ...item, resposta } : item
      ),
    }));
  };

  const renderSecao = (
    secao: SecaoInspecaoKey,
    titulo: string,
    bloqueada = documentoBloqueado
  ) => {
    const itens = inspecao[secao] as ItemInspecao[];

    if (!itens.length) {
      return null;
    }

    return (
      <div key={secao} className={`secao-inspecao${bloqueada ? ' secao-inspecao-bloqueada' : ''}`}>
        <h3 className="titulo-secao">{titulo}</h3>
        <div className="itens-container">
          {itens.map((item) => (
            <div key={item.id} className="item-inspecao">
              <p className="pergunta">{item.titulo}</p>
              <div className="respostas">
                {(['SIM', 'NÃO', 'N/A'] as RespostaBinaria[]).map((resp) => (
                  <label key={resp} className="checkbox-label">
                    <input
                      type="radio"
                      name={item.id}
                      value={resp}
                      checked={item.resposta === resp}
                      onChange={() => handleRespostaChange(secao, item.id, resp)}
                      disabled={bloqueada}
                    />
                    <span className="checkbox-custom">☐</span>
                    <span>{resp}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleImagensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (documentoBloqueado) return;

    const files = e.target.files;
    if (!files) return;

    const maxImages = 5;
    const currentCount = (inspecao.imagensAnexadas || []).length;
    
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
        setInspecao((prev) => ({
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

    setInspecao((prev) => ({
      ...prev,
      imagensAnexadas: (prev.imagensAnexadas || []).filter((_, i) => i !== index),
    }));
  };

  const handleSalvar = () => {
    if (documentoBloqueado) {
      alert('A inspeção não pode ser modificada quando a manutenção não estiver com status "Em manutenção".');
      return;
    }

    const executor = inspecao.responsavel?.trim() || usuarioExecutor;

    if (!executor) {
      alert('Por favor, preencha o campo obrigatório: Executado por');
      return;
    }

    if (!inspecao.validade) {
      alert('Informe a validade do equipamento considerando a peça que vence primeiro.');
      return;
    }

    onSalvar?.({
      ...inspecao,
      responsavel: executor,
    });
  };

  return (
    <form
      className="formulario-inspecao-manutencao"
      aria-label={
        documentoBloqueado
          ? 'Visualização da inspeção de manutenção'
          : isEditing
            ? 'Editar inspeção de manutenção'
            : 'Nova inspeção de manutenção'
      }
      onSubmit={(e) => e.preventDefault()}
    >
      {documentoBloqueado && (
        <div className="alerta-somente-leitura" role="alert">
          {inspecao.statusManutencao === 'CONCLUIDA'
            ? 'Esta manutenção já foi concluída. A inspeção está finalizada e em modo somente leitura.'
            : 'A inspeção de manutenção só pode ser preenchida e alterada quando o status for "Em manutenção".'}
        </div>
      )}
      <div className="dados-equipamento">
        <h2>Dados da Manutenção</h2>
        <div className="grid-inputs">
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Data de Início da Manutenção</label>
            <input
              type="date"
              value={inspecao.dataInicio}
              onChange={(e) => handleInputChange('dataInicio', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Local da Manutenção</label>
            <input
              type="text"
              value={inspecao.localManutencao}
              onChange={(e) => handleInputChange('localManutencao', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Tipo de Equipamento</label>
            <input
              type="text"
              value={inspecao.tipoEquipamento || ''}
              readOnly
              disabled
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Tipo de Manutenção</label>
            <input
              type="text"
              value={inspecao.tipoManutencao === 'PREVENTIVA' ? 'Preventiva' : 'Corretiva'}
              readOnly
              disabled
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Fabricante</label>
            <input
              type="text"
              value={inspecao.fabricante}
              onChange={(e) => handleInputChange('fabricante', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Modelo</label>
            <input
              type="text"
              value={inspecao.modelo}
              onChange={(e) => handleInputChange('modelo', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>TAG</label>
            <input
              type="text"
              value={inspecao.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Número de Ordem de Manutenção</label>
            <input
              type="number"
              value={inspecao.numeroOrdemManutencao || ''}
              onChange={(e) => handleInputChange('numeroOrdemManutencao', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Destino</label>
            <input
              type="text"
              value={inspecao.destino}
              onChange={(e) => handleInputChange('destino', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Data de Retorno à Base</label>
            <input
              type="date"
              value={inspecao.dataRetornoBase || ''}
              onChange={(e) => handleInputChange('dataRetornoBase', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Previsão de Término</label>
            <input
              type="date"
              value={inspecao.previsaoTermino || ''}
              onChange={(e) => handleInputChange('previsaoTermino', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Executado por *</label>
            <input
              type="text"
              value={inspecao.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              placeholder="Preenchido automaticamente pelo usuário logado"
              required
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Revisado por</label>
            <input
              type="text"
              value={
                inspecao.statusManutencao === 'CONCLUIDA'
                  ? 'Douglas Moreira Alves'
                  : inspecao.responsavelRevisao || ''
              }
              onChange={(e) => handleInputChange('responsavelRevisao', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura || inspecao.statusManutencao === 'CONCLUIDA'}
              disabled={dadosManutencaoSomenteLeitura || inspecao.statusManutencao === 'CONCLUIDA'}
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Status da Manutenção</label>
            <input
              type="text"
              value={inspecao.statusManutencao}
              readOnly
              disabled
            />
          </div>
          <div className={`form-group${dadosManutencaoSomenteLeitura ? ' form-group-readonly' : ''}`}>
            <label>Data de Término</label>
            <input
              type="date"
              value={inspecao.dataTermino || ''}
              onChange={(e) => handleInputChange('dataTermino', e.target.value)}
              readOnly={dadosManutencaoSomenteLeitura}
              disabled={dadosManutencaoSomenteLeitura}
            />
          </div>
        </div>
      </div>

      <div className="inspecoes">
        {SECOES_MANUTENCAO.map((secao) => renderSecao(secao.key, secao.titulo))}
      </div>

      <div className={`avaliacao-final${documentoBloqueado ? ' secao-inspecao-bloqueada' : ''}`}>
        <h3>AVALIAÇÃO FINAL</h3>
        <div className="validade-manutencao-box">
          <div className="form-group">
            <label>Validade do equipamento *</label>
            <input
              type="date"
              value={inspecao.validade || ''}
              onChange={(e) => handleInputChange('validade', e.target.value)}
              disabled={documentoBloqueado}
            />
          </div>
          <p>
            A validade deve considerar a peça, componente, certificado ou item
            inspecionado que vence primeiro.
          </p>
        </div>
        <div className="respostas">
          {(['CONFORME', 'NÃO CONFORME'] as const).map((aval) => (
            <label key={aval} className="checkbox-label">
              <input
                type="radio"
                name="avaliacaoFinal"
                value={aval}
                checked={inspecao.avaliacaoFinal === aval}
                onChange={() => handleInputChange('avaliacaoFinal', aval)}
                disabled={documentoBloqueado}
              />
              <span className="checkbox-custom">☐</span>
              <span>{aval}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={`observacoes-gerais${documentoBloqueado ? ' secao-inspecao-bloqueada' : ''}`}>
        <h3>Observações</h3>
        <textarea
          value={inspecao.observacoes || ''}
          onChange={(e) => handleInputChange('observacoes', e.target.value)}
          placeholder="Digite observações gerais da inspeção"
          rows={4}
          disabled={documentoBloqueado}
        />
      </div>

      <div className={`imagens-anexadas${documentoBloqueado ? ' secao-inspecao-bloqueada' : ''}`}>
        <h3>Fotos/Imagens da Manutenção (Máx. 5)</h3>
        
        <div className="upload-imagens">
          <div className="upload-acoes">
            <label className={`upload-label${documentoBloqueado || (inspecao.imagensAnexadas || []).length >= 5 ? ' disabled' : ''}`}>
              <input
                type="file"
                multiple
                accept="image/*"
                capture="environment"
                onChange={handleImagensChange}
                disabled={documentoBloqueado || (inspecao.imagensAnexadas || []).length >= 5}
                className="file-input"
              />
              <span className="upload-text">
                Abrir câmera ({(inspecao.imagensAnexadas || []).length}/5)
              </span>
            </label>
            <label className={`upload-label${documentoBloqueado || (inspecao.imagensAnexadas || []).length >= 5 ? ' disabled' : ''}`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagensChange}
                disabled={documentoBloqueado || (inspecao.imagensAnexadas || []).length >= 5}
                className="file-input"
              />
              <span className="upload-text">
                Escolher da galeria ({(inspecao.imagensAnexadas || []).length}/5)
              </span>
            </label>
          </div>
        </div>

        {(inspecao.imagensAnexadas || []).length > 0 && (
          <div className="galeria-imagens">
            {inspecao.imagensAnexadas!.map((imagem, index) => (
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

      <div className="botoes">
        {!documentoBloqueado && (
          <button onClick={handleSalvar} className="btn-salvar">
            Salvar Inspeção
          </button>
        )}
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="btn-cancelar">
            {documentoBloqueado ? 'Voltar' : 'Cancelar'}
          </button>
        )}
      </div>
    </form>
  );
};
