import { supabaseServer } from "@/lib/supabaseServer";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from("coach").select("*").limit(5);

    if (error) {
      console.error("Supabase GET error:", error);
      return json({ ok: false, error: error.message, details: error.details, hint: error.hint, code: error.code }, 500);
    }
    return json({ ok: true, data });
  } catch (e) {
    console.error("Unhandled GET error:", e);
    return json({ ok: false, error: String(e) }, 500);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from("coach")
      .insert([{
        full_name: body.full_name,
        email: body.email,
        phone: body.phone,
        specialization: body.specialization,
        experience_years: body.experience_years,
        bio: body.bio,
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST error:", error);
      return json({ ok: false, error: error.message, details: error.details, hint: error.hint, code: error.code }, 500);
    }
    return json({ ok: true, data }, 201);
  } catch (e) {
    console.error("Unhandled POST error:", e);
    return json({ ok: false, error: String(e) }, 500);
  }
}
