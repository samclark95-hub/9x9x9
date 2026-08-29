import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADER = "x-admin-secret";

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

  const { error } = await admin.from("posts").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Constant-time-ish compare so the secret cannot be guessed byte by byte. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
