<<<<<<< HEAD
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
=======

// File: app/api/student/profile/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    await connectDB();

    const student = await Student.findById(decoded.userId)
      .select('-password')
      .lean();

    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        ...student,
        id: student._id.toString()
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile fetch error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return new Response(
        JSON.stringify({ message: "Not authenticated" }),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    await connectDB();

    const updatedData = await request.json();
    const student = await Student.findById(decoded.userId);
    console.log("udapteddata",updatedData)
    if (!student) {
      return new Response(
        JSON.stringify({ message: "Student not found" }),
        { status: 404 }
      );
    }

    // Update fields
    if (updatedData.profile) {
      if (updatedData.profile.socialLinks) {
        const cleanedSocialLinks = Object.fromEntries(
          Object.entries(updatedData.profile.socialLinks).filter(([_, value]) => value)
        );
        updatedData.profile.socialLinks = cleanedSocialLinks;
      }
      
      student.profile = {
        ...student.profile.toObject(), // Ensure nested object merging
        ...updatedData.profile
      };
      student.markModified('profile.socialLinks');
    }

    ['firstName', 'middleName', 'lastName', 'preferredContactNumber', 'subjectsOfInterest'].forEach(field => {
      if (updatedData[field] !== undefined) {
        student[field] = updatedData[field];
      }
    });

    await student.save();

    return new Response(
      JSON.stringify({
        ...student.toObject(),
        id: student._id.toString()
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error during profile update:', error);
    return new Response(
      JSON.stringify({ message: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}



>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
