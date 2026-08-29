export type Post = {
  id: string;
  created_at: string;
  author: string;
  inning: number | null;
  beers: number;
  dogs: number;
  note: string | null;
  photo_url: string | null;
};

export const GOAL = 9;

/**
 * Marker for feed posts announcing a bet. Bet posts ALWAYS carry beers: 0 and
 * dogs: 0 - the counters are summed from the feed, so a bet that recorded its
 * numbers as deltas would corrupt the totals. The prediction itself lives in
 * the predictions table; this is only the announcement.
 */
export const BET_PREFIX = "🎲 Bet:";

export function betNote(beers: number, dogs: number): string {
  return `${BET_PREFIX} ${beers} beers, ${dogs} dogs`;
}

export function isBetNote(note: string | null): boolean {
  return !!note && note.startsWith(BET_PREFIX);
}

/**
 * Marker for feed posts that correct the running totals.
 *
 * A fix post stores the DELTA needed to reach the target in beers/dogs - the
 * scoreboard still derives everything by summing the feed, so there is still
 * no stored counter to drift. The note records what it was set to, for anyone
 * reading the feed later.
 */
export const FIX_PREFIX = "✏️ Set to:";

export function fixNote(
  beers: number,
  dogs: number,
  inning: number | null
): string {
  const base = `${FIX_PREFIX} ${beers} beers, ${dogs} dogs`;
  return inning ? `${base}, inning ${inning}` : base;
}

export function isFixNote(note: string | null): boolean {
  return !!note && note.startsWith(FIX_PREFIX);
}
