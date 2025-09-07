/*
  Warnings:

  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[idempotencyKey]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "idempotencyKey" TEXT,
ADD COLUMN     "stripeCheckoutSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeCheckoutSessionId_key" ON "public"."Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "public"."Payment"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Payment_stripeCheckoutSessionId_idx" ON "public"."Payment"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Payment_idempotencyKey_idx" ON "public"."Payment"("idempotencyKey");
