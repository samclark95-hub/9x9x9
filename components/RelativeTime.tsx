"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/time";

/**
 * Renders nothing on the server and fills in on mount. The label depends on
 * "now", so rendering it server-side would guarantee a hydration mismatch.
 */
export default function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => setLabel(relativeTime(iso));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [iso]);

  return (
    <time dateTime={iso} className="tabular-nums">
      {label}
    </time>
  );
}
