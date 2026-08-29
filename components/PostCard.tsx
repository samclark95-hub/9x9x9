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

export default function PostCard({
  post,
  canDelete = false,
  onDelete,
}: {
  post: Post;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}) {
  const hasDeltas = post.beers > 0 || post.dogs > 0 || post.waters > 0;

  return (
    <article className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
      <div className="p-4">
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
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(post.id)}
              aria-label={`Delete post by ${post.author}`}
              className="-my-1 shrink-0 rounded-lg px-2 py-1 text-xs font-bold text-dog ring-1 ring-dog/40 transition active:scale-95"
            >
              Delete
            </button>
          )}
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
      </div>

      {post.photo_url && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.photo_url}
          alt={`Posted by ${post.author}`}
          loading="lazy"
          decoding="async"
          className="max-h-[70vh] w-full bg-black/40 object-cover"
        />
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
