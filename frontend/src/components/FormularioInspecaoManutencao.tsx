import React, { useState } from 'react';
import { InspecaoManutencao, criarInspecaoVazia, ItemInspecao, RespostaBinaria } from '../types/manutencao';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import './FormularioInspecaoManutencao.css';

interface FormularioInspecaoManutencaoProps {
  onSalvar?: (inspecao: InspecaoManutencao) => void;
  onCancelar?: () => void;
  inspecaoInicial?: InspecaoManutencao;
  isEditing?: boolean;
}

type SecaoInspecaoKey = keyof Pick<
  InspecaoManutencao,
  | 'certificacoes'
  | 'estruturaMecanica'
  | 'sistemaHidraulico'
  | 'sistemaPneumatico'
  | 'sistemaEletrico'
  | 'dispositivoSeguranca'
  | 'componentesOperacionais'
  | 'acessorios'
  | 'testesOperacionais'
>;

type CampoInspecao = keyof Omit<InspecaoManutencao, SecaoInspecaoKey>;

export const FormularioInspecaoManutencao: React.FC<FormularioInspecaoManutencaoProps> = ({
  onSalvar,
  onCancelar,
  inspecaoInicial,
  isEditing = false,
}) => {
  const [inspecao, setInspecao] = useState<InspecaoManutencao>(
    inspecaoInicial || criarInspecaoVazia()
  );
  usePdfExportManutencao();

  const documentoBloqueado = inspecao.statusManutencao !== 'CONCLUIDA';

  const handleInputChange = (campo: CampoInspecao, valor: string) => {
    setInspecao((prev) => ({
      ...prev,
      [campo]: valor,
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

  const handleSalvar = () => {
    if (!inspecao.responsavel) {
      alert('Por favor, preencha o campo obrigatório: Responsável');
      return;
    }

    onSalvar?.(inspecao);
  };

  return (
    <form
      className="formulario-inspecao-manutencao"
      aria-label={isEditing ? 'Editar inspeção de manutenção' : 'Nova inspeção de manutenção'}
      onSubmit={(e) => e.preventDefault()}
    >


      <div className="inspecoes">
        {renderSecao('certificacoes', 'CERTIFICAÇÕES E DOCUMENTAÇÃO')}
        {renderSecao('estruturaMecanica', 'ESTRUTURA E INTEGRIDADE MECÂNICA')}
        {renderSecao('sistemaHidraulico', 'SISTEMA HIDRÁULICO')}
        {renderSecao('sistemaPneumatico', 'SISTEMA PNEUMÁTICO')}
        {renderSecao('sistemaEletrico', 'SISTEMA ELÉTRICO')}
        {renderSecao('dispositivoSeguranca', 'DISPOSITIVOS DE SEGURANÇA')}
        {renderSecao('componentesOperacionais', 'COMPONENTES OPERACIONAIS')}
        {renderSecao('acessorios', 'ACESSÓRIOS E ITENS ESPECÍFICOS')}
        {renderSecao('testesOperacionais', 'TESTES OPERACIONAIS')}
      </div>

      <div className={`avaliacao-final${documentoBloqueado ? ' secao-inspecao-bloqueada' : ''}`}>
        <h3>AVALIAÇÃO FINAL</h3>
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

      <div className={`assinatura${documentoBloqueado ? ' secao-inspecao-bloqueada' : ''}`}>
        <h3>Assinatura</h3>
        <input
          type="text"
          placeholder="Espaço para assinatura digital ou texto"
          value={inspecao.assinatura || ''}
          onChange={(e) => handleInputChange('assinatura', e.target.value)}
          disabled={documentoBloqueado}
        />
      </div>

      <div className="botoes">
        <button onClick={handleSalvar} className="btn-salvar">
          Salvar Inspeção
        </button>
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="btn-cancelar">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
