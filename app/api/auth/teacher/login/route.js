// app/api/auth/teacher/login/route.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

// Create a Supabase server client that reads/writes auth cookies.
// NOTE: cookies() is synchronous in the App Router.
function getSupabase() {
  const cookieStore = cookies(); // ← no await
  const secure = process.env.NODE_ENV === "production"; // false on localhost (HTTP)

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name, value, options) {
          // Ensure dev works over http://localhost (no Secure flag)
          cookieStore.set(name, value, { ...options, secure });
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, secure, maxAge: 0 });
        },
      },
    }
  );
}

export const dynamic = "force-dynamic"; // don't cache auth responses

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ message: "Email and password are required" }, 400);
    }

    const supabase = getSupabase();

    // Sign in (sets sb-* cookies automatically via our adapter)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(email).trim().toLowerCase(),
      password,
    });

    if (error) {
      return json({ message: "Invalid credentials" }, 401);
    }

    // Optional: fetch minimal profile (from your Supabase table, if you have one)
    const { data: coachRow } = await supabase
      .from("coach")
      .select("id, full_name, email, specialization, experience_years")
      .eq("email", String(email).trim().toLowerCase())
      .maybeSingle();

    return json({
      message: "Logged in successfully",
      user: {
        id: coachRow?.id ?? data.user?.id ?? null,
        fullName: coachRow?.full_name ?? data.user?.email ?? null,
        email: coachRow?.email ?? data.user?.email ?? null,
        role: "teacher",
      },
    });
  } catch (e) {
    console.error("Login error:", e);
    return json({ message: "An error occurred during login" }, 500);
  }
}
