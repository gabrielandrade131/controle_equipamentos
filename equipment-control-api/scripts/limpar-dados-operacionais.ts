import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limparSeExistir(nomeModelo: string) {
  const client = prisma as any;

  if (!client[nomeModelo]) {
    console.log(`Ignorando ${nomeModelo}: model não encontrado no Prisma Client.`);
    return;
  }

  const resultado = await client[nomeModelo].deleteMany();
  console.log(`${nomeModelo}: ${resultado.count} registro(s) apagado(s).`);
}

async function main() {
  console.log('======================================');
  console.log(' Limpando dados operacionais do Axis');
  console.log(' Usuários e cadastros base preservados');
  console.log('======================================');

  /**
   * IMPORTANTE:
   * A ordem abaixo apaga primeiro tabelas filhas/dependentes,
   * depois tabelas principais.
   *
   * Não colocar aqui:
   * - usuario / user
   * - tipoEquipamento
   * - permissões/auth
   */

  const modelosParaLimpar = [
    // Axis Check / Recebimentos
    'recebimentoFoto',
    'fotoRecebimento',
    'recebimentoEquipamento',
    'recebimentoOperacional',

    // Manutenção
    'historicoManutencao',
    'observacaoManutencao',
    'registroInspecaoManutencao',
    'fotoManutencao',
    'manutencao',

    // Produção - dependências
    'historicoEquipamentoRegistro',
    'historicoProducao',
    'observacaoProducao',
    'registroInspecaoMontagem',
    'itemSeriado',
    'documento',

    // Produção principal
    'producao',
    'equipment',

    // Lote de produção
    'loteProducao',
  ];

  for (const modelo of modelosParaLimpar) {
    try {
      await limparSeExistir(modelo);
    } catch (error) {
      console.error(`Erro ao limpar ${modelo}:`, error);
      throw error;
    }
  }

  console.log('======================================');
  console.log(' Limpeza finalizada com sucesso');
  console.log('======================================');
}

main()
  .catch((error) => {
    console.error('Erro geral na limpeza:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
