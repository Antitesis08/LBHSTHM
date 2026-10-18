-- AlterTable
ALTER TABLE "Case"
ADD COLUMN "preferredConsultantId" TEXT,
ADD COLUMN "rejectionReason" TEXT;

-- AddForeignKey
ALTER TABLE "Case"
ADD CONSTRAINT "Case_preferredConsultantId_fkey"
FOREIGN KEY ("preferredConsultantId") REFERENCES "ConsultantProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
