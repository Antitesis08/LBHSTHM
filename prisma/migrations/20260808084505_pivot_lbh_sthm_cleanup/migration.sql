/*
  Warnings:

  - You are about to drop the column `preferredConsultantId` on the `Case` table. All the data in the column will be lost.
  - Made the column `consultantId` on table `Case` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_consultantId_fkey";

-- DropForeignKey
ALTER TABLE "Case" DROP CONSTRAINT "Case_preferredConsultantId_fkey";

-- AlterTable
ALTER TABLE "Case" DROP COLUMN "preferredConsultantId",
ALTER COLUMN "consultantId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "ConsultantProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
