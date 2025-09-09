"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminUserRow } from "@/app/admin/users/page";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import UserEditModal from "@/components/admin/users/user-edit-modal";
import UserDeleteModal from "@/components/admin/users/user-delete-modal";

const PAGE_SIZE = 10;

function roleBadgeVariant(role: AdminUserRow["role"]) {
  switch (role) {
    case "ADMIN":
      return "default";
    case "OWNER":
      return "secondary";
    case "USER":
      return "outline";
    default:
      return "secondary";
  }
}

function roleBadgeClass(role: AdminUserRow["role"]) {
  switch (role) {
    case "ADMIN":
      return "bg-purple-600 text-white hover:bg-purple-700";
    case "OWNER":
      return "border border-blue-600/30 bg-blue-600/10 text-blue-700 dark:text-blue-400";
    case "USER":
      return "border border-zinc-500/30 text-foreground";
    default:
      return "";
  }
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function UsersTable({
  data,
}: {
  data: (AdminUserRow & {
    avatarUrl?: string | null;
    emailVerified?: boolean;
  })[];
}) {
  const router = useRouter();

  // pagination
  const [page, setPage] = useState(1);
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  const pageItems = useMemo(
    () => data.slice(startIdx, endIdx),
    [data, startIdx, endIdx]
  );

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const goPage = (p: number) =>
    setPage(() => Math.min(Math.max(1, p), totalPages));

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const window: number[] = [
      1,
      2,
      page - 1,
      page,
      page + 1,
      totalPages - 1,
      totalPages,
    ]
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
    const dedup = window.filter((n, i) => n !== window[i - 1]);
    return dedup;
  }, [page, totalPages]);

  // modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<
    | (AdminUserRow & { avatarUrl?: string | null; emailVerified?: boolean })
    | null
  >(null);

  const handleEdit = (
    u: AdminUserRow & { avatarUrl?: string | null; emailVerified?: boolean }
  ) => {
    setActiveUser(u);
    setEditOpen(true);
  };

  const handleDelete = (
    u: AdminUserRow & { avatarUrl?: string | null; emailVerified?: boolean }
  ) => {
    setActiveUser(u);
    setDeleteOpen(true);
  };

  return (
    <Card className="rounded-xl border bg-card text-card-foreground shadow-sm p-0">
      <div className="relative overflow-auto">
        <Table className="table-auto">
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <TableRow>
              <TableHead className="min-w-[280px]">User</TableHead>
              <TableHead className="min-w-[240px]">Email</TableHead>
              <TableHead className="min-w-[120px]">Verified</TableHead>
              <TableHead className="min-w-[120px]">Role</TableHead>
              <TableHead className="min-w-[160px]">Joined</TableHead>
              <TableHead className="text-right min-w-[160px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((u) => {
              const joined = new Date(u.createdAt);
              const name = u.fullName || u.email.split("@")[0];

              return (
                <TableRow
                  key={u.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {/* User with avatar */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 font-medium">
                        <AvatarImage
                          src={u.avatarUrl ?? undefined}
                          alt={name}
                        />
                        <AvatarFallback className="text-xs">
                          {initials(name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate">
                          <span
                            className={`${u.role === "ADMIN" && "font-bold"}`}
                          >
                            {u.fullName}
                          </span>
                        </div>
                        {u.role === "ADMIN" ? null : (
                          <div className="text-xs text-muted-foreground">
                            ID: {u.id}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="truncate">{u.email}</span>
                  </TableCell>

                  {/* Email verified */}
                  <TableCell>
                    {u.emailVerified ? (
                      <Badge
                        variant="secondary"
                        className="border border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 rounded-full"
                      >
                        Verified
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border border-amber-600/30 bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-full"
                      >
                        Unverified
                      </Badge>
                    )}
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Badge
                      variant={roleBadgeVariant(u.role)}
                      className={`rounded-full ${roleBadgeClass(u.role)}`}
                    >
                      {u.role}
                    </Badge>
                  </TableCell>

                  {/* Joined */}
                  <TableCell className="whitespace-nowrap">
                    <div className="text-sm">{joined.toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {joined.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>

                  {/* Actions (hide for admin) */}
                  {u.role === "ADMIN" ? (
                    <TableCell />
                  ) : (
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => handleEdit(u)}
                          aria-label={`Edit ${u.fullName}`}
                          title={`Edit ${u.fullName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => handleDelete(u)}
                          aria-label={`Delete ${u.fullName}`}
                          title={`Delete ${u.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination controls */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {total === 0 ? 0 : startIdx + 1}
            </span>
            –<span className="font-medium text-foreground">{endIdx}</span> of{" "}
            <span className="font-medium text-foreground">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={goPrev}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {pageNumbers.map((n, idx) => {
                const isCurrent = n === page;
                const showEllipsis = idx > 0 && n - pageNumbers[idx - 1] > 1;

                return (
                  <div key={n} className="flex items-center">
                    {showEllipsis ? (
                      <span className="px-1 text-muted-foreground">…</span>
                    ) : null}
                    <Button
                      variant={isCurrent ? "default" : "outline"}
                      size="sm"
                      className="cursor-pointer px-3"
                      onClick={() => goPage(n)}
                      aria-current={isCurrent ? "page" : undefined}
                    >
                      {n}
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={goNext}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserEditModal
        open={editOpen}
        onOpenChange={setEditOpen}
        user={activeUser}
        onSaved={() => router.refresh()}
      />

      <UserDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={activeUser ?? null}
        onDeleted={() => router.refresh()}
      />
    </Card>
  );
}
