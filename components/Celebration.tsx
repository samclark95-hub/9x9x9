"use client";

import { useEffect } from "react";
import Confetti from "./Confetti";

/**
 * The 9/9 payoff (spec §7): the hero photo takes the full screen for ~3s
 * behind the confetti, and dismisses on tap.
 */
export default function Celebration({
  label,
  onDismiss,
}: {
  label: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      role="dialog"
      aria-label={label}
      onClick={onDismiss}
      className="fixed inset-0 z-50 cursor-pointer bg-black"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/tkn-kb-hero.jpg"
        alt=""
        className="h-full w-full object-cover"
        style={{ objectPosition: "center 40%" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/50" />
      <div className="absolute inset-x-0 bottom-24 px-6 text-center">
        <p className="font-score text-6xl uppercase leading-none text-chalk drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
          {label}
        </p>
        <p className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-chalk/70">
          Tap to dismiss
        </p>
      </div>
      <Confetti />
    </div>
  );
}
