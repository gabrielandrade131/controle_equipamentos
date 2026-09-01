import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModalEditarDetalhesManutencao } from '../components/ModalEditarDetalhesManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import { useManutencao } from '../hooks/useManutencao';
import { criarInspecaoVazia } from '../constants/inspecaoManutencao';

export const NovaManutencao: React.FC = () => {
  const navigate = useNavigate();
  const { historico, adicionarInspecao } = useManutencao();

  const handleSalvar = (inspecao: InspecaoManutencao) => {
    adicionarInspecao(inspecao)
      .then(() => {
        alert('Manutenção criada com sucesso!');
        navigate('/manutencao');
      })
      .catch((error) => {
        console.error('Erro ao criar manutenção:', error);
        alert(error.response?.data?.message || 'Não foi possível criar a manutenção.');
      });
  };

  const novaOM = criarInspecaoVazia();
  const ultimoNumero = historico.reduce((max, item) => {
    const num = item.numeroOrdemManutencao || 0;
    return num > max ? num : max;
  }, 0);
  novaOM.numeroOrdemManutencao = ultimoNumero + 1;

  return (
    <div className="manutencao-page">
      <h2>Manutenção</h2>
      <ModalEditarDetalhesManutencao
        inspecao={novaOM}
        onSalvar={handleSalvar}
        onCancelar={() => navigate('/manutencao')}
        titulo="Criar Nova Manutenção"
        isCreating
      />
    </div>
  );
};

