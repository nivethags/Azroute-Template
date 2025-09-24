// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Memoize to avoid multiple GoTrue clients during HMR in dev
const supabase =
  globalThis.__supabase__ ??
  createClient(url, anon, {
    auth: {
      storageKey: "azroute-auth", // unique key for your app
      // keep defaults for autoRefreshToken, persistSession, etc.
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__supabase__ = supabase;
}

export default supabase;
