"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [live, setLive] = useState(false);
  const { name, setName, ready } = useName();

  // Realtime: new posts from other phones land here without a refresh.
  useEffect(() => {
    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const row = payload.new as Post;
          setPosts((prev) =>
            // Our own insert may already be here from the optimistic path.
            prev.some((p) => p.id === row.id) ? prev : [row, ...prev]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts" },
        (payload) => {
          const gone = payload.old as { id?: string };
          if (!gone?.id) return;
          setPosts((prev) => prev.filter((p) => p.id !== gone.id));
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
        setPosts((prev) => {
          // Realtime may have beaten the insert response back to us.
          const withoutTemp = prev.filter((p) => p.id !== tempId);
          return withoutTemp.some((p) => p.id === saved.id)
            ? withoutTemp
            : [saved, ...withoutTemp];
        });
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
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Feed
          </h2>
          <span
            title={live ? "Live" : "Reconnecting"}
            className={`h-1.5 w-1.5 rounded-full ${
              live ? "bg-emerald-400" : "bg-muted/40"
            }`}
          />
          <span className="sr-only">{live ? "Live" : "Reconnecting"}</span>
        </div>
        <Feed posts={posts} />
      </section>
    </>
  );
}
