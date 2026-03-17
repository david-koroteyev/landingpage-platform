import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

async function main() {
  await prisma.$connect();
  console.log('Connected to database');

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
