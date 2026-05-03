import { getDoctorByUserId } from '../src/repositories/doctor.repository';
import { getAccessRequestsByDoctor } from '../src/repositories/accessRequests.repository';
import { db } from '../src/db';
import { users, patients, shareTokens } from '../src/schema';
import { eq } from 'drizzle-orm';

async function main() {
  try {
    const doctor = await getDoctorByUserId('160bbde1-e167-4903-b962-140207f024f3'); // drhouse@hospital.com
    const requests = await getAccessRequestsByDoctor(doctor.doctorId);

    // Map patient names
    const patientIds = [...new Set(requests.map(r => r.patientId))];
    const patientNamesMap: Record<string, string> = {};
    if (patientIds.length > 0) {
      for (const pId of patientIds) {
        const [p] = await db
          .select({ name: users.name })
          .from(patients)
          .innerJoin(users, eq(patients.userId, users.userId))
          .where(eq(patients.patientId, pId))
          .limit(1);
        if (p) patientNamesMap[pId] = p.name;
      }
    }

    // Map tokens
    const shareTokenIds = requests.map(r => r.shareTokenId).filter(Boolean) as string[];
    const tokensMap: Record<string, string> = {};
    
    if (shareTokenIds.length > 0) {
      for (const stId of shareTokenIds) {
        const [st] = await db
          .select({ metadata: shareTokens.metadata })
          .from(shareTokens)
          .where(eq(shareTokens.tokenId, stId))
          .limit(1);
        
        if (st?.metadata && typeof st.metadata === 'object' && 'token' in st.metadata) {
          tokensMap[stId] = (st.metadata as any).token as string;
        }
      }
    }

    const response = requests.map(r => ({
        requestId: r.id,
        patientName: patientNamesMap[r.patientId] || 'Unknown Patient',
        status: r.status,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        approvedScope: r.approvedScope,
        token: r.shareTokenId ? (tokensMap[r.shareTokenId] || null) : null,
      }));
      
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
}
main();
