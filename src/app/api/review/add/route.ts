import { NextResponse } from "next/server";
import { addReview as addReviewAction } from "@/app/actions/player/review-actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const review = await addReviewAction(body);
    return NextResponse.json(review);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to add review" },
      { status: 400 }
    );
  }
}
