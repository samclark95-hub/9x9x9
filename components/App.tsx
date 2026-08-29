"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uploadPhoto } from "@/lib/photo";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";
import { currentInning, paceInning, sumTotals } from "@/lib/totals";
import { useAdmin } from "@/lib/useAdmin";
import { useName } from "@/lib/useName";
import Scoreboard from "./Scoreboard";
import BettingLine from "./BettingLine";
import Celebration from "./Celebration";
import Composer, { type Draft } from "./Composer";
import Feed from "./Feed";
import NamePrompt from "./NamePrompt";

export default function App({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const { name, setName, ready } = useName();
  const { isAdmin, secret: adminSecret } = useAdmin();

  // Derived on every render by summing the feed - never stored (spec §4).
  const totals = sumTotals(posts);
  const inning = currentInning(posts);
  const pace = paceInning(totals.beers, inning);

  // The 9/9 payoff fires on the crossing only - never on a reload that
  // happens to load a feed already at nine.
  const [celebration, setCelebration] = useState<string | null>(null);
  const prevTotals = useRef<{ beers: number; dogs: number } | null>(null);

  useEffect(() => {
    const prev = prevTotals.current;
    prevTotals.current = { beers: totals.beers, dogs: totals.dogs };
    if (!prev) return;
    if (prev.beers < 9 && totals.beers >= 9) setCelebration("9 BEERS");
    else if (prev.dogs < 9 && totals.dogs >= 9) setCelebration("9 DOGS");
  }, [totals.beers, totals.dogs]);

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
      .subscribe((s) => setLive(s === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePost = useCallback(
    async (draft: Draft) => {
      if (!name) return;
      setBusy(true);
      setError(null);
      setStatus(draft.file ? "Shrinking photo…" : null);

      const tempId = `temp-${crypto.randomUUID()}`;
      const localPhoto = draft.file ? URL.createObjectURL(draft.file) : null;

      // Append optimistically so the tap feels instant on stadium wifi.
      const optimistic: Post = {
        id: tempId,
        created_at: new Date().toISOString(),
        author: name,
        inning: draft.inning,
        beers: draft.beers,
        dogs: draft.dogs,
        waters: draft.waters,
        note: draft.note || null,
        photo_url: localPhoto,
      };
      setPosts((prev) => [optimistic, ...prev]);

      const cleanup = () => {
        if (localPhoto) URL.revokeObjectURL(localPhoto);
      };

      let photoUrl: string | null = null;
      if (draft.file) {
        try {
          photoUrl = await uploadPhoto(draft.file);
          setStatus("Posting…");
        } catch {
          setPosts((prev) => prev.filter((p) => p.id !== tempId));
          cleanup();
          setError("Photo upload failed. Try again, or post without it.");
          setBusy(false);
          setStatus(null);
          return;
        }
      }

      const { data, error: insertError } = await supabase
        .from("posts")
        .insert({
          author: name,
          inning: draft.inning,
          beers: draft.beers,
          dogs: draft.dogs,
          waters: draft.waters,
          note: draft.note || null,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (insertError || !data) {
        setPosts((prev) => prev.filter((p) => p.id !== tempId));
        cleanup();
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
        cleanup();
      }

      setBusy(false);
      setStatus(null);
    },
    [name]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!isAdmin || !adminSecret) return;
      const before = posts;
      // Optimistic removal; Realtime DELETE will confirm it on every
      // other phone. Restore the row if the server refuses.
      setPosts((prev) => prev.filter((p) => p.id !== id));

      const res = await fetch("/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        setPosts(before);
        setError("Delete failed.");
      }
    },
    [isAdmin, adminSecret, posts]
  );

  return (
    <>
      {celebration && (
        <Celebration
          label={celebration}
          onDismiss={() => setCelebration(null)}
        />
      )}

      <Scoreboard
        beers={totals.beers}
        dogs={totals.dogs}
        waters={totals.waters}
        inning={inning}
        pace={pace}
      />

      <BettingLine name={name} />

      {ready && !name && <NamePrompt onSubmit={setName} />}

      {name && <Composer onPost={handlePost} busy={busy} status={status} />}

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
        <Feed posts={posts} canDelete={isAdmin} onDelete={handleDelete} />
      </section>
    </>
  );
}
