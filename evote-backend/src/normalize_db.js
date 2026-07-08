import prisma from './config/database.js';
import { normalizePosition } from './utils/position.js';

async function main() {
  try {
    console.log('--- STARTING DATABASE POSITION NORMALIZATION ---');

    // 1. Normalize Candidates
    const candidates = await prisma.candidate.findMany();
    console.log(`Found ${candidates.length} candidates in database.`);
    
    let updatedCandidatesCount = 0;
    let updatedVotesCount = 0;

    for (const candidate of candidates) {
      const normalized = normalizePosition(candidate.position);
      if (candidate.position !== normalized) {
        console.log(`Normalizing candidate: "${candidate.fullName}" | "${candidate.position}" -> "${normalized}"`);
        
        // Update candidate in DB
        await prisma.candidate.update({
          where: { id: candidate.id },
          data: { position: normalized }
        });
        updatedCandidatesCount++;

        // Update any votes referencing this candidate in this election to the normalized position
        const voteUpdates = await prisma.vote.updateMany({
          where: {
            candidateId: candidate.id,
            electionId: candidate.electionId,
          },
          data: {
            position: normalized
          }
        });
        updatedVotesCount += voteUpdates.count;
      }
    }

    // 2. Normalize remaining Votes (just in case they don't match or were manually created)
    const votes = await prisma.vote.findMany();
    console.log(`Found ${votes.length} votes in database.`);
    
    let leftoverVotesCount = 0;
    for (const vote of votes) {
      const normalized = normalizePosition(vote.position);
      if (vote.position !== normalized) {
        try {
          await prisma.vote.update({
            where: { id: vote.id },
            data: { position: normalized }
          });
          leftoverVotesCount++;
        } catch (err) {
          console.warn(`Could not normalize vote ID ${vote.id} directly (unique constraint check):`, err.message);
        }
      }
    }

    console.log('--- NORMALIZATION COMPLETED ---');
    console.log(`Candidates updated: ${updatedCandidatesCount}`);
    console.log(`Candidate votes updated: ${updatedVotesCount}`);
    console.log(`Leftover votes updated: ${leftoverVotesCount}`);
  } catch (error) {
    console.error('❌ Error during normalization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
