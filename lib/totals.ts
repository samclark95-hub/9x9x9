import type { Post } from "./types";

export type Totals = { beers: number; dogs: number };

/**
 * Totals are ALWAYS derived by summing the feed. There is deliberately no
 * counter column anywhere (spec §4) - two sources of truth would drift.
 */
export function sumTotals(posts: Post[]): Totals {
  return posts.reduce<Totals>(
    (acc, p) => ({
      beers: acc.beers + (p.beers || 0),
      dogs: acc.dogs + (p.dogs || 0),
    }),
    { beers: 0, dogs: 0 }
  );
}

/**
 * Current inning is the one on the most recent post that specified it.
 *
 * This used to be the maximum, but the maximum cannot be corrected
 * downward - a mistaken 9 would pin the game at the 9th forever. Taking
 * the latest lets anyone fix it by posting the right inning.
 */
export function currentInning(posts: Post[]): number | null {
  let best: Post | null = null;
  for (const p of posts) {
    if (p.inning == null) continue;
    if (!best || p.created_at > best.created_at) best = p;
  }
  return best?.inning ?? null;
}

/**
 * Projects the inning he finishes 9 beers in, from the rate so far.
 * Returns null when there is not enough signal to guess.
 */
export function paceInning(
  beers: number,
  inning: number | null
): number | null {
  if (!inning || inning < 1 || beers < 1) return null;
  if (beers >= 9) return null;
  const perInning = beers / inning;
  return Math.ceil(9 / perInning);
}

export function ordinal(n: number): string {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}
