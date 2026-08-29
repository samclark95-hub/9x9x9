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
