"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const sports = ["Badminton", "Tennis", "Football", "Squash", "Table Tennis"];

export function FiltersSidebar() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([300, 1500]);
  const [rating, setRating] = useState<string>("any");

  function toggleSport(s: string) {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function clearAll() {
    setQ("");
    setSelected([]);
    setPrice([300, 1500]);
    setRating("any");
  }

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Search & Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            placeholder="Court, venue, area"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <Label>Sport</Label>
          <div className="grid grid-cols-2 gap-2">
            {sports.map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 rounded-md border p-2"
              >
                <Checkbox
                  checked={selected.includes(s)}
                  onCheckedChange={() => toggleSport(s)}
                />
                <span className="text-sm">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Price per hour (₹)</Label>
          <Slider
            value={price}
            onValueChange={(val) => setPrice(val as [number, number])}
            min={0}
            max={3000}
            step={50}
            minStepsBetweenThumbs={1}
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹{price[0].toLocaleString("en-IN")}</span>
            <span>₹{price[1].toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label>Rating</Label>
          <RadioGroup value={rating} onValueChange={setRating}>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="r-any" value="any" />
              <Label htmlFor="r-any">Any</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="r-45" value="4.5" />
              <Label htmlFor="r-45">4.5+ stars</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="r-4" value="4.0" />
              <Label htmlFor="r-4">4.0+ stars</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem id="r-35" value="3.5" />
              <Label htmlFor="r-35">3.5+ stars</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={clearAll}
          >
            Clear
          </Button>
          <Button className="bg-orange-600 cursor-pointer hover:bg-orange-700">
            {" "}
            Apply
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
