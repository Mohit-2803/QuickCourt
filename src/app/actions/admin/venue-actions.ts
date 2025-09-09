// app/admin/venues/actions.ts
"use server";

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateVenueApproval(id: string, approved: boolean) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.venue.update({
    where: { id: parseInt(id) },
    data: { approved: approved },
  });

  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  revalidatePath("/manager/my-venues");
  return { ok: true };
}

export type UpdateVenuePayload = {
  id: string;
  name?: string;
  city?: string;
  address?: string;
  slug?: string;
  description?: string | null;
  approved?: boolean;
};

export async function updateVenueDetails(input: UpdateVenuePayload) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const idNum = Number(input.id);
  if (!Number.isFinite(idNum)) throw new Error("Invalid venue id");

  await prisma.venue.update({
    where: { id: idNum },
    data: {
      name: input.name,
      city: input.city,
      address: input.address,
      slug: input.slug,
      description: input.description ?? undefined,
      approved: input.approved,
    },
  });
  revalidatePath("/admin/venues");
  revalidatePath("/venues");
  revalidatePath("/manager/my-venues");
  return { ok: true };
}
