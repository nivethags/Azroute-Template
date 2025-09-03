import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Helper function to get completion trend over last 6 months
async function getCompletionTrend(studentId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const objectId = Types.ObjectId.isValid(studentId) ? new Types.ObjectId(studentId) : null;
  if (!objectId) {
    throw new Error('Invalid student ID');
  }

  const completions = await CourseEnrollment.aggregate([
    {
      $match: {
        studentId: objectId,
        status: 'completed',
        completedAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return completions.map(item => ({
    date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    completions: item.count
  }));
}

// Helper function to calculate 28-day consistency score
async function calculateConsistencyScore(studentId) {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const objectId = Types.ObjectId.isValid(studentId) ? new Types.ObjectId(studentId) : null;
  if (!objectId) {
    throw new Error('Invalid student ID');
  }

  const dailyActivity = await CourseEnrollment.aggregate([
    {
      $match: {
        studentId: objectId,
        'lessonsProgress.lastWatched': { $gte: fourWeeksAgo }
      }
    },
    {
      $unwind: '$lessonsProgress'
    },
    {
      $match: {
        'lessonsProgress.lastWatched': { $gte: fourWeeksAgo }
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
    }
  ]);

  const daysWithActivity = dailyActivity.length;
  const consistencyScore = (daysWithActivity / 28) * 100;

  return Math.round(consistencyScore);
}

export async function GET(request) {
  try {
    // Get auth token from cookie
    const cookieStore =await cookies();
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

    // Get student and basic enrollment stats
    const [student, totalEnrollments] = await Promise.all([
      Student.findById(decoded.userId).select('name email verified').lean(),
      CourseEnrollment.countDocuments({ studentId: decoded.userId })
    ]);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Get active and completed course counts
    const [activeCourses, completedCourses] = await Promise.all([
      CourseEnrollment.countDocuments({ 
        studentId: decoded.userId, 
        status: 'active' 
      }),
      CourseEnrollment.countDocuments({ 
        studentId: decoded.userId, 
        status: 'completed' 
      })
    ]);

    // Get completion trend and consistency score
    const [completionTrend, consistencyScore] = await Promise.all([
      getCompletionTrend(decoded.userId),
      calculateConsistencyScore(decoded.userId)
    ]);

    // Calculate completion rate
    const completionRate = totalEnrollments > 0 
      ? (completedCourses / totalEnrollments) * 100 
      : 0;

    const stats = {
      totalEnrollments,
      activeCourses,
      completedCourses,
      completionRate: Math.round(completionRate),
      consistencyScore,
      completionTrend,
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        verified: student.verified
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}