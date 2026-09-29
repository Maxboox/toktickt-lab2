const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Vérifier la connexion DB
  console.log('🔌 Connexion à la base de données...');
  const userCount = await prisma.user.count();
  console.log(`✅ ${userCount} utilisateurs trouvés\n`);

  // 2. Reset du mot de passe admin
  const hash = await bcrypt.hash('Admin123!', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@tiktockit.com' },
    update: {
      passwordHash: hash,
      mustChangePassword: true,
      isActive: true,
      role: 'ADMINISTRATOR',
    },
    create: {
      name: 'Admin Test',
      email: 'admin@tiktockit.com',
      passwordHash: hash,
      role: 'ADMINISTRATOR',
      isActive: true,
      mustChangePassword: true,
    },
  });

  console.log('✅ Compte prêt :');
  console.log('   📧 Email    : admin@tiktockit.com');
  console.log('   🔑 Password : Admin123!');
  console.log('   👑 Role     : ADMINISTRATOR');
  console.log('   🆔 ID       :', user.id);
  console.log('');
  console.log('➡️  Va sur http://localhost:3000 et connecte-toi');
}

main()
  .catch((e) => {
    console.error('❌ ERREUR :', e.message);
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
