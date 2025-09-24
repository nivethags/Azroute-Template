// lib/supabaseServer.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServer() {
  const cookieStore = cookies(); // sync in App Router
  const secure = process.env.NODE_ENV === "production";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // NOT the service role
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value ?? null,
        set: (name, value, options) =>
          cookieStore.set(name, value, { ...options, secure }),
        remove: (name, options) =>
          cookieStore.set(name, "", { ...options, secure, maxAge: 0 }),
      },
    }
  );
}
