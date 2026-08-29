export type Prediction = {
  id: string;
  created_at: string;
  voter: string;
  beers: number;
  dogs: number;
};

export type Line = { beers: number; dogs: number; voters: number };

/**
 * Votes are append-only, mirroring posts: changing your pick inserts a new row
 * rather than updating an old one. That keeps anon on select+insert only, so
 * nobody can rewrite somebody else's vote. The current vote is the newest row
 * per voter.
 */
export function latestByVoter(rows: Prediction[]): Prediction[] {
  const sorted = [...rows].sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  const seen = new Map<string, Prediction>();
  for (const r of sorted) if (!seen.has(r.voter)) seen.set(r.voter, r);
  return [...seen.values()];
}

export function computeLine(rows: Prediction[]): Line | null {
  const latest = latestByVoter(rows);
  if (latest.length === 0) return null;
  const total = latest.reduce(
    (acc, p) => ({ beers: acc.beers + p.beers, dogs: acc.dogs + p.dogs }),
    { beers: 0, dogs: 0 }
  );
  return {
    beers: total.beers / latest.length,
    dogs: total.dogs / latest.length,
    voters: latest.length,
  };
}

export function pickFor(
  rows: Prediction[],
  voter: string | null
): Prediction | null {
  if (!voter) return null;
  return latestByVoter(rows).find((p) => p.voter === voter) ?? null;
}
