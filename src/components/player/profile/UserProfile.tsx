"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfileModal from "./edit-profile-modal";
import { User } from "@prisma/client";

interface UserProfileProps {
  user: Pick<User, "fullName" | "email" | "avatarUrl" | "role" | "createdAt">;
}

export default function UserProfile({ user }: UserProfileProps) {
  const router = useRouter();

  return (
    <main className="max-w-lg mx-auto my-12 min-h-screen">
      <Card className="shadow-lg rounded-3xl">
        <CardHeader className="flex flex-col items-center pt-10 pb-6">
          <Avatar className="w-28 h-28 mb-4">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.fullName} />
            ) : (
              <AvatarFallback className="text-5xl font-bold">
                {user.fullName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>

          <CardTitle className="text-3xl font-extrabold text-gray-900">
            {user.fullName}
          </CardTitle>

          <CardDescription className="text-gray-600">
            {user.email}
          </CardDescription>

          <div className="mt-2 flex gap-2">
            <span className="uppercase bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full tracking-widest select-none">
              {user.role === "OWNER" ? "Venue Owner" : "Player"}
            </span>
          </div>

          <p className="mt-3 text-xs text-gray-400 select-none">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </CardHeader>

        {user.role !== "OWNER" && (
          <CardContent className="flex flex-col gap-4 px-10">
            <Button
              onClick={() => router.push("/player/bookings")}
              variant="outline"
              className="w-full cursor-pointer"
            >
              My Bookings
            </Button>
          </CardContent>
        )}

        <CardFooter className="flex flex-row gap-3 px-10 pb-10 pt-4 w-fit">
          <EditProfileModal
            currentName={user.fullName}
            currentAvatarUrl={user.avatarUrl || ""}
            onSuccess={() => {
              router.refresh();
            }}
          />

          <Button
            variant="destructive"
            className="w-full cursor-pointer"
            onClick={() => signOut()}
          >
            Logout
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
