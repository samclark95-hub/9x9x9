import Feed from "@/components/Feed";
import { supabase } from "@/lib/supabase";
import type { Post } from "@/lib/types";

// The feed must never be served from a build-time snapshot.
export const dynamic = "force-dynamic";

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("failed to load posts:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-4 pb-16 pt-8">
      <header className="text-center">
        <h1 className="text-4xl font-black leading-none tracking-tight">
          TKN KB Tracker
        </h1>
        <p className="mt-2 text-sm text-muted">9 beers. 9 hot dogs. 9 innings.</p>
      </header>

      <section aria-label="Feed">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">
          Feed
        </h2>
        <Feed posts={posts} />
      </section>
    </main>
  );
}
