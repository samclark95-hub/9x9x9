import type { Post } from "@/lib/types";
import RelativeTime from "./RelativeTime";

function Chip({ emoji, n, tint }: { emoji: string; n: number; tint: string }) {
  if (n <= 0) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-sm font-bold ring-1 ring-line ${tint}`}
    >
      <span aria-hidden>{emoji}</span>
      <span className="tabular-nums">+{n}</span>
    </span>
  );
}

export default function PostCard({ post }: { post: Post }) {
  const hasDeltas = post.beers > 0 || post.dogs > 0 || post.waters > 0;

  return (
    <article className="rounded-2xl bg-surface p-4 ring-1 ring-line">
      <header className="flex items-baseline gap-2">
        <h3 className="truncate font-bold">{post.author}</h3>
        {post.inning != null && (
          <span className="shrink-0 rounded-md bg-black/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-muted ring-1 ring-line">
            {ordinal(post.inning)}
          </span>
        )}
        <span className="ml-auto shrink-0 text-xs text-muted">
          <RelativeTime iso={post.created_at} />
        </span>
      </header>

      {hasDeltas && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip emoji="🍺" n={post.beers} tint="text-beer" />
          <Chip emoji="🌭" n={post.dogs} tint="text-dog" />
          <Chip emoji="💧" n={post.waters} tint="text-water" />
        </div>
      )}

      {post.note && (
        <p className="mt-3 break-words text-[15px] leading-snug text-chalk/90">
          {post.note}
        </p>
      )}
    </article>
  );
}

function ordinal(n: number): string {
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? "th"
      : ["th", "st", "nd", "rd"][n % 10] ?? "th";
  return `${n}${suffix}`;
}
