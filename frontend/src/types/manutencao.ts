// Tipos para Inspeção de Manutenção

export type RespostaBinaria = 'SIM' | 'NÃO' | 'N/A' | '';

export interface ItemInspecao {
  id: string;
  titulo: string;
  categoria: string;
  resposta: RespostaBinaria;
  observacoes?: string;
}

export interface SessaoInspecao {
  categoria: string;
  titulo: string;
  itens: ItemInspecao[];
}

export interface InspecaoManutencao {
  id?: string;
  dataManutencao: string;
  localManutencao: string;
  fabricante: string;
  modelo: string;
  numeroSerie: string;
  tag: string;
  destino: string;
  responsavel: string;
  
  // Certificações e Documentação
  certificacoes: ItemInspecao[];
  
  // Estrutura e Integridade Mecânica
  estruturaMecanica: ItemInspecao[];
  
  // Sistema Hidráulico
  sistemaHidraulico: ItemInspecao[];
  
  // Sistema Pneumático
  sistemaPneumatico: ItemInspecao[];
  
  // Sistema Elétrico
  sistemaEletrico: ItemInspecao[];
  
  // Dispositivos de Segurança
  dispositivoSeguranca: ItemInspecao[];
  
  // Componentes Operacionais
  componentesOperacionais: ItemInspecao[];
  
  // Acessórios e Itens Específicos
  acessorios: ItemInspecao[];
  
  // Testes Operacionais
  testesOperacionais: ItemInspecao[];
  
  // Avaliação Final
  avaliacaoFinal: 'CONFORME' | 'NÃO CONFORME' | '';
  observacoes?: string;
  assinatura?: string;
  
  criadoEm?: string;
  atualizadoEm?: string;
}

