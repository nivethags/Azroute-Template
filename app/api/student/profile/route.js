import { supabase } from "@/lib/supabaseClient";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Helper to get the logged-in student
async function getStudentFromToken() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: student, error } = await supabase
      .from("Students")
      .select("Student_id, Student_name, email, mobile, bio, location")
      .eq("Student_id", decoded.id)
      .single();

    if (error || !student) return null;

    return student;
  } catch (err) {
    return null;
  }
}

// GET profile
export async function GET() {
  const student = await getStudentFromToken();
  if (!student) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
  }

  return new Response(JSON.stringify(student), { status: 200 });
}

// PUT (update) profile
export async function PUT(req) {
  const student = await getStudentFromToken();
  if (!student) {
    return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });
  }

  try {
    const body = await req.json();

    // Optional: Validate input
    if (!body.Student_name || !body.Student_name.trim()) {
      return new Response(JSON.stringify({ message: "Name is required" }), { status: 400 });
    }

    const { data, error } = await supabase
      .from("Students")
      .update({
        Student_name: body.Student_name,
        email: body.email,
        mobile: body.mobile || null,
        bio: body.bio || null,
        location: body.location || null,
      })
      .eq("Student_id", student.Student_id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message || "Failed to update profile" }), { status: 400 });
  }
}
