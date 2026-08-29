"use client";

import { useEffect, useState } from "react";

const KEY = "tknkb:bet-hint-dismissed";

/**
 * Points people at the betting line. Sat here because the first thing someone
 * did was enter their prediction as real beer and dog counts, which corrupts
 * the totals - the tracker is for what he has actually eaten and drunk.
 */
export default function BetHintBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {
      // storage blocked - show it rather than hide it
    }
    if (!dismissed) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-beer/15 px-4 py-3 ring-1 ring-beer/40">
      <p className="text-sm font-semibold leading-snug text-beer">
        Click betting line to place your bet
      </p>
      <button
        type="button"
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(KEY, "1");
          } catch {
            // nothing to do; it will reappear next launch
          }
        }}
        aria-label="Dismiss"
        className="-my-1 ml-auto shrink-0 rounded-lg px-2 py-1 text-lg font-black leading-none text-beer/70"
      >
        ×
      </button>
    </div>
  );
}
