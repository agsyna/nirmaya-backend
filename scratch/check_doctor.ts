import { db } from '../src/db';
import { users } from '../src/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const doctorsList = await db.select().from(users).where(eq(users.type, 'doctor'));
  console.log("Doctors in DB:", doctorsList.map(d => ({ email: d.email, password: d.password })));
  process.exit(0);
}
main();
