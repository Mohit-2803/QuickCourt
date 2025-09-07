import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserProfile from "@/components/player/profile/UserProfile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      fullName: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return <UserProfile user={user} />;
}
