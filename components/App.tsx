"use client";

import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";
import { useName } from "@/lib/useName";
import Composer, { type Draft } from "./Composer";
import Feed from "./Feed";
import NamePrompt from "./NamePrompt";

export default function App({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { name, setName, ready } = useName();

  const handlePost = useCallback(
    async (draft: Draft) => {
      if (!name) return;
      setBusy(true);
      setError(null);

      // Append optimistically so the tap feels instant on stadium wifi,
      // then reconcile with whatever the server actually stored.
      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: Post = {
        id: tempId,
        created_at: new Date().toISOString(),
        author: name,
        inning: draft.inning,
        beers: draft.beers,
        dogs: draft.dogs,
        waters: draft.waters,
        note: draft.note || null,
        photo_url: null,
      };
      setPosts((prev) => [optimistic, ...prev]);

      const { data, error: insertError } = await supabase
        .from("posts")
        .insert({
          author: name,
          inning: draft.inning,
          beers: draft.beers,
          dogs: draft.dogs,
          waters: draft.waters,
          note: draft.note || null,
        })
        .select()
        .single();

      if (insertError || !data) {
        setPosts((prev) => prev.filter((p) => p.id !== tempId));
        setError("Post failed. Check your signal and try again.");
      } else {
        const saved = data as Post;
        setPosts((prev) =>
          // Realtime may have already delivered this row; never show it twice.
          prev.some((p) => p.id === saved.id)
            ? prev.filter((p) => p.id !== tempId)
            : prev.map((p) => (p.id === tempId ? saved : p))
        );
      }
      setBusy(false);
    },
    [name]
  );

  return (
    <>
      {ready && !name && <NamePrompt onSubmit={setName} />}

      {name && <Composer onPost={handlePost} busy={busy} />}

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-dog/15 px-4 py-3 text-sm font-semibold text-dog ring-1 ring-dog/40"
        >
          {error}
        </p>
      )}

      <section aria-label="Feed">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Feed
        </h2>
        <Feed posts={posts} />
      </section>
    </>
  );
}
