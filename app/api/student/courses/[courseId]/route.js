<<<<<<< HEAD
// app/api/student/courses/[courseId]/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Authenticate student using JWT stored in cookies
=======
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Course from '@/models/Course';
import CourseEnrollment from '@/models/CourseEnrollment';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
import mongoose from 'mongoose';

>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

<<<<<<< HEAD
  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const { data: student, error } = await supabase
      .from('Students')
      .select('id, student_name as name, email, mobile')
      .eq('id', decoded.userId)
      .single();

    if (error || !student) return null;

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      role: 'student'
    };
  } catch (err) {
    console.error('Auth verification error:', err);
=======
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
// GET course details for a student
export async function GET(request, { params }) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId } = params;

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('Courses')
      .select(`
        id, title, description, thumbnail, price, level, category,
        enrollments, rating, totalDuration, totalLessons,
        prerequisites, objectives, sections (
          title, lessons (id, title, duration, videoURL)
        )
      `)
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Fetch student enrollment
    const { data: enrollment } = await supabase
      .from('CourseEnrollments')
      .select('id, status, progress, lessonsProgress, lastAccessedAt, certificate')
      .eq('courseId', courseId)
      .eq('studentId', user.id)
      .single();

    // Format course data
    const formattedCourse = {
      id: course.id,
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
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
<<<<<<< HEAD
      sections: Array.isArray(course.sections)
        ? course.sections.map(section => ({
            title: section.title || '',
            lessons: Array.isArray(section.lessons)
              ? section.lessons.map(lesson => ({
                  id: lesson.id,
                  title: lesson.title || '',
                  duration: lesson.duration || 0,
                  ...(enrollment && lesson.videoURL ? { videoURL: lesson.videoURL } : {})
                }))
              : []
          }))
        : []
    };

    // Format enrollment data
    const formattedEnrollment = enrollment
      ? {
          id: enrollment.id,
          status: enrollment.status || 'pending',
          progress: enrollment.progress || 0,
          lessonsProgress: Array.isArray(enrollment.lessonsProgress)
            ? enrollment.lessonsProgress
            : [],
          lastAccessedAt: enrollment.lastAccessedAt || null,
          certificate: enrollment.certificate || null
        }
      : null;

    return NextResponse.json({ course: formattedCourse, enrollment: formattedEnrollment });

  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
