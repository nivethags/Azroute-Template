// app/api/teacher/profile/route.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

async function getSupabase() {
  const cookieStore = await cookies(); // your setup requires await
  const secure = process.env.NODE_ENV === "production";
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (n) => cookieStore.get(n)?.value ?? null,
        set: (n, v, o) => cookieStore.set(n, v, { ...o, secure }),
        remove: (n, o) => cookieStore.set(n, "", { ...o, secure, maxAge: 0 }),
      },
    }
  );
}

export async function GET() {
  const supabase = await getSupabase();

  // Who is logged in?
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user?.email) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401, headers: { "content-type": "application/json" },
    });
  }

  // Select ONLY existing columns from public.coach
  const { data: coach, error } = await supabase
    .from("coach")
    .select("id, full_name, email, phone, specialization, experience_years, bio")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Coach fetch error:", error);
    return new Response(JSON.stringify({ message: "Failed to load profile" }), {
      status: 500, headers: { "content-type": "application/json" },
    });
  }

  if (!coach) {
    // Not a coach; return minimal identity so UI can decide
    return new Response(JSON.stringify({
      id: user.id,
      role: "student",
      name: user.email,
      email: user.email,
      phone: null,
      specialization: null,
      experienceYears: null,
      bio: null,
    }), { headers: { "content-type": "application/json" } });
  }

  // Normalize for your UI
  const normalized = {
    id: coach.id,
    role: "teacher",
    name: coach.full_name || coach.email,
    email: coach.email,
    phone: coach.phone ?? null,
    specialization: coach.specialization ?? null,
    experienceYears: coach.experience_years ?? null,
    bio: coach.bio ?? null,
  };

  return new Response(JSON.stringify(normalized), {
    headers: { "content-type": "application/json" },
  });
}
