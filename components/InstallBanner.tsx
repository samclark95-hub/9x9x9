"use client";

import { useEffect, useState } from "react";

const KEY = "tknkb:install-dismissed";

function isStandalone(): boolean {
  if (typeof window === "undefined") return true;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
    true;
  const displayMode = window.matchMedia("(display-mode: standalone)").matches;
  return iosStandalone || displayMode;
}

/**
 * iOS has no install prompt (spec §6). Without this bar half the group never
 * gets the app onto their home screen.
 */
export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {
      // storage blocked - show the banner rather than hide it
    }
    if (!dismissed && !isStandalone()) setShow(true);
  }, []);

  if (!show) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl bg-beer/15 px-4 py-3 ring-1 ring-beer/40">
      <p className="text-sm font-semibold leading-snug text-beer">
        Open in Safari → tap Share → Add to Home Screen
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
        aria-label="Dismiss install instructions"
        className="-my-1 ml-auto shrink-0 rounded-lg px-2 py-1 text-lg font-black leading-none text-beer/70"
      >
        ×
      </button>
    </div>
  );
}
