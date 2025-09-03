// app/api/student/courses/[courseId]/complete-lesson/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CourseEnrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from "@/models/Student";
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


export async function POST(request, { params }) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { lessonId } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' },
        { status: 400 }
      );
    }

    await connectDB();
    const {courseId}=await params
    // Get enrollment
    const enrollment = await CourseEnrollment.findOne({
      studentId: user.id,
      courseId: courseId
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Update lesson progress
    const lessonProgress = enrollment.lessonsProgress.find(
      p => p.lessonId.toString() === lessonId
    );

    if (lessonProgress) {
      lessonProgress.completed = true;
      lessonProgress.lastAccessedAt = new Date();
    } else {
      enrollment.lessonsProgress.push({
        lessonId,
        completed: true,
        watchTime: 0,
        lastAccessedAt: new Date()
      });
    }

    // Update last accessed time and overall progress
    enrollment.lastAccessedAt = new Date();
    
    const course = await Course.findById(courseId);
    const totalLessons = course.sections.reduce(
      (sum, section) => sum + section.lessons.length,
      0
    );
    const completedLessons = enrollment.lessonsProgress.filter(l => l.completed).length;
    enrollment.progress = (completedLessons / totalLessons) * 100;

    // Check if course is completed
    if (enrollment.progress === 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
      enrollment.status = 'completed';

      // Generate completion certificate if enabled
      if (course.certificateEnabled) {
        enrollment.certificate = {
          issued: true,
          issuedAt: new Date(),
          url: await generateCertificate(course, user, enrollment)
        };
      }
    }

    await enrollment.save();

    // Format response
    const formattedProgress = {};
    enrollment.lessonsProgress.forEach(lesson => {
      formattedProgress[lesson.lessonId] = {
        completed: lesson.completed,
        watchTime: lesson.watchTime,
        lastAccessedAt: lesson.lastAccessedAt
      };
    });

    return NextResponse.json({
      progress: formattedProgress,
      overallProgress: enrollment.progress,
      completedAt: enrollment.completedAt,
      certificate: enrollment.certificate
    });

  } catch (error) {
    console.error('Error completing lesson:', error);
    return NextResponse.json(
      { error: 'Failed to complete lesson' },
      { status: 500 }
    );
  }
}

async function generateCertificate(course, user, enrollment) {
  // Certificate generation logic here
  // This could involve generating a PDF with course completion details
  // and storing it in cloud storage
  return null; // Placeholder
}