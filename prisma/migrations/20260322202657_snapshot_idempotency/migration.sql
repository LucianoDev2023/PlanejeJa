/*
  Warnings:

  - A unique constraint covering the columns `[userId,dateKey]` on the table `PortfolioSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PortfolioSnapshot" ADD COLUMN     "dateKey" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioSnapshot_userId_dateKey_key" ON "PortfolioSnapshot"("userId", "dateKey");
