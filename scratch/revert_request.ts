import { db } from '../src/db';
import { accessRequests } from '../src/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    await db.update(accessRequests)
      .set({ status: 'pending', shareTokenId: null, approvedScope: null, expiresAt: null })
      .where(eq(accessRequests.id, 'c8964331-a52e-4578-945c-d4893156e389'));
    console.log("Reverted request to pending");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}
main();
