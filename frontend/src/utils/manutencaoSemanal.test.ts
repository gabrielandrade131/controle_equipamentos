import { criarInspecaoVazia } from "../constants/inspecaoManutencao";
import { InspecaoManutencao } from "../types/manutencao";
import {
  adicionarDiasData,
  construirNomeBasePdfInspecao,
  construirNomesArquivosSemana,
  filtrarManutencoesConcluidasNoPeriodo,
  obterIntervaloSemana,
} from "./manutencaoSemanal";
import { createZipBytes } from "./zip";

const criarManutencaoMock = (
  overrides: Partial<InspecaoManutencao>,
): InspecaoManutencao => ({
  ...criarInspecaoVazia(),
  statusManutencao: "CONCLUIDA",
  ...overrides,
});

describe("manutencaoSemanal", () => {
  test("calcula intervalo de segunda a domingo corretamente para qualquer dia da semana", () => {
    // 2026-11-26 é quinta-feira
    expect(obterIntervaloSemana("2026-11-26")).toEqual({
      inicio: "2026-11-23",
      fim: "2026-11-29",
    });

    // Segunda-feira
    expect(obterIntervaloSemana("2026-11-23")).toEqual({
      inicio: "2026-11-23",
      fim: "2026-11-29",
    });

    // Domingo pertence à mesma semana que começou na segunda anterior
    expect(obterIntervaloSemana("2026-11-29")).toEqual({
      inicio: "2026-11-23",
      fim: "2026-11-29",
    });

    expect(adicionarDiasData("2026-11-26", -7)).toBe("2026-11-19");
    expect(adicionarDiasData("2026-11-26", 7)).toBe("2026-12-03");
  });

  test("filtra apenas manutenções concluídas cuja data de conclusão está dentro do período", () => {
    const intervalo = { inicio: "2026-11-10", fim: "2026-11-25" };
    const lista: InspecaoManutencao[] = [
      criarManutencaoMock({
        id: "1",
        numeroOrdemManutencao: 12,
        statusManutencao: "CONCLUIDA",
        dataTermino: "2026-11-25",
      }),
      criarManutencaoMock({
        id: "2",
        numeroOrdemManutencao: 10,
        statusManutencao: "CONCLUIDA",
        dataTermino: "2026-11-10",
      }),
      criarManutencaoMock({
        id: "3",
        numeroOrdemManutencao: 11,
        statusManutencao: "EM_MANUTENCAO",
        dataTermino: "2026-11-18",
      }),
      criarManutencaoMock({
        id: "4",
        numeroOrdemManutencao: 13,
        statusManutencao: "CONCLUIDA",
        dataTermino: "2026-11-09",
      }),
      criarManutencaoMock({
        id: "5",
        numeroOrdemManutencao: 14,
        statusManutencao: "CONCLUIDA",
        dataTermino: "",
      }),
    ];

    const filtradas = filtrarManutencoesConcluidasNoPeriodo(lista, intervalo);
    expect(filtradas.map((item) => item.id)).toEqual(["2", "1"]);

    // Período invertido ou vazio retorna lista vazia
    expect(
      filtrarManutencoesConcluidasNoPeriodo(lista, {
        inicio: "2026-11-25",
        fim: "2026-11-10",
      }),
    ).toEqual([]);
    expect(
      filtrarManutencoesConcluidasNoPeriodo(lista, { inicio: "", fim: "2026-11-25" }),
    ).toEqual([]);
  });

  test("gera nomes no padrão item-numero de serie ou tag e evita duplicados", () => {
    const comSerie = criarManutencaoMock({
      tipoEquipamento: "Bomba Submersível",
      numeroSerie: "SN-001",
      tag: "TAG-99",
      numeroOrdemManutencao: 5,
    });
    const comTag = criarManutencaoMock({
      tipoEquipamento: "Skimmer / Óleo",
      numeroSerie: "",
      tag: "TAG-42",
      numeroOrdemManutencao: 6,
    });
    const duplicada = criarManutencaoMock({
      tipoEquipamento: "Bomba Submersível",
      numeroSerie: "SN-001",
      tag: "TAG-99",
      numeroOrdemManutencao: 8,
    });

    expect(construirNomeBasePdfInspecao(comSerie)).toBe(
      "Bomba Submersível-SN-001",
    );
    expect(construirNomeBasePdfInspecao(comTag)).toBe("Skimmer - Óleo-TAG-42");

    expect(construirNomesArquivosSemana([comSerie, comTag, duplicada])).toEqual([
      "Bomba Submersível-SN-001.pdf",
      "Skimmer - Óleo-TAG-42.pdf",
      "Bomba Submersível-SN-001-OM-8.pdf",
    ]);
  });

  test("gera um arquivo ZIP válido com assinaturas PKZIP e contagem correta de entradas", () => {
    const zipBytes = createZipBytes([
      {
        name: "Bomba-SN01.pdf",
        data: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]),
      },
      {
        name: "Skimmer-TAG02.pdf",
        data: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
      },
    ]);

    const view = new DataView(
      zipBytes.buffer,
      zipBytes.byteOffset,
      zipBytes.byteLength,
    );
    // Local file header signature
    expect(view.getUint32(0, true)).toBe(0x04034b50);
    // End of central directory signature at the last 22 bytes
    const eocdOffset = zipBytes.length - 22;
    expect(view.getUint32(eocdOffset, true)).toBe(0x06054b50);
    // Total entries = 2
    expect(view.getUint16(eocdOffset + 10, true)).toBe(2);
  });
});
