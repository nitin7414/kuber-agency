// scripts/reset-db.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function reset() {
  console.log("🔄 Starting complete database reset for Maa Gogas Agency...");

  // 1. Delete all transactions
  const txns = await prisma.transaction.deleteMany();
  console.log(`🗑️ Deleted ${txns.count} transactions.`);

  // 2. Delete all customers
  const customers = await prisma.customer.deleteMany();
  console.log(`🗑️ Deleted ${customers.count} customers.`);

  // 3. Delete all tasks/notes
  const tasks = await prisma.task.deleteMany();
  console.log(`🗑️ Deleted ${tasks.count} tasks.`);

  // 4. Delete all activity logs
  const logs = await prisma.activityLog.deleteMany();
  console.log(`🗑️ Deleted ${logs.count} activity logs.`);

  // 5. Reset AgencyStock to 0 / 0
  await prisma.agencyStock.deleteMany();
  await prisma.agencyStock.create({
    data: {
      totalFilled: 0,
      totalEmpty: 0,
    },
  });
  console.log("✅ Agency stock reset to 0 filled, 0 empty.");

  // 6. Reset Admin with default PIN 123456
  await prisma.admin.deleteMany();
  const defaultPin = process.env.APP_SECURITY_PIN || "123456";
  const hashedPin = await bcrypt.hash(defaultPin, 10);
  await prisma.admin.create({
    data: {
      adminPin: hashedPin,
      darkMode: false,
      logoUrl: null,
    },
  });
  console.log(`✅ Admin profile reset with default PIN: ${defaultPin}`);

  // 7. Initial activity log
  await prisma.activityLog.create({
    data: {
      type: "STOCK_UPDATED",
      description: "Database initialized for Maa Gogas Agency",
    },
  });
  console.log("🎉 Database reset completed successfully for Maa Gogas Agency!");
}

reset()
  .catch((e) => {
    console.error("❌ Reset failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
