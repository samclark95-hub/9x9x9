import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADER = "x-admin-secret";
const BUCKET = "photos";

/**
 * Admin delete. The service_role key lives ONLY here, on the server - it is
 * never sent to the browser and never read from a NEXT_PUBLIC_ variable.
 */
export async function POST(request: Request) {
  const adminSecret = process.env.ADMIN_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!adminSecret || !url || !serviceKey) {
    console.error("delete route is missing required environment variables");
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  }

  const provided = request.headers.get(HEADER);
  if (!provided || !safeEqual(provided, adminSecret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let id: unknown;
  try {
    ({ id } = await request.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  if (typeof id !== "string" || id.length === 0) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // Read the row first so we know whether a photo needs removing too.
  // Deleting the row alone would orphan the image, and it would stay
  // publicly readable at its URL forever - "deleted" has to mean gone.
  const { data: existing } = await admin
    .from("posts")
    .select("photo_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("posts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let photoRemoved = false;
  const objectPath = storagePathFrom(existing?.photo_url ?? null);
  if (objectPath) {
    const { error: storageError } = await admin.storage
      .from(BUCKET)
      .remove([objectPath]);
    if (storageError) {
      // The post is already gone; report it rather than failing the request.
      console.error("orphaned photo, storage delete failed:", storageError.message);
    } else {
      photoRemoved = true;
    }
  }

  return NextResponse.json({ ok: true, photoRemoved });
}

/** Pulls the object key out of a public storage URL, or null if there isn't one. */
function storagePathFrom(photoUrl: string | null): string | null {
  if (!photoUrl) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const at = photoUrl.indexOf(marker);
  if (at === -1) return null;
  const path = photoUrl.slice(at + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}

/** Constant-time-ish compare so the secret cannot be guessed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
