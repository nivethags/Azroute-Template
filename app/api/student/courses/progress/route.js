// app/api/student/courses/progress/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';

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

export async function POST(request) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, lessonId, progress, watchTime } = body;

    if (!courseId || !lessonId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get enrollment
    const enrollment = await CourseEnrollment.findOne({
      courseId,
      studentId: user.id
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Update lesson progress
    const lessonProgress = enrollment.lessonsProgress.find(
      p => p.lessonId.toString() === lessonId
    );

    if (lessonProgress) {
      lessonProgress.watchTime = watchTime;
      if (progress === 100) {
        lessonProgress.completed = true;
      }
    } else {
      enrollment.lessonsProgress.push({
        lessonId,
        completed: progress === 100,
        watchTime
      });
    }

    // Update last accessed
    enrollment.lastAccessedAt = new Date();

    // Calculate overall course progress
    await enrollment.updateProgress();

    return NextResponse.json({
      message: 'Progress updated successfully',
      enrollment: {
        id: enrollment._id,
        status: enrollment.status,
        progress: enrollment.progress,
        lessonsProgress: enrollment.lessonsProgress,
        lastAccessedAt: enrollment.lastAccessedAt,
        certificate: enrollment.certificate
      }
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}