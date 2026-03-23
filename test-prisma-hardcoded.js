const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function test() {
  const url = "postgresql://neondb_owner:zJdR58oMmtnb@ep-yellow-firefly-a5fq10in.us-east-2.aws.neon.tech:5432/neondb?sslmode=require";
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });

  let log = 'Testing Prisma connection with hardcoded URL...\n';
  try {
    const res = await prisma.$queryRaw`SELECT 1`;
    log += '✅ Success: ' + JSON.stringify(res) + '\n';
  } catch (err) {
    log += '❌ Prisma Error: ' + err.message + '\n';
  } finally {
    await prisma.$disconnect();
  }
  fs.writeFileSync('prisma-test.log', log);
}

test();
