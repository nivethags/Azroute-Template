// app/api/student/courses/[courseId]/complete-lesson/route.js
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    return null;
  }
}

<<<<<<< HEAD
// POST to mark a lesson as completed
export async function POST(request, { params }) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lessonId } = await request.json();
    if (!lessonId) return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 });

    const { courseId } = params;

    // Get enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("CourseEnrollments")
      .select("*")
      .eq("studentId", user.id)
      .eq("courseId", courseId)
      .single();

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: "Not enrolled in this course" }, { status: 404 });
    }

    // Update lesson progress
    const lessonsProgress = Array.isArray(enrollment.lessonsProgress) ? enrollment.lessonsProgress : [];
    const lessonIndex = lessonsProgress.findIndex(p => p.lessonId === lessonId);

    if (lessonIndex > -1) {
      lessonsProgress[lessonIndex] = {
        ...lessonsProgress[lessonIndex],
        completed: true,
        lastAccessedAt: new Date(),
      };
    } else {
      lessonsProgress.push({
        lessonId,
        completed: true,
        watchTime: 0,
        lastAccessedAt: new Date(),
      });
    }

    // Fetch course to calculate total lessons
    const { data: course, error: courseError } = await supabase
      .from("Courses")
      .select("id, sections, certificateEnabled")
      .eq("id", courseId)
      .single();

    if (courseError || !course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

    const totalLessons = course.sections?.reduce(
      (sum, section) => sum + (section.lessons?.length || 0),
      0
    ) || 0;

    const completedLessons = lessonsProgress.filter(l => l.completed).length;
    const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    let certificate = enrollment.certificate || null;
    let completedAt = enrollment.completedAt || null;

    // Check if course is completed
    if (overallProgress === 100 && !enrollment.completedAt) {
      completedAt = new Date();
      if (course.certificateEnabled) {
        certificate = {
          issued: true,
          issuedAt: new Date(),
          url: await generateCertificate(course, user, enrollment),
=======

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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        };
      }
    }

<<<<<<< HEAD
    // Update enrollment in Supabase
    const { error: updateError } = await supabase
      .from("CourseEnrollments")
      .update({
        lessonsProgress,
        lastAccessedAt: new Date(),
        progress: overallProgress,
        completedAt,
        certificate,
        status: overallProgress === 100 ? "completed" : enrollment.status,
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
    await enrollment.save();

    // Format response
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
      completedAt,
      certificate,
    });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json({ error: "Failed to complete lesson" }, { status: 500 });
  }
}

// Placeholder for certificate generation
async function generateCertificate(course, user, enrollment) {
  // Implement your PDF generation logic or Supabase Storage upload here
  return null;
}
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
