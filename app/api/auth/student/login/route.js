// app/api/auth/student/login/route.js
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const student = await Student.findOne({ email: email.toLowerCase() });

    if (!student) {
      return Response.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValid = await student.comparePassword(password);

    if (!isValid) {
      return Response.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!student.verified) {
      return Response.json(
        { message: "Please verify your email first" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: student._id,
        email: student.email,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const cookie = await cookies();
    cookie.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    return Response.json({
      message: "Logged in successfully",
      user: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
