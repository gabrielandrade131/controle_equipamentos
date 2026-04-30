import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormularioInspecaoManutencao } from '../components/FormularioInspecaoManutencao';
import { InspecaoManutencao } from '../types/manutencao';
import { useManutencaoMock } from '../hooks/useManutencaoMock';

export const NovaManutencao: React.FC = () => {
  const navigate = useNavigate();
  const { adicionarInspecao } = useManutencaoMock();

  const handleSalvarInspecao = (inspecao: InspecaoManutencao) => {
    const novoRegistro: InspecaoManutencao = {
      ...inspecao,
      id: Math.random().toString(36).substr(2, 9),
      criadoEm: new Date().toISOString(),
    };

    adicionarInspecao(novoRegistro);
    alert('Inspeção salva com sucesso!');

    console.log('Inspeção salva:', novoRegistro);
    
    navigate('/manutencao');
  };

  return (
    <div className="manutencao-container">
      <FormularioInspecaoManutencao onSalvar={handleSalvarInspecao} />
    </div>
  );
};
