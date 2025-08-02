
// app/api/student/courses/[courseId]/lessons/[lessonId]/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
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

export async function GET(request, { params }) {
  try {
    const user = await verifyAuth();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId, lessonId } =await params;
    await connectDB();

    // Find the course and the specific lesson
    const course = await Course.findById(courseId).lean();
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Find the lesson in the course sections
    let lessonData = null;
    for (const section of course.sections) {
      const lesson = section.lessons.find(l => l._id.toString() === lessonId);
      if (lesson) {
        lessonData = lesson;
        break;
      }
    }

    if (!lessonData) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Format the lesson data
    const formattedLesson = {
      id: lessonData._id,
      title: lessonData.title,
      description: lessonData.description,
      videoURL: lessonData.videoURL,
      duration: lessonData.duration,
      resources: lessonData.resources
    };

    return NextResponse.json({ lesson: formattedLesson });
    
  } catch (error) {
    console.error('Error fetching lesson details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}