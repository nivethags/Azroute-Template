import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

async function supabaseServer() {
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return store.get(name)?.value ?? null;
        },
        set(name, value, options) {
          store.set(name, value, options);
        },
        remove(name, options) {
          store.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}

/**
 * GET /api/courses
 * Optional query: ?mine=1 to only fetch courses of the signed-in coach
 */
export async function GET(req) {
  try {
    const supabase = await supabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    const url = new URL(req.url);
    const mine = url.searchParams.get("mine") === "1";

    let query = supabase.from("course")
      .select("id, title, description, level, price, status, coach_id, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (mine && user?.email) {
      // join via coach email
      // Fetch the coach id for current user
      const { data: coach } = await supabase
        .from("coach")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (coach?.id) query = query.eq("coach_id", coach.id);
      else return json({ ok: true, data: [] }, 200);
    }

    const { data, error } = await query;
    if (error) return json({ ok: false, message: error.message }, 400);

    return json({ ok: true, data });
  } catch (e) {
    console.error("GET /api/courses error:", e);
    return json({ ok: false, message: "Failed to fetch courses" }, 500);
  }
}

/**
 * POST /api/courses
 * Body: { title, description?, level?, price?, status? }
 * Requires signed-in coach; will attach coach_id automatically.
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const supabase = await supabaseServer();

    // must be signed in
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) return json({ message: "Not authenticated" }, 401);

    // find coach row for this user by email
    const { data: coachRow, error: coachErr } = await supabase
      .from("coach")
      .select("id, email, full_name")
      .eq("email", user.email)
      .maybeSingle();

    if (coachErr) return json({ message: coachErr.message }, 400);
    if (!coachRow) return json({ message: "Coach profile not found for this user" }, 403);

    const payload = {
      title: String(body.title || "").trim(),
      description: body.description ?? null,
      level: body.level ?? null,
      price: body.price != null ? Number(body.price) : 0,
      status: body.status ?? "active",
      coach_id: coachRow.id,
    };

    if (!payload.title) return json({ message: "Title is required" }, 400);

    // insert (RLS will allow because coach_id matches auth user email per policy)
    const { data, error } = await supabase
      .from("course")
      .insert([payload])
      .select()
      .single();

    if (error) return json({ message: error.message }, 400);

    return json({ message: "Course created", data }, 201);
  } catch (e) {
    console.error("POST /api/courses error:", e);
    return json({ message: "Failed to create course" }, 500);
  }
}
