"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type UpdateUserPayload = {
  id: string;
  fullName?: string;
  email?: string;
  role?: "USER" | "OWNER" | "ADMIN";
  emailVerified?: boolean;
};

export async function adminUpdateUser(input: UpdateUserPayload) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const idNum = Number(input.id);
  if (!Number.isFinite(idNum)) throw new Error("Invalid user id");

  await prisma.user.update({
    where: { id: idNum },
    data: {
      fullName: input.fullName,
      email: input.email,
      role: input.role,
      emailVerified: input.emailVerified ?? undefined,
    },
  });

  return { ok: true };
}

export async function adminDeleteUser(id: string) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (session.user.id === id) {
    throw new Error("Cannot delete yourself");
  }

  console.log("Deleting user", id);

  const idNum = Number(id);
  if (!Number.isFinite(idNum)) throw new Error("Invalid user id");

  await prisma.user.delete({ where: { id: idNum } });

  return { ok: true };
}
