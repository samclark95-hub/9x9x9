"use client";

import type { Post } from "@/lib/types";
import PostCard from "./PostCard";

export default function Feed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
        <p className="text-lg font-bold">Nothing yet</p>
        <p className="mt-1 text-sm text-muted">
          First beer of the day goes here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
