"use client";

import CountUp from "react-countup";

export function StatCard({
  label,
  value,
  currency = "₹",
}: {
  label: string;
  value: number;
  currency?: string;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">
        <span className="mr-1">{currency}</span>
        <CountUp
          end={value}
          duration={1.2}
          formattingFn={(n) =>
            new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
              n
            )
          }
        />
      </p>
    </div>
  );
}
