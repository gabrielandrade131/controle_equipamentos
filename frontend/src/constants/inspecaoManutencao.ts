import {
  InspecaoManutencao,
  ItemInspecao,
  RespostaBinaria,
} from "../types/manutencao";
import { getLocalDateInput } from "../utils/date";

export type SecaoInspecaoKey = keyof Pick<
  InspecaoManutencao,
  | "certificacoes"
  | "estruturaMecanica"
  | "sistemaHidraulico"
  | "sistemaPneumatico"
  | "sistemaEletrico"
  | "dispositivoSeguranca"
  | "componentesOperacionais"
  | "acessorios"
  | "testesOperacionais"
>;

type SecaoInspecaoConfig = {
  key: SecaoInspecaoKey;
  titulo: string;
  categoria: string;
};

type ChecklistItemTemplate = {
  id: string;
  titulo: string;
};

type ChecklistSectionTemplate = {
  secao: SecaoInspecaoKey;
  itens: ChecklistItemTemplate[];
};

type ChecklistTemplate = {
  id: string;
  label: string;
  secoes: ChecklistSectionTemplate[];
};

export type ChecklistManutencaoParams = {
  tipoEquipamento?: string;
  modeloEquipamento?: string;
  checklistId?: string;
};

export const SECOES_MANUTENCAO: SecaoInspecaoConfig[] = [
  {
    key: "certificacoes",
    titulo: "CERTIFICAÇÕES E DOCUMENTAÇÃO",
    categoria: "Certificações e Documentação",
  },
  {
    key: "estruturaMecanica",
    titulo: "ESTRUTURA E INTEGRIDADE MECÂNICA",
    categoria: "Estrutura e Integridade Mecânica",
  },
  {
    key: "sistemaHidraulico",
    titulo: "SISTEMA HIDRÁULICO",
    categoria: "Sistema Hidráulico",
  },
  {
    key: "sistemaPneumatico",
    titulo: "SISTEMA PNEUMÁTICO",
    categoria: "Sistema Pneumático",
  },
  {
    key: "sistemaEletrico",
    titulo: "SISTEMA ELÉTRICO",
    categoria: "Sistema Elétrico",
  },
  {
    key: "dispositivoSeguranca",
    titulo: "DISPOSITIVOS DE SEGURANÇA",
    categoria: "Dispositivos de Segurança",
  },
  {
    key: "componentesOperacionais",
    titulo: "COMPONENTES OPERACIONAIS",
    categoria: "Componentes Operacionais",
  },
  {
    key: "acessorios",
    titulo: "ACESSÓRIOS E ITENS ESPECÍFICOS",
    categoria: "Acessórios e Itens Específicos",
  },
  {
    key: "testesOperacionais",
    titulo: "TESTES OPERACIONAIS",
    categoria: "Testes Operacionais",
  },
];