// Inicializador com todos os itens padrão
export const criarInspecaoVazia = (): InspecaoManutencao => ({
  dataManutencao: new Date().toISOString().split('T')[0],
  localManutencao: '',
  fabricante: '',
  modelo: '',
  numeroSerie: '',
  tag: '',
  destino: '',
  responsavel: '',
  certificacoes: [
    { id: 'cert_1', titulo: 'Placa de identificação e/ou TAG estão legíveis?', categoria: 'Certificações e Documentação', resposta: '' },
    { id: 'cert_2', titulo: 'Certificações do equipamento estão válidas?', categoria: 'Certificações e Documentação', resposta: '' },
    { id: 'cert_3', titulo: 'Certificados de instrumentos (manômetros, etc.) estão dentro da validade?', categoria: 'Certificações e Documentação', resposta: '' },
  ],
  estruturaMecanica: [
    { id: 'estr_1', titulo: 'A estrutura do equipamento está íntegra e em boas condições de uso?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_2', titulo: 'A estrutura base/skid está sem deformações?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_3', titulo: 'A pintura ou tratamento da carcaça está adequado?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_4', titulo: 'Todos os componentes estão íntegros?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_5', titulo: 'Parafusos, porcas, abraçadeiras e fixações estão bem apertados e íntegros?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_6', titulo: 'Flanges e conexões mecânicas estão íntegros?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_7', titulo: 'Tambor, cone ou carcaças estão sem danos ou corrosão?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
    { id: 'estr_8', titulo: 'Molas, peneiras, sapatas e demais partes mecânicas estão íntegras?', categoria: 'Estrutura e Integridade Mecânica', resposta: '' },
  ],
  sistemaHidraulico: [
    { id: 'hid_1', titulo: 'As conexões hidráulicas estão íntegras?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_2', titulo: 'As mangueiras hidráulicas estão bem fixadas?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_3', titulo: 'As mangueiras hidráulicas estão sem vazamentos?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_4', titulo: 'As mangueiras hidráulicas estão em boas condições de uso?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_5', titulo: 'O sistema hidráulico está funcionando adequadamente?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_6', titulo: 'Há vazamentos durante a operação?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_7', titulo: 'O nível de óleo hidráulico está adequado?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_8', titulo: 'A vazão da máquina está adequada?', categoria: 'Sistema Hidráulico', resposta: '' },
    { id: 'hid_9', titulo: 'Há sinais de cavitação no sistema?', categoria: 'Sistema Hidráulico', resposta: '' },
  ],
  sistemaPneumatico: [
    { id: 'pneu_1', titulo: 'As conexões pneumáticas estão íntegras?', categoria: 'Sistema Pneumático', resposta: '' },
    { id: 'pneu_2', titulo: 'O sistema pneumático está sem vazamentos?', categoria: 'Sistema Pneumático', resposta: '' },
    { id: 'pneu_3', titulo: 'O funcionamento pneumático está adequado?', categoria: 'Sistema Pneumático', resposta: '' },
  ],
  sistemaEletrico: [
    { id: 'elet_1', titulo: 'Os cabos elétricos estão íntegros?', categoria: 'Sistema Elétrico', resposta: '' },
    { id: 'elet_2', titulo: 'Plugues e tomadas estão em boas condições?', categoria: 'Sistema Elétrico', resposta: '' },
    { id: 'elet_3', titulo: 'O painel elétrico está íntegro?', categoria: 'Sistema Elétrico', resposta: '' },
    { id: 'elet_4', titulo: 'Os componentes elétricos estão bem fixados?', categoria: 'Sistema Elétrico', resposta: '' },
    { id: 'elet_5', titulo: 'O sistema de aterramento (equipotencialização) está adequado?', categoria: 'Sistema Elétrico', resposta: '' },
    { id: 'elet_6', titulo: 'Disjuntores e dispositivos DR estão operacionais?', categoria: 'Sistema Elétrico', resposta: '' },
    { id: 'elet_7', titulo: 'O motor elétrico está em conformidade para operação?', categoria: 'Sistema Elétrico', resposta: '' },
  ],
  dispositivoSeguranca: [
    { id: 'seg_1', titulo: 'O botão de emergência está íntegro e operacional?', categoria: 'Dispositivos de Segurança', resposta: '' },
    { id: 'seg_2', titulo: 'O sistema de parada de emergência está operacional?', categoria: 'Dispositivos de Segurança', resposta: '' },
    { id: 'seg_3', titulo: 'O dispositivo anti-chicoteamento (configuração 8) está instalado e operacional?', categoria: 'Dispositivos de Segurança', resposta: '' },
    { id: 'seg_4', titulo: 'As proteções (grades/carenagens) estão íntegras?', categoria: 'Dispositivos de Segurança', resposta: '' },
    { id: 'seg_5', titulo: 'Gatilhos de segurança e travas estão funcionando?', categoria: 'Dispositivos de Segurança', resposta: '' },
  ],
  componentesOperacionais: [
    { id: 'comp_1', titulo: 'O equipamento encontra-se limpo?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_2', titulo: 'O equipamento foi lubrificado?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_3', titulo: 'Os rolamentos estão sem ruído anormal?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_4', titulo: 'Rotor, bombas e componentes internos estão livres e desobstruídos?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_5', titulo: 'Os acoplamentos estão bem fixados?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_6', titulo: 'As válvulas (by-pass, alívio, etc.) estão operacionais?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_7', titulo: 'Os manômetros estão íntegros e operacionais?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_8', titulo: 'Os filtros estão limpos e adequados?', categoria: 'Componentes Operacionais', resposta: '' },
    { id: 'comp_9', titulo: 'O sistema de resfriamento/trocador de calor está funcional?', categoria: 'Componentes Operacionais', resposta: '' },
  ],
  acessorios: [
    { id: 'acess_1', titulo: 'Cabos de aço estão íntegros (sem danos, nós ou desgaste)?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
    { id: 'acess_2', titulo: 'A fixação de cabos e ganchos está adequada?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
    { id: 'acess_3', titulo: 'Rodas e sistemas de locomoção estão funcionais?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
    { id: 'acess_4', titulo: 'Câmeras, sensores e monitores estão operacionais?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
    { id: 'acess_5', titulo: 'Iluminação/luminárias estão funcionando corretamente?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
    { id: 'acess_6', titulo: 'Bicos, esguichos e pistolas estão operacionais?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
    { id: 'acess_7', titulo: 'Reservatórios estão íntegros e com nível adequado?', categoria: 'Acessórios e Itens Específicos', resposta: '' },
  ],
  testesOperacionais: [
    { id: 'teste_1', titulo: 'O equipamento opera sem ruídos anormais?', categoria: 'Testes Operacionais', resposta: '' },
    { id: 'teste_2', titulo: 'O equipamento opera sem vazamentos?', categoria: 'Testes Operacionais', resposta: '' },
    { id: 'teste_3', titulo: 'O equipamento apresenta aquecimento excessivo?', categoria: 'Testes Operacionais', resposta: '' },
    { id: 'teste_4', titulo: 'O funcionamento geral está satisfatório?', categoria: 'Testes Operacionais', resposta: '' },
    { id: 'teste_5', titulo: 'O equipamento está operacional?', categoria: 'Testes Operacionais', resposta: '' },
  ],
  avaliacaoFinal: '',
});
