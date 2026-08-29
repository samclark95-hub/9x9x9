"use client";

import { useRef, useState } from "react";

export type Draft = {
  beers: number;
  dogs: number;
  waters: number;
  inning: number | null;
  note: string;
  file: File | null;
};

const EMPTY: Draft = {
  beers: 0,
  dogs: 0,
  waters: 0,
  inning: null,
  note: "",
  file: null,
};

type Counter = "beers" | "dogs" | "waters";

const COUNTERS: { key: Counter; emoji: string; label: string; ring: string }[] = [
  { key: "beers", emoji: "🍺", label: "Beer", ring: "focus-visible:ring-beer" },
  { key: "dogs", emoji: "🌭", label: "Dog", ring: "focus-visible:ring-dog" },
  { key: "waters", emoji: "💧", label: "Water", ring: "focus-visible:ring-water" },
];

export default function Composer({
  onPost,
  busy,
  status,
}: {
  onPost: (draft: Draft) => Promise<void>;
  busy: boolean;
  status: string | null;
}) {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const staged = draft.beers + draft.dogs + draft.waters;
  const canPost =
    !busy && (staged > 0 || draft.note.trim().length > 0 || draft.file !== null);

  const bump = (key: Counter) => setDraft((d) => ({ ...d, [key]: d[key] + 1 }));

  function pickFile(file: File | null) {
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return file ? URL.createObjectURL(file) : null;
    });
    setDraft((d) => ({ ...d, file }));
  }

  async function submit() {
    if (!canPost) return;
    await onPost({ ...draft, note: draft.note.trim() });
    setDraft(EMPTY);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <section
      aria-label="Add to the count"
      className="rounded-3xl bg-surface p-4 ring-1 ring-line"
    >
      {/* Tap to stage, tap again to increase. One-handed, in the dark. */}
      <div className="grid grid-cols-3 gap-3">
        {COUNTERS.map(({ key, emoji, label, ring }) => (
          <button
            key={key}
            type="button"
            onClick={() => bump(key)}
            aria-label={`Add one ${label}`}
            className={`relative flex h-24 flex-col items-center justify-center gap-1 rounded-2xl bg-black/40 ring-1 ring-line transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 ${ring}`}
          >
            <span className="text-3xl" aria-hidden>
              {emoji}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-muted">
              {label}
            </span>
            {draft[key] > 0 && (
              <span className="absolute right-2 top-2 min-w-7 rounded-full bg-chalk px-2 py-0.5 text-sm font-black tabular-nums text-black">
                {draft[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {staged > 0 && (
        <button
          type="button"
          onClick={() =>
            setDraft((d) => ({ ...d, beers: 0, dogs: 0, waters: 0 }))
          }
          className="mt-2 w-full py-1 text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Clear counts
        </button>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Inning
        </p>
        <div className="grid grid-cols-9 gap-1.5">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
            const on = draft.inning === n;
            return (
              <button
                key={n}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setDraft((d) => ({ ...d, inning: d.inning === n ? null : n }))
                }
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

      <input
        value={draft.note}
        onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
        placeholder="Say something (optional)"
        maxLength={140}
        enterKeyHint="done"
        className="mt-4 w-full rounded-2xl bg-black/40 px-4 py-3.5 text-base outline-none ring-1 ring-line placeholder:text-muted/60 focus:ring-2 focus:ring-beer"
      />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
        className="sr-only"
        id="photo-input"
      />

      {preview ? (
        <div className="relative mt-3 overflow-hidden rounded-2xl ring-1 ring-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Selected" className="max-h-56 w-full object-cover" />
          <button
            type="button"
            onClick={() => pickFile(null)}
            className="absolute right-2 top-2 rounded-full bg-black/80 px-3 py-1.5 text-xs font-bold ring-1 ring-line"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor="photo-input"
          className="mt-3 flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-black/40 text-sm font-bold text-muted ring-1 ring-line transition active:scale-[0.98]"
        >
          <span aria-hidden>📷</span> Add a photo
        </label>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!canPost}
        className="mt-3 w-full rounded-2xl bg-beer px-4 py-4 text-lg font-black text-black transition active:scale-[0.98] disabled:opacity-40"
      >
        {busy ? (status ?? "Posting…") : "Post"}
      </button>
    </section>
  );
}
