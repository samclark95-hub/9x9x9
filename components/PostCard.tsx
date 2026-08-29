import { ordinal } from "@/lib/totals";
import { BET_PREFIX, FIX_PREFIX, isBetNote, isFixNote, type Post } from "@/lib/types";
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
  const isBet = isBetNote(post.note);
  const isFix = isFixNote(post.note);
  // A fix post stores a delta, so its chips would misread as "+1 beer".
  const hasDeltas = !isFix && (post.beers > 0 || post.dogs > 0);

  return (
    <article className="overflow-hidden rounded-2xl bg-surface ring-1 ring-line">
      <div className="p-4">
        <header className="flex items-baseline gap-2">
          <h3 className="truncate font-bold">{post.author}</h3>
          {isFix && (
            <span className="shrink-0 rounded-md bg-chalk/15 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-chalk ring-1 ring-chalk/30">
              Fix
            </span>
          )}
          {isBet && (
            <span className="shrink-0 rounded-md bg-beer/20 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-beer ring-1 ring-beer/40">
              Bet
            </span>
          )}
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
          </div>
        )}

        {post.note && (
          <p
            className={`mt-3 break-words text-[15px] leading-snug ${
              isBet
                ? "font-bold text-beer"
                : isFix
                  ? "font-bold text-chalk"
                  : "text-chalk/90"
            }`}
          >
            {isBet
              ? post.note.slice(BET_PREFIX.length).trim()
              : isFix
                ? post.note.slice(FIX_PREFIX.length).trim()
                : post.note}
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
