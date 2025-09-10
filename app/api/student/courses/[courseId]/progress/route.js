// app/api/student/courses/[courseId]/progress/route.js
<<<<<<< HEAD
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Authenticate student using JWT stored in cookies
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token");

  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const { data: student, error } = await supabase
      .from("Students")
      .select("id, student_name as name, email, mobile")
      .eq("id", decoded.userId)
      .single();

    if (error || !student) return null;

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      role: "student",
    };
  } catch (err) {
    console.error("Auth verification error:", err);
=======

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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    return null;
  }
}

<<<<<<< HEAD
// GET course progress
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId } = params;

    // Fetch enrollment
    const { data: enrollment, error } = await supabase
      .from("CourseEnrollments")
      .select("id, lessonsProgress, progress")
      .eq("studentId", user.id)
      .eq("courseId", courseId)
      .single();

    if (error || !enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
=======

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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    }

    // Format progress data
    const progress = {};
<<<<<<< HEAD
    (enrollment.lessonsProgress || []).forEach(lesson => {
      progress[lesson.lessonId] = {
        completed: lesson.completed,
        watchTime: lesson.watchTime,
        lastAccessedAt: lesson.lastAccessedAt,
=======
    enrollment.lessonsProgress.forEach(lesson => {
      progress[lesson.lessonId] = {
        completed: lesson.completed,
        watchTime: lesson.watchTime,
        lastAccessedAt: lesson.lastAccessedAt
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      };
    });

    return NextResponse.json({
      progress,
<<<<<<< HEAD
      overallProgress: enrollment.progress || 0,
    });

  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

// POST update lesson progress
export async function POST(request, { params }) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId, progress, watchTime } = await request.json();
    const { courseId } = params;

    if (!lessonId || progress === undefined || watchTime === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch enrollment
    const { data: enrollment, error } = await supabase
      .from("CourseEnrollments")
      .select("id, lessonsProgress, progress")
      .eq("studentId", user.id)
      .eq("courseId", courseId)
      .single();

    if (error || !enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    let lessonsProgress = enrollment.lessonsProgress || [];

    // Update or add lesson progress
    const lessonIndex = lessonsProgress.findIndex(l => l.lessonId === lessonId);
    const now = new Date().toISOString();

    if (lessonIndex !== -1) {
      lessonsProgress[lessonIndex].watchTime = Math.max(lessonsProgress[lessonIndex].watchTime, watchTime);
      if (progress >= 90) lessonsProgress[lessonIndex].completed = true;
      lessonsProgress[lessonIndex].lastAccessedAt = now;
    } else {
      lessonsProgress.push({
        lessonId,
        completed: progress >= 90,
        watchTime,
        lastAccessedAt: now,
      });
    }

    // Calculate overall progress
    const { data: course, error: courseError } = await supabase
      .from("Courses")
      .select("sections")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const totalLessons = (course.sections || []).reduce(
      (sum, section) => sum + ((section.lessons || []).length),
      0
    );

    const completedLessons = lessonsProgress.filter(l => l.completed).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    // Update enrollment in Supabase
    const { error: updateError } = await supabase
      .from("CourseEnrollments")
      .update({
        lessonsProgress,
        progress: overallProgress,
        lastAccessedAt: now,
      })
      .eq("id", enrollment.id);

    if (updateError) throw updateError;

    // Format response
    const formattedProgress = {};
    lessonsProgress.forEach(lesson => {
      formattedProgress[lesson.lessonId] = {
        completed: lesson.completed,
        watchTime: lesson.watchTime,
        lastAccessedAt: lesson.lastAccessedAt,
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      };
    });

    return NextResponse.json({
      progress: formattedProgress,
<<<<<<< HEAD
      overallProgress,
    });

  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
