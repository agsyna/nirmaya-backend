import { db } from '../src/db';
import { getPatientByUserId } from '../src/repositories/patient.repository';
import { getShareTokensByPatient } from '../src/repositories/shareTokens.repository';

async function main() {
  try {
    const patient = await getPatientByUserId('72edf62f-9554-4574-839e-eeb5457f67ae'); // Mayank's userId
    console.log("Patient:", patient?.patientId);
    if (!patient) return;

    const tokens = await getShareTokensByPatient(patient.patientId);
    console.log("Tokens count:", tokens.length);
    console.log(tokens);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}
main();
