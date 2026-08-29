"use client";

import { ordinal } from "@/lib/totals";
import { GOAL } from "@/lib/types";

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
          className={`font-score text-4xl leading-none tabular-nums ${
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
  inning,
  onFix,
  pace,
}: {
  beers: number;
  dogs: number;
  inning: number | null;
  onFix?: () => void;
  pace: number | null;
}) {
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-line bg-field/95 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-2 gap-6">
        <Counter emoji="🍺" label="Beers" n={beers} fill="bg-beer" text="text-beer" />
        <Counter emoji="🌭" label="Dogs" n={dogs} fill="bg-dog" text="text-dog" />
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
        <span className="text-muted">
          {inning ? `${ordinal(inning)} inning` : "Pre-game"}
        </span>
        <div className="flex items-center gap-3">
          {onFix && (
            <button
              type="button"
              onClick={onFix}
              className="rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-muted ring-1 ring-line transition active:scale-95"
            >
              Fix
            </button>
          )}
          <span className={pace && pace > 9 ? "text-dog" : "text-muted"}>
            {paceLabel(beers, pace)}
          </span>
        </div>
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
