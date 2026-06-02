import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if an admin already exists so we don't accidentally overwrite anything later
  const existingAdmin = await prisma.admin.findFirst();

  if (!existingAdmin) {
    // Hash the default startup PIN (123456)
    const hashedPin = await bcrypt.hash("123456", 10);
    
    // Create the admin row
    await prisma.admin.create({
      data: {
        adminPin: hashedPin,
        // If your schema requires other fields (like a name or email), add them here:
        // name: "Admin", 
      },
    });
    console.log("✅ Admin successfully created with default PIN: 123456");
  } else {
    console.log("⚠️ Admin already exists. No changes made.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });