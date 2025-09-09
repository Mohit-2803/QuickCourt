// components/admin/venues/venues-table.tsx
"use client";

import { useState, useTransition } from "react";
import { updateVenueApproval } from "@/app/actions/admin/venue-actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import VenueModal, { VenueDetail } from "./venue-modal";

type VenueRow = {
  id: string;
  name: string;
  city: string;
  approved: boolean;
  createdAt: string | Date;
  address?: string;
  slug?: string;
  description?: string | null;
  amenities?: string[];
  photos?: string[];
  updatedAt?: string | Date;
  owner?: {
    id: string;
    businessName?: string | null;
    phone?: string | null;
  };
};

export default function VenuesTable({ venues }: { venues: VenueRow[] }) {
  // Independent pending states per action
  const [approvingRow, setApprovingRow] = useState<string | null>(null);
  const [disapprovingRow, setDisapprovingRow] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Modal state
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<VenueDetail | null>(null);

  const openModal = (v: VenueRow) => {
    setActive({
      id: v.id,
      name: v.name,
      city: v.city,
      address: v.address ?? "",
      slug: v.slug ?? "",
      description: v.description ?? "",
      approved: v.approved,
      amenities: v.amenities,
      photos: v.photos,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      owner: v.owner ? { ...v.owner } : undefined,
    });
    setOpen(true);
  };

  const onApprove = (id: string) => {
    setApprovingRow(id);
    startTransition(async () => {
      try {
        await updateVenueApproval(id, true);
      } finally {
        setApprovingRow(null);
      }
    });
  };

  const onDisapprove = (id: string) => {
    setDisapprovingRow(id);
    startTransition(async () => {
      try {
        await updateVenueApproval(id, false);
      } finally {
        setDisapprovingRow(null);
      }
    });
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="relative overflow-auto">
        <Table className="table-auto">
          <TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75">
            <TableRow>
              <TableHead className="min-w-[220px]">Name</TableHead>
              <TableHead className="min-w-[140px]">City</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[180px]">Created</TableHead>
              <TableHead className="text-right min-w-[200px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.map((v) => {
              const created = new Date(v.createdAt);
              const approving = approvingRow === v.id;
              const disapproving = disapprovingRow === v.id;

              return (
                <TableRow
                  key={v.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  {/* Clickable data cells open modal */}
                  <TableCell
                    className="font-medium cursor-pointer"
                    onClick={() => openModal(v)}
                  >
                    <div className="truncate">{v.name}</div>
                    <div className="text-xs text-muted-foreground">
                      ID: {v.id}
                    </div>
                  </TableCell>

                  <TableCell
                    className="cursor-pointer"
                    onClick={() => openModal(v)}
                  >
                    <span className="truncate">{v.city}</span>
                  </TableCell>

                  <TableCell
                    className="cursor-pointer"
                    onClick={() => openModal(v)}
                  >
                    {v.approved ? (
                      <Badge
                        variant="secondary"
                        className="border border-emerald-600/20 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 rounded-full"
                      >
                        Approved
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="border border-amber-600/20 bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-full"
                      >
                        Pending
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell
                    className="whitespace-nowrap cursor-pointer"
                    onClick={() => openModal(v)}
                  >
                    <div className="text-sm">
                      {created.toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {created.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </TableCell>

                  {/* Action buttons */}
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                        disabled={approving || v.approved}
                        onClick={() => onApprove(v.id)}
                      >
                        {approving ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Approving
                          </span>
                        ) : (
                          "Approve"
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="cursor-pointer"
                        disabled={disapproving || !v.approved}
                        onClick={() => onDisapprove(v.id)}
                      >
                        {disapproving ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Disapproving
                          </span>
                        ) : (
                          "Disapprove"
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}

            {venues.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No venues found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal mount */}
      <VenueModal
        open={open}
        onOpenChange={setOpen}
        venue={active}
        onSaved={() => {}}
      />
    </div>
  );
}
