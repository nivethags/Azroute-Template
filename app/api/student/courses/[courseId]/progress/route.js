// app/api/student/courses/[courseId]/progress/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CourseEnrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
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


// Get course progress
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const {courseId}=await params
    // Get enrollment and progress
    console.log("userID",user.id)
    console.log("courseId",courseId)
    const enrollment = await CourseEnrollment.findOne({
      studentId: user.id,
      courseId: courseId
    }).select('lessonsProgress progress');
    
    console.log("enroll",enrollment)
    if (!enrollment) {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 404 }
      );
    }

    // Format progress data
    const progress = {};
    enrollment.lessonsProgress.forEach(lesson => {
      progress[lesson.lessonId] = {
        completed: lesson.completed,
        watchTime: lesson.watchTime,
        lastAccessedAt: lesson.lastAccessedAt
      };
    });

    return NextResponse.json({
      progress,
      overallProgress: enrollment.progress
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// Update lesson progress
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
    const { lessonId, progress, watchTime } = body;

    if (!lessonId || progress === undefined || watchTime === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
      lessonProgress.watchTime = Math.max(lessonProgress.watchTime, watchTime);
      if (progress >= 90) {  // Mark as completed if watched 90% or more
        lessonProgress.completed = true;
      }
      lessonProgress.lastAccessedAt = new Date();
    } else {
      enrollment.lessonsProgress.push({
        lessonId,
        completed: progress >= 90,
        watchTime,
        lastAccessedAt: new Date()
      });
    }

    // Update last accessed time
    enrollment.lastAccessedAt = new Date();

    // Calculate overall progress
    const course = await Course.findById(courseId);
    const totalLessons = course.sections.reduce(
      (sum, section) => sum + section.lessons.length, 
      0
    );
    const completedLessons = enrollment.lessonsProgress.filter(l => l.completed).length;
    enrollment.progress = (completedLessons / totalLessons) * 100;

    await enrollment.save();

    // Return updated progress
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
      overallProgress: enrollment.progress
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}