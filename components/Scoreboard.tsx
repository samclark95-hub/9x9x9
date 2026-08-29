"use client";

import { GOAL } from "@/lib/types";
import { ordinal } from "@/lib/totals";

function Segments({ n, fill }: { n: number; fill: string }) {
  return (
    <div className="mt-1.5 flex gap-[3px]" aria-hidden>
      {Array.from({ length: GOAL }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i < n ? fill : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

function Counter({
  emoji,
  label,
  n,
  fill,
  text,
}: {
  emoji: string;
  label: string;
  n: number;
  fill: string;
  text: string;
}) {
  const done = n >= GOAL;
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-base leading-none" aria-hidden>
          {emoji}
        </span>
        <span
          className={`text-3xl font-black leading-none tabular-nums ${
            done ? text : "text-chalk"
          }`}
        >
          {n}
        </span>
        <span className="text-sm font-bold leading-none text-muted">
          /{GOAL}
        </span>
        <span className="sr-only">
          {label}: {n} of {GOAL}
        </span>
      </div>
      <Segments n={n} fill={fill} />
    </div>
  );
}

export default function Scoreboard({
  beers,
  dogs,
  waters,
  inning,
  pace,
}: {
  beers: number;
  dogs: number;
  waters: number;
  inning: number | null;
  pace: number | null;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-field/95 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-3 gap-4">
        <Counter emoji="🍺" label="Beers" n={beers} fill="bg-beer" text="text-beer" />
        <Counter emoji="🌭" label="Dogs" n={dogs} fill="bg-dog" text="text-dog" />
        <Counter emoji="💧" label="Waters" n={waters} fill="bg-water" text="text-water" />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
        <span className="text-muted">
          {inning ? `${ordinal(inning)} inning` : "Pre-game"}
        </span>
        <span className={pace && pace > 9 ? "text-dog" : "text-muted"}>
          {paceLabel(beers, pace)}
        </span>
      </div>
    </div>
  );
}

function paceLabel(beers: number, pace: number | null): string {
  if (beers >= GOAL) return "Beers done 🍺";
  if (pace === null) return "No pace yet";
  if (pace > 9) return "Behind pace";
  return `On pace: ${ordinal(pace)}`;
}
