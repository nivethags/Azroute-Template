// app/api/auth/me/route.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

async function getSupabase() {
  const cookieStore = await cookies(); // 👈 await
  const secure = process.env.NODE_ENV === "production";

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

export async function GET() {
  const supabase = await getSupabase(); // 👈 await
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ user: null }), {
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ user: { id: user.id, email: user.email } }),
    { headers: { "content-type": "application/json" } }
  );
}