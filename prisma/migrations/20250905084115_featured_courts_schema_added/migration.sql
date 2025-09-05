-- CreateEnum
CREATE TYPE "public"."EventKind" AS ENUM ('VIEW', 'BOOKING');

-- CreateTable
CREATE TABLE "public"."CourtEvent" (
    "id" SERIAL NOT NULL,
    "courtId" INTEGER NOT NULL,
    "kind" "public"."EventKind" NOT NULL,
    "source" TEXT,
    "city" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourtEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourtRatingAggregate" (
    "courtId" INTEGER NOT NULL,
    "stars1" INTEGER NOT NULL DEFAULT 0,
    "stars2" INTEGER NOT NULL DEFAULT 0,
    "stars3" INTEGER NOT NULL DEFAULT 0,
    "stars4" INTEGER NOT NULL DEFAULT 0,
    "stars5" INTEGER NOT NULL DEFAULT 0,
    "avg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtRatingAggregate_pkey" PRIMARY KEY ("courtId")
);

-- CreateTable
CREATE TABLE "public"."FeaturedSnapshot" (
    "id" SERIAL NOT NULL,
    "city" TEXT,
    "items" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "FeaturedSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourtEvent_courtId_kind_createdAt_idx" ON "public"."CourtEvent"("courtId", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "CourtEvent_city_kind_createdAt_idx" ON "public"."CourtEvent"("city", "kind", "createdAt");

-- CreateIndex
CREATE INDEX "FeaturedSnapshot_city_computedAt_idx" ON "public"."FeaturedSnapshot"("city", "computedAt");

-- AddForeignKey
ALTER TABLE "public"."CourtEvent" ADD CONSTRAINT "CourtEvent_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourtRatingAggregate" ADD CONSTRAINT "CourtRatingAggregate_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
