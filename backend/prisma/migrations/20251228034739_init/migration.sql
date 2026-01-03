/*
  Warnings:

  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Profile` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Profile_email_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "phone",
DROP COLUMN "updatedAt";
