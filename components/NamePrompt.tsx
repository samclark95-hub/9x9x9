"use client";

import { useState } from "react";

export default function NamePrompt({
  onSubmit,
}: {
  onSubmit: (name: string) => void;
}) {
  const [value, setValue] = useState("");
  const canSubmit = value.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit(value);
        }}
        className="w-full max-w-sm rounded-3xl bg-surface p-6 ring-1 ring-line"
      >
        <h2 className="text-2xl font-black leading-tight">Who are you?</h2>
        <p className="mt-2 text-sm text-muted">
          Shows on your posts. Asked once.
        </p>

        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your name"
          maxLength={24}
          enterKeyHint="go"
          className="mt-5 w-full rounded-2xl bg-black/40 px-4 py-4 text-lg outline-none ring-1 ring-line placeholder:text-muted/60 focus:ring-2 focus:ring-beer"
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-4 w-full rounded-2xl bg-beer px-4 py-4 text-lg font-black text-black transition active:scale-[0.98] disabled:opacity-40"
        >
          Let me in
        </button>
      </form>
    </div>
  );
}
