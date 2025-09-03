// app/api/student/livestreams/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { LiveStream } from '@/models/LiveStream';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
import Enrollment from '@/models/CourseEnrollment';

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.userId).select('-password');

    if (!student) {
      return null;
    }

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

// Get all active livestreams
export async function GET(req) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user's enrolled courses
    const enrolledCourses = await Enrollment.find({
      studentId: user.id
    }).select('courseId');

    const courseIds = enrolledCourses.map(e => e.courseId);

    // Find active livestreams
    const livestreams = await LiveStream.find({
      $or: [
        { courseId: { $in: courseIds } }, // Livestreams from enrolled courses
        { courseId: null } // Public livestreams
      ],
      status: 'live'
    })
    .select('title description teacherId teacherName startedAt attendees')
    .sort('-startedAt')
    .lean();

    return NextResponse.json(livestreams);

  } catch (error) {
    console.error('Error fetching livestreams:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}