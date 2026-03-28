-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "freeSessionCount" INTEGER NOT NULL DEFAULT 4;

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);
