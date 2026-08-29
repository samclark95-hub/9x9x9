import App from "@/components/App";
import HeroHeader from "@/components/HeroHeader";
import InstallBanner from "@/components/InstallBanner";
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
      <HeroHeader />
      <InstallBanner />
      <App initialPosts={posts} />
    </main>
  );
}
