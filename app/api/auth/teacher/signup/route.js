import { createClient } from "@supabase/supabase-js";

// Server-side client with SERVICE ROLE (never expose this key to the client)
function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, { auth: { persistSession: false } });
}

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export async function POST(request) {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      password,
      phoneNumber,
    } = await request.json();

    // ✅ Basic validation
    if (!firstName || !lastName || !email || !password || !phoneNumber) {
      return json({ message: "All required fields must be filled" }, 400);
    }

    const supabase = supabaseServer();

    // Normalize inputs
    const normEmail = String(email).trim().toLowerCase();
    const full_name = [firstName, middleName, lastName]
      .filter(Boolean)
      .map(s => String(s).trim())
      .join(" ");
    const phone = String(phoneNumber || "").trim();

    // ✅ Optional: pre-check if coach email already exists (friendly error)
    {
      const { data: existing, error: checkErr } = await supabase
        .from("coach")
        .select("id")
        .eq("email", normEmail)
        .limit(1);

      if (checkErr) {
        // Not fatal—unique constraint will still protect; but surface a clear error if it happens
        console.warn("coach email pre-check error:", checkErr);
      } else if (existing && existing.length > 0) {
        return json({ message: "Email already registered" }, 400);
      }
    }

    // 1) Create Supabase Auth user
    const { data: userRes, error: userErr } = await supabase.auth.admin.createUser({
      email: normEmail,
      password,
      email_confirm: true,               // for dev; in prod consider sending confirmation email
      user_metadata: { role: "coach" },  // optional, helpful later
    });

    if (userErr) {
      // Common cases: email already used in auth.users
      return json({ message: userErr.message }, 400);
    }

    const userId = userRes?.user?.id;
    if (!userId) return json({ message: "Failed to create user" }, 500);

    // 2) Insert into public.coach
    const { error: coachErr } = await supabase
      .from("coach")
      .insert([{
        full_name,
        email: normEmail,
        phone,
        specialization: null,
        experience_years: 0,
        bio: null,
        password,
        // If you added this column: uncomment and use it
        // user_id: userId,
      }]);

    if (coachErr) {
      // Roll back the auth user so you don't leave orphaned users
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      // Surface constraint errors nicely (e.g., unique email)
      return json({ message: coachErr.message }, 400);
    }

    return json({ message: "Registration successful!" }, 201);
  } catch (error) {
    console.error("Signup error:", error);
    return json({ message: "Internal server error" }, 500);
  }
}