const CHECKLIST_PADRAO: ChecklistTemplate = {
  id: "padrao",
  label: "Checklist padrão",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e/ou TAG estão legíveis?",
        },
        { id: "cert_2", titulo: "Certificações do equipamento estão válidas?" },
        {
          id: "cert_3",
          titulo:
            "Certificados de instrumentos (manômetros, etc.) estão dentro da validade?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento está íntegra e em boas condições de uso?",
        },
        { id: "estr_2", titulo: "A estrutura base/skid está sem deformações?" },
        {
          id: "estr_3",
          titulo: "A pintura ou tratamento da carcaça está adequado?",
        },
        { id: "estr_4", titulo: "Todos os componentes estão íntegros?" },
        {
          id: "estr_5",
          titulo:
            "Parafusos, porcas, abraçadeiras e fixações estão bem apertados e íntegros?",
        },
        {
          id: "estr_6",
          titulo: "Flanges e conexões mecânicas estão íntegros?",
        },
        {
          id: "estr_7",
          titulo: "Tambor, cone ou carcaças estão sem danos ou corrosão?",
        },
        {
          id: "estr_8",
          titulo:
            "Molas, peneiras, sapatas e demais partes mecânicas estão íntegras?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "hid_1", titulo: "As conexões hidráulicas estão íntegras?" },
        { id: "hid_2", titulo: "As mangueiras hidráulicas estão bem fixadas?" },
        {
          id: "hid_3",
          titulo: "As mangueiras hidráulicas estão sem vazamentos?",
        },
        {
          id: "hid_4",
          titulo: "As mangueiras hidráulicas estão em boas condições de uso?",
        },
        {
          id: "hid_5",
          titulo: "O sistema hidráulico está funcionando adequadamente?",
        },
        { id: "hid_6", titulo: "Há vazamentos durante a operação?" },
        { id: "hid_7", titulo: "O nível de óleo hidráulico está adequado?" },
        { id: "hid_8", titulo: "A vazão da máquina está adequada?" },
        { id: "hid_9", titulo: "Há sinais de cavitação no sistema?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "pneu_1", titulo: "As conexões pneumáticas estão íntegras?" },
        { id: "pneu_2", titulo: "O sistema pneumático está sem vazamentos?" },
        { id: "pneu_3", titulo: "O funcionamento pneumático está adequado?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "elet_1", titulo: "Os cabos elétricos estão íntegros?" },
        { id: "elet_2", titulo: "Plugues e tomadas estão em boas condições?" },
        { id: "elet_3", titulo: "O painel elétrico está íntegro?" },
        { id: "elet_4", titulo: "Os componentes elétricos estão bem fixados?" },
        {
          id: "elet_5",
          titulo:
            "O sistema de aterramento (equipotencialização) está adequado?",
        },
        {
          id: "elet_6",
          titulo: "Disjuntores e dispositivos DR estão operacionais?",
        },
        {
          id: "elet_7",
          titulo: "O motor elétrico está em conformidade para operação?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_1",
          titulo: "O botão de emergência está íntegro e operacional?",
        },
        {
          id: "seg_2",
          titulo: "O sistema de parada de emergência está operacional?",
        },
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento (configuração 8) está instalado e operacional?",
        },
        {
          id: "seg_4",
          titulo: "As proteções (grades/carenagens) estão íntegras?",
        },
        {
          id: "seg_5",
          titulo: "Gatilhos de segurança e travas estão funcionando?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "comp_1", titulo: "O equipamento encontra-se limpo?" },
        { id: "comp_2", titulo: "O equipamento foi lubrificado?" },
        { id: "comp_3", titulo: "Os rolamentos estão sem ruído anormal?" },
        {
          id: "comp_4",
          titulo:
            "Rotor, bombas e componentes internos estão livres e desobstruídos?",
        },
        { id: "comp_5", titulo: "Os acoplamentos estão bem fixados?" },
        {
          id: "comp_6",
          titulo: "As válvulas (by-pass, alívio, etc.) estão operacionais?",
        },
        {
          id: "comp_7",
          titulo: "Os manômetros estão íntegros e operacionais?",
        },
        { id: "comp_8", titulo: "Os filtros estão limpos e adequados?" },
        {
          id: "comp_9",
          titulo: "O sistema de resfriamento/trocador de calor está funcional?",
        },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        {
          id: "acess_1",
          titulo: "Cabos de aço estão íntegros (sem danos, nós ou desgaste)?",
        },
        {
          id: "acess_2",
          titulo: "A fixação de cabos e ganchos está adequada?",
        },
        {
          id: "acess_3",
          titulo: "Rodas e sistemas de locomoção estão funcionais?",
        },
        {
          id: "acess_4",
          titulo: "Câmeras, sensores e monitores estão operacionais?",
        },
        {
          id: "acess_5",
          titulo: "Iluminação/luminárias estão funcionando corretamente?",
        },
        {
          id: "acess_6",
          titulo: "Bicos, esguichos e pistolas estão operacionais?",
        },
        {
          id: "acess_7",
          titulo: "Reservatórios estão íntegros e com nível adequado?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "teste_1", titulo: "O equipamento opera sem ruídos anormais?" },
        { id: "teste_2", titulo: "O equipamento opera sem vazamentos?" },
        {
          id: "teste_3",
          titulo: "O equipamento apresenta aquecimento excessivo?",
        },
        { id: "teste_4", titulo: "O funcionamento geral está satisfatório?" },
        { id: "teste_5", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_CAVALETE_AR_MANDADO: ChecklistTemplate = {
  id: "cavalete-ar-mandado",
  label: "Cavalete de ar mandado",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boa condição de uso?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e TAG estão legíveis?",
        },
        {
          id: "cert_2",
          titulo:
            "Todas as certificações encontram-se dentro do prazo de validade?",
        },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        {
          id: "pneu_1",
          titulo:
            "As conexões e sistema de ar encontram-se em boas condições de uso?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "comp_1", titulo: "O equipamento encontra-se limpo?" },
        {
          id: "cav_filtro_condicao",
          titulo: "O filtro da unidade está em boa condição de uso?",
        },
        {
          id: "cav_filtro_validade",
          titulo:
            "O filtro está dentro da validade ou atenderá todo o período da operação?",
        },
        { id: "comp_7", titulo: "Manômetro está operacional?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        {
          id: "cav_cilindros_vazios",
          titulo:
            "Os cilindros vazios estão mantidos separados dos recipientes cheios e identificados por meio de etiqueta “VAZIO”?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "teste_4",
          titulo:
            "O equipamento encontra-se em perfeitas condições de funcionamento?",
        },
        { id: "teste_5", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_HELICOIDAL: ChecklistTemplate = {
  id: "bomba-helicoidal",
  label: "Bomba helicoidal",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e TAG estão legíveis?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "hid_1", titulo: "As conexões hidráulicas estão íntegras?" },
        { id: "hid_2", titulo: "As mangueiras estão bem fixadas?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [{ id: "comp_2", titulo: "A bomba foi lubrificada?" }],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "teste_4",
          titulo:
            "O equipamento encontra-se em perfeitas condições de funcionamento?",
        },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_PNEUMATICA: ChecklistTemplate = {
  id: "bomba-pneumatica",
  label: "Bomba pneumática",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
        {
          id: "estr_5",
          titulo: "Os parafusos da estrutura e abraçadeiras estão íntegros?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e TAG estão legíveis?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "comp_1", titulo: "O equipamento encontra-se limpo?" },
        { id: "comp_2", titulo: "A bomba foi lubrificada?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        {
          id: "pneu_1",
          titulo:
            "As conexões e sistema de ar da bomba encontram-se em boas condições de uso?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "teste_4",
          titulo:
            "O equipamento encontra-se em perfeitas condições de funcionamento?",
        },
        { id: "teste_5", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_SUBMERSIVEL: ChecklistTemplate = {
  id: "bomba-submersivel",
  label: "Bomba submersível",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
        {
          id: "estr_5",
          titulo: "Os parafusos da estrutura e abraçadeiras estão íntegros?",
        },
        {
          id: "estr_6",
          titulo:
            "O flange e conexão de recalque estão íntegros e operacionais?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e TAG estão legíveis?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "comp_1", titulo: "O equipamento encontra-se limpo?" },
        {
          id: "comp_4",
          titulo: "A bomba está com rotor íntegro e desobstruído?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hid_5",
          titulo:
            "As conexões e sistema hidráulico encontram-se em boas condições de uso?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "elet_2",
          titulo:
            "O cabeamento e plug elétrico estão em boas condições de uso? (Funcionamento elétrica)",
        },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        {
          id: "pneu_3",
          titulo:
            "O sistema pneumático (mão amiga e conexões) está em boa condição de uso? (Funcionamento pneumático)",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "teste_4",
          titulo:
            "O equipamento encontra-se em perfeitas condições de funcionamento?",
        },
        { id: "teste_5", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_GUINCHO_TRIPE: ChecklistTemplate = {
  id: "guincho-tripe",
  label: "Guincho tripé",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "As placas de identificação e TAG estão legíveis?",
        },
        { id: "cert_2", titulo: "A certificação do equipamento está válida?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        {
          id: "acess_1",
          titulo:
            "O cabo de aço está íntegro (sem danos, dobras, nós, arames rompidos, desgastes por abrasão ou corrosão)?",
        },
        {
          id: "acess_2",
          titulo:
            "A fixação do cabo no gancho de içamento está adequada para operação?",
        },
        {
          id: "guin_borrachas_antiderrapantes",
          titulo: "As borrachas sintéticas antiderrapantes estão íntegras?",
        },
        {
          id: "guin_cabo_lubrificacao",
          titulo: "O cabo e sua lubrificação está adequado para operação?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_7",
          titulo: "Aparentemente o tambor está íntegro (sem corrosão, danos)?",
        },
        {
          id: "estr_6",
          titulo: "As conexões estão em condições ideais de uso?",
        },
        {
          id: "estr_8",
          titulo: "As sapatas estão íntegras (sem desgaste excessivo)?",
        },
        { id: "estr_3", titulo: "A pintura está adequada para operação?" },
        { id: "estr_4", titulo: "Todos os componentes estão íntegros?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        {
          id: "guin_haste_controle",
          titulo:
            "A haste de controle retorna para a posição neutra quando é solta?",
        },
        {
          id: "guin_amortecimento_queda",
          titulo:
            "O sistema interno de absorção de impacto e amortecimento de queda está adequado para operação?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "O equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_HIDROJATO_ALTA_PRESSAO: ChecklistTemplate = {
  id: "hidrojato-alta-pressao",
  label: "Hidrojato de alta pressão",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
        {
          id: "estr_5",
          titulo: "Todos os parafusos e conexões estão bem fixados?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e TAG estão legíveis?",
        },
        {
          id: "cert_2",
          titulo:
            "Todas as certificações encontram-se dentro do prazo de validade?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "seg_4", titulo: "A grade de proteção está íntegra?" },
        {
          id: "seg_1",
          titulo: "O botão de emergência está íntegro e operacional?",
        },
        {
          id: "seg_5",
          titulo:
            "O gatilho de segurança da pistola está íntegra e operacional?",
        },
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "elet_3", titulo: "O painel elétrico está íntegro?" },
        {
          id: "elet_6",
          titulo: "Contém dispositivo diferencial residual (DR)?",
        },
        {
          id: "hidro_plug_atex",
          titulo:
            "O plugue elétrico é para a área classificada (ATEX) e está íntegro?",
        },
        {
          id: "hidro_motor_explosao",
          titulo: "O motor elétrico é a prova de explosão?",
        },
        {
          id: "elet_5",
          titulo:
            "Ponto de equipotencialização (terra) está visível e bem fixado?",
        },
        { id: "elet_1", titulo: "O cabo elétrico está íntegro?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        {
          id: "acess_3",
          titulo: "As rodas de locomoção estão íntegras e funcionais?",
        },
        {
          id: "acess_6",
          titulo: "A pistola de alta pressão está íntegra e funcional?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hid_7",
          titulo:
            "O nível de óleo da bomba está na condição de operacionalidade?",
        },
        {
          id: "hid_3",
          titulo: "As mangueiras estão íntegras e sem vazamentos?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        {
          id: "comp_5",
          titulo: "O acoplamento entre bomba e motor está bem fixado?",
        },
        {
          id: "teste_2",
          titulo: "A bomba está operacional sem vazamentos?",
        },
        {
          id: "comp_6",
          titulo: "A válvula de by-pass/regulagem está íntegra e operacional?",
        },
        { id: "comp_7", titulo: "O manômetro está íntegro e operacional?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "teste_4",
          titulo:
            "O equipamento encontra-se em perfeitas condições de funcionamento?",
        },
        { id: "teste_5", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_HPU_UEH_50: ChecklistTemplate = {
  id: "hpu-ueh-50",
  label: "HPU - UEH-50",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo:
            "As placas de identificação do equipamento e/ou TAG estão legíveis?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hpu50_nivel_oleo",
          titulo:
            "Verificação nível de óleo: o óleo permaneceu no nível após operação conforme instrução do fabricante?",
        },
        {
          id: "hpu50_circulacao_fluido",
          titulo:
            "Após iniciar o funcionamento da unidade hidráulica por 1 minuto, a circulação do fluído foi satisfatória?",
        },
        {
          id: "hpu50_nivel_pos_desligar",
          titulo:
            "Após desligar o equipamento, o nível de óleo permaneceu no nível de operação conforme descrição do equipamento?",
        },
        {
          id: "hpu50_substituicao_oleo",
          titulo:
            "Foi necessária a substituição do óleo do sistema? (Óleo ISO VG68)",
        },
        {
          id: "hpu50_trocador_calor",
          titulo:
            "Após realizar a limpeza do trocador de calor e a troca de óleo, o sistema ficou operacional?",
        },
        {
          id: "hpu50_filtros_inspecionados",
          titulo: "Os filtros do equipamento foram inspecionados e limpos?",
        },
        {
          id: "hpu50_filtro_retorno",
          titulo:
            "O elemento filtrante do filtro de retorno está adequado para operação, após inspeção da pressão mostrada no manômetro?",
        },
        {
          id: "hpu50_filtro_succao",
          titulo:
            "O filtro de sucção está adequado para operação, após análise de presença de cavitação na bomba hidráulica?",
        },
        {
          id: "teste_1",
          titulo:
            "A execução de teste na base foi satisfatória (sem ruído excessivo)?",
        },
        {
          id: "teste_3",
          titulo:
            "Houve algum aquecimento excessivo da máquina durante a operação na base?",
        },
        {
          id: "hid_8",
          titulo: "A vazão da máquina está adequada para operação?",
        },
        {
          id: "hid_4",
          titulo:
            "As conexões e mangueiras estão íntegras e adequadas para operação?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "hpu50_conexoes_eletricas",
          titulo:
            "As conexões elétricas, cabeamento, tomadas e componentes estão íntegros e adequados para operação?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_2",
          titulo: "O sistema de parada de emergência está operacional?",
        },
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_3",
          titulo:
            "A pintura ou tratamento da carcaça está adequada para operação?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "Equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_HPU_UEH_75: ChecklistTemplate = {
  id: "hpu-ueh-75",
  label: "HPU - UEH-75",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo:
            "As placas de identificação do equipamento e TAG estão legíveis?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hpu75_nivel_oleo",
          titulo:
            "Verificação nível de óleo: o óleo permaneceu no nível, após operação conforme instrução do fabricante?",
        },
        {
          id: "hpu75_circulacao_fluido",
          titulo:
            "Após iniciar o funcionamento da unidade hidráulica por 1 minuto, a circulação do fluído foi satisfatória?",
        },
        {
          id: "hpu75_nivel_pos_desligar",
          titulo:
            "Após desligar o equipamento, o nível de óleo permaneceu no nível de operação conforme descrição do equipamento?",
        },
        {
          id: "hpu75_substituicao_oleo",
          titulo:
            "Foi necessária a substituição do óleo do sistema? (Óleo ISO VG68)",
        },
        {
          id: "hpu75_trocador_calor",
          titulo:
            "Após realizar a limpeza do trocador de calor e a troca de óleo, o sistema ficou operacional?",
        },
        {
          id: "hpu75_filtros_inspecionados",
          titulo: "Os filtros do equipamento foram inspecionados e limpos?",
        },
        {
          id: "hpu75_filtro_retorno",
          titulo:
            "O elemento filtrante do filtro de retorno está adequado para operação, após inspeção da pressão mostrada no manômetro?",
        },
        {
          id: "hpu75_filtro_succao",
          titulo:
            "O filtro de sucção está adequado para operação, após análise de presença de cavitação na bomba hidráulica?",
        },
        {
          id: "teste_1",
          titulo:
            "A execução de teste na base foi satisfatória (sem ruído excessivo)?",
        },
        {
          id: "teste_3",
          titulo:
            "Houve algum aquecimento excessivo da máquina durante a operação na base?",
        },
        {
          id: "hid_8",
          titulo: "A vazão da máquina está adequada para operação?",
        },
        {
          id: "hid_4",
          titulo:
            "As conexões e mangueiras estão íntegras e adequadas para operação?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "hpu75_conexoes_eletricas",
          titulo:
            "As conexões elétricas, cabeamento, tomadas e componentes estão íntegros e adequados para operação?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        {
          id: "hpu75_troca_componentes",
          titulo:
            "Haverá necessidade de troca de algum componente durante o teste?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_2",
          titulo: "O sistema de parada de emergência está operacional?",
        },
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "hpu75_pintura_tratamento",
          titulo: "Haverá necessidade de pintura ou tratamento da carcaça?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "Equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_LUMINARIA_PNEUMATICA: ChecklistTemplate = {
  id: "luminaria-pneumatica",
  label: "Luminária pneumática",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "As placas de identificação e TAG estão legíveis?",
        },
        {
          id: "lum_epl_zona",
          titulo:
            "O equipamento está apropriado para os requisitos de EPL/Zona do local da instalação?",
        },
        {
          id: "lum_classe_grupo",
          titulo:
            "A classe do equipamento e o grupo está adequado para operação?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "lum_involucro",
          titulo:
            "As condições do invólucro estão adequadas para operação (partes de vidro, vedações e/ou compostos de selagem)?",
        },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        {
          id: "pneu_2",
          titulo: "O sistema pneumático está íntegro (sem vazamento)?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "lum_limpeza_plugs",
          titulo:
            "O cabo e plugs estão com a limpeza e higienização adequados para operação?",
        },
        {
          id: "lum_sistema_eletrico",
          titulo:
            "O sistema elétrico da luminária está adequado para operação (cabos, conectores, bulbos)?",
        },
        {
          id: "lum_respiro_drenagem",
          titulo:
            "O dispositivo de respiro e drenagem estão adequados para operação?",
        },
        {
          id: "elet_5",
          titulo:
            "As conexões de aterramento, incluindo quaisquer conexões de aterramento suplementar, estão adequadas para operação?",
        },
        { id: "lum_prensa_cabo", titulo: "O prensa cabo está íntegro?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "lum_ligou_normal",
          titulo: "Após ligar, a luminária ligou normalmente?",
        },
        { id: "teste_5", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_MANIFOLD: ChecklistTemplate = {
  id: "manifold",
  label: "Manifold",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "A placa de identificação e TAG estão legíveis?",
        },
        {
          id: "cert_3",
          titulo: "O certificado do manômetro está dentro da validade?",
        },
        {
          id: "man_cert_estrutura",
          titulo: "A certificação da estrutura está dentro da validade?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "estr_1", titulo: "A estrutura do equipamento está íntegra?" },
        { id: "estr_3", titulo: "A pintura está adequada para operação?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        {
          id: "pneu_1",
          titulo: "As conexões do sistema pneumático encontram-se íntegras?",
        },
        {
          id: "pneu_2",
          titulo: "As conexões encontram-se sem vazamento durante utilização?",
        },
      ],
    },
    {
      secao: "acessorios",
      itens: [{ id: "man_pegador", titulo: "O pegador está íntegro?" }],
    },
    {
      secao: "componentesOperacionais",
      itens: [{ id: "comp_1", titulo: "O equipamento está limpo?" }],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "O equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_ROBO_LOMBRICO_ROV: ChecklistTemplate = {
  id: "robo-lombrico-rov",
  label: "Robô Lombrico ROV",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
        {
          id: "estr_5",
          titulo: "Todos os parafusos e conexões estão bem fixados?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e/ou TAG estão legíveis?",
        },
        {
          id: "cert_2",
          titulo:
            "Todas as certificações encontram-se dentro do prazo de validade?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "elet_3", titulo: "O painel elétrico está íntegro?" },
        { id: "elet_2", titulo: "A tomada elétrica está íntegra?" },
        {
          id: "elet_5",
          titulo:
            "Ponto de equipotencialização (terra) está visível e bem fixado?",
        },
        { id: "elet_1", titulo: "O cabo elétrico está íntegro?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hid_2",
          titulo: "As mangueiras hidráulicas estão fixadas ao robô?",
        },
        {
          id: "hid_7",
          titulo:
            "O nível de óleo da unidade está na condição de operacionalidade?",
        },
        {
          id: "rov_protecao_condutores",
          titulo: "A proteção dos condutores hidráulicos está íntegra?",
        },
        {
          id: "hid_3",
          titulo: "As mangueiras estão íntegras e sem vazamentos?",
        },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        {
          id: "rov_esteira",
          titulo: "A esteira de locomoção está íntegra e operacional?",
        },
        { id: "rov_monitores", titulo: "Os monitores estão operacionais?" },
        { id: "rov_cameras", titulo: "As câmeras estão operacionais?" },
        {
          id: "rov_esguicho_cameras",
          titulo: "O esguicho de limpeza das câmeras está operacional?",
        },
        {
          id: "rov_cadeira",
          titulo:
            "A cadeira de assento está íntegra e seus ajustes operacionais?",
        },
        {
          id: "rov_bicos_esguicho",
          titulo: "Os bicos de esguicho estão bem fixados e operacionais?",
        },
        {
          id: "acess_7",
          titulo:
            "O reservatório de água para limpeza das câmeras está em nível operacional?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        {
          id: "rov_comandos_controle",
          titulo:
            "Os comandos de acionamento e controle do equipamento estão operacionais?",
        },
        {
          id: "rov_descompactador",
          titulo: "O descompactador está íntegro e operacional?",
        },
        { id: "comp_6", titulo: "A válvula solenoide está operacional?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
        {
          id: "seg_1",
          titulo: "O botão de emergência está íntegro e operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "O equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_SHAKER: ChecklistTemplate = {
  id: "shaker",
  label: "Shaker",
  secoes: [
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_1",
          titulo:
            "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
        {
          id: "estr_5",
          titulo: "Todos os parafusos e conexões estão bem fixados?",
        },
        { id: "shaker_peneiras", titulo: "As peneiras estão íntegras?" },
        {
          id: "shaker_molas",
          titulo: "As molas do sistema mecânico estão íntegras para operação?",
        },
      ],
    },
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "Placa de identificação e/ou TAG estão legíveis?",
        },
        {
          id: "cert_2",
          titulo:
            "Todas as certificações encontram-se dentro do prazo de validade?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hid_3",
          titulo: "As mangueiras estão íntegras e sem vazamentos?",
        },
        { id: "hid_2", titulo: "As mangueiras estão fixadas?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        {
          id: "shaker_skimmer",
          titulo: "O skimmer está em boas condições para operação?",
        },
        {
          id: "shaker_manoplas",
          titulo: "As manoplas de acionamento estão operacionais?",
        },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "acess_7", titulo: "O reservatório de água está íntegro?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
        {
          id: "seg_1",
          titulo: "O botão de emergência está íntegro e operacional?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "shaker_botoeiras",
          titulo: "As botoeiras do painel estão operacionais?",
        },
        { id: "elet_3", titulo: "O painel elétrico está íntegro?" },
        { id: "elet_2", titulo: "O plug elétrico está íntegro?" },
        {
          id: "elet_5",
          titulo:
            "Ponto de equipotencialização (terra) está visível e bem fixado?",
        },
        { id: "elet_1", titulo: "O cabo elétrico está íntegro?" },
        {
          id: "elet_6",
          titulo: "Os disjuntores e DRs estão operacionais e fixados?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "O equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_SOPRADOR_PNEUMATICO: ChecklistTemplate = {
  id: "soprador-pneumatico",
  label: "Soprador pneumático",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "A placa de identificação e TAG estão legíveis?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "estr_7", titulo: "A estrutura do cone está íntegra?" },
        {
          id: "estr_2",
          titulo: "A estrutura da base está íntegra e sem deformações?",
        },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "pneu_1", titulo: "As conexões pneumáticas estão íntegras?" },
        {
          id: "pneu_2",
          titulo:
            "Durante teste de operação, a conexão pneumática apresentou algum vazamento?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [{ id: "comp_1", titulo: "O equipamento está limpo?" }],
    },
    {
      secao: "acessorios",
      itens: [{ id: "sop_pegador", titulo: "O pegador está íntegro?" }],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento na configuração 8 está operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "O equipamento está operacional?" }],
    },
  ],
};

const CHECKLIST_EXAUSTOR_VENTILADOR_420_550: ChecklistTemplate = {
  id: "exaustor-ventilador-420-550",
  label: "Exaustor/Ventilador 420-550",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "exa_placa_tag",
          titulo: "A placa de identificação e TAG estão legíveis?",
        },
        {
          id: "exa_certificacoes",
          titulo: "Todas as certificações encontram-se dentro do prazo de validade?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "exa_estrutura",
          titulo: "A estrutura do equipamento encontra-se em boas condições de uso?",
        },
        {
          id: "exa_grade_protecao",
          titulo: "A grade de proteção está íntegra?",
        },
        {
          id: "exa_helice",
          titulo: "A hélice do equipamento está íntegra?",
        },
        {
          id: "exa_parafusos",
          titulo: "Todos os parafusos estão bem fixados?",
        },
        {
          id: "exa_conduto_flexivel",
          titulo: "O conduto flexível está operacional, sem danos e contém ponto de aterramento?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "exa_chave_comutadora",
          titulo: "A chave comutadora liga/desliga está íntegra?",
        },
        {
          id: "exa_plugue",
          titulo: "O plugue elétrico é para área classificada (ATEX) e está íntegro?",
        },
        {
          id: "exa_terra",
          titulo: "O ponto de equipotencialização (terra) está visível e bem fixado?",
        },
        {
          id: "exa_cabo_eletrico",
          titulo: "O cabo elétrico está íntegro?",
        },
        {
          id: "exa_motor_explosao",
          titulo: "O motor elétrico é à prova de explosão?",
        },
        {
          id: "exa_megagem_motor",
          titulo: "A megagem do motor está dentro do valor especificado?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        {
          id: "exa_condicoes_funcionamento",
          titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?",
        },
        { id: "exa_operacional", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_WPU_UNIDADE_LAVADORA: ChecklistTemplate = {
  id: "wpu-unidade-lavadora",
  label: "WPU - Unidade lavadora",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        {
          id: "cert_1",
          titulo: "As placas de identificação e TAG estão legíveis?",
        },
        {
          id: "cert_3",
          titulo: "A validade da calibração dos manômetros está em dia?",
        },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        {
          id: "comp_7",
          titulo: "O manômetro de pressão está em conformidade?",
        },
        { id: "comp_8", titulo: "O filtro cesto de entrada está limpo?" },
        {
          id: "wpu_selo_mecanico",
          titulo:
            "Durante testes de operação, o selo mecânico encontra-se íntegro e sem vazamento?",
        },
        {
          id: "comp_3",
          titulo:
            "Os rolamentos das bombas centrífugas estão sem ruído anormal?",
        },
        {
          id: "wpu_rolamentos_motor",
          titulo: "Os rolamentos dos motores estão sem ruído anormal?",
        },
        {
          id: "comp_6",
          titulo: "As conexões e válvulas estão sem vazamento e íntegras?",
        },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        {
          id: "wpu_manopla_63a",
          titulo:
            "A manopla da tomada de 63A está em conformidade para uso? Se necessário, lubrificar.",
        },
        {
          id: "wpu_chaves_painel",
          titulo: "As chaves do painel elétrico estão operacionais?",
        },
        { id: "wpu_botoeiras", titulo: "As botoeiras estão operacionais?" },
        {
          id: "wpu_luzes_indicacao",
          titulo: "As luzes de indicação luminosa estão em conformidade?",
        },
        {
          id: "wpu_aperto_itens_eletricos",
          titulo: "O aperto dos itens elétricos estão em conformidade?",
        },
        {
          id: "wpu_corrente_motor",
          titulo:
            "A corrente elétrica do motor está menor ou igual a 19A e maior ou igual a 18A?",
        },
        {
          id: "wpu_tomadas_plugs",
          titulo:
            "As tomadas, cabeamentos e plugs estão íntegras para operação?",
        },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        {
          id: "wpu_reservatorio_detergente",
          titulo: "O reservatório de detergente e conexões estão íntegros?",
        },
        {
          id: "wpu_tampa_reservatorio",
          titulo: "A tampa do reservatório de detergente está íntegra?",
        },
        {
          id: "wpu_eslingas_olhais",
          titulo: "As eslingas e olhais estão íntegras para operação?",
        },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        {
          id: "hid_2",
          titulo: "A mangueira do sistema hidráulico está bem fixado?",
        },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        {
          id: "estr_2",
          titulo: "A estrutura está íntegra e sem deformações (skid)?",
        },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        {
          id: "seg_3",
          titulo:
            "O dispositivo anti-chicoteamento está instalado na configuração 8 e operacional?",
        },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [{ id: "teste_5", titulo: "O equipamento está operacional?" }],
    },
  ],
};

const normalizarChave = (valor?: string) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .filter((parte) => !["de", "da", "do", "das", "dos"].includes(parte))
    .join(" ");

const CHECKLISTS_POR_EQUIPAMENTO: Record<string, ChecklistTemplate> = {
  padrao: CHECKLIST_PADRAO,
  default: CHECKLIST_PADRAO,
  [normalizarChave("Cavalete de ar mandado")]: CHECKLIST_CAVALETE_AR_MANDADO,
  [normalizarChave("Bomba helicoidal")]: CHECKLIST_BOMBA_HELICOIDAL,
  [normalizarChave("Bomba pneumática")]: CHECKLIST_BOMBA_PNEUMATICA,
  [normalizarChave("Bomba submersível")]: CHECKLIST_BOMBA_SUBMERSIVEL,
  [normalizarChave("Guincho tripé")]: CHECKLIST_GUINCHO_TRIPE,
  [normalizarChave("Hidrojato de alta pressão")]:
    CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("Hidrojato BP")]: CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("HPU - UEH-50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("UEH-50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("HPU - UEH-75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("UEH-75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("Luminária pneumática")]: CHECKLIST_LUMINARIA_PNEUMATICA,
  [normalizarChave("Manifold")]: CHECKLIST_MANIFOLD,
  [normalizarChave("Robô Lombrico ROV")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("Shaker")]: CHECKLIST_SHAKER,
  [normalizarChave("Soprador pneumático")]: CHECKLIST_SOPRADOR_PNEUMATICO,
  [normalizarChave("Exaustor 420")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor 550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador 420")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador 550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("WPU - Unidade lavadora")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("WPU")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("Unidade lavadora")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
};

const buscarChecklistPorValor = (valor?: string) => {
  const chave = normalizarChave(valor);
  if (!chave) return undefined;

  if (CHECKLISTS_POR_EQUIPAMENTO[chave]) {
    return CHECKLISTS_POR_EQUIPAMENTO[chave];
  }

  if (chave.split(" ").length < 2) {
    return undefined;
  }

  const chavesDisponiveis = Object.keys(CHECKLISTS_POR_EQUIPAMENTO).filter(
    (key) => key !== "padrao" && key !== "default",
  );
  const match = chavesDisponiveis.find(
    (key) => chave.includes(key) || key.includes(chave),
  );

  return match ? CHECKLISTS_POR_EQUIPAMENTO[match] : undefined;
};

export const obterChecklistManutencao = (
  params: ChecklistManutencaoParams = {},
) => {
  return (
    buscarChecklistPorValor(params.checklistId) ||
    buscarChecklistPorValor(params.modeloEquipamento) ||
    buscarChecklistPorValor(params.tipoEquipamento) ||
    CHECKLIST_PADRAO
  );
};

const construirItens = (
  secaoConfig: SecaoInspecaoConfig,
  templates: ChecklistItemTemplate[],
  itensAtuais?: ItemInspecao[],
  respostaPadrao: RespostaBinaria = "N/A",
) =>
  templates.map((template) => {
    const itemAtual = itensAtuais?.find((item) => item.id === template.id);
    return {
      id: template.id,
      titulo: template.titulo,
      categoria: secaoConfig.categoria,
      resposta: itemAtual?.resposta ?? respostaPadrao,
      observacoes: itemAtual?.observacoes,
    };
  });

export const aplicarChecklistManutencao = (
  inspecao: InspecaoManutencao,
  params: ChecklistManutencaoParams = {},
): InspecaoManutencao => {
  const checklist = obterChecklistManutencao(params);
  const secoesMap = new Map(
    checklist.secoes.map((secao) => [secao.secao, secao]),
  );

  const montarItens = (secaoConfig: SecaoInspecaoConfig) => {
    const template = secoesMap.get(secaoConfig.key);
    if (!template) {
      return [] as ItemInspecao[];
    }

    return construirItens(
      secaoConfig,
      template.itens,
      inspecao[secaoConfig.key],
    );
  };

  return {
    ...inspecao,
    certificacoes: montarItens(SECOES_MANUTENCAO[0]),
    estruturaMecanica: montarItens(SECOES_MANUTENCAO[1]),
    sistemaHidraulico: montarItens(SECOES_MANUTENCAO[2]),
    sistemaPneumatico: montarItens(SECOES_MANUTENCAO[3]),
    sistemaEletrico: montarItens(SECOES_MANUTENCAO[4]),
    dispositivoSeguranca: montarItens(SECOES_MANUTENCAO[5]),
    componentesOperacionais: montarItens(SECOES_MANUTENCAO[6]),
    acessorios: montarItens(SECOES_MANUTENCAO[7]),
    testesOperacionais: montarItens(SECOES_MANUTENCAO[8]),
  };
};

export const criarInspecaoVazia = (): InspecaoManutencao => {
  const dataAtual = getLocalDateInput();

  const base: InspecaoManutencao = {
    dataInicio: dataAtual,
    localManutencao: "",
    tipoManutencao: "CORRETIVA",
    tipoEquipamento: "",
    fabricante: "",
    modelo: "",
    tag: "",
    numeroOrdemManutencao: null,
    destino: "",
    dataRetornoBase: "",
    previsaoTermino: "",
    dataParalisacao: "",
    responsavel: "",
    responsavelRevisao: "",
    statusManutencao: "EM_MANUTENCAO",
    dataTermino: "",
    validade: "",
    certificacoes: [],
    estruturaMecanica: [],
    sistemaHidraulico: [],
    sistemaPneumatico: [],
    sistemaEletrico: [],
    dispositivoSeguranca: [],
    componentesOperacionais: [],
    acessorios: [],
    testesOperacionais: [],
    avaliacaoFinal: "",
    observacoesHistorico: [],
    imagensAnexadas: [],
  };

  return aplicarChecklistManutencao(base);
};
