"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface LeaveReviewProps {
  courtId: number;
  onSuccess?: () => void;
}

export default function LeaveReview({ courtId, onSuccess }: LeaveReviewProps) {
  const [rating, setRating] = React.useState(0);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/review/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courtId, rating, text }),
      });
      if (res.ok) {
        toast.success("Review submitted successfully");
        setRating(0);
        setText("");
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch {
      toast.error("Unexpected error");
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto bg-card p-6 rounded-2xl shadow-sm"
    >
      <h3 className="text-lg font-semibold">Leave a Review</h3>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`cursor-pointer h-7 w-7 ${
              rating >= star
                ? "fill-orange-400 text-orange-400"
                : "text-gray-400"
            }`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
      <Textarea
        placeholder="Write your review (optional)"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        className="resize-none"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}
