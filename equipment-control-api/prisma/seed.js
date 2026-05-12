const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const envPath = path.join(__dirname, '..', '.env');
if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const match = envFile.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/m);

  if (match?.[1]) {
    process.env.DATABASE_URL = match[1];
  }
}

const prisma = new PrismaClient();

async function upsertTipoEquipamento(nome) {
  return prisma.tipoEquipamento.upsert({
    where: { nome },
    update: { ativo: true },
    create: { nome },
  });
}

async function upsertUser({ nome, email, senha }) {
  const senhaHash = await bcrypt.hash(senha, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      nome,
      senha: senhaHash,
      ativo: true,
      precisaTrocarSenha: true,
    },
    create: {
      nome,
      email,
      senha: senhaHash,
      ativo: true,
      precisaTrocarSenha: true,
    },
  });
}

async function main() {
  const tipos = [
    'Exaustor',
    'Compressor de Ar',
    'Hidrojato de alta pressão',
    'Caixa Metálica',
    'Painel Elétrico Móvel',
  ];

  const [tipoExaustor, tipoCompressor, tipoHidrojato] = await Promise.all(
    tipos.map((nome) => upsertTipoEquipamento(nome)),
  );

  const usuarioAdmin = await upsertUser({
    nome: 'Gabriel Roza',
    email: 'gabriel.roza@ambipar.com',
    senha: 'Suporte123@',
  });

  await upsertUser({
    nome: 'Teste Operação',
    email: 'teste.operacao@ambipar.com',
    senha: 'Teste123@',
  });

  const equipamentosBase = [
    {
      numeroOrdem: 1001,
      numeroSerie: 'EXA-420-001',
      tag: 'TAG-EXA-001',
      solicitante: 'Carlos Almeida',
      dataSolicitacao: new Date('2026-04-10T08:00:00.000Z'),
      dataInicio: new Date('2026-04-11T08:00:00.000Z'),
      statusProducao: 'EM_ANDAMENTO',
      tipoEquipamentoId: tipoExaustor.id,
      modelo: 'Exaustor 420 Monofásico',
      descricao: 'Equipamento de teste para fluxo de produção',
      listaPecas: 'Sim',
      sequenciaMontagem: 'Sim',
      inspecaoMontagem: 'Sim',
      historicoEquipamento: 'Sim',
      procedimentoTesteInspecaoMontagem: 'Sim',
    },
    {
      numeroOrdem: 1002,
      numeroSerie: 'CMP-220-014',
      tag: 'TAG-CMP-014',
      solicitante: 'Marina Souza',
      dataSolicitacao: new Date('2026-04-12T08:00:00.000Z'),
      dataInicio: new Date('2026-04-13T08:00:00.000Z'),
      dataTermino: new Date('2026-04-18T18:00:00.000Z'),
      statusProducao: 'CONCLUIDA',
      tipoEquipamentoId: tipoCompressor.id,
      modelo: 'Compressor 220V Industrial',
      descricao: 'Concluído com inspeção final aprovada',
      listaPecas: 'Sim',
      sequenciaMontagem: 'Sim',
      inspecaoMontagem: 'Sim',
      historicoEquipamento: '',
      procedimentoTesteInspecaoMontagem: 'Sim',
    },
    {
      numeroOrdem: 1003,
      numeroSerie: 'HJP-900-033',
      tag: 'TAG-HJP-033',
      solicitante: 'Equipe Manutenção',
      dataSolicitacao: new Date('2026-04-20T08:00:00.000Z'),
      statusProducao: 'PROGRAMADA',
      tipoEquipamentoId: tipoHidrojato.id,
      modelo: 'Hidrojato BP 900',
      descricao: 'Produção agendada para validação de fluxo',
      listaPecas: '',
      sequenciaMontagem: '',
      inspecaoMontagem: '',
      historicoEquipamento: '',
      procedimentoTesteInspecaoMontagem: '',
    },
  ];

  const equipamentos = [];

  for (const equipamento of equipamentosBase) {
    const created = await prisma.equipment.upsert({
      where: { numeroOrdem: equipamento.numeroOrdem },
      update: equipamento,
      create: equipamento,
    });

    equipamentos.push(created);
  }

  await prisma.itemSeriado.deleteMany({
    where: {
      equipmentId: {
        in: equipamentos.map((equipamento) => equipamento.id),
      },
    },
  });

  await prisma.observacaoProducao.deleteMany({
    where: {
      producaoId: {
        in: equipamentos.map((equipamento) => equipamento.id),
      },
    },
  });

  await prisma.registroInspecaoMontagem.deleteMany({
    where: {
      equipmentId: {
        in: equipamentos.map((equipamento) => equipamento.id),
      },
    },
  });

  await prisma.historicoProducao.deleteMany({
    where: {
      equipmentId: {
        in: equipamentos.map((equipamento) => equipamento.id),
      },
    },
  });

  await prisma.itemSeriado.createMany({
    data: [
      {
        equipmentId: equipamentos[0].id,
        descricao: 'Mancal principal e conjunto rotor',
      },
      {
        equipmentId: equipamentos[0].id,
        descricao: 'Painel elétrico e cabos de alimentação',
      },
      {
        equipmentId: equipamentos[1].id,
        descricao: 'Filtro de ar e conjunto de compressão',
      },
    ],
  });

  await prisma.observacaoProducao.createMany({
    data: [
      {
        producaoId: equipamentos[0].id,
        descricao: 'Separação inicial aprovada pelo setor de montagem.',
      },
      {
        producaoId: equipamentos[1].id,
        descricao: 'Teste final executado sem divergências.',
      },
    ],
  });

  await prisma.registroInspecaoMontagem.createMany({
    data: [
      {
        equipmentId: equipamentos[0].id,
        ordem: 1,
        valorObservado: 'OK',
        instrumentoMedicao: 'Paquímetro digital',
        conformidades: true,
      },
      {
        equipmentId: equipamentos[0].id,
        ordem: 2,
        valorObservado: 'OK',
        instrumentoMedicao: 'Torquímetro',
        conformidades: true,
      },
      {
        equipmentId: equipamentos[1].id,
        ordem: 1,
        valorObservado: 'Ajuste fino realizado',
        instrumentoMedicao: 'Multímetro',
        conformidades: true,
      },
    ],
  });

  await prisma.historicoProducao.createMany({
    data: [
      {
        equipmentId: equipamentos[0].id,
        campo: 'statusProducao',
        valorAnterior: 'PROGRAMADA',
        valorNovo: 'EM_ANDAMENTO',
        alteradoPor: usuarioAdmin.nome,
      },
      {
        equipmentId: equipamentos[1].id,
        campo: 'statusProducao',
        valorAnterior: 'EM_ANDAMENTO',
        valorNovo: 'CONCLUIDA',
        alteradoPor: usuarioAdmin.nome,
      },
    ],
  });

  await prisma.manutencao.upsert({
    where: { id: 'seed-manutencao-001' },
    update: {},
    create: {
      id: 'seed-manutencao-001',
      origem: 'MANUAL',
      tipoEquipamentoNome: 'Exaustor',
      modeloEquipamento: 'Exaustor 420 Monofásico',
      tag: 'TAG-EXA-001',
      situacaoEquipamento: 'Retornou para a base',
      dataInicio: new Date('2026-04-22T08:00:00.000Z'),
      statusManutencao: 'EM_MANUTENCAO',
      diagnostico: 'Troca de rolamentos e limpeza geral',
      responsavelManutencao: 'Equipe técnica',
    },
  });

  console.log('Seed concluído com sucesso.');
  console.log('Login teste: gabriel.roza@ambipar.com / Suporte123@');
  console.log('Login extra: teste.operacao@ambipar.com / Teste123@');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });