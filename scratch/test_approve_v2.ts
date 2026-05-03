import { db } from '../src/db';
import { getAccessRequestById, updateAccessRequest } from '../src/repositories/accessRequests.repository';
import { createShareToken } from '../src/repositories/shareTokens.repository';
import { getDoctorWithUser } from '../src/repositories/doctor.repository';

async function main() {
  try {
    const accessReq = await getAccessRequestById('c8964331-a52e-4578-945c-d4893156e389');
    console.log("Found request:", accessReq);
    if (!accessReq) return;

    const doctorData = await getDoctorWithUser(accessReq.doctorId);
    if (!doctorData) {
        console.error("Doctor not found");
        return;
    }

    console.log("Creating share token...");
    const shareToken = await createShareToken({
      patientId: accessReq.patientId,
      doctorId: doctorData.user.userId,
      scope: ['reports', 'prescriptions', 'health_data'],
      accessLevel: 'doctor',
      accessType: 'restricted',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    console.log("Created share token:", shareToken);

    console.log("Updating request...");
    const updatedReq = await updateAccessRequest(accessReq.id, {
      status: 'approved',
      approvedScope: ['reports', 'prescriptions', 'health_data'],
      shareTokenId: shareToken.tokenId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    console.log("Updated request:", updatedReq);

  } catch (error) {
    console.error("Test Error:", error);
  } finally {
    process.exit(0);
  }
}
main();
