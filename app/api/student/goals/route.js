// app/api/student/goals/route.js
<<<<<<< HEAD
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Auth helper
=======

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LearningGoal from "@/models/LearningGoal";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Student from "@/models/Student";
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

<<<<<<< HEAD
  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('id', decoded.userId)
      .single();

    if (error || !student) return null;

    return {
      id: student.id,
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      name: student.name,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

<<<<<<< HEAD
// GET: fetch learning goals
export async function GET(request) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get active goals
    const { data: goals, error } = await supabase
      .from('learning_goals')
      .select(`
        id, title, type, description, start_date, due_date, course_id,
        target_hours, target_certificates, milestones, status
      `)
      .eq('student_id', user.id)
      .neq('status', 'archived')
      .order('due_date', { ascending: true });

    if (error) throw error;

    // Attach course data and calculate progress
    const goalsWithProgress = await Promise.all(goals.map(async goal => {
      let progress = 0;
      let course = null;

      if (goal.course_id) {
        const { data: courseData } = await supabase
          .from('courses')
          .select('id, title, thumbnail, category, level')
          .eq('id', goal.course_id)
          .single();

        course = courseData || null;

        if (goal.type === 'course_completion') {
          const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('progress')
            .eq('student_id', user.id)
            .eq('course_id', goal.course_id)
            .single();

          progress = enrollment?.progress || 0;
        }
      }

      if (goal.type === 'study_hours') {
        const totalHours = await calculateStudyHours(user.id, goal.start_date);
        progress = Math.min((totalHours / goal.target_hours) * 100, 100);
      }

      if (goal.type === 'certificates') {
        const { count: certificatesEarned } = await supabase
          .from('course_enrollments')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', user.id)
          .eq('status', 'completed')
          .eq('certificate.issued', true)
          .gte('completed_at', goal.start_date);

        progress = Math.min((certificatesEarned / goal.target_certificates) * 100, 100);
      }

      return {
        id: goal.id,
        title: goal.title,
        type: goal.type,
        description: goal.description,
        startDate: goal.start_date,
        dueDate: goal.due_date,
        progress: Math.round(progress),
        completed: progress === 100,
        course,
        target: {
          hours: goal.target_hours,
          certificates: goal.target_certificates
        },
        milestones: goal.milestones.map(m => ({
          ...m,
          completed: progress >= m.progress_required
=======

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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        }))
      };
    }));

<<<<<<< HEAD
    return NextResponse.json({
=======
    return NextResponse.json({ 
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      goals: goalsWithProgress,
      summary: {
        total: goalsWithProgress.length,
        completed: goalsWithProgress.filter(g => g.completed).length,
<<<<<<< HEAD
        upcomingDeadlines: goalsWithProgress.filter(g => !g.completed && new Date(g.dueDate) > new Date()).length
      }
    });
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    return NextResponse.json({ error: 'Failed to fetch learning goals' }, { status: 500 });
  }
}

// POST: create a new learning goal
export async function POST(request) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    const body = await request.json();
    const { title, type, description, dueDate, courseId, targetHours, targetCertificates, milestones } = body;

<<<<<<< HEAD
    if (!title || !type || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: goal, error } = await supabase
      .from('learning_goals')
      .insert({
        student_id: user.id,
        title,
        type,
        description,
        start_date: new Date(),
        due_date: new Date(dueDate),
        course_id: type === 'course_completion' ? courseId : null,
        target_hours: type === 'study_hours' ? targetHours : null,
        target_certificates: type === 'certificates' ? targetCertificates : null,
        milestones: milestones || [],
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    return NextResponse.json({
      message: 'Goal created successfully',
      goal: {
<<<<<<< HEAD
        id: goal.id,
        title: goal.title,
        type: goal.type,
        dueDate: goal.due_date
=======
        id: goal._id,
        title: goal.title,
        type: goal.type,
        dueDate: goal.dueDate
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      }
    });

  } catch (error) {
    console.error('Error creating learning goal:', error);
<<<<<<< HEAD
    return NextResponse.json({ error: 'Failed to create learning goal' }, { status: 500 });
  }
}

// Helper function to calculate study hours
async function calculateStudyHours(studentId, startDate) {
  const { data: enrollments, error } = await supabase
    .from('course_enrollments')
    .select('lessons_progress')
    .eq('student_id', studentId);

  if (error || !enrollments) return 0;

  let totalHours = 0;
  enrollments.forEach(enrollment => {
    enrollment.lessons_progress.forEach(progress => {
      if (progress.last_watched && new Date(progress.last_watched) >= new Date(startDate)) {
        totalHours += (progress.watch_time || 0) / 3600;
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      }
    });
  });

  return totalHours;
<<<<<<< HEAD
}
=======
}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
