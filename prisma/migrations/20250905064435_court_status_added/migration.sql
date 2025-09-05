-- CreateEnum
CREATE TYPE "public"."CourtStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "public"."Court" ADD COLUMN     "status" "public"."CourtStatus" NOT NULL DEFAULT 'ACTIVE';
