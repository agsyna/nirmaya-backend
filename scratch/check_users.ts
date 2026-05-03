import { db } from '../src/db';
import { users } from '../src/schema';

async function main() {
  const allUsers = await db.select().from(users);
  console.log("All users in DB:");
  allUsers.forEach(u => console.log(`- ${u.email} (type: ${u.type})`));
  process.exit(0);
}
main();
