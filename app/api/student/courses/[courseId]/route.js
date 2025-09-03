import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
import mongoose from 'mongoose';

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

    const { courseId } =await params;

    // Validate courseId format
    let courseObjectId;
    try {
      courseObjectId = new mongoose.Types.ObjectId(courseId);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid course ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get course details and check if student is enrolled
    const [course, enrollment] = await Promise.all([
      Course.findById(courseObjectId)
        .select('-reviews')
        .lean(),
      CourseEnrollment.findOne({
        courseId: courseObjectId,
        studentId: user.id
      }).lean()
    ]);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Format response with null/type checking
    const formattedCourse = {
      id: course._id,
      title: course.title || '',
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      price: course.price || 0,
      level: course.level || 'beginner',
      category: course.category || 'uncategorized',
      enrollments: course.enrollments || 0,
      rating: course.rating || 0,
      totalDuration: course.totalDuration || 0,
      totalLessons: course.totalLessons || 0,
      prerequisites: Array.isArray(course.prerequisites) ? course.prerequisites : [],
      objectives: Array.isArray(course.objectives) ? course.objectives : [],
      sections: Array.isArray(course.sections) ? course.sections.map(section => ({
        title: section.title || '',
        lessons: Array.isArray(section.lessons) ? section.lessons.map(lesson => ({
          id: lesson._id,
          title: lesson.title || '',
          duration: lesson.duration || 0,
          ...(enrollment && lesson.videoURL ? { videoURL: lesson.videoURL } : {})
        })) : []
      })) : []
    };

    let formattedEnrollment = null;
    if (enrollment) {
      formattedEnrollment = {
        id: enrollment._id,
        status: enrollment.status || 'pending',
        progress: enrollment.progress || 0,
        lessonsProgress: Array.isArray(enrollment.lessonsProgress) 
          ? enrollment.lessonsProgress 
          : [],
        lastAccessedAt: enrollment.lastAccessedAt || null,
        certificate: enrollment.certificate || null
      };
    }

    return NextResponse.json({
      course: formattedCourse,
      enrollment: formattedEnrollment
    });

  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}