<<<<<<< HEAD
// app/api/student/stats/route.js
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
=======
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

// Helper function to get completion trend over last 6 months
async function getCompletionTrend(studentId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

<<<<<<< HEAD
  const { data: completions, error } = await supabase
    .from('Course_Enrollments')
    .select('completed_at')
    .eq('Student_id', studentId)
    .eq('status', 'completed')
    .gte('completed_at', sixMonthsAgo);

  if (error) throw error;

  const trendMap = {};

  completions.forEach(item => {
    const date = new Date(item.completed_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    trendMap[key] = (trendMap[key] || 0) + 1;
  });

  return Object.entries(trendMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, completions: count }));
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
}

// Helper function to calculate 28-day consistency score
async function calculateConsistencyScore(studentId) {
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

<<<<<<< HEAD
  const { data: lessons, error } = await supabase
    .from('Course_Enrollments')
    .select('lessons_progress')
    .eq('Student_id', studentId);

  if (error) throw error;

  const activityDays = new Set();

  lessons.forEach(enrollment => {
    enrollment.lessons_progress?.forEach(progress => {
      const watched = new Date(progress.last_watched);
      if (watched >= fourWeeksAgo) {
        const dayKey = watched.toISOString().split('T')[0];
        activityDays.add(dayKey);
      }
    });
  });

  const consistencyScore = (activityDays.size / 28) * 100;
  return Math.round(consistencyScore);
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');

    if (!authToken) {
      return new Response(JSON.stringify({ message: 'Not authenticated' }), { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(authToken.value, process.env.JWT_SECRET);
    } catch {
      return new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
    }

    const studentId = decoded.userId;

    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('Students')
      .select('Student_id, Student_name, email, mobile')
      .eq('Student_id', studentId)
      .single();

    if (studentError || !student) {
      return new Response(JSON.stringify({ message: 'Student not found' }), { status: 404 });
    }

    // Get enrollments counts
    const { count: totalEnrollments } = await supabase
      .from('Course_Enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('Student_id', studentId);

    const { count: activeCourses } = await supabase
      .from('Course_Enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('Student_id', studentId)
      .eq('status', 'active');

    const { count: completedCourses } = await supabase
      .from('Course_Enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('Student_id', studentId)
      .eq('status', 'completed');

    const [completionTrend, consistencyScore] = await Promise.all([
      getCompletionTrend(studentId),
      calculateConsistencyScore(studentId)
    ]);

    const completionRate = totalEnrollments > 0 ? (completedCourses / totalEnrollments) * 100 : 0;
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    const stats = {
      totalEnrollments,
      activeCourses,
      completedCourses,
      completionRate: Math.round(completionRate),
      consistencyScore,
      completionTrend,
<<<<<<< HEAD
      student
    };

    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  }
}
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
