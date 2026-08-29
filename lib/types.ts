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
