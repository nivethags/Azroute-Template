// app/api/auth/student/login/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Fetch the student by email
    const { data: student, error } = await supabase
      .from("Students")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !student) {
      return NextResponse.json(
        { message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // Compare password (assuming stored as plain text)
    if (student.password !== password) {
      return NextResponse.json(
        { message: "Invalid login credentials" },
        { status: 401 }
      );
    }

    // Remove password from response
    const { password: pwd, ...studentData } = student;

    return NextResponse.json({ student: studentData });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
