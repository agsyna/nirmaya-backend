import { db } from '../src/db';
import { patients, users } from '../src/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const result = await db
    .select()
    .from(patients)
    .innerJoin(users, eq(patients.userId, users.userId))
    .where(eq(users.email, 'mayank.gupta.23cse@bmu.edu.in'));
    
  console.log("Patient profile:", result[0]?.patients);
  process.exit(0);
}
main();
