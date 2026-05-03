import { db } from '../src/db';
import { emergencySos } from '../src/schema';

async function main() {
  try {
    const result = await db.insert(emergencySos).values({
      patientId: 'a4c19fbc-beab-4b34-abd0-43e9ba57c6e0',
      affectedPatientId: 'acdb058a-b72f-4465-bfa4-340310f1c551',
      latitude: '28.2467669',
      longitude: '76.8140435',
      serviceTypes: ['ambulance'],
      description: 'hfjfkrjr',
      criticalInfoShared: {}
    }).returning();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

main();
