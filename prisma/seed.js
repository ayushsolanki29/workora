require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({});

async function main() {
  console.log('Seeding the database...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@soseki.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists, skipping creation.');
    return;
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@soseki.com',
      passwordHash,
      name: 'Admin User',
    },
  });

  console.log('Database seeded successfully! Created admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
