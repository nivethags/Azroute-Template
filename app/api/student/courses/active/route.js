// app/api/student/courses/active/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CourseEnrollment from "@/models/CourseEnrollment";
import Course from "@/models/Course";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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
      firstName: student.firstName,
      lastName: student.lastName,
      name: `${student.firstName} ${student.lastName}`,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function GET(request) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all active enrollments for the student
    const enrollments = await CourseEnrollment.find({
      studentId: user.id,
      status: 'active',
      progress: { $lt: 100 } // Only incomplete courses
    })
    .populate({
      path: 'courseId',
      populate: {
        path: 'teacherId',
        select: 'firstName lastName email profileImage department qualification experience'
      }
    })
    .sort({ lastAccessedAt: -1 });

    // Format courses data
    const courses = await Promise.all(enrollments.map(async enrollment => {
      const course = enrollment.courseId;
      const completedLessons = enrollment.lessonsProgress.filter(l => l.completed).length;
      const totalLessons = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
      
      // Calculate remaining time
      const remainingTime = course.sections.reduce((totalTime, section) => {
        return totalTime + section.lessons.reduce((sectionTime, lesson) => {
          const progress = enrollment.lessonsProgress.find(p => p.lessonId.toString() === lesson._id.toString());
          if (!progress?.completed) {
            return sectionTime + (lesson.duration || 0);
          }
          return sectionTime;
        }, 0);
      }, 0);

      // Find the next incomplete lesson
      let nextLesson = null;
      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          const progress = enrollment.lessonsProgress.find(p => p.lessonId.toString() === lesson._id.toString());
          if (!progress?.completed) {
            nextLesson = {
              id: lesson._id,
              title: lesson.title,
              sectionTitle: section.title
            };
            break;
          }
        }
        if (nextLesson) break;
      }

      const teacher = course.teacherId ? {
        id: course.teacherId._id,
        name: `${course.teacherId.firstName} ${course.teacherId.lastName}`,
        email: course.teacherId.email,
        avatar: course.teacherId.profileImage,
        department: course.teacherId.department,
        qualification: course.teacherId.qualification,
        experience: course.teacherId.experience
      } : null;

      return {
        id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        teacher,
        progress: enrollment.progress,
        completedLessons,
        totalLessons,
        remainingTime,
        lastAccessed: enrollment.lastAccessedAt,
        nextLesson,
        totalDuration: course.totalDuration,
        enrollmentId: enrollment._id
      };
    }));

    return NextResponse.json({ 
      courses,
      summary: {
        totalActive: courses.length,
        averageProgress: courses.reduce((sum, course) => sum + course.progress, 0) / courses.length || 0
      }
    });

  } catch (error) {
    console.error('Error fetching active courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active courses' },
      { status: 500 }
    );
  }
}