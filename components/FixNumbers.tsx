"use client";

import { useState } from "react";
import { GOAL } from "@/lib/types";

function Picker({
  emoji,
  label,
  value,
  max,
  min,
  onStep,
  tint,
}: {
  emoji: string;
  label: string;
  value: number;
  max: number;
  min: number;
  onStep: (delta: number) => void;
  tint: string;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
        <span aria-hidden>{emoji}</span> {label}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`One fewer ${label}`}
          onClick={() => onStep(-1)}
          disabled={value <= min}
          className="h-14 w-14 shrink-0 rounded-2xl bg-black/40 text-2xl font-black ring-1 ring-line transition active:scale-95 disabled:opacity-30"
        >
          −
        </button>
        <span
          className={`font-score flex-1 text-center text-4xl leading-none tabular-nums ${tint}`}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`One more ${label}`}
          onClick={() => onStep(1)}
          disabled={value >= max}
          className="h-14 w-14 shrink-0 rounded-2xl bg-black/40 text-2xl font-black ring-1 ring-line transition active:scale-95 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

/** Rapid taps must not read a stale prop, so stepping is always functional. */
function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export default function FixNumbers({
  beers,
  dogs,
  inning,
  busy,
  onCancel,
  onSubmit,
}: {
  beers: number;
  dogs: number;
  inning: number | null;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (next: {
    beers: number;
    dogs: number;
    inning: number | null;
  }) => void;
}) {
  const [b, setB] = useState(beers);
  const [d, setD] = useState(dogs);
  const [i, setI] = useState<number | null>(inning);

  const changed = b !== beers || d !== dogs || i !== inning;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center">
      <div className="max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-surface p-5 ring-1 ring-line">
        <h2 className="font-score text-3xl uppercase leading-none">
          Fix the count
        </h2>
        <p className="mt-2 text-sm text-muted">
          Set what he is actually on. Anyone can correct this.
        </p>

        <Picker
          emoji="🍺"
          label="Beers"
          value={b}
          min={0}
          max={GOAL}
          onStep={(d) => setB((p) => clamp(p + d, 0, GOAL))}
          tint="text-beer"
        />
        <Picker
          emoji="🌭"
          label="Dogs"
          value={d}
          min={0}
          max={GOAL}
          onStep={(d) => setD((p) => clamp(p + d, 0, GOAL))}
          tint="text-dog"
        />

        <div className="mt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Inning
          </p>
          <div className="grid grid-cols-9 gap-1.5">
            {Array.from({ length: 9 }, (_, n) => n + 1).map((n) => {
              const on = i === n;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  aria-label={`Inning ${n}`}
                  onClick={() => setI(i === n ? null : n)}
                  className={`h-11 rounded-xl text-base font-black tabular-nums ring-1 transition active:scale-95 ${
                    on
                      ? "bg-chalk text-black ring-chalk"
                      : "bg-black/40 text-chalk ring-line"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-black/40 px-4 py-3.5 font-bold text-muted ring-1 ring-line"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ beers: b, dogs: d, inning: i })}
            disabled={busy || !changed}
            className="flex-[2] rounded-2xl bg-beer px-4 py-3.5 font-black text-black transition active:scale-[0.98] disabled:opacity-40"
          >
            {busy ? "Saving…" : "Update count"}
          </button>
        </div>
      </div>
    </div>
  );
}
