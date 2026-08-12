import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Server-only Supabase client using the service role key. This key must
// never be prefixed with NEXT_PUBLIC_ and must never be imported from a
// Client Component — the `server-only` import above makes that a build
// error if it happens by mistake.
//
// The browser never talks to Supabase directly in this app; every read and
// write goes through Next.js server code (Server Components / Server
// Actions), which is why RLS can stay locked down to "no public access" on
// every table while the app still works.
let cachedClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase の環境変数が設定されていません。SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください。"
    );
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return cachedClient;
}
