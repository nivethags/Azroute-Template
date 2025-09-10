import { supabase } from "@/lib/supabaseClient";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }
    
    // Fetch student by email
    const { data: student, error } = await supabase
      .from('Students')
      .select('Student_id, Student_name, email, password, mobile')
      .eq('email', email)
      .single();

    if (error || !student || student.password !== password) {
      return new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
    }

    // Create JWT
    const token = jwt.sign({ id: student.Student_id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    
    // Set HTTP-only cookie
    cookies().set("auth-token", token, { httpOnly: true, path: "/" });

    // Return student info without password
    return new Response(JSON.stringify({
      message: 'Login successful',
      student: {
        student_id: student.Student_id,
        name: student.Student_name,
        email: student.email,
        mobile: student.mobile,
      
      }
    }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: err.message || 'Internal server error' }), { status: 500 });
  }
}
