// app/api/student/profile/route.js
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
// ✅ use a relative path (adjust if your supabaseClient is elsewhere)
import { supabase } from "@/lib/supabaseClient";

// Keep cookie name consistent with your login route.
// If your login sets `cookies().set('token', ...)`, use 'token' here.
const AUTH_COOKIE = "token";

// Helper to read the logged-in student from JWT
async function getStudentFromToken() {
  try {
    // cookies() is sync in App Router
    const cookieStore = cookies();
    const token = cookieStore.get(AUTH_COOKIE)?.value;
    if (!token) return null;

    // Ensure secret exists
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing");
      return null;
    }

    const decoded = jwt.verify(token, secret);
    if (!decoded?.id) return null;

    const { data: student, error } = await supabase
      .from("Students")
      .select("Student_id, Student_name, email, mobile, bio, location")
      .eq("Student_id", decoded.id)
      .single();

    if (error || !student) return null;
    return student;
  } catch (_err) {
    // Token invalid/expired or verify threw
    return null;
  }
}

// GET /api/student/profile
export async function GET() {
  const student = await getStudentFromToken();
  if (!student) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify(student), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// PUT /api/student/profile (update profile)
export async function PUT(req) {
  const student = await getStudentFromToken();
  if (!student) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Basic validation
    if (!body?.Student_name || !String(body.Student_name).trim()) {
      return new Response(JSON.stringify({ message: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatePayload = {
      Student_name: body.Student_name,
      email: body.email,                 // decide if email should be editable
      mobile: body.mobile ?? null,
      bio: body.bio ?? null,
      location: body.location ?? null,
    };

    const { data, error } = await supabase
      .from("Students")
      .update(updatePayload)
      .eq("Student_id", student.Student_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ message: err?.message || "Failed to update profile" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
