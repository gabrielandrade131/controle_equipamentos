const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Encontrar a ordem de manutenção com numeroOrdemManutencao = 1
    const manutencao = await prisma.manutencao.findFirst({
      where: {
        numeroOrdemManutencao: 1,
      },
    });

    if (!manutencao) {
      console.log('Ordem de manutenção 1 não encontrada');
      process.exit(0);
    }

    console.log('Manutenção encontrada:', manutencao.id);
    console.log('Status atual:', manutencao.statusManutencao);

    // Atualizar para EM_MANUTENCAO
    const atualizada = await prisma.manutencao.update({
      where: {
        id: manutencao.id,
      },
      data: {
        statusManutencao: 'EM_MANUTENCAO',
      },
    });

    console.log('Status atualizado para:', atualizada.statusManutencao);
  } catch (error) {
    console.error('Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
