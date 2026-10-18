-- CreateEnum
CREATE TYPE "DocumentSource" AS ENUM ('CLIENT', 'CONSULTANT_GENERATED', 'EXTERNAL_OFFICIAL');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "source" "DocumentSource" NOT NULL DEFAULT 'CLIENT';
