/*
  Warnings:

  - Added the required column `userId` to the `CryptoTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CryptoTransaction" ADD COLUMN     "userId" TEXT NOT NULL;
