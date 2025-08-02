// app/api/teacher/profile/route.js
import { cookies } from 'next/headers';
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth-token');

    if (!token) {
      return Response.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    } catch (err) {
      return Response.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    // Connect to database and fetch teacher data
    await connectDB();
    
    const teacher = await Teacher.findById(decoded.userId)
      .select('-password -verificationToken -resetPasswordToken');
    
    if (!teacher) {
      return Response.json(
        { message: "Teacher not found" },
        { status: 404 }
      );
    }

    // Return teacher data
    return Response.json({
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        department: teacher.department || null,
        phone: teacher.phone || null,
        location: teacher.location || null
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}