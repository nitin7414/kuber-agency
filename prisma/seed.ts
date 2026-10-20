import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Check if an admin already exists
  const existingAdmin = await prisma.admin.findFirst();

  if (!existingAdmin) {
    // Hash default startup PIN (123456)
    const hashedPin = await bcrypt.hash("123456", 10);
    
    await prisma.admin.create({
      data: {
        adminPin: hashedPin,
        darkMode: false,
      },
    });
    console.log("✅ Admin successfully created with default PIN: 123456");
  } else {
    console.log("ℹ️ Admin already exists.");
  }

  // Ensure AgencyStock exists
  const existingStock = await prisma.agencyStock.findFirst();
  if (!existingStock) {
    await prisma.agencyStock.create({
      data: {
        totalFilled: 0,
        totalEmpty: 0,
      },
    });
    console.log("✅ Agency stock initialized with 0 filled and 0 empty.");
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