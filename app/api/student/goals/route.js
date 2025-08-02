// app/api/student/goals/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LearningGoal from "@/models/LearningGoal";
import CourseEnrollment from "@/models/CourseEnrollment";
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
      name: student.name,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}


// Get learning goals
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

    // Get active goals with course data
    const goals = await LearningGoal.find({
      studentId: user.id,
      status: { $ne: 'archived' }
    })
    .populate('courseId', 'title thumbnail category level')
    .sort({ dueDate: 1 });

    // Calculate progress for each goal
    const goalsWithProgress = await Promise.all(goals.map(async goal => {
      let progress = 0;

      if (goal.type === 'course_completion') {
        const enrollment = await CourseEnrollment.findOne({
          studentId: user.id,
          courseId: goal.courseId
        });
        progress = enrollment?.progress || 0;
      } else if (goal.type === 'study_hours') {
        const totalHours = await calculateStudyHours(user.id, goal.startDate);
        progress = Math.min((totalHours / goal.targetHours) * 100, 100);
      } else if (goal.type === 'certificates') {
        const certificatesEarned = await CourseEnrollment.countDocuments({
          studentId: user.id,
          status: 'completed',
          'certificate.issued': true,
          completedAt: { $gte: goal.startDate }
        });
        progress = Math.min((certificatesEarned / goal.targetCertificates) * 100, 100);
      }

      return {
        id: goal._id,
        title: goal.title,
        type: goal.type,
        description: goal.description,
        startDate: goal.startDate,
        dueDate: goal.dueDate,
        progress: Math.round(progress),
        completed: progress === 100,
        course: goal.courseId ? {
          id: goal.courseId._id,
          title: goal.courseId.title,
          thumbnail: goal.courseId.thumbnail,
          category: goal.courseId.category,
          level: goal.courseId.level
        } : null,
        target: {
          hours: goal.targetHours,
          certificates: goal.targetCertificates
        },
        milestones: goal.milestones.map(m => ({
          ...m.toObject(),
          completed: progress >= m.progressRequired
        }))
      };
    }));

    return NextResponse.json({ 
      goals: goalsWithProgress,
      summary: {
        total: goalsWithProgress.length,
        completed: goalsWithProgress.filter(g => g.completed).length,
        upcomingDeadlines: goalsWithProgress
          .filter(g => !g.completed && new Date(g.dueDate) > new Date())
          .length
      }
    });

  } catch (error) {
    console.error('Error fetching learning goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning goals' },
      { status: 500 }
    );
  }
}

// Create new learning goal
export async function POST(request) {
  try {
    const user = await getUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, type, description, dueDate, courseId, targetHours, targetCertificates, milestones } = body;

    await connectDB();

    // Validate the goal
    if (!title || !type || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the goal
    const goal = new LearningGoal({
      studentId: user.id,
      title,
      type,
      description,
      startDate: new Date(),
      dueDate: new Date(dueDate),
      courseId: type === 'course_completion' ? courseId : undefined,
      targetHours: type === 'study_hours' ? targetHours : undefined,
      targetCertificates: type === 'certificates' ? targetCertificates : undefined,
      milestones: milestones || [],
      status: 'active'
    });

    await goal.save();

    return NextResponse.json({
      message: 'Goal created successfully',
      goal: {
        id: goal._id,
        title: goal.title,
        type: goal.type,
        dueDate: goal.dueDate
      }
    });

  } catch (error) {
    console.error('Error creating learning goal:', error);
    return NextResponse.json(
      { error: 'Failed to create learning goal' },
      { status: 500 }
    );
  }
}

// Helper function to calculate total study hours
async function calculateStudyHours(studentId, startDate) {
  const enrollments = await CourseEnrollment.find({
    studentId,
    'lessonsProgress.lastWatched': { $gte: startDate }
  });

  let totalHours = 0;
  enrollments.forEach(enrollment => {
    enrollment.lessonsProgress.forEach(progress => {
      if (progress.lastWatched && progress.lastWatched >= startDate) {
        totalHours += (progress.watchTime || 0) / 3600; // Convert seconds to hours
      }
    });
  });

  return totalHours;
}