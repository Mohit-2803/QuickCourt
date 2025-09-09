// app/admin/users/page.tsx
import prisma from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersTable from "@/components/admin/users/users-table";

export const metadata = {
  title: "Manage Users",
  description: "Admin interface to manage users.",
};

export type AdminUserRow = {
  id: string;
  fullName: string;
  email: string;
  role: "USER" | "OWNER" | "ADMIN";
  emailVerified?: boolean;
  avatarUrl?: string | null;
  createdAt: string;
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const rows: AdminUserRow[] = users.map((u) => ({
    id: u.id.toString(),
    fullName: u.fullName,
    email: u.email,
    role: u.role as "USER" | "OWNER" | "ADMIN",
    avatarUrl: u.avatarUrl || null,
    emailVerified: u.emailVerified || undefined,
    createdAt: new Date(u.createdAt).toISOString(),
  }));

  const owners = rows.filter((u) => u.role === "OWNER");
  const players = rows.filter((u) => u.role === "USER");

  return (
    <div className="mx-auto p-6 w-full max-w-7xl min-h-screen">
      <h1 className="text-xl font-semibold mb-4">Manage Users</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger className="cursor-pointer" value="all">
            All ({rows.length})
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="owners">
            Owners ({owners.length})
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="players">
            Players ({players.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="owners" className="mt-0">
          <UsersTable data={owners} />
        </TabsContent>

        <TabsContent value="players" className="mt-0">
          <UsersTable data={players} />
        </TabsContent>

        <TabsContent value="all" className="mt-0">
          <UsersTable data={rows} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
