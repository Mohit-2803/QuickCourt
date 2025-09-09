"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface UpdateProfileInput {
  fullName: string;
  avatarUrl?: string;
}

export async function updateUserProfile(input: UpdateProfileInput) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!input.fullName || input.fullName.trim() === "") {
    return { ok: false, error: "Full name is required" };
  }

  // Update the user by email
  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: {
      fullName: input.fullName.trim(),
      avatarUrl: input.avatarUrl,
    },
  });
  revalidatePath("/player/profile");
  revalidatePath("/player/bookings");
  revalidatePath("manager/profile");
  return { ok: true, user: updatedUser };
}
