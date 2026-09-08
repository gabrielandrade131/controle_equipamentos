require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tipos = [
    'Refletor LED',
    'Compressor de Ar',
    'Caixa Distribuidora EX',
    'Caixa Transformadora EX',
    'Guincho Tripé',
    'Trava Quedas',
    'Luminária Pneumática',
    'HPU - UEH-50',
    'HPU - UEH-75',
    'HPU',
    'Máquina de Limpeza a Vácuo',
    'Compressor XAS420',
    'Detector de Gases',
    'Guincho Pneumático',
    'Bomba Pneumática',
    'Bomba submersível',
    'Conjunto Autônomo',
    'EEBD',
    'Exaustor / Ventilador 420-550 EX',
    'Exaustor',
    'Ventilador',
    'Cavalete de ar mandado',
    'Ventilador Alta Vazão',
    'Ventilador Holandês',
    'Hidrojato de alta pressão',
    'Hidrojato BP',
    'Hidrojato de Baixa Pressão',
    'Máscara de Ar Mandado',
    'Robô Lombrico ROV',
    'HVAC 16F',
    'HVAC',
    'UBA - Unidade Lavadora',
    'Exaustor SH-30',
    'Exaustor / Ventilador SHT 30',
    'Manifold',
    'Soprador Pneumático',
    'Compressor a Diesel',
    'SHAKER',
    'WPU - Unidade Lavadora',
    'WPU',
    'Bomba Centrífuga',
    'Bomba Lóbulo',
    'Bomba Helicoidal',
    'Container DryBox - 10pés',
    'Container DryBox - 20pés',
    'Container OpenTop - 10pés',
    'Container OpenTop - 20pés',
    'Caixa Metálica',
    'Cutting Box',
    'Caixa Metálica de Passagem',
    'Painel Elétrico Móvel',
  ];

  for (const nome of tipos) {
    await prisma.tipoEquipamento.upsert({
      where: { nome },
      update: { ativo: true },
      create: { nome, ativo: true },
    });
  }

  console.log(`Tipos de equipamento inseridos com sucesso (${tipos.length} tipos)!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
