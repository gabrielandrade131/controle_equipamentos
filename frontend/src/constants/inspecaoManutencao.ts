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
        { id: "cert_1", titulo: "Placa de identificação e/ou TAG estão legíveis?" },
        { id: "cert_2", titulo: "Certificações do equipamento estão válidas?" },
        { id: "cert_3", titulo: "Certificados de instrumentos (manômetros, etc.) estão dentro da validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "estr_1", titulo: "A estrutura do equipamento está íntegra e em boas condições de uso?" },
        { id: "estr_2", titulo: "A estrutura base/skid está sem deformações?" },
        { id: "estr_3", titulo: "A pintura ou tratamento da carcaça está adequado?" },
        { id: "estr_4", titulo: "Todos os componentes estão íntegros?" },
        { id: "estr_5", titulo: "Parafusos, porcas, abraçadeiras e fixações estão bem apertados e íntegros?" },
        { id: "estr_6", titulo: "Flanges e conexões mecânicas estão íntegros?" },
        { id: "estr_7", titulo: "Tambor, cone ou carcaças estão sem danos ou corrosão?" },
        { id: "estr_8", titulo: "Molas, peneiras, sapatas e demais partes mecânicas estão íntegras?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "hid_1", titulo: "As conexões hidráulicas estão íntegras?" },
        { id: "hid_2", titulo: "As mangueiras hidráulicas estão bem fixadas?" },
        { id: "hid_3", titulo: "As mangueiras hidráulicas estão sem vazamentos?" },
        { id: "hid_4", titulo: "As mangueiras hidráulicas estão em boas condições de uso?" },
        { id: "hid_5", titulo: "O sistema hidráulico está funcionando adequadamente?" },
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
        { id: "elet_5", titulo: "O sistema de aterramento (equipotencialização) está adequado?" },
        { id: "elet_6", titulo: "Disjuntores e dispositivos DR estão operacionais?" },
        { id: "elet_7", titulo: "O motor elétrico está em conformidade para operação?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "seg_1", titulo: "O botão de emergência está íntegro e operacional?" },
        { id: "seg_2", titulo: "O sistema de parada de emergência está operacional?" },
        { id: "seg_3", titulo: "O dispositivo anti-chicoteamento (configuração 8) está instalado e operacional?" },
        { id: "seg_4", titulo: "As proteções (grades/carenagens) estão íntegras?" },
        { id: "seg_5", titulo: "Gatilhos de segurança e travas estão funcionando?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "comp_1", titulo: "O equipamento encontra-se limpo?" },
        { id: "comp_2", titulo: "O equipamento foi lubrificado?" },
        { id: "comp_3", titulo: "Os rolamentos estão sem ruído anormal?" },
        { id: "comp_4", titulo: "Rotor, bombas e componentes internos estão livres e desobstruídos?" },
        { id: "comp_5", titulo: "Os acoplamentos estão bem fixados?" },
        { id: "comp_6", titulo: "As válvulas (by-pass, alívio, etc.) estão operacionais?" },
        { id: "comp_7", titulo: "Os manômetros estão íntegros e operacionais?" },
        { id: "comp_8", titulo: "Os filtros estão limpos e adequados?" },
        { id: "comp_9", titulo: "O sistema de resfriamento/trocador de calor está funcional?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "acess_1", titulo: "Cabos de aço estão íntegros (sem danos, nós ou desgaste)?" },
        { id: "acess_2", titulo: "A fixação de cabos e ganchos está adequada?" },
        { id: "acess_3", titulo: "Rodas e sistemas de locomoção estão funcionais?" },
        { id: "acess_4", titulo: "Câmeras, sensores e monitores estão operacionais?" },
        { id: "acess_5", titulo: "Iluminação/luminárias estão funcionando corretamente?" },
        { id: "acess_6", titulo: "Bicos, esguichos e pistolas estão operacionais?" },
        { id: "acess_7", titulo: "Reservatórios estão íntegros e com nível adequado?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "teste_1", titulo: "O equipamento opera sem ruídos anormais?" },
        { id: "teste_2", titulo: "O equipamento opera sem vazamentos?" },
        { id: "teste_3", titulo: "O equipamento apresenta aquecimento excessivo?" },
        { id: "teste_4", titulo: "O funcionamento geral está satisfatório?" },
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
      secao: "certificacoes",
      itens: [{ id: "bhel_cert_1", titulo: "Placa de identificação e TAG estão legíveis?" }],
    },
    {
      secao: "estruturaMecanica",
      itens: [{ id: "bhel_estr_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" }],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "bhel_hid_1", titulo: "As conexões hidráulicas estão íntegras?" },
        { id: "bhel_hid_2", titulo: "As mangueiras estão bem fixadas?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [{ id: "bhel_seg_1", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" }],
    },
    {
      secao: "componentesOperacionais",
      itens: [{ id: "bhel_comp_1", titulo: "A bomba foi lubrificada?" }],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "bhel_teste_1", titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?" },
        { id: "bhel_teste_2", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_REFLETOR_LED: ChecklistTemplate = {
  id: "refletor-led",
  label: "Refletor LED",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "refletor_led_1", titulo: "A placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "refletor_led_5", titulo: "A estrutura do equipamento encontra-se íntegra?" },
        { id: "refletor_led_7", titulo: "Durante os testes, o equipamentos está sem sobreaquecimento na estrutura?" },
        { id: "refletor_led_9", titulo: "A condição e a fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "refletor_led_2", titulo: "O cabo e o plugue elétrico são indicados para áreas classificadas?" },
        { id: "refletor_led_3", titulo: "O cabo e o plugue elétrico estão em boas condições?" },
        { id: "refletor_led_4", titulo: "Os prensa cabos estão instalados corretamente e em boas condições?" },
        { id: "refletor_led_6", titulo: "Todos os LEDs do conjunto do refletor estão operacionais?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "refletor_led_8", titulo: "Durante os testes, os cabos e plugs estão sem sobreacimento?" },
        { id: "refletor_led_10", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "refletor_led_11", titulo: "O equipamento foi testado?" },
        { id: "refletor_led_12", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_COMPRESSOR_AR: ChecklistTemplate = {
  id: "compressor-ar",
  label: "Compressor de Ar",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "compressor_ar_1", titulo: "As placas de identificação do equipamento e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "compressor_ar_11", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "compressor_ar_5", titulo: "A água do reservatório foi drenada por meio do purgador?" },
        { id: "compressor_ar_9", titulo: "O pressostato está devidamente regulado e apresenta bom funcionamento?" },
        { id: "compressor_ar_12", titulo: "O tempo de enchimento do reservatório está satisfatório?" },
        { id: "compressor_ar_14", titulo: "Durante o teste, o compressor funcionou sem apresentar ruídos anormais?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "compressor_ar_3", titulo: "O cabo e o plugue elétrico estão em boas condições?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "compressor_ar_2", titulo: "A estrutura e grade de proteção do equipamento encontra-se em boas condições?" },
        { id: "compressor_ar_13", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "compressor_ar_4", titulo: "As conexões e engates encontram-se em boas condições?" },
        { id: "compressor_ar_6", titulo: "O elemento filtrante está em boas condições?" },
        { id: "compressor_ar_7", titulo: "A correia do equipamento está integra e devidamente tensionada?" },
        { id: "compressor_ar_8", titulo: "A polia e o volante estão devidamente alinhados?" },
        { id: "compressor_ar_10", titulo: "O manômetro e válvulas estão ajustados, calibrados e operacionais?" },
        { id: "compressor_ar_15", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "compressor_ar_16", titulo: "O equipamento foi testado?" },
        { id: "compressor_ar_17", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_CAIXA_DISTRIBUIDORA: ChecklistTemplate = {
  id: "caixa-distribuidora",
  label: "Caixa Distribuidora",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "caixa_distribuidora_1", titulo: "As placas de identificação e TAG estão legíveis?" },
        { id: "caixa_distribuidora_2", titulo: "A certificação do equipamento está em dia?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "caixa_distribuidora_6", titulo: "A condição da estrutura do equipamento está adequada para operação?" },
        { id: "caixa_distribuidora_8", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "caixa_distribuidora_3", titulo: "O cabo elétrico encontra-se em boas condições?" },
        { id: "caixa_distribuidora_4", titulo: "O plugue elétrico encontra-se em boas condições?" },
        { id: "caixa_distribuidora_7", titulo: "Os prensa-cabos estão integros?" },
        { id: "caixa_distribuidora_9", titulo: "O dispositivo diferencial residual (DR) está operacional?" },
        { id: "caixa_distribuidora_10", titulo: "As chaves comutadoras liga/desliga estão íntegras e operacionais?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "caixa_distribuidora_5", titulo: "Os acomplamentos encontram-se operacionais e em boas condições?" },
        { id: "caixa_distribuidora_11", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "caixa_distribuidora_12", titulo: "O equipamento foi testado?" },
        { id: "caixa_distribuidora_13", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_CAIXA_TRANSFORMADORA: ChecklistTemplate = {
  id: "caixa-transformadora",
  label: "Caixa Transformadora",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "caixa_transformadora_1", titulo: "As placas de identificação e/ou TAG estão legíveis?" },
        { id: "caixa_transformadora_2", titulo: "A certificação do equipamento está em dia?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "caixa_transformadora_5", titulo: "A condição da estrutura do equipamento está adequada para operação?" },
        { id: "caixa_transformadora_7", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "caixa_transformadora_3", titulo: "O cabo elétrico encontra-se em boas condições?" },
        { id: "caixa_transformadora_4", titulo: "O plugue elétrico encontra-se em boas condições?" },
        { id: "caixa_transformadora_6", titulo: "Os prensa-cabos estão integros?" },
        { id: "caixa_transformadora_8", titulo: "O transformador de potência está funcionando corretamente e em boas condições?" },
        { id: "caixa_transformadora_9", titulo: "O dispositivo diferencial residual (DR) está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "caixa_transformadora_10", titulo: "As chaves comutadorsa liga/desliga estão íntegras e operacionais?" },
        { id: "caixa_transformadora_11", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "caixa_transformadora_12", titulo: "O equipamento foi testado?" },
        { id: "caixa_transformadora_13", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_GUINCHO_TRIPE: ChecklistTemplate = {
  id: "guincho-tripe",
  label: "Guincho Tripé",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "guincho_tripe_1", titulo: "As placas de identificação e/ou TAG estão legiveis?" },
        { id: "guincho_tripe_2", titulo: "A certificação do equipamento está válida?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "guincho_tripe_5", titulo: "Aparentemente o tambor está integro (sem corrosão, danos)?" },
        { id: "guincho_tripe_11", titulo: "As sapatas estão integras (sem desgaste excessivo)?" },
        { id: "guincho_tripe_12", titulo: "A pintura está adequada para operação?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "guincho_tripe_6", titulo: "As conexões estão em condições ideiais de uso?" },
        { id: "guincho_tripe_8", titulo: "O cabo e sua lubrificação está conforme?" },
        { id: "guincho_tripe_9", titulo: "A haste de controle retorna para a posição neutra quando é solta?" },
        { id: "guincho_tripe_10", titulo: "O sistema interno de absorção de impacto e amortecimento de queda está adequado para operação?" },
        { id: "guincho_tripe_13", titulo: "Todos os componentes estão integros?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "guincho_tripe_3", titulo: "O cabo de aço está integro (sem danos, dobras, nós, arames rompidos, desgastes por abrasão ou corrosão)?" },
        { id: "guincho_tripe_4", titulo: "A fixação do cabo no gancho de içamento está conforme?" },
        { id: "guincho_tripe_7", titulo: "As borrachas sintéticas antiderrapantes estão integras?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "guincho_tripe_14", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_TRAVA_QUEDAS: ChecklistTemplate = {
  id: "trava-quedas",
  label: "Trava Quedas",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "trava_quedas_1", titulo: "As placas de identificaçõ e/ou TAG estão legíveis?" },
        { id: "trava_quedas_2", titulo: "A certificação do equipamento está válida?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "trava_quedas_8", titulo: "O tambor está integro (sem corrosão ou danos)?" },
        { id: "trava_quedas_15", titulo: "A pintura do equipamento está adequada para operação?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "trava_quedas_7", titulo: "Existe um dispositivo de segurança para evitar a saída do cabo?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "trava_quedas_3", titulo: "O cabo está com o enrolamento ordenado e de forma correta?" },
        { id: "trava_quedas_4", titulo: "O cabo está fixado corretamente no cabeçote do tripé?" },
        { id: "trava_quedas_9", titulo: "As conexões estão adequados para operação?" },
        { id: "trava_quedas_11", titulo: "O cabo está com a limpeza e lubrificação adequadas para operação?" },
        { id: "trava_quedas_12", titulo: "A haste de controle retorna para a posição neutra quando é solta?" },
        { id: "trava_quedas_13", titulo: "O sistema de absorção de impacto e amortecimento de queda está adequado para operação?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "trava_quedas_5", titulo: "O cabo de aço está integro (sem danos, dobras, nós, arames rompidos, desgastes por abrasão ou corrosão)?" },
        { id: "trava_quedas_6", titulo: "A fixação do cabo no gancho de içamento está correta?" },
        { id: "trava_quedas_10", titulo: "A borracha sintética antiderrapante está integra?" },
        { id: "trava_quedas_14", titulo: "O processo de remoção do cabo de aço está adequado para operação?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "trava_quedas_16", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_LUMINARIA_PNEUMATICA: ChecklistTemplate = {
  id: "luminaria-pneumatica",
  label: "Luminária Pneumática",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "luminaria_pneumatica_1", titulo: "As placas de identificação e/ou TAG estão legíveis?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "luminaria_pneumatica_5", titulo: "O sistema pneumático está integro (sem vazamento)?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "luminaria_pneumatica_8", titulo: "As conexões de aterramento, incluindo quaisquer conexões de aterramento suplementar, estão adequados para operação?" },
        { id: "luminaria_pneumatica_9", titulo: "O prensa cabo está integro?" },
        { id: "luminaria_pneumatica_10", titulo: "Após ligar, a luminaria ligou normalmente?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "luminaria_pneumatica_2", titulo: "O cabo e plugs estão com a limpeza e higienização adequados para operação?" },
        { id: "luminaria_pneumatica_3", titulo: "A classe do equipamento e o grupo está adequado para operação?" },
        { id: "luminaria_pneumatica_4", titulo: "As condições do invólucro estão adequado para operação (partes de vidro, vedações e/ou compostos de selagem vidro/materia)?" },
        { id: "luminaria_pneumatica_6", titulo: "O sistema elétrico da luminária está adequado para operação (cabos, conectores, bulbos)?" },
        { id: "luminaria_pneumatica_7", titulo: "O dispositivo de respiro e drenagem estão adequados para operação?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "luminaria_pneumatica_11", titulo: "O equipamento está operacional?" },
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
        { id: "hpu_ueh_50_3", titulo: "As placas de identificação do equipamento e/ou TAG estão legíveis?" },
        { id: "hpu_ueh_50_21", titulo: "Todas as certificações do equipamento encontram-se dentro da data de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "hpu_ueh_50_1", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
        { id: "hpu_ueh_50_2", titulo: "A pintura do equipamento encontra-se adequada para operação?" },
        { id: "hpu_ueh_50_20", titulo: "A condição e a fixação dos parafusos foram revisadas?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "hpu_ueh_50_4", titulo: "Durante o teste, o óleo hidráulico circulou adequadamente pelo sistema?" },
        { id: "hpu_ueh_50_6", titulo: "Foi feita a substituição do óleo hidráulico (óleo ISO VG68)?" },
        { id: "hpu_ueh_50_12", titulo: "A bomba hidráulica está operacional e livre de ruídos anormais?" },
        { id: "hpu_ueh_50_13", titulo: "A vazão da máquina está adequada para operação?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "hpu_ueh_50_11", titulo: "O motor elétrico está operacional e livre de ruídos anormais?" },
        { id: "hpu_ueh_50_16", titulo: "O equipamento possui dispositivo diferencial residual (DR) instalado?" },
        { id: "hpu_ueh_50_18", titulo: "O cabo elétrico encontra-se em boas condições?" },
        { id: "hpu_ueh_50_19", titulo: "O plugue elétrico é para área classificada e encontra-se em boas condições?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "hpu_ueh_50_17", titulo: "O botão de emergência está em boas condições e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "hpu_ueh_50_5", titulo: "Após desligar o equipamento, o nível de óleo permaneceu no nível ideal?" },
        { id: "hpu_ueh_50_7", titulo: "O trocador de calor está funcionando adequadamente?" },
        { id: "hpu_ueh_50_8", titulo: "Os filtros do equipamento foram inspecionados e limpos?" },
        { id: "hpu_ueh_50_9", titulo: "O elemento filtrante de retorno está adequado para operação?" },
        { id: "hpu_ueh_50_10", titulo: "O filtro de sucção está adequado para operação?" },
        { id: "hpu_ueh_50_14", titulo: "Os manômetros estão em boas condições e funcionais?" },
        { id: "hpu_ueh_50_15", titulo: "As conexões e mangueiras estão integras e adequadas para operação?" },
        { id: "hpu_ueh_50_22", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "hpu_ueh_50_23", titulo: "O equipamento foi testado?" },
        { id: "hpu_ueh_50_24", titulo: "O equipamento está operacional?" },
      ],
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
        { id: "hpu_ueh_75_3", titulo: "As placas de identificação do equipamento e TAG estão legíveis?" },
        { id: "hpu_ueh_75_22", titulo: "Todas as certificações do equipamento encontram-se dentro da data de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "hpu_ueh_75_1", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
        { id: "hpu_ueh_75_2", titulo: "A pintura do equipamento encontra-se adequada para operação?" },
        { id: "hpu_ueh_75_21", titulo: "A condição e a fixação dos parafusos foram revisadas?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "hpu_ueh_75_4", titulo: "Durante o teste, o fluído circulou adequadamente pelo sistema?" },
        { id: "hpu_ueh_75_6", titulo: "Foi feita a substituição do óleo hidráulico ((óleo ISO VG68)?" },
        { id: "hpu_ueh_75_15", titulo: "A vazão da máquina está adequada para operação?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "hpu_ueh_75_11", titulo: "O motor elétrico está operacional e livre de ruídos anormais?" },
        { id: "hpu_ueh_75_17", titulo: "O equipamento possui dispositivo diferencial residual (DR) instalado?" },
        { id: "hpu_ueh_75_19", titulo: "O cabo elétrico encontra-se em boas condições?" },
        { id: "hpu_ueh_75_20", titulo: "O plugue elétrico é para área classificada e encontra-se em boas condições?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "hpu_ueh_75_18", titulo: "O botão de emergência está em boas condições e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "hpu_ueh_75_5", titulo: "Após desligar o equipamento, o nível de óleo permaneceu no nível ideal?" },
        { id: "hpu_ueh_75_7", titulo: "O trocador de calor está funcionando adequadamente?" },
        { id: "hpu_ueh_75_8", titulo: "Os filtros do equipamento foram inspecionados e limpos?" },
        { id: "hpu_ueh_75_9", titulo: "O elemento filtrante de retorno está adequado para operação?" },
        { id: "hpu_ueh_75_10", titulo: "O filtro de sucção está adequado para operação?" },
        { id: "hpu_ueh_75_12", titulo: "A bomba está operacional e livre de ruídos anormais?" },
        { id: "hpu_ueh_75_13", titulo: "O equipamento apresentou temperatura normal durante os testes?" },
        { id: "hpu_ueh_75_14", titulo: "Os manômetros estão em boas condições e funcionais?" },
        { id: "hpu_ueh_75_16", titulo: "As conexões e mangueiras estão integras e adequadas para operação?" },
        { id: "hpu_ueh_75_23", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "hpu_ueh_75_24", titulo: "O equipamento foi testado?" },
        { id: "hpu_ueh_75_25", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_MAQUINA_LIMPEZA_VACUO: ChecklistTemplate = {
  id: "maquina-limpeza-vacuo",
  label: "Máquina de Limpeza a Vácuo",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "maquina_limpeza_vacuo_1", titulo: "As placas de identifcação e/ou TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "maquina_limpeza_vacuo_2", titulo: "Após transporte, as vedações e os moveis da porta do container estão integros?" },
        { id: "maquina_limpeza_vacuo_3", titulo: "Após inspeção, as portas do container estão íntegras para entrar em operação?" },
        { id: "maquina_limpeza_vacuo_4", titulo: "Após inspeção, o painel acustico do container encontra-se integro?" },
        { id: "maquina_limpeza_vacuo_7", titulo: "Após inspeção, todas as peças estão em seu devido local (algemas, pinos etc.)?" },
        { id: "maquina_limpeza_vacuo_49", titulo: "O coletor de admissão, quanto a inspeção a superfície externa, danos ou rachaduras está integro? todas as fixações estão seguras? (1 mês ou 200 horas e depois 6 meses ou 1000 horas)." },
        { id: "maquina_limpeza_vacuo_58", titulo: "O método recomendado para definir o ponto de ajuste é com a válvula totalmente conectada e operando com o sistema de controle de segurança. nesta situação, o fechamento da válvula do controle de segurança mestre deve ser desviado durante o ajuste para permitir que a máquina continue funcionando. se este método não for possível, um manômetro pode ser instalado na porta vent para indicar quando a válvula abre. o ajuste do set point é realizado à temperatura normal de operação. deve-se ter muito cuidado ao manusear a válvula para evitar queimaduras ao operador. após o procedimento, o sistema ficou operacional?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "maquina_limpeza_vacuo_22", titulo: "As conexões elétricas estão adequadas para operação? manutenção a cada 12 meses ou 250 horas." },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "maquina_limpeza_vacuo_40", titulo: "O elemento de flametrap de exaustão está adequado para operação?" },
        { id: "maquina_limpeza_vacuo_46", titulo: "O sistema supressor de faiscas encontra-se integro e adequado para operação? manutenção a cada 6 meses ou 1000 horas." },
        { id: "maquina_limpeza_vacuo_48", titulo: "O coletor de chama de entrada, a tubulação e a junta estão integros e sem vazamento e apto para operação?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "maquina_limpeza_vacuo_5", titulo: "As conexões, roscas e plugs estão instalados corretamente?" },
        { id: "maquina_limpeza_vacuo_8", titulo: "Após inspeção, todos os componentes estão presente e integros (nos painéis, instrumentação, alavancas, medidores, interruptores, botões e mostradores frontais de vidro)?" },
        { id: "maquina_limpeza_vacuo_9", titulo: "Durante inspeção visual, o tanque de combustivel e tanque de água estão integros e sem vazamento?" },
        { id: "maquina_limpeza_vacuo_10", titulo: "O fluido dos tanques estão no nivel adequado para operação? caso necessário, complete." },
        { id: "maquina_limpeza_vacuo_11", titulo: "Durante inspeção, as mangueiras anti-estáticas, linhas de combustivel, válvulas e conexões, todos os itens encontram-se integros e sem vazamento?" },
        { id: "maquina_limpeza_vacuo_12", titulo: "Durante inspeção no acoplamento, as partes estão adequadas para operação (sem folga de torção )?" },
        { id: "maquina_limpeza_vacuo_13", titulo: "Durante inspeção, o acoplamento e os elementos flexiveis estão adequados para operação?" },
        { id: "maquina_limpeza_vacuo_14", titulo: "O acoplamento está íntegro e operacional?" },
        { id: "maquina_limpeza_vacuo_15", titulo: "Durante inspeção, o óleo do motor encontra-se em condições ideais para operação (nivel, saturação, tempo de uso...)?" },
        { id: "maquina_limpeza_vacuo_16", titulo: "O nível do líquido refrigerante está adequado para operação?" },
        { id: "maquina_limpeza_vacuo_17", titulo: "O nível do refrigerador de ar admissível está adequado para operação?" },
        { id: "maquina_limpeza_vacuo_18", titulo: "O orificio de drenagem está adequado para operação?" },
        { id: "maquina_limpeza_vacuo_19", titulo: "Durante inspeção geral, as correias de transmissão estão adequadas para uso? manutenção a cada 06 meses ou 150 horas." },
        { id: "maquina_limpeza_vacuo_20", titulo: "Durante inspeção, o filtro de ar tipo seco está adequado para operação? manutenção a cada 12 meses." },
        { id: "maquina_limpeza_vacuo_21", titulo: "Os ânodos de zinco estão adequados para operação? manutenção a cada 12 meses ou 250 horas." },
        { id: "maquina_limpeza_vacuo_23", titulo: "Durante inspeção, o pré-filtro de combustível está adequado para operação (limpeza, condições físicas...)? manutenção a cada 12 meses ou 250 horas." },
        { id: "maquina_limpeza_vacuo_24", titulo: "O controle do nível de água do combustível está adequado para operação? manutenção a cada 12 meses ou 250 horas." },
        { id: "maquina_limpeza_vacuo_25", titulo: "O filtro de óleo está adequado para operação (nivel de saturação)? manutenção a cada 12 meses ou 500 horas." },
        { id: "maquina_limpeza_vacuo_26", titulo: "As conexões da mangueira e as braçadeiras, no lado de admissão do compressor, estão adequadas para operação? manutenção a cada 12 meses ou 1000 horas." },
        { id: "maquina_limpeza_vacuo_27", titulo: "As valvulas estão bem fixadas e sem folga? manutenção a cada 12 meses ou 1500 horas" },
        { id: "maquina_limpeza_vacuo_28", titulo: "Durante inspeção, os bicos injetores estão adequados para operação? manutenção a cada 12 meses ou 1500 horas." },
        { id: "maquina_limpeza_vacuo_30", titulo: "A inspeção e o teste do turbocompressor foi satisfatório? manutenção a cada 12 meses." },
        { id: "maquina_limpeza_vacuo_32", titulo: "A verificação e limpeza do impulsor foi satisfatória? (bomba de drenagem de óleo). manutenção a cada 12 meses." },
        { id: "maquina_limpeza_vacuo_33", titulo: "O trocador de calor está limpo e pintado de forma adequada para operação? manutenção a cada 12 meses." },
        { id: "maquina_limpeza_vacuo_34", titulo: "Após inspeção, a limpeza do refrigerador de ar de carga está adequada para operação? manutenção a cada 12 meses." },
        { id: "maquina_limpeza_vacuo_35", titulo: "Após inspeção, o líquido refrigerante está adequado para operação? manutenção a cada 24 meses." },
        { id: "maquina_limpeza_vacuo_36", titulo: "A lubrificação do soprador e rolamentos está adequada para operação?" },
        { id: "maquina_limpeza_vacuo_37", titulo: "O óleo está adequado para operação?" },
        { id: "maquina_limpeza_vacuo_38", titulo: "No módulo de soprador de raizes, a temperatura está adequada para operação?" },
        { id: "maquina_limpeza_vacuo_39", titulo: "A pressão e temperatura de operação estão adequadas para operação?" },
        { id: "maquina_limpeza_vacuo_41", titulo: "O sistema de exaustão, a integridade mecânica de todos os componentes e as juntas da tubulação estão adequadas para operação?" },
        { id: "maquina_limpeza_vacuo_42", titulo: "Após verificação do resfriador de gases de escape e a remoção de carbono, o equipamento ficou adequado para operação? manutenção a cada 24 meses ou 4000 horas" },
        { id: "maquina_limpeza_vacuo_43", titulo: "Após verificação do manicooler de escape e a remoção de carbono, o equipamento ficou adequado para operação? manutenção a cada 24 meses ou 4000 horas." },
        { id: "maquina_limpeza_vacuo_44", titulo: "Durante inspeção, o sistema de exaustão flexivel, tubulação e a junta, encontram-se integros e adequados para operação? manutenção a cada 6 meses ou 1000 horas." },
        { id: "maquina_limpeza_vacuo_47", titulo: "A tubulação, as juntas e o seu interior estão sem vazamentos e limpos respectivamente? manutenção a cada 6 meses ou 1000 horas." },
        { id: "maquina_limpeza_vacuo_50", titulo: "Após inspecionar o resfriador de gases de escape e realizar a remoção de carbono, o sistema ficou adequado para operação? manutenção a cada 24 meses ou 4000 horas." },
        { id: "maquina_limpeza_vacuo_51", titulo: "Após inspeção do manicooler de escape e realizar a remoção de carbono, o sistema ficou adequado para operação? manutenção a cada 24 meses ou 4000 horas." },
        { id: "maquina_limpeza_vacuo_52", titulo: "Durante inspeção ao sistema de exaustão flexível, tubulação e a junta foi constatado alguma avaria no seu exterior e/ou vazamento, respectivamente? manutenção a cada 6 meses ou 1000 horas." },
        { id: "maquina_limpeza_vacuo_54", titulo: "A válvula de corte de entrada, SVG, está operando de forma satisfatória? manutenção a cada 200 horas." },
        { id: "maquina_limpeza_vacuo_55", titulo: "Após inspeção da válvula de corte de admissão de ar e teste de desligamento do motor, ambos estão adequados para operação? teste a cada 500 horas ou 3 meses." },
        { id: "maquina_limpeza_vacuo_56", titulo: "Foi realizado a limpeza da superficie externa da valvula para retirar acúmulo de sujeira/derrames potencialmente inflamáveis?" },
        { id: "maquina_limpeza_vacuo_57", titulo: "A válvula apresentou algum vazamento durante operação (prevenir contra o risco de explosão)?" },
        { id: "maquina_limpeza_vacuo_59", titulo: "Foi realizado limpeza na superfície externa da válvula quanto a acúmulo de sujeira/derrames potencialmente inflamáveis?" },
        { id: "maquina_limpeza_vacuo_61", titulo: "Para ajustar o ponto de ajuste é necessário operar o motor na velocidade do ponto de ajuste de desligamento. se isto não for seguro, a válvula sensora de velocidade deve ser removida do motor e montada em uma bancada de testes. após procedimento, o sistema ficou operacional?" },
        { id: "maquina_limpeza_vacuo_62", titulo: "Os recipientes devem ser drenados diariamente através da válvula situada na extremidade mais baixa. libere o ar comprimido lentamente de tal forma que não coloque em risco o pessoal ou o equipamento. desligue os compressores de ar antes de liberar o ar comprimido. após procedimento, o sistema ficou operacional?" },
        { id: "maquina_limpeza_vacuo_63", titulo: "Procedimento: abrir a válvula de purga na parte superior da tampa do filtro. drenar qualquer água e partículas separadas abrindo a válvula, pressionar e girar a parte inferior do recipiente. em seguida, fechar válvula de drenagem. reabastecer o filtro com combustível abrindo a válvula de corte, se o nível de combustível estiver acima do filtro, alternativamente, remova a tampa e complete o filtro, em seguida, recoloque a tampa e feche a válvula de sangria. após procedimento o sistema ficou operacional? procedimento anual." },
        { id: "maquina_limpeza_vacuo_64", titulo: "Após inspeção, o filtro de entrada de ar está íntegro para operação? (deve ser trocado a cada 250 horas ou 12 meses.)" },
        { id: "maquina_limpeza_vacuo_65", titulo: "Após procedimentos de manutenção, inspeção e testes, o equipamento ficou operacional?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "maquina_limpeza_vacuo_6", titulo: "As eslingas e todas as manilhas estão seguras e certificadas?" },
        { id: "maquina_limpeza_vacuo_45", titulo: "Durante inspeção, o dispositivo de monitoramento de teperatura encontra-se integro e adequado para operação? manutenção a cada 6 meses ou 1000 horas." },
        { id: "maquina_limpeza_vacuo_53", titulo: "Durante inspeção ao dispositivo de monitoramento de temperatura foi encontrado alguma avaria em seu exterior? manutenção a cada 6 meses ou 1000 horas." },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "maquina_limpeza_vacuo_29", titulo: "O teste de pressão foi satisfatório? manutenção a cada 12 meses ou 2000 horas." },
        { id: "maquina_limpeza_vacuo_31", titulo: "O teste de funcionamento do motor foi satisfatório? manutenção a cada 12 meses." },
        { id: "maquina_limpeza_vacuo_60", titulo: "Durante o teste de funcionamento a válvula apresentou alguma espécie de vazamento (prevenir contra risco de explosão)?" },
      ],
    },
  ],
};

const CHECKLIST_COMPRESSOR_XAS420: ChecklistTemplate = {
  id: "compressor-xas420",
  label: "Compressor XAS420",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "cert_1", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "cert_2", titulo: "Certificações do equipamento estão válidas?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "xas_est_1", titulo: "Verificar estado geral (peças danificadas, porcas e parafusos frouxos, problemas em operações anteriores, cor dos gases de escapamento)?" },
        { id: "xas_est_2", titulo: "Limpar externamente a unidade?" },
        { id: "xas_est_3", titulo: "Lubrificar dobradiças das portas, abraçadeiras, olhal da barra de tração e peças móveis?" },
        { id: "xas_est_4", titulo: "Inspecionar o aperto dos parafusos das rodas e barra de tração?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "xas_pneu_1", titulo: "Inspecionar o indicador de estado dos filtros. Limpar ou trocar os filtros se o indicador(es) estiver(em) vermelho?" },
        { id: "xas_pneu_2", titulo: "Verificar o funcionamento da válvula de segurança calibrando-a se necessário?" },
        { id: "xas_pneu_3", titulo: "Substituir os elementos de filtro de ar do compressor?" },
        { id: "xas_pneu_4", titulo: "Substituir o elemento separador de óleo?" },
        { id: "xas_pneu_5", titulo: "Verificar o funcionamento da válvula de regulagem, regulador de velocidade e solenóide de carga trocando os reparos se necessário?" },
        { id: "xas_pneu_6", titulo: "Inspecionar válvula de retenção de ar e óleo?" },
        { id: "xas_pneu_7", titulo: "Medir a queda de pressão no elemento separador?" },
        { id: "xas_pneu_8", titulo: "Substituir os elementos de filtro de ar do motor?" },
        { id: "xas_pneu_9", titulo: "Regular folga das válvulas de admissão e escape?" },
        { id: "xas_pneu_10", titulo: "Substituir filtros DDx, PDx e QDx (quando instalado)?" },
        { id: "xas_pneu_11", titulo: "Limpar dreno do elemento separador (quando instalado)?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "xas_elet_1", titulo: "Verificar bateria e terminais?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "xas_seg_1", titulo: "Verificar os dispositivos de proteção?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "xas_comp_1", titulo: "Limpar externamente o radiador de óleo do elemento compressor e radiador de água do motor?" },
        { id: "xas_comp_2", titulo: "Substituir o óleo lubrificante?" },
        { id: "xas_comp_3", titulo: "Substituir o filtro de óleo lubrificante?" },
        { id: "xas_comp_4", titulo: "Substituir o óleo lubrificante e filtro do motor?" },
        { id: "xas_comp_5", titulo: "Drenar a água no filtro primário e no tanque de combustível?" },
        { id: "xas_comp_6", titulo: "Substituir o filtro primário e secundário de combustível?" },
        { id: "xas_comp_7", titulo: "Substituir o filtro do líquido de arrefecimento?" },
        { id: "xas_comp_8", titulo: "Substituir a correia?" },
        { id: "xas_comp_9", titulo: "Inspecionar o líquido de arrefecimento?" },
        { id: "xas_comp_10", titulo: "Verificar o nível de óleo, água e combustível antes da partida e durante o funcionamento?" },
        { id: "xas_comp_11", titulo: "Limpar o coletor de pó dos filtros de ar antes da partida?" },
        { id: "xas_comp_12", titulo: "Verificar possíveis vazamentos de óleo combustível, óleo lubrificante e líquido de arrefecimento?" },
        { id: "xas_comp_13", titulo: "Limpar internamente o tanque de combustível?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "xas_acess_1", titulo: "Verificar, ajustar e lubrificar se necessário os cabos do freio?" },
        { id: "xas_acess_2", titulo: "Verificar a calibração dos pneus?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "xas_teste_1", titulo: "Integridade e teste de operação do equipamento satisfatórios?" },
        { id: "xas_teste_2", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_DETECTOR_GASES: ChecklistTemplate = {
  id: "detector-gases",
  label: "Detector de Gases",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "detector_gases_1", titulo: "A placa de identificação do equipamento encontra-se legível?" },
        { id: "detector_gases_6", titulo: "A certificação do equipamento encontra-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "detector_gases_2", titulo: "A estrutura do equipamento encontra-se em boas condições e sem anomalias?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "detector_gases_3", titulo: "O equipamento encontra-se limpo?" },
        { id: "detector_gases_5", titulo: "Bomba encontra-se em funcionamento?" },
        { id: "detector_gases_7", titulo: "Todos os acessórios, suportes e periféricos encontram-se em boas condições?" },
        { id: "detector_gases_8", titulo: "Os filtros encontram-se limpos e em boas condições de uso?" },
        { id: "detector_gases_9", titulo: "Os dispositivos de segurança encontram-se em condições?" },
        { id: "detector_gases_10", titulo: "Foi alterado algum circuito ou a configuração do equipamento?" },
        { id: "detector_gases_11", titulo: "A tela do visor LCD está exibindo informações do tipo de gáses e a concentração?" },
        { id: "detector_gases_12", titulo: "Destino: retorno ao estoque manutenção descarte" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "detector_gases_4", titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?" },
      ],
    },
  ],
};

const CHECKLIST_GUINCHO_PNEUMATICO: ChecklistTemplate = {
  id: "guincho-pneumatico",
  label: "Guincho Pneumático",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "guincho_pneumatico_2", titulo: "A placa de identificação e TAG estão legíveis?" },
        { id: "guincho_pneumatico_12", titulo: "O certificado do guincho está dentro da validade?" },
        { id: "guincho_pneumatico_13", titulo: "O certificado do cabo está dentro da validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "guincho_pneumatico_1", titulo: "A estrutura do equipamento encontra-se integra?" },
        { id: "guincho_pneumatico_4", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "guincho_pneumatico_3", titulo: "As conexões pneumáticas encontram- se em boas condições de uso?" },
        { id: "guincho_pneumatico_10", titulo: "O sistema pneumático está operacional e sem vazamentos?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "guincho_pneumatico_14", titulo: "Dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "guincho_pneumatico_5", titulo: "A haste de comando retorna à posição neutra quando utilizado?" },
        { id: "guincho_pneumatico_11", titulo: "O sistema do equipamento está devidamente lubrificado?" },
        { id: "guincho_pneumatico_15", titulo: "O equipamento encontra-se limpo?" },
        { id: "guincho_pneumatico_16", titulo: "O equipamento foi testado?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "guincho_pneumatico_6", titulo: "O cabo de aço está enrolado de forma ordenada e fixada corretaente no tambor?" },
        { id: "guincho_pneumatico_7", titulo: "O cabo de aço encontra-se em boas condições de uso?" },
        { id: "guincho_pneumatico_8", titulo: "A fixação do cabo de aço no gancho foi revisada?" },
        { id: "guincho_pneumatico_9", titulo: "Foi efetuada a limpeza do cabo de aço e sua lubrificação?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "guincho_pneumatico_17", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_PNEUMATICA: ChecklistTemplate = {
  id: "bomba-pneumatica",
  label: "Bomba Pneumática",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "bomba_pneumatica_2", titulo: "A placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "bomba_pneumatica_1", titulo: "A estrutura do equipamento encontra-se íntegra?" },
        { id: "bomba_pneumatica_4", titulo: "Os parafusos da estrutura e abraçadeiras estão íntegros?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "bomba_pneumatica_3", titulo: "O sistema de ar da bomba encontra-se em boas condições?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "bomba_pneumatica_9", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "bomba_pneumatica_5", titulo: "As conexões e engates estão em boas condições?" },
        { id: "bomba_pneumatica_6", titulo: "Foi verificado ou substituído os diafragmas?" },
        { id: "bomba_pneumatica_7", titulo: "As válvulas de retenção esféricas foram verificadas ou substituídas?" },
        { id: "bomba_pneumatica_8", titulo: "Foi realizada a lubrificação da válvula de ar?" },
        { id: "bomba_pneumatica_10", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "bomba_pneumatica_11", titulo: "O equipamento foi testado?" },
        { id: "bomba_pneumatica_12", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_SUBMERSIVEL: ChecklistTemplate = {
  id: "bomba-submersivel",
  label: "Bomba Submersível",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "bomba_submersivel_2", titulo: "Placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "bomba_submersivel_1", titulo: "A estrutura do equipamento encontra-se integra?" },
        { id: "bomba_submersivel_8", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "bomba_submersivel_5", titulo: "O motor hidráulico está funcional, sem vazamentos e ruídos anormais? (funcionamento hidráulico)" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "bomba_submersivel_6", titulo: "O sistema de distribuição de ar está em boas condições e foi lubrificado? (funcionamento pneumático)" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "bomba_submersivel_4", titulo: "O cabeamento e plugue elétrico estão em boas condições? (funcionamento elétrico)" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "bomba_submersivel_12", titulo: "Dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "bomba_submersivel_3", titulo: "As conexões, mangueiras encontram-se em boas condições?" },
        { id: "bomba_submersivel_7", titulo: "O flange e conexão de recalque estão íntegros e operacionais?" },
        { id: "bomba_submersivel_9", titulo: "A bomba apresenta algum vazamento?" },
        { id: "bomba_submersivel_10", titulo: "O selo mecânico está em boas condições?" },
        { id: "bomba_submersivel_11", titulo: "O rotor da bomba está íntegro, sem encrustrações e desobstruído?" },
        { id: "bomba_submersivel_13", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "bomba_submersivel_14", titulo: "O equipamento foi testado?" },
        { id: "bomba_submersivel_15", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_CONJUNTO_AUTONOMO: ChecklistTemplate = {
  id: "conjunto-autonomo",
  label: "Conjunto Autônomo",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "conjunto_autonomo_2", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "conjunto_autonomo_8", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "conjunto_autonomo_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "conjunto_autonomo_4", titulo: "As conexões e sistema de ar da encontra- se em boas condições de uso?" },
        { id: "conjunto_autonomo_5", titulo: "O cilindro está íntegro e em condições de operacionalidade?" },
        { id: "conjunto_autonomo_6", titulo: "A máscara, cintos, anéis de vedação, válvula de inalação e exalação estão operacionais?" },
        { id: "conjunto_autonomo_10", titulo: "Os cilindros vazios estão mantidos separados dos recipientes cheios e identificados por meio de etiqueta “vazio”?" },
        { id: "conjunto_autonomo_11", titulo: "Os cilindros estão armazenados em local próprio, projetado de modo que, em caso de incêndio, os recipientes possam ser facilmente removidos?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "conjunto_autonomo_3", titulo: "O equipamento encontra-se limpo?" },
        { id: "conjunto_autonomo_7", titulo: "Manômetro está operacional?" },
        { id: "conjunto_autonomo_9", titulo: "Os trabalhadores que utilizam recipiente contendo gases comprimidos possuem treinamento?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "conjunto_autonomo_12", titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?" },
        { id: "conjunto_autonomo_13", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_EEBD: ChecklistTemplate = {
  id: "eebd",
  label: "EEBD",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "eebd_2", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "eebd_8", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "eebd_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "eebd_4", titulo: "As conexões e sistema de ar da encontra- se em boas condições de uso?" },
        { id: "eebd_5", titulo: "O cilindro está íntegro e em condições de operacionalidade?" },
        { id: "eebd_6", titulo: "A máscara, cintos, anéis de vedação, válvula de inalação e exalação estão operacionais?" },
        { id: "eebd_10", titulo: "Os cilindros vazios estão mantidos separados dos recipientes cheios e identificados por meio de etiqueta “vazio”?" },
        { id: "eebd_11", titulo: "Os cilindros estão armazenados em local próprio, projetado de modo que, em caso de incêndio, os recipientes possam ser facilmente removidos?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "eebd_3", titulo: "O equipamento encontra-se limpo?" },
        { id: "eebd_7", titulo: "Manômetro está operacional?" },
        { id: "eebd_9", titulo: "Os trabalhadores que utilizam recipiente contendo gases comprimidos possuem treinamento?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "eebd_12", titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?" },
        { id: "eebd_13", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_EXAUSTOR_VENTILADOR_420_550: ChecklistTemplate = {
  id: "exaustor-ventilador-420-550",
  label: "Exaustor / Ventilador 420-550 EX",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "exaustor_ventilador_420_550_2", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "exaustor_ventilador_420_550_12", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "exaustor_ventilador_420_550_1", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
        { id: "exaustor_ventilador_420_550_6", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "exaustor_ventilador_420_550_8", titulo: "O plugue elétrico é para a área classificada e está íntegro?" },
        { id: "exaustor_ventilador_420_550_9", titulo: "O cabo elétrico está íntegro?" },
        { id: "exaustor_ventilador_420_550_10", titulo: "O motor eletrico está operacional e livre de ruídos anormais?" },
        { id: "exaustor_ventilador_420_550_11", titulo: "A megagem do motor está dentro do valor de especificação?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "exaustor_ventilador_420_550_3", titulo: "A grade de proteção está em boas condições?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "exaustor_ventilador_420_550_4", titulo: "A caixa comutadora lig/desliga está em boas condições e operacional?" },
        { id: "exaustor_ventilador_420_550_5", titulo: "A hélice do equipamento está íntegra?" },
        { id: "exaustor_ventilador_420_550_13", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "exaustor_ventilador_420_550_7", titulo: "O calço de borracha encontra-se em boas condições?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "exaustor_ventilador_420_550_14", titulo: "O equipamento foi testado?" },
        { id: "exaustor_ventilador_420_550_15", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_CAVALETE_AR_MANDADO: ChecklistTemplate = {
  id: "cavalete-ar-mandado",
  label: "Cavalete de Ar Mandado",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "cavalete_ar_mandado_1", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "cavalete_ar_mandado_6", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "cavalete_ar_mandado_2", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "cavalete_ar_mandado_3", titulo: "As conexões e sistema de ar encontram-se em boas condições?" },
        { id: "cavalete_ar_mandado_7", titulo: "Os cilindros vazios estão mantidos separados dos recipientes cheios e identificados por meio de etiqueta “vazio”?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "cavalete_ar_mandado_8", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "cavalete_ar_mandado_4", titulo: "O filtro do equipamento está em boas condições?" },
        { id: "cavalete_ar_mandado_5", titulo: "Manômetro está operacional?" },
        { id: "cavalete_ar_mandado_9", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "cavalete_ar_mandado_10", titulo: "O equipamento foi testado?" },
        { id: "cavalete_ar_mandado_11", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_VENTILADOR_ALTA_VAZAO: ChecklistTemplate = {
  id: "ventilador-alta-vazao",
  label: "Ventilador / Exaustor Alta Vazão",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "ventilador_alta_vazao_3", titulo: "A placa de identificação e TAG estão legíveis?" },
        { id: "ventilador_alta_vazao_19", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "ventilador_alta_vazao_1", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
        { id: "ventilador_alta_vazao_2", titulo: "A pintura da estrutura do equipamento encontra-se em boas condições de operação?" },
        { id: "ventilador_alta_vazao_4", titulo: "A condição e fixação dos parafusos foi revisada?" },
        { id: "ventilador_alta_vazao_15", titulo: "A estrutura do tubulão encontra-se íntegro?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "ventilador_alta_vazao_6", titulo: "O painel elétrico está integro?" },
        { id: "ventilador_alta_vazao_7", titulo: "O equipamento possui dispositivo diferencial residual (DR) instalado?" },
        { id: "ventilador_alta_vazao_9", titulo: "A chave comutadora liga/desliga está em boas condições e operacional?" },
        { id: "ventilador_alta_vazao_10", titulo: "O motor elétrico está operacional e livre de ruídos anormais?" },
        { id: "ventilador_alta_vazao_11", titulo: "Os prensa-cabos foram revisados e estão em boas condições?" },
        { id: "ventilador_alta_vazao_12", titulo: "O plugue elétrico está em boas condições?" },
        { id: "ventilador_alta_vazao_13", titulo: "Ponto de equipotencialização está aparente e bem fixado?" },
        { id: "ventilador_alta_vazao_14", titulo: "O cabo elétrico está em boas condições?" },
        { id: "ventilador_alta_vazao_18", titulo: "O conduto flexível está operacional, sem danos e contém ponto de aterramento?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "ventilador_alta_vazao_5", titulo: "A grade de proteção está íntegra?" },
        { id: "ventilador_alta_vazao_8", titulo: "O botão de emergência está íntegro e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "ventilador_alta_vazao_16", titulo: "O rotor de ventilação está em boas condições?" },
        { id: "ventilador_alta_vazao_20", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "ventilador_alta_vazao_17", titulo: "As rodas e rodízios de locomoção estão em boas condições e funcionais?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "ventilador_alta_vazao_21", titulo: "O equipamento foi testado?" },
        { id: "ventilador_alta_vazao_22", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_HIDROJATO_ALTA_PRESSAO: ChecklistTemplate = {
  id: "hidrojato-alta-pressao",
  label: "Hidrojato de Alta Pressão",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "hidrojato_alta_pressao_3", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "hidrojato_alta_pressao_18", titulo: "O certificado do manômetro está em dia?" },
        { id: "hidrojato_alta_pressao_21", titulo: "As demais certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "hidrojato_alta_pressao_1", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
        { id: "hidrojato_alta_pressao_2", titulo: "A condição e a fixação dos parafusos foram revisadas?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "hidrojato_alta_pressao_5", titulo: "O painél elétrico está integro?" },
        { id: "hidrojato_alta_pressao_6", titulo: "O equipamento possui dispositivo diferencial residual (DR)?" },
        { id: "hidrojato_alta_pressao_8", titulo: "O plugue elétrico é para a área classificada (ATEX) e está em boas condições?" },
        { id: "hidrojato_alta_pressao_9", titulo: "O motor elétrico é a prova de explosão e está operacional?" },
        { id: "hidrojato_alta_pressao_10", titulo: "Ponto de equipotencialização (terra) está visível e bem fixado?" },
        { id: "hidrojato_alta_pressao_11", titulo: "O cabo elétrico está em boas condições?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "hidrojato_alta_pressao_4", titulo: "A grade de proteção está íntegra?" },
        { id: "hidrojato_alta_pressao_7", titulo: "O botão de emergência está íntegro e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "hidrojato_alta_pressao_13", titulo: "O acoplamento entre bomba e motor está bem fixado?" },
        { id: "hidrojato_alta_pressao_14", titulo: "O nível e condição do óleo (15W40) da bomba foi verificado?" },
        { id: "hidrojato_alta_pressao_15", titulo: "A bomba possui algum vazamento?" },
        { id: "hidrojato_alta_pressao_16", titulo: "A válvula de by-pass/regulagem está íntegra e operacional?" },
        { id: "hidrojato_alta_pressao_17", titulo: "O manômetro está em boas condições e operacional?" },
        { id: "hidrojato_alta_pressao_19", titulo: "As mangueiras e conexões estão íntegras e sem vazamentos?" },
        { id: "hidrojato_alta_pressao_22", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "hidrojato_alta_pressao_12", titulo: "Os rozídios e rodas estão em boas condições e funcionais?" },
        { id: "hidrojato_alta_pressao_20", titulo: "A pistola de alta pressão está íntegra e funcional?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "hidrojato_alta_pressao_23", titulo: "O equipamento foi testado?" },
        { id: "hidrojato_alta_pressao_24", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_MASCARA_AR_MANDADO: ChecklistTemplate = {
  id: "mascara-ar-mandado",
  label: "Máscara de Ar Mandado",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "mascara_ar_mandado_2", titulo: "Placa de identificação e TAG estão legíveis?" },
        { id: "mascara_ar_mandado_7", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "mascara_ar_mandado_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "mascara_ar_mandado_4", titulo: "As conexões e sistema de ar da encontra- se em boas condições de uso?" },
        { id: "mascara_ar_mandado_6", titulo: "A traquéia sanfonada está íntegra e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "mascara_ar_mandado_3", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "mascara_ar_mandado_5", titulo: "O visor está íntegro e operacional?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "mascara_ar_mandado_8", titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?" },
        { id: "mascara_ar_mandado_9", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_ROBO_LOMBRICO_ROV: ChecklistTemplate = {
  id: "robo-lombrico-rov",
  label: "Robô Lombrico ROV",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "robo_lombrico_rov_3", titulo: "Placa de identificação e/ou TAG estão legíveis?" },
        { id: "robo_lombrico_rov_23", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "robo_lombrico_rov_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
        { id: "robo_lombrico_rov_2", titulo: "Todos os parafusos e conexões estão bem fixados?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "robo_lombrico_rov_9", titulo: "As mangueiras hidráulicas estão fixadas ao robô?" },
        { id: "robo_lombrico_rov_13", titulo: "A proteção dos condutores hidráulicos está íntegra?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "robo_lombrico_rov_4", titulo: "O painel elétrico está integro?" },
        { id: "robo_lombrico_rov_6", titulo: "A tomada elétrica está íntegra?" },
        { id: "robo_lombrico_rov_7", titulo: "Ponto de equipotencialização (terra) está visível e bem fixado?" },
        { id: "robo_lombrico_rov_8", titulo: "O cabo elétrico está íntegro?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "robo_lombrico_rov_5", titulo: "O botão de emergência está íntegro e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "robo_lombrico_rov_10", titulo: "O nível de óleo da unidade está na condição de operacionalidade?" },
        { id: "robo_lombrico_rov_14", titulo: "As mangueiras estão íntegras e sem vazamentos?" },
        { id: "robo_lombrico_rov_18", titulo: "Os comandos de acionamento e controle do equipamento estão operacionais?" },
        { id: "robo_lombrico_rov_22", titulo: "A valvula solenoide está operacional?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "robo_lombrico_rov_11", titulo: "A esteiras de locomoção estão íntegras e operacionais?" },
        { id: "robo_lombrico_rov_12", titulo: "Os monitores estão operacionais?" },
        { id: "robo_lombrico_rov_15", titulo: "O reservatório de água para limpeza das câmeras está em nível operacional?" },
        { id: "robo_lombrico_rov_16", titulo: "As câmeras estão operacionais?" },
        { id: "robo_lombrico_rov_17", titulo: "O esguicho de limpeza das câmeras está operacional?" },
        { id: "robo_lombrico_rov_19", titulo: "A cadeira de assento está integra e seus ajustes operacionais?" },
        { id: "robo_lombrico_rov_20", titulo: "Os bicos de esguicho estão bem fixados e operacionais?" },
        { id: "robo_lombrico_rov_21", titulo: "O descompactador está íntegro e operacional?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "robo_lombrico_rov_24", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_HVAC_16F: ChecklistTemplate = {
  id: "hvac-16f",
  label: "HVAC 16F",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "hvac_16f_3", titulo: "A placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "hvac_16f_1", titulo: "A estrutura estãá em boas condições e livre de corrosão?" },
        { id: "hvac_16f_2", titulo: "A pintura da estrutura está em boas condições operacionais?" },
        { id: "hvac_16f_4", titulo: "Os parafusos, abradeiras e demais fixações foram revisadas?" },
        { id: "hvac_16f_7", titulo: "O isolamento térmico da estrutura está em boas condições?" },
        { id: "hvac_16f_8", titulo: "A vedação das portas e suas fixações estão em boas condições?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "hvac_16f_14", titulo: "O motor elétrico da condensadora está operacional e sem ruídos?" },
        { id: "hvac_16f_18", titulo: "O equipamento possui dispositivo diferencial residual (DR) instalado?" },
        { id: "hvac_16f_19", titulo: "As chaves seletoras ON/OFF e os sinaleiros estão funcionais?" },
        { id: "hvac_16f_20", titulo: "O painel de controle CLP está funcional e operacional?" },
        { id: "hvac_16f_21", titulo: "Os transdutores estão funcionais?" },
        { id: "hvac_16f_22", titulo: "Os prensa-cabos foram revisados e estão em boas condições?" },
        { id: "hvac_16f_23", titulo: "O sistema de aterramento e os grampos estão em boas condições operacionais?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "hvac_16f_5", titulo: "As grades dos exaustores estão em boas condições?" },
        { id: "hvac_16f_24", titulo: "O botão de emergência está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "hvac_16f_6", titulo: "As hélices dos exaustores estão em boas condições?" },
        { id: "hvac_16f_9", titulo: "A bandeja, a saída de drenagem e o sifão estão em boas condições e sem entupimento?" },
        { id: "hvac_16f_10", titulo: "A válvula de serviço está em boas condições e operacional?" },
        { id: "hvac_16f_11", titulo: "A válvula de expansão está em boas condições e operacional?" },
        { id: "hvac_16f_12", titulo: "Os conduítes e as unidades seladoras estão em boas condições?" },
        { id: "hvac_16f_13", titulo: "O ventilador plenum está operacional e sem ruídos anormais?" },
        { id: "hvac_16f_15", titulo: "A correia de transmissão do motor está alinhada, ajustada e em boas condições?" },
        { id: "hvac_16f_16", titulo: "As aletas da condensadora estão limpas e em boas condições?" },
        { id: "hvac_16f_17", titulo: "Os compressores scroll estão em boas condições e operacionais?" },
        { id: "hvac_16f_25", titulo: "Os filtros encontram-se em boas condições operacionais?" },
        { id: "hvac_16f_26", titulo: "As serpentinas encontram-se em bom estado e livre de vazamentos?" },
        { id: "hvac_16f_27", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "hvac_16f_28", titulo: "O equipamento foi testado?" },
        { id: "hvac_16f_29", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_UBA_UNIDADE_LAVADORA: ChecklistTemplate = {
  id: "uba-unidade-lavadora",
  label: "UBA - Unidade Lavadora",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "uba_unidade_lavadora_1", titulo: "As placas de identificação e TAG estão legíveis?" },
        { id: "uba_unidade_lavadora_2", titulo: "A validade da calibração dos manometros está em dia?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "uba_unidade_lavadora_18", titulo: "A estrutura está íntegra e sem deformações (skid)?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "uba_unidade_lavadora_6", titulo: "As chaves do painel eletrico estão operacionais?" },
        { id: "uba_unidade_lavadora_7", titulo: "As botoeiras estão operacionais?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "uba_unidade_lavadora_3", titulo: "O manometro de pressão está em conformidade?" },
        { id: "uba_unidade_lavadora_4", titulo: "O filtro cesto de entrada está limpo?" },
        { id: "uba_unidade_lavadora_5", titulo: "A manopla da toma de 63A está em conformidade para uso? se necessário lubrificar." },
        { id: "uba_unidade_lavadora_8", titulo: "As luzes de indicação luminosa estão em conformidade?" },
        { id: "uba_unidade_lavadora_9", titulo: "O aperto dos itens elétricos estão em conformidade?" },
        { id: "uba_unidade_lavadora_10", titulo: "Durante testes de operação, o selo mecânico encontra-se íntegro e sem vazamento?" },
        { id: "uba_unidade_lavadora_11", titulo: "Os rolamentos das bombas centrífugas estão sem ruido anormal?" },
        { id: "uba_unidade_lavadora_12", titulo: "Os rolamentos dos motores estão sem ruído anormal?" },
        { id: "uba_unidade_lavadora_13", titulo: "A corrente elétrica do motor está menor ou igual a 19A e maior ou igual a 18A?" },
        { id: "uba_unidade_lavadora_14", titulo: "As tomadas, cabeamentos e plugs estão íntegras para operação?" },
        { id: "uba_unidade_lavadora_15", titulo: "As conexões e válvulas estão sem vazamento e íntegras?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "uba_unidade_lavadora_16", titulo: "O reservatório de detergente e conexões estão íntegros?" },
        { id: "uba_unidade_lavadora_17", titulo: "A tampa do reservatório de detergente está íntegra?" },
        { id: "uba_unidade_lavadora_19", titulo: "As slingas e olhais estão íntegras para operação?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "uba_unidade_lavadora_20", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30: ChecklistTemplate = {
  id: "exaustor-ventilador-sht-30",
  label: "Exaustor / Ventilador SHT 30",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "exaustor_ventilador_sht_30_2", titulo: "A placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "exaustor_ventilador_sht_30_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
        { id: "exaustor_ventilador_sht_30_5", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "exaustor_ventilador_sht_30_6", titulo: "O plugue elétrico é para área classificada e está íntegro?" },
        { id: "exaustor_ventilador_sht_30_7", titulo: "O cabo elétrico está em boas condições?" },
        { id: "exaustor_ventilador_sht_30_8", titulo: "O motor elétrico está operacional e livre de ruídos anormais?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "exaustor_ventilador_sht_30_3", titulo: "A grade de proteção encontra-se em boas condições?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "exaustor_ventilador_sht_30_4", titulo: "A hélice do equipamento está integra?" },
        { id: "exaustor_ventilador_sht_30_9", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "exaustor_ventilador_sht_30_10", titulo: "O equipamento foi testado?" },
        { id: "exaustor_ventilador_sht_30_11", titulo: "O equipamento está operacional?" },
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
        { id: "manifold_1", titulo: "A placa de identificação e TAG estão legíveis?" },
        { id: "manifold_2", titulo: "O certificado do manometro está dentro da validade?" },
        { id: "manifold_3", titulo: "O certificado do equipamento está dentro da validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "manifold_4", titulo: "A estrutura do equipamento está íntegra?" },
        { id: "manifold_5", titulo: "A pintura está adequada para operação?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "manifold_6", titulo: "As conexões e válvulas encontram-se em boas condições e sem vazamento durante utilização?" },
        { id: "manifold_7", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "manifold_8", titulo: "O equipamento foi testado?" },
        { id: "manifold_9", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_SOPRADOR_PNEUMATICO: ChecklistTemplate = {
  id: "soprador-pneumatico",
  label: "Soprador Pneumático",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "soprador_pneumatico_1", titulo: "A placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "soprador_pneumatico_2", titulo: "A estrutura do cone está íntegra?" },
        { id: "soprador_pneumatico_3", titulo: "A estrutura da base está íntegra e sem deformações?" },
      ],
    },
    {
      secao: "sistemaPneumatico",
      itens: [
        { id: "soprador_pneumatico_4", titulo: "As conexões pneumaticas estão íntegras?" },
        { id: "soprador_pneumatico_5", titulo: "Durante o teste, a conexão pneumática apresentou algum vazamento?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "soprador_pneumatico_7", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "soprador_pneumatico_6", titulo: "O pegador está íntegro?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "soprador_pneumatico_8", titulo: "O equipamento foi testado?" },
        { id: "soprador_pneumatico_9", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_HIDROJATO_BAIXA_PRESSAO: ChecklistTemplate = {
  id: "hidrojato-baixa-pressao",
  label: "Hidrojato de Baixa Pressão",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "hidrojato_baixa_pressao_3", titulo: "Placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "hidrojato_baixa_pressao_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
        { id: "hidrojato_baixa_pressao_2", titulo: "Todos os parafusos e conexões estão bem fixados?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "hidrojato_baixa_pressao_5", titulo: "O plugue elétrico está íntegro?" },
        { id: "hidrojato_baixa_pressao_6", titulo: "O cabo elétrico está íntegro?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "hidrojato_baixa_pressao_4", titulo: "A grade de proteção está íntegra?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "hidrojato_baixa_pressao_9", titulo: "As mangueiras estão íntegras e sem vazamentos?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "hidrojato_baixa_pressao_7", titulo: "As rodas locomoção estão íntegras e funcionais?" },
        { id: "hidrojato_baixa_pressao_10", titulo: "A pistola de baixa pressão está íntegra e funcional?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "hidrojato_baixa_pressao_8", titulo: "O equipamento encontra-se em perfeitas condições de funcionamento?" },
        { id: "hidrojato_baixa_pressao_11", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_COMPRESSOR_DIESEL: ChecklistTemplate = {
  id: "compressor-diesel",
  label: "Compressor a Diesel",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "compressor_diesel_1", titulo: "As placas de identificação do equipamento e TAG estão legíveis?" },
        { id: "compressor_diesel_3", titulo: "Os filtros de óleo e/ou elementos filtrantes do compressor estão dentro do prazo de validade (1000h ou 1 ano)" },
        { id: "compressor_diesel_4", titulo: "O óleo lubrificante do compressor está dentro do prazo de validade? (troca 1000h ou 1 ano)" },
        { id: "compressor_diesel_23", titulo: "O teste de fumaça preta está dentro da validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "compressor_diesel_12", titulo: "Os parafusos e conexões interna estão íntegros?" },
        { id: "compressor_diesel_17", titulo: "Os parafusos da estrutura estão íntegros?" },
        { id: "compressor_diesel_22", titulo: "A limpeza externa e/ou pintura está em conformidade para operação?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "compressor_diesel_14", titulo: "As baterias estão íntegras e operacionais?" },
        { id: "compressor_diesel_15", titulo: "Os terminais da bateria estão fixados corretamente?" },
        { id: "compressor_diesel_16", titulo: "O sistema elétrico (bateria, alternador, motor de arranque) estão íntegros?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "compressor_diesel_19", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "compressor_diesel_2", titulo: "O indicador de estado do filtro está verde? (verde – adequado para operação – limpar se necessário)" },
        { id: "compressor_diesel_5", titulo: "O elemento separador de óleo compressor está adequado para operação? (toleravel queda de pressão de 0 a 0,8 bar/11,6 psi)" },
        { id: "compressor_diesel_6", titulo: "O radiador de água do motor e radiador de óleo do compressor estão limpos (limpar com 1000h ou 1 ano)" },
        { id: "compressor_diesel_7", titulo: "Os filtros primários e secundários de combustivel estão operacionais? (substituir com 1000h ou 1 ano)" },
        { id: "compressor_diesel_8", titulo: "A água no filtro primário e no tanque de combustivel foi drenado? (inspecionar rotineiramente)" },
        { id: "compressor_diesel_9", titulo: "O líquido de arrefecimento está no nível adequado? (substituir com 1000h ou 1 ano)" },
        { id: "compressor_diesel_10", titulo: "O nivel de óleo da bomba injetora está adequado para operação?" },
        { id: "compressor_diesel_11", titulo: "O correia está adequada para operação? (substituir com 1000h ou 1 ano)" },
        { id: "compressor_diesel_13", titulo: "As mangueiras de circulação do diesel e água estão íntegros e operacionais?" },
        { id: "compressor_diesel_18", titulo: "As conexões externa estão íntegras e operacionais?" },
        { id: "compressor_diesel_21", titulo: "O painel de instrumento está operacional e mostrando as informações em funcionamento?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "compressor_diesel_20", titulo: "Os pneus e estrutura de fixação estão calibrados e íntegros respectivamente?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "compressor_diesel_24", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_SHAKER: ChecklistTemplate = {
  id: "shaker",
  label: "SHAKER",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "shaker_3", titulo: "Placa de identificação e/ou TAG estão legíveis?" },
        { id: "shaker_18", titulo: "Todas as certificações encontram-se dentro do prazo de validade?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "shaker_1", titulo: "A estrutura do equipamento encontra-se em boas condições?" },
        { id: "shaker_2", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "shaker_12", titulo: "O painel elétrico está integro?" },
        { id: "shaker_14", titulo: "O plugue elétrico está íntegro?" },
        { id: "shaker_15", titulo: "O cabo elétrico está integro?" },
        { id: "shaker_16", titulo: "Ponto de equipotencialização (terra) está visível e bem fixado?" },
        { id: "shaker_17", titulo: "Os disjuntores e DR estão operacionais?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "shaker_13", titulo: "O botão de emergência está íntegro e operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "shaker_7", titulo: "As mangueiras estão íntegras e sem vazamentos?" },
        { id: "shaker_8", titulo: "As mangueiras estão devidamente fixadas?" },
        { id: "shaker_9", titulo: "As manoplas de acionamento estão operacionais?" },
        { id: "shaker_10", titulo: "As molas do sistema mecânico estão íntegras para operação?" },
        { id: "shaker_11", titulo: "As botoreiras do painel estão operacionais?" },
        { id: "shaker_19", titulo: "O equipamento encontra-se limpo" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "shaker_4", titulo: "As peneiras estão integras?" },
        { id: "shaker_5", titulo: "O skimmer está em boas condições para operação?" },
        { id: "shaker_6", titulo: "O reservatório de água está íntegro?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "shaker_20", titulo: "O equipamento foi testado?" },
        { id: "shaker_21", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_WPU_UNIDADE_LAVADORA: ChecklistTemplate = {
  id: "wpu-unidade-lavadora",
  label: "WPU - Unidade Lavadora",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "wpu_unidade_lavadora_2", titulo: "As placas de identificação e TAG estão legíveis?" },
        { id: "wpu_unidade_lavadora_3", titulo: "A validade da calibração dos manometros está em dia?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "wpu_unidade_lavadora_1", titulo: "A estrutura do equipamento está em boas condições?" },
        { id: "wpu_unidade_lavadora_10", titulo: "A condição e fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "wpu_unidade_lavadora_19", titulo: "A mangueira do sistema hidraulico está bem fixado?" },
      ],
    },
    {
      secao: "sistemaEletrico",
      itens: [
        { id: "wpu_unidade_lavadora_7", titulo: "As chaves comutadoras do painel eletrico estão operacionais?" },
        { id: "wpu_unidade_lavadora_8", titulo: "As botoeiras estão operacionais?" },
        { id: "wpu_unidade_lavadora_9", titulo: "As sinaleiras estão operacionais?" },
        { id: "wpu_unidade_lavadora_13", titulo: "O motor elétrico está operacional e livre de ruídos anormais?" },
        { id: "wpu_unidade_lavadora_14", titulo: "O equipamento possui dispositivo diferencial residual (DR) instalado?" },
        { id: "wpu_unidade_lavadora_15", titulo: "O cabo elétrico encontra-se em boas condições?" },
        { id: "wpu_unidade_lavadora_16", titulo: "O plugue elétrico é para área classificada e encontra-se em boas condições" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "wpu_unidade_lavadora_4", titulo: "Os manômetros estão em boas condições e funcionais?" },
        { id: "wpu_unidade_lavadora_5", titulo: "O filtro cesto de entrada está limpo?" },
        { id: "wpu_unidade_lavadora_6", titulo: "A manopla da tomada de 63A está em conformidade para uso? se necessário lubrificar." },
        { id: "wpu_unidade_lavadora_11", titulo: "Durante testes, o selo mecânico encontra-se íntegro e sem vazamento?" },
        { id: "wpu_unidade_lavadora_12", titulo: "As bombas estão operacionais e livre de ruídos anormais?" },
        { id: "wpu_unidade_lavadora_17", titulo: "As conexões e válvulas estão sem vazamento e íntegras?" },
        { id: "wpu_unidade_lavadora_20", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "wpu_unidade_lavadora_18", titulo: "O a tampa e o reservatório de detergente e conexões estão íntegros?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "wpu_unidade_lavadora_21", titulo: "O equipamento foi testado?" },
        { id: "wpu_unidade_lavadora_22", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_CENTRIFUGA: ChecklistTemplate = {
  id: "bomba-centrifuga",
  label: "Bomba Centrífuga",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "bomba_centrifuga_2", titulo: "Placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "bomba_centrifuga_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
        { id: "bomba_centrifuga_13", titulo: "A condição e a fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "bomba_centrifuga_3", titulo: "As conexões hidráulicas estão íntegras?" },
        { id: "bomba_centrifuga_14", titulo: "O motor hidráulico está operacional?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "bomba_centrifuga_15", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "bomba_centrifuga_4", titulo: "O óleo da caixa de engrenagens (SAE 90) foi substituido?" },
        { id: "bomba_centrifuga_5", titulo: "Ao sangrar o óleo da caixa de engrenagens, o mesmo está sem emulsão ou limalhas?" },
        { id: "bomba_centrifuga_6", titulo: "A bomba apresenta sinais de vazamento?" },
        { id: "bomba_centrifuga_7", titulo: "Os elementos vedantes foram verificados e estão em boas condições?" },
        { id: "bomba_centrifuga_8", titulo: "A folga dos eixos e rolamentos estão dentro das tolerâncias permitidas?" },
        { id: "bomba_centrifuga_9", titulo: "A bomba está livre de ruídos anormais ou vibrações excessivas?" },
        { id: "bomba_centrifuga_10", titulo: "O selo mecânico encontra-se em boas condições de uso?" },
        { id: "bomba_centrifuga_11", titulo: "O rotor da bomba está em boas condições sem desgaste excessivo?" },
        { id: "bomba_centrifuga_12", titulo: "A bomba foi lubrificada?" },
        { id: "bomba_centrifuga_16", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "bomba_centrifuga_17", titulo: "O equipamento foi testado?" },
        { id: "bomba_centrifuga_18", titulo: "O equipamento está operacional?" },
      ],
    },
  ],
};

const CHECKLIST_BOMBA_LOBULO: ChecklistTemplate = {
  id: "bomba-lobulo",
  label: "Bomba Lóbulo",
  secoes: [
    {
      secao: "certificacoes",
      itens: [
        { id: "bomba_lobulo_2", titulo: "Placa de identificação e TAG estão legíveis?" },
      ],
    },
    {
      secao: "estruturaMecanica",
      itens: [
        { id: "bomba_lobulo_1", titulo: "A estrutura do equipamento encontra-se em boas condições de uso?" },
        { id: "bomba_lobulo_12", titulo: "A condição e a fixação dos parafusos foi revisada?" },
      ],
    },
    {
      secao: "sistemaHidraulico",
      itens: [
        { id: "bomba_lobulo_3", titulo: "As conexões hidráulicas estão íntegras?" },
        { id: "bomba_lobulo_13", titulo: "O motor hidráulico está operacional?" },
      ],
    },
    {
      secao: "dispositivoSeguranca",
      itens: [
        { id: "bomba_lobulo_14", titulo: "O dispositivo anti-chicoteamento na configuração 8 está operacional?" },
      ],
    },
    {
      secao: "componentesOperacionais",
      itens: [
        { id: "bomba_lobulo_4", titulo: "O óleo da caixa de engrenagens (SAE 90) foi substituido?" },
        { id: "bomba_lobulo_5", titulo: "Ao sangrar o óleo da caixa de engrenagens, o mesmo está sem emulsão ou limalhas?" },
        { id: "bomba_lobulo_6", titulo: "A bomba apresenta sinais de vazamento?" },
        { id: "bomba_lobulo_7", titulo: "Os elementos vedantes foram verificados?" },
        { id: "bomba_lobulo_8", titulo: "A folga dos eixos e rolamentos estão dentro das tolerâncias permitidas?" },
        { id: "bomba_lobulo_9", titulo: "A bomba está livre de ruídos anormais ou vibrações excessivas?" },
        { id: "bomba_lobulo_10", titulo: "A bomba foi lubrificada?" },
        { id: "bomba_lobulo_15", titulo: "O equipamento encontra-se limpo?" },
      ],
    },
    {
      secao: "acessorios",
      itens: [
        { id: "bomba_lobulo_11", titulo: "Os lóbulos estão em boas condições e sem desgaste excessivo?" },
      ],
    },
    {
      secao: "testesOperacionais",
      itens: [
        { id: "bomba_lobulo_16", titulo: "O equipamento foi testado?" },
        { id: "bomba_lobulo_17", titulo: "O equipamento está operacional?" },
      ],
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
    // Ventilador e exaustor sao sinonimos no sistema
    .replace(/\bexaustores\b/g, "ventilador")
    .replace(/\bexaustor\b/g, "ventilador")
    .replace(/\bventiladores\b/g, "ventilador")
    .split(" ")
    .filter((parte) => !["de", "da", "do", "das", "dos", "a", "e"].includes(parte))
    .join(" ");

const CHECKLISTS_POR_EQUIPAMENTO: Record<string, ChecklistTemplate> = {
  padrao: CHECKLIST_PADRAO,
  default: CHECKLIST_PADRAO,
  [normalizarChave("Bomba helicoidal")]: CHECKLIST_BOMBA_HELICOIDAL,
  [normalizarChave("refletor-led")]: CHECKLIST_REFLETOR_LED,
  [normalizarChave("FOR-MAN-012 - Rev. 1")]: CHECKLIST_REFLETOR_LED,
  [normalizarChave("Refletor LED")]: CHECKLIST_REFLETOR_LED,
  [normalizarChave("Refletor led")]: CHECKLIST_REFLETOR_LED,
  [normalizarChave("Refletor")]: CHECKLIST_REFLETOR_LED,
  [normalizarChave("compressor-ar")]: CHECKLIST_COMPRESSOR_AR,
  [normalizarChave("FOR-MAN-014 - Rev. 2")]: CHECKLIST_COMPRESSOR_AR,
  [normalizarChave("Compressor de Ar")]: CHECKLIST_COMPRESSOR_AR,
  [normalizarChave("Compressor de ar")]: CHECKLIST_COMPRESSOR_AR,
  [normalizarChave("Compressor")]: CHECKLIST_COMPRESSOR_AR,
  [normalizarChave("caixa-distribuidora")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("FOR-MAN-017 - Rev. 1")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("Caixa distribuidora")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("Caixa Distribuidora")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("Caixa Distribuidora EX")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("Caixa distribuidora EX")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("Caixa Metálica de Passagem")]: CHECKLIST_CAIXA_DISTRIBUIDORA,
  [normalizarChave("caixa-transformadora")]: CHECKLIST_CAIXA_TRANSFORMADORA,
  [normalizarChave("FOR-MAN-018 - Rev. 1")]: CHECKLIST_CAIXA_TRANSFORMADORA,
  [normalizarChave("Caixa Transformadora")]: CHECKLIST_CAIXA_TRANSFORMADORA,
  [normalizarChave("Caixa transformadora")]: CHECKLIST_CAIXA_TRANSFORMADORA,
  [normalizarChave("Caixa transformadora EX")]: CHECKLIST_CAIXA_TRANSFORMADORA,
  [normalizarChave("Caixa Transformadora EX")]: CHECKLIST_CAIXA_TRANSFORMADORA,
  [normalizarChave("guincho-tripe")]: CHECKLIST_GUINCHO_TRIPE,
  [normalizarChave("FOR-MAN-021 - Rev. 0")]: CHECKLIST_GUINCHO_TRIPE,
  [normalizarChave("Guincho Tripé")]: CHECKLIST_GUINCHO_TRIPE,
  [normalizarChave("Guincho tripé")]: CHECKLIST_GUINCHO_TRIPE,
  [normalizarChave("Tripé")]: CHECKLIST_GUINCHO_TRIPE,
  [normalizarChave("trava-quedas")]: CHECKLIST_TRAVA_QUEDAS,
  [normalizarChave("FOR-MAN-022 - Rev. 0")]: CHECKLIST_TRAVA_QUEDAS,
  [normalizarChave("Trava Quedas")]: CHECKLIST_TRAVA_QUEDAS,
  [normalizarChave("Trava quedas")]: CHECKLIST_TRAVA_QUEDAS,
  [normalizarChave("Trava Queda")]: CHECKLIST_TRAVA_QUEDAS,
  [normalizarChave("Trava queda")]: CHECKLIST_TRAVA_QUEDAS,
  [normalizarChave("luminaria-pneumatica")]: CHECKLIST_LUMINARIA_PNEUMATICA,
  [normalizarChave("FOR-MAN-025 - Rev. 0")]: CHECKLIST_LUMINARIA_PNEUMATICA,
  [normalizarChave("Luminária Pneumática")]: CHECKLIST_LUMINARIA_PNEUMATICA,
  [normalizarChave("Luminária pneumática")]: CHECKLIST_LUMINARIA_PNEUMATICA,
  [normalizarChave("Luminaria Pneumatica")]: CHECKLIST_LUMINARIA_PNEUMATICA,
  [normalizarChave("hpu-ueh-50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("FOR-MAN-026 - Rev. 2")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("HPU-UEH 50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("HPU - UEH-50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("HPU - UEH 50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("UEH-50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("UEH 50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("HPU 50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("UEH50")]: CHECKLIST_HPU_UEH_50,
  [normalizarChave("hpu-ueh-75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("FOR-MAN-027 - Rev. 3")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("HPU-UEH 75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("HPU - UEH-75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("HPU - UEH 75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("UEH-75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("UEH 75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("HPU 75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("UEH75")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("HPU")]: CHECKLIST_HPU_UEH_75,
  [normalizarChave("maquina-limpeza-vacuo")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("FOR-MAN-028 - Rev. 0")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("Máquina de Limpeza a Vácuo")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("Maquina de Limpeza a Vacuo")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("Máquina Limpeza Vácuo")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("Limpeza a Vácuo")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("Unidade de Vácuo")]: CHECKLIST_MAQUINA_LIMPEZA_VACUO,
  [normalizarChave("compressor-xas420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("FOR-MAN-033 - Rev. 0")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("Compressor XAS420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("Compressor de Ar - XAS420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("XAS420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("XAS 420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("Compressor XAS 420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("Compressor de ar - XAS420")]: CHECKLIST_COMPRESSOR_XAS420,
  [normalizarChave("detector-gases")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("FOR-MAN-036 - Rev. 0")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("Detector de Gases")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("Detectores de Gases")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("Detector de Gases - Inspeção")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("Detector de Gás")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("Detector multigás")]: CHECKLIST_DETECTOR_GASES,
  [normalizarChave("guincho-pneumatico")]: CHECKLIST_GUINCHO_PNEUMATICO,
  [normalizarChave("FOR-MAN-041 - Rev. 2")]: CHECKLIST_GUINCHO_PNEUMATICO,
  [normalizarChave("Guincho Pneumático")]: CHECKLIST_GUINCHO_PNEUMATICO,
  [normalizarChave("Guincho pneumático")]: CHECKLIST_GUINCHO_PNEUMATICO,
  [normalizarChave("Guincho Pneumatico")]: CHECKLIST_GUINCHO_PNEUMATICO,
  [normalizarChave("bomba-pneumatica")]: CHECKLIST_BOMBA_PNEUMATICA,
  [normalizarChave("FOR-MAN-042 - Rev. 2")]: CHECKLIST_BOMBA_PNEUMATICA,
  [normalizarChave("Bomba Pneumática")]: CHECKLIST_BOMBA_PNEUMATICA,
  [normalizarChave("Bomba pneumática")]: CHECKLIST_BOMBA_PNEUMATICA,
  [normalizarChave("Bomba Pneumatica")]: CHECKLIST_BOMBA_PNEUMATICA,
  [normalizarChave("bomba-submersivel")]: CHECKLIST_BOMBA_SUBMERSIVEL,
  [normalizarChave("FOR-MAN-043 - Rev. 2")]: CHECKLIST_BOMBA_SUBMERSIVEL,
  [normalizarChave("Bomba Submersível")]: CHECKLIST_BOMBA_SUBMERSIVEL,
  [normalizarChave("Bomba submersível")]: CHECKLIST_BOMBA_SUBMERSIVEL,
  [normalizarChave("Bomba Submersivel")]: CHECKLIST_BOMBA_SUBMERSIVEL,
  [normalizarChave("conjunto-autonomo")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("FOR-MAN-044 - Rev. 0")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("Conjunto Autônomo")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("Conjunto autônomo")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("Conjunto Autonomo")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("Autônomo")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("Autonomo")]: CHECKLIST_CONJUNTO_AUTONOMO,
  [normalizarChave("eebd")]: CHECKLIST_EEBD,
  [normalizarChave("FOR-MAN-045 - Rev. 0")]: CHECKLIST_EEBD,
  [normalizarChave("EEBD")]: CHECKLIST_EEBD,
  [normalizarChave("Eebd")]: CHECKLIST_EEBD,
  [normalizarChave("exaustor-ventilador-420-550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("FOR-MAN-046 - Rev. 1")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor - Ventilador 420-550 EX")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor 420-550 EX")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador 420-550 EX")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor 420")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor 550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador 420")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador 550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Exaustor 420-550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("Ventilador 420-550")]: CHECKLIST_EXAUSTOR_VENTILADOR_420_550,
  [normalizarChave("cavalete-ar-mandado")]: CHECKLIST_CAVALETE_AR_MANDADO,
  [normalizarChave("FOR-MAN-047 - Rev. 2")]: CHECKLIST_CAVALETE_AR_MANDADO,
  [normalizarChave("Cavalete de Ar Mandado")]: CHECKLIST_CAVALETE_AR_MANDADO,
  [normalizarChave("Cavalete de ar mandado")]: CHECKLIST_CAVALETE_AR_MANDADO,
  [normalizarChave("Cavalete")]: CHECKLIST_CAVALETE_AR_MANDADO,
  [normalizarChave("ventilador-alta-vazao")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("FOR-MAN-048 - Rev. 1")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Ventilador Alta Vazão")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Exaustor Alta Vazão")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Ventilador Alta Vazao")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Exaustor Alta Vazao")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Ventilador Holandês")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Exaustor Holandês")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Ventilador Holandes")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("Exaustor Holandes")]: CHECKLIST_VENTILADOR_ALTA_VAZAO,
  [normalizarChave("hidrojato-alta-pressao")]: CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("FOR-MAN-049 - Rev. 2")]: CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("Hidrojato de Alta Pressão")]: CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("Hidrojato de alta pressão")]: CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("Hidrojato AP")]: CHECKLIST_HIDROJATO_ALTA_PRESSAO,
  [normalizarChave("mascara-ar-mandado")]: CHECKLIST_MASCARA_AR_MANDADO,
  [normalizarChave("FOR-MAN-050 - Rev. 0")]: CHECKLIST_MASCARA_AR_MANDADO,
  [normalizarChave("Máscara de Ar Mandado")]: CHECKLIST_MASCARA_AR_MANDADO,
  [normalizarChave("Mascara de Ar Mandado")]: CHECKLIST_MASCARA_AR_MANDADO,
  [normalizarChave("Máscara ar mandado")]: CHECKLIST_MASCARA_AR_MANDADO,
  [normalizarChave("Mascara ar mandado")]: CHECKLIST_MASCARA_AR_MANDADO,
  [normalizarChave("robo-lombrico-rov")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("FOR-MAN-052 - Rev. 0")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("Robô Lombrico ROV")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("Robô Lombrico ROV 01")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("Robo Lombrico ROV")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("Robô Lombrico")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("Lombrico")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("ROV")]: CHECKLIST_ROBO_LOMBRICO_ROV,
  [normalizarChave("hvac-16f")]: CHECKLIST_HVAC_16F,
  [normalizarChave("FOR-MAN-053 - Rev. 1")]: CHECKLIST_HVAC_16F,
  [normalizarChave("HVAC 16F")]: CHECKLIST_HVAC_16F,
  [normalizarChave("HVAC")]: CHECKLIST_HVAC_16F,
  [normalizarChave("HVAC 16 F")]: CHECKLIST_HVAC_16F,
  [normalizarChave("HVAC-16F")]: CHECKLIST_HVAC_16F,
  [normalizarChave("uba-unidade-lavadora")]: CHECKLIST_UBA_UNIDADE_LAVADORA,
  [normalizarChave("FOR-MAN-056 - Rev. 0")]: CHECKLIST_UBA_UNIDADE_LAVADORA,
  [normalizarChave("UBA - Unidade Lavadora")]: CHECKLIST_UBA_UNIDADE_LAVADORA,
  [normalizarChave("UBA")]: CHECKLIST_UBA_UNIDADE_LAVADORA,
  [normalizarChave("Unidade Lavadora UBA")]: CHECKLIST_UBA_UNIDADE_LAVADORA,
  [normalizarChave("UBA Unidade Lavadora")]: CHECKLIST_UBA_UNIDADE_LAVADORA,
  [normalizarChave("exaustor-ventilador-sht-30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("FOR-MAN-057 - Rev. 1")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Exaustor - Ventilador SHT 30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Exaustor SH-30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Exaustor SHT 30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Ventilador SHT 30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Ventilador SH-30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Exaustor SHT-30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("Ventilador SHT-30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("SHT 30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("SH-30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("SHT30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("SH30")]: CHECKLIST_EXAUSTOR_VENTILADOR_SHT_30,
  [normalizarChave("manifold")]: CHECKLIST_MANIFOLD,
  [normalizarChave("FOR-MAN-058 - Rev. 2")]: CHECKLIST_MANIFOLD,
  [normalizarChave("Manifold")]: CHECKLIST_MANIFOLD,
  [normalizarChave("soprador-pneumatico")]: CHECKLIST_SOPRADOR_PNEUMATICO,
  [normalizarChave("FOR-MAN-059 - Rev. 2")]: CHECKLIST_SOPRADOR_PNEUMATICO,
  [normalizarChave("Soprador Pneumático")]: CHECKLIST_SOPRADOR_PNEUMATICO,
  [normalizarChave("Soprador pneumático")]: CHECKLIST_SOPRADOR_PNEUMATICO,
  [normalizarChave("Soprador")]: CHECKLIST_SOPRADOR_PNEUMATICO,
  [normalizarChave("hidrojato-baixa-pressao")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("FOR-MAN-060 - Rev. 0")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("Hidrojato de Baixa Pressão")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("Hidrojato de baixa pressão")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("Hidrojato BP")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("Hidrojato Baixa Pressão")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("Hidrojato Baixa Pressao")]: CHECKLIST_HIDROJATO_BAIXA_PRESSAO,
  [normalizarChave("compressor-diesel")]: CHECKLIST_COMPRESSOR_DIESEL,
  [normalizarChave("FOR-MAN-066 - Rev. 0")]: CHECKLIST_COMPRESSOR_DIESEL,
  [normalizarChave("Compressor à diesel")]: CHECKLIST_COMPRESSOR_DIESEL,
  [normalizarChave("Compressor a diesel")]: CHECKLIST_COMPRESSOR_DIESEL,
  [normalizarChave("Compressor a Diesel")]: CHECKLIST_COMPRESSOR_DIESEL,
  [normalizarChave("Compressor Diesel")]: CHECKLIST_COMPRESSOR_DIESEL,
  [normalizarChave("shaker")]: CHECKLIST_SHAKER,
  [normalizarChave("FOR-MAN-067 - Rev. 0")]: CHECKLIST_SHAKER,
  [normalizarChave("SHAKER")]: CHECKLIST_SHAKER,
  [normalizarChave("Shaker")]: CHECKLIST_SHAKER,
  [normalizarChave("wpu-unidade-lavadora")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("FOR-MAN-068 - Rev. 0")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("WPU - Unidade Lavadora")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("WPU")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("Unidade Lavadora")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("Unidade lavadora")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("Unidade lavadora WPU")]: CHECKLIST_WPU_UNIDADE_LAVADORA,
  [normalizarChave("bomba-centrifuga")]: CHECKLIST_BOMBA_CENTRIFUGA,
  [normalizarChave("FOR-MAN-069 - Rev. 0")]: CHECKLIST_BOMBA_CENTRIFUGA,
  [normalizarChave("Bomba Centrífuga")]: CHECKLIST_BOMBA_CENTRIFUGA,
  [normalizarChave("Bomba centrífuga")]: CHECKLIST_BOMBA_CENTRIFUGA,
  [normalizarChave("Bomba Centrifuga")]: CHECKLIST_BOMBA_CENTRIFUGA,
  [normalizarChave("bomba-lobulo")]: CHECKLIST_BOMBA_LOBULO,
  [normalizarChave("FOR-MAN-070 - Rev. 0")]: CHECKLIST_BOMBA_LOBULO,
  [normalizarChave("Bomba Lóbulo")]: CHECKLIST_BOMBA_LOBULO,
  [normalizarChave("Bomba lóbulo")]: CHECKLIST_BOMBA_LOBULO,
  [normalizarChave("Bomba Lobulo")]: CHECKLIST_BOMBA_LOBULO,
};

const buscarChecklistPorValor = (valor?: string) => {
  const chave = normalizarChave(valor);
  if (!chave) return undefined;

  if (CHECKLISTS_POR_EQUIPAMENTO[chave]) {
    return CHECKLISTS_POR_EQUIPAMENTO[chave];
  }

  const chavesDisponiveis = Object.keys(CHECKLISTS_POR_EQUIPAMENTO).filter(
    (key) => key !== "padrao" && key !== "default",
  );

  // Match exato ou substring precisa
  const match = chavesDisponiveis.find(
    (key) => chave === key || chave.includes(key) || (key.length > 3 && key.includes(chave)),
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
