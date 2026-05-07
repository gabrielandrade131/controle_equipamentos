import React, { useState } from 'react';
import { InspecaoManutencao, criarInspecaoVazia, ItemInspecao, RespostaBinaria } from '../types/manutencao';
import { usePdfExportManutencao } from '../hooks/usePdfExportManutencao';
import './FormularioInspecaoManutencao.css';

interface FormularioInspecaoManutencaoProps {
  onSalvar?: (inspecao: InspecaoManutencao) => void;
  inspecaoInicial?: InspecaoManutencao;
}

export const FormularioInspecaoManutencao: React.FC<FormularioInspecaoManutencaoProps> = ({
  onSalvar,
  inspecaoInicial,
}) => {
  const [inspecao, setInspecao] = useState<InspecaoManutencao>(
    inspecaoInicial || criarInspecaoVazia()
  );
  usePdfExportManutencao();

  const handleInputChange = (campo: keyof Omit<InspecaoManutencao, 'certificacoes' | 'estruturaMecanica' | 'sistemaHidraulico' | 'sistemaPneumatico' | 'sistemaEletrico' | 'dispositivoSeguranca' | 'componentesOperacionais' | 'acessorios' | 'testesOperacionais'>, valor: string) => {
    setInspecao((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleRespostaChange = (
    secao: keyof Pick<InspecaoManutencao, 'certificacoes' | 'estruturaMecanica' | 'sistemaHidraulico' | 'sistemaPneumatico' | 'sistemaEletrico' | 'dispositivoSeguranca' | 'componentesOperacionais' | 'acessorios' | 'testesOperacionais'>,
    itemId: string,
    resposta: RespostaBinaria
  ) => {
    setInspecao((prev) => ({
      ...prev,
      [secao]: prev[secao].map((item) =>
        item.id === itemId ? { ...item, resposta } : item
      ),
    }));
  };

  const renderSecao = (
    secao: keyof Pick<InspecaoManutencao, 'certificacoes' | 'estruturaMecanica' | 'sistemaHidraulico' | 'sistemaPneumatico' | 'sistemaEletrico' | 'dispositivoSeguranca' | 'componentesOperacionais' | 'acessorios' | 'testesOperacionais'>,
    titulo: string
  ) => {
    const itens = inspecao[secao] as ItemInspecao[];

    return (
      <div key={secao} className="secao-inspecao">
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
    if (!inspecao.dataManutencao || !inspecao.responsavel) {
      alert('Por favor, preencha os campos obrigatórios: Data da Manutenção e Responsável');
      return;
    }
    onSalvar?.(inspecao);
  };

  return (
    <form className="formulario-inspecao-manutencao" onSubmit={(e) => e.preventDefault()}>
      {/* Dados do Equipamento */}
      <div className="dados-equipamento">
        <h2>Dados da Manutenção</h2>
        <div className="grid-inputs">
          <div className="form-group">
            <label>Data da Manutenção *</label>
            <input
              type="date"
              value={inspecao.dataManutencao}
              onChange={(e) => handleInputChange('dataManutencao', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Local da Manutenção</label>
            <input
              type="text"
              value={inspecao.localManutencao}
              onChange={(e) => handleInputChange('localManutencao', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Fabricante</label>
            <input
              type="text"
              value={inspecao.fabricante}
              onChange={(e) => handleInputChange('fabricante', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Modelo</label>
            <input
              type="text"
              value={inspecao.modelo}
              onChange={(e) => handleInputChange('modelo', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Nº de Série</label>
            <input
              type="text"
              value={inspecao.numeroSerie}
              onChange={(e) => handleInputChange('numeroSerie', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>TAG</label>
            <input
              type="text"
              value={inspecao.tag}
              onChange={(e) => handleInputChange('tag', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Destino</label>
            <input
              type="text"
              value={inspecao.destino}
              onChange={(e) => handleInputChange('destino', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Responsável *</label>
            <input
              type="text"
              value={inspecao.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
            />
          </div>
        </div>
      </div>

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

      <div className="avaliacao-final">
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
              />
              <span className="checkbox-custom">☐</span>
              <span>{aval}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="observacoes-gerais">
        <h3>Observações</h3>
        <textarea
          value={inspecao.observacoes || ''}
          onChange={(e) => handleInputChange('observacoes', e.target.value)}
          placeholder="Digite observações gerais da inspeção"
          rows={4}
        />
      </div>

      <div className="assinatura">
        <h3>Assinatura</h3>
        <input
          type="text"
          placeholder="Espaço para assinatura digital ou texto"
          value={inspecao.assinatura || ''}
          onChange={(e) => handleInputChange('assinatura', e.target.value)}
        />
      </div>

      <div className="botoes">
        <button onClick={handleSalvar} className="btn-salvar">
          Salvar Inspeção
        </button>
      </div>
    </form>
  );
};
