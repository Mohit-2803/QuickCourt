"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminQuickFilter() {
  const [range, setRange] = useState("30d");

  return (
    <div className="flex items-center gap-2">
      <Select value={range} onValueChange={setRange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
          <SelectItem value="90d">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" className="cursor-pointer">
        Apply
      </Button>
    </div>
  );
}
