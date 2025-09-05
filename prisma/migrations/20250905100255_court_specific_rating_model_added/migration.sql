/*
  Warnings:

  - Added the required column `courtId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Review" DROP CONSTRAINT "Review_venueId_fkey";

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "courtId" INTEGER NOT NULL,
ALTER COLUMN "venueId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Court_venueId_idx" ON "public"."Court"("venueId");

-- CreateIndex
CREATE INDEX "Review_courtId_idx" ON "public"."Review"("courtId");

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "public"."Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
