"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function canLeaveReview(courtId: number): Promise<boolean> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return false;

  const now = new Date();

  const booking = await prisma.booking.findFirst({
    where: {
      userId: Number(session.user.id),
      courtId,
      status: "CONFIRMED",
      endTime: { lt: now },
    },
  });

  if (!booking) return false;

  const existingReview = await prisma.review.findFirst({
    where: {
      userId: Number(session.user.id),
      courtId,
    },
  });

  if (existingReview) return false;

  return true;
}

interface AddReviewInput {
  courtId: number;
  rating: number;
  text?: string;
}

export async function addReview(input: AddReviewInput) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    throw new Error("Unauthorized");
  }

  const { courtId, rating, text } = input;

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const now = new Date();
  const booking = await prisma.booking.findFirst({
    where: {
      userId: Number(session.user.id),
      courtId,
      status: "CONFIRMED",
      endTime: { lt: now },
    },
  });

  if (!booking) {
    throw new Error("User not eligible to review this court");
  }

  const existingReview = await prisma.review.findFirst({
    where: { courtId, userId: Number(session.user.id) },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this court");
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      courtId,
      userId: Number(session.user.id),
      rating,
      comment: text,
    },
  });

  const aggregate = await prisma.courtRatingAggregate.findUnique({
    where: { courtId },
  });

  if (aggregate) {
    const updatedStarsCount = {
      stars1: aggregate.stars1,
      stars2: aggregate.stars2,
      stars3: aggregate.stars3,
      stars4: aggregate.stars4,
      stars5: aggregate.stars5,
    };

    switch (rating) {
      case 1:
        updatedStarsCount.stars1 += 1;
        break;
      case 2:
        updatedStarsCount.stars2 += 1;
        break;
      case 3:
        updatedStarsCount.stars3 += 1;
        break;
      case 4:
        updatedStarsCount.stars4 += 1;
        break;
      case 5:
        updatedStarsCount.stars5 += 1;
        break;
    }

    const newCount = aggregate.count + 1;

    const totalStars =
      updatedStarsCount.stars1 * 1 +
      updatedStarsCount.stars2 * 2 +
      updatedStarsCount.stars3 * 3 +
      updatedStarsCount.stars4 * 4 +
      updatedStarsCount.stars5 * 5;
    const newAvg = totalStars / newCount;

    await prisma.courtRatingAggregate.update({
      where: { courtId },
      data: {
        stars1: updatedStarsCount.stars1,
        stars2: updatedStarsCount.stars2,
        stars3: updatedStarsCount.stars3,
        stars4: updatedStarsCount.stars4,
        stars5: updatedStarsCount.stars5,
        count: newCount,
        avg: newAvg,
        updatedAt: new Date(),
      },
    });
  } else {
    await prisma.courtRatingAggregate.create({
      data: {
        courtId,
        stars1: rating === 1 ? 1 : 0,
        stars2: rating === 2 ? 1 : 0,
        stars3: rating === 3 ? 1 : 0,
        stars4: rating === 4 ? 1 : 0,
        stars5: rating === 5 ? 1 : 0,
        count: 1,
        avg: rating,
      },
    });
  }

  return review;
}
