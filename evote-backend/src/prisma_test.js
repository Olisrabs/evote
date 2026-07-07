import prisma from './config/database.js';

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const count = await prisma.election.count();
    console.log(`✅ Success! Number of elections: ${count}`);
    const elections = await prisma.election.findMany({
      include: {
        _count: {
          select: { candidates: true, votes: true }
        }
      }
    });
    console.log('Elections details:', JSON.stringify(elections, null, 2));
  } catch (err) {
    console.error('❌ Prisma query failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
