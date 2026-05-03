import { registerDoctor } from '../src/services/auth.service';

async function main() {
  try {
    const result = await registerDoctor({
      name: "Dr. Gregory House",
      email: "drhouse@hospital.com",
      password: "StrongPassword123!",
      licenseNumber: "MED12345678",
      specialization: "general_medicine",
      phone: "+1234555666",
      bio: "Expert Diagnostician",
      verified: true
    });
    console.log("Success! Doctor created:", result.user.email);
  } catch (error) {
    console.error("Error creating doctor:", error);
  } finally {
    process.exit(0);
  }
}

main();
