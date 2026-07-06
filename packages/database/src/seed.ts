import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emirsign.ai' },
    update: {},
    create: {
      email: 'admin@emirsign.ai',
      passwordHash: '$2b$12$LJ3m4ys3Lz0QfQqQQqQqQeQqQqQqQqQqQqQqQqQqQqQqQqQqQq', // password: Admin123!
      name: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@emirsign.ai' },
    update: {},
    create: {
      email: 'test@emirsign.ai',
      passwordHash: '$2b$12$LJ3m4ys3Lz0QfQqQQqQqQeQqQqQqQqQqQqQqQqQqQqQqQqQqQq', // password: Test1234!
      name: 'Test User',
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log('Seeded users:', { admin: admin.id, testUser: testUser.id });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
