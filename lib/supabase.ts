import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy .env.example to .env.local and fill it in."
  );
}

// Anon client. Safe in the browser: RLS is what protects the data, and the
// only policies on `posts` are select and insert. There is deliberately no
// service_role client here - that lives server-side in app/api/delete only.
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});
