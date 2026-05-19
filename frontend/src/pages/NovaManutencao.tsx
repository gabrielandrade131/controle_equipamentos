import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioInspecaoManutencao } from '../components/FormularioInspecaoManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import { useManutencao } from '../hooks/useManutencao';

export const NovaManutencao: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarInspecao } = useManutencao();

  const handleSalvarInspecao = (inspecao: InspecaoManutencao) => {
    adicionarInspecao(inspecao)
      .then(() => {
      alert('Inspeção salva com sucesso!');
        navigate('/manutencao');
      })
      .catch((error) => {
      console.error('Erro ao criar manutenção:', error);
      alert(error.response?.data?.message || 'Não foi possível criar a manutenção.');
      });
  };

  return (
    <div className="manutencao-container">
      <FormularioInspecaoManutencao onSalvar={handleSalvarInspecao} />
    </div>
  );
};
