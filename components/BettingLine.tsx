"use client";

import { useCallback, useEffect, useState } from "react";
import {
  computeLine,
  pickFor,
  type Prediction,
} from "@/lib/predictions";
import { betNote } from "@/lib/types";
import { supabase } from "@/lib/supabase";

function Row({
  emoji,
  label,
  value,
  onChange,
  tint,
}: {
  emoji: string;
  label: string;
  value: number | null;
  onChange: (n: number) => void;
  tint: string;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
        <span aria-hidden>{emoji}</span> {label}
      </p>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i).map((n) => {
          const on = value === n;
          return (
            <button
              key={n}
              type="button"
              aria-pressed={on}
              aria-label={`${label}: ${n}`}
              onClick={() => onChange(n)}
              className={`h-10 rounded-lg text-sm font-black tabular-nums ring-1 transition active:scale-95 ${
                on ? `${tint} text-black ring-transparent` : "bg-black/40 text-chalk ring-line"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BettingLine({ name }: { name: string | null }) {
  const [rows, setRows] = useState<Prediction[]>([]);
  const [available, setAvailable] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [beers, setBeers] = useState<number | null>(null);
  const [dogs, setDogs] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("predictions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      // Table not created yet - hide the bar rather than break the app.
      setAvailable(false);
      setLoaded(true);
      return;
    }
    setRows((data ?? []) as Prediction[]);
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!available) return;
    const channel = supabase
      .channel("predictions-line")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "predictions" },
        (payload) => {
          const row = payload.new as Prediction;
          setRows((prev) =>
            prev.some((p) => p.id === row.id) ? prev : [row, ...prev]
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [available]);

  const line = computeLine(rows);
  const mine = pickFor(rows, name);

  function openSheet() {
    setBeers(mine?.beers ?? null);
    setDogs(mine?.dogs ?? null);
    setOpen(true);
  }

  async function submit() {
    if (!name || beers === null || dogs === null) return;
    setSaving(true);

    const { data } = await supabase
      .from("predictions")
      .insert({ voter: name, beers, dogs })
      .select()
      .single();

    if (data) {
      const row = data as Prediction;
      setRows((prev) =>
        prev.some((p) => p.id === row.id) ? prev : [row, ...prev]
      );

      // Announce it in the feed only once the bet actually saved.
      // beers/dogs are deliberately 0: the scoreboard sums the feed,
      // and a bet is a guess, not something he has consumed.
      await supabase.from("posts").insert({
        author: name,
        beers: 0,
        dogs: 0,
        note: betNote(beers, dogs),
      });
    }

    setSaving(false);
    setOpen(false);
  }

  // Nothing until we know the table exists - otherwise the bar flashes
  // "No bets yet" and then vanishes.
  if (!available || !loaded) return null;

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        disabled={!name}
        className="flex w-full items-center gap-3 rounded-2xl bg-surface px-4 py-2.5 text-left ring-1 ring-line transition active:scale-[0.99] disabled:opacity-50"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">
          Line
        </span>

        {line ? (
          <span className="flex items-center gap-3">
            <span className="font-score text-xl leading-none text-beer tabular-nums">
              <span className="mr-1 text-sm" aria-hidden>🍺</span>
              {line.beers.toFixed(1)}
            </span>
            <span className="font-score text-xl leading-none text-dog tabular-nums">
              <span className="mr-1 text-sm" aria-hidden>🌭</span>
              {line.dogs.toFixed(1)}
            </span>
            <span className="text-[11px] font-semibold text-muted">
              {line.voters} {line.voters === 1 ? "vote" : "votes"}
            </span>
          </span>
        ) : (
          <span className="text-sm font-semibold text-muted">
            No bets yet — set the line
          </span>
        )}

        <span className="ml-auto shrink-0 text-[11px] font-bold uppercase tracking-wide text-muted">
          {mine ? `You ${mine.beers}/${mine.dogs}` : "Bet"}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-5 ring-1 ring-line">
            <h2 className="font-score text-3xl uppercase leading-none">
              Set your line
            </h2>
            <p className="mt-2 text-sm text-muted">
              How many does he actually finish with?
            </p>

            <Row emoji="🍺" label="Beers" value={beers} onChange={setBeers} tint="bg-beer" />
            <Row emoji="🌭" label="Dogs" value={dogs} onChange={setDogs} tint="bg-dog" />

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-2xl bg-black/40 px-4 py-3.5 font-bold text-muted ring-1 ring-line"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving || beers === null || dogs === null}
                className="flex-[2] rounded-2xl bg-beer px-4 py-3.5 font-black text-black transition active:scale-[0.98] disabled:opacity-40"
              >
                {saving ? "Placing…" : mine ? "Change bet" : "Place bet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
