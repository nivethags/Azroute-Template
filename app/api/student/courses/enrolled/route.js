// app/api/student/courses/enrolled/route.js
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Helper function to calculate course statistics
async function calculateCourseStats(enrollment, course) {
  const completedLessons = enrollment.lessonsProgress.filter(p => p.completed).length;
  const totalLessons = course.sections.reduce(
    (total, section) => total + section.lessons.length, 
    0
  );

  // Calculate remaining time
  const remainingTime = course.sections.reduce((total, section) => {
    return total + section.lessons.reduce((sectionTotal, lesson) => {
      const progress = enrollment.lessonsProgress.find(
        p => p.lessonId.toString() === lesson._id.toString()
      );
      return progress?.completed ? sectionTotal : sectionTotal + (lesson.duration || 0);
    }, 0);
  }, 0);

  return {
    completedLessons,
    totalLessons,
    remainingTime,
    completionRate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  };
}

// Helper function to get study streak
async function getStudyStreak(studentId) {
  const objectId = Types.ObjectId.isValid(studentId) ? new Types.ObjectId(studentId) : null;
  if (!objectId) {
    throw new Error('Invalid student ID');
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyActivity = await CourseEnrollment.aggregate([
    {
      $match: {
        studentId: objectId,
        'lessonsProgress.lastWatched': { $gte: thirtyDaysAgo }
      }
    },
    {
      $unwind: '$lessonsProgress'
    },
    {
      $match: {
        'lessonsProgress.lastWatched': { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$lessonsProgress.lastWatched'
          }
        },
        totalTime: { $sum: '$lessonsProgress.watchTime' }
      }
    },
    {
      $sort: { '_id': -1 }
    }
  ]);

  let currentStreak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < dailyActivity.length; i++) {
    const activityDate = new Date(dailyActivity[i]._id);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (activityDate.getTime() === expectedDate.getTime()) {
      currentStreak++;
    } else {
      break;
    }
  }

  return currentStreak;
}

export async function GET(request) {
  try {
    // Get auth token from cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    await connectDB();

    // Get search params if any
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'recent'; // default sort by recent activity

    // Prepare query
    const query = {
      studentId: decoded.userId
    };

    if (status) {
      query.status = status;
    }

    // Prepare sort options
    const sortOptions = {
      recent: { lastAccessedAt: -1 },
      progress: { progress: -1 },
      title: { 'course.title': 1 }
    };

    // Get enrollments with course and teacher details
    const enrollments = await CourseEnrollment.find(query)
      .populate({
        path: 'courseId',
        populate: {
          path: 'teacherId',
          select: 'firstName lastName email profileImage department qualification experience subjectsToTeach'
        }
      })
      .sort(sortOptions[sort])
      .lean();

    // Get current study streak
    const studyStreak = await getStudyStreak(decoded.userId);

    // Process and format course data
    const coursesPromises = enrollments.map(async enrollment => {
      const course = enrollment.courseId;
      const stats = await calculateCourseStats(enrollment, course);

      const teacher = course.teacherId ? {
        id: course.teacherId._id.toString(),
        name: `${course.teacherId.firstName} ${course.teacherId.lastName}`,
        email: course.teacherId.email,
        avatar: course.teacherId.profileImage,
        department: course.teacherId.department,
        qualification: course.teacherId.qualification,
        experience: course.teacherId.experience,
        subjects: course.teacherId.subjectsToTeach
      } : null;

      return {
        id: course._id.toString(),
        enrollmentId: enrollment._id.toString(),
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        teacher,
        progress: Math.round(enrollment.progress),
        status: enrollment.status,
        stats: {
          completedLessons: stats.completedLessons,
          totalLessons: stats.totalLessons,
          remainingTime: stats.remainingTime,
          completionRate: Math.round(stats.completionRate)
        },
        lastAccessed: enrollment.lastAccessedAt,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        expiresAt: enrollment.expiresAt,
        certificate: enrollment.certificate,
        sections: course.sections.map(section => ({
          id: section._id.toString(),
          title: section.title,
          order: section.order,
          lessons: section.lessons.map(lesson => ({
            id: lesson._id.toString(),
            title: lesson.title,
            duration: lesson.duration,
            type: lesson.type,
            progress: {
              completed: enrollment.lessonsProgress.some(
                p => p.lessonId.toString() === lesson._id.toString() && p.completed
              ),
              watchTime: enrollment.lessonsProgress.find(
                p => p.lessonId.toString() === lesson._id.toString()
              )?.watchTime || 0,
              lastWatched: enrollment.lessonsProgress.find(
                p => p.lessonId.toString() === lesson._id.toString()
              )?.lastWatched
            }
          }))
        }))
      };
    });

    const courses = await Promise.all(coursesPromises);

    // Calculate overall stats
    const overallStats = {
      totalCourses: courses.length,
      activeCourses: courses.filter(c => c.status === 'active').length,
      completedCourses: courses.filter(c => c.status === 'completed').length,
      averageProgress: Math.round(
        courses.reduce((sum, course) => sum + course.progress, 0) / courses.length
      ),
      studyStreak,
      byTeacher: courses.reduce((acc, course) => {
        if (course.teacher) {
          const teacherId = course.teacher.id;
          if (!acc[teacherId]) {
            acc[teacherId] = {
              name: course.teacher.name,
              department: course.teacher.department,
              courses: 0,
              completedCourses: 0
            };
          }
          acc[teacherId].courses++;
          if (course.status === 'completed') {
            acc[teacherId].completedCourses++;
          }
        }
        return acc;
      }, {})
    };

    return NextResponse.json({
      courses,
      stats: overallStats
    });

  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}