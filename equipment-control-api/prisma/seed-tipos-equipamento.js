require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    const tipos = [
    'Bomba Pneumática',
    'Bomba submersível',
    'Caixa transformadora EX',
    'Cavalete de ar mandado',
    'Exaustor',
    'Guincho Pneumático',
    'Guincho Tripé',
    'Hidrojato de alta pressão',
    'Manifold',
    'Refletor led',
    'Trava quedas',
    'Container DryBox - 10pés',
    'Container DryBox - 20pés',
    'Container OpenTop - 10pés',
    'Container OpenTop - 20pés',
    'Caixa Metálica',
    'Cutting Box',
    'Caixa Distribuidora EX',
    'Caixa Metálica de Passagem',
    'Compressor de Ar',
    'Exaustor SH-30',
    'Hidrojato BP',
    'HPU',
    'HVAC',
    'WPU',
    'Painel Elétrico Móvel',
    'Soprador Pneumático',
    'Ventilador Holandês',
    'Luminária Pneumática',
    ];

    for (const nome of tipos) {
        await prisma.tipoEquipamento.upsert({
            where: { nome },
            update: {},
            create: { nome },
        });
    }

    console.log('Tipos de equipamento inseridos com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })
