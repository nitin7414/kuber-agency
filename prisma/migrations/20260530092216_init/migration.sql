-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CUSTOMER_ADDED', 'TRANSACTION_ADDED', 'PAYMENT_RECEIVED', 'CYLINDERS_DELIVERED', 'EMPTIES_COLLECTED', 'TASK_ADDED', 'TASK_EDITED', 'STOCK_UPDATED');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminPin" TEXT NOT NULL DEFAULT '245773',

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "aadharUrl" TEXT,
    "panUrl" TEXT,
    "foodLicenseUrl" TEXT,
    "gstCertUrl" TEXT,
    "totalDelivered" INTEGER NOT NULL DEFAULT 0,
    "totalEmptyLeft" INTEGER NOT NULL DEFAULT 0,
    "pendingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "cylindersDelivered" INTEGER,
    "emptiesCollected" INTEGER,
    "paymentAmount" DOUBLE PRECISION,
    "balanceAfter" DOUBLE PRECISION NOT NULL,
    "totalEmptyAfter" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyStock" (
    "id" TEXT NOT NULL,
    "totalFilled" INTEGER NOT NULL DEFAULT 0,
    "totalEmpty" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT,
    "amount" DOUBLE PRECISION,
    "cylinders" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
