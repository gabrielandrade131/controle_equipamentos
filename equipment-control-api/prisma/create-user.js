const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const nome = 'Gabriel Roza';
  const email = 'gabriel.roza@ambipar.com';
  const senha = 'Suporte123@';

  try {
    // Verificar se usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      console.log('❌ Usuário com este e-mail já existe!');
      return;
    }

    // Fazer hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        ativo: true,
        precisaTrocarSenha: true,
      },
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log(`
ID: ${usuario.id}
Nome: ${usuario.nome}
Email: ${usuario.email}
Ativo: ${usuario.ativo}
Precisa trocar senha: ${usuario.precisaTrocarSenha}
Criado em: ${usuario.criadoEm}
    `);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
