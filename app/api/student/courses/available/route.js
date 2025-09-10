<<<<<<< HEAD
// app/api/student/courses/available/route.js
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
      .select("id, firstName, lastName, student_name as name, email")
      .eq("id", decoded.userId)
      .single();

    if (error || !student) return null;

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      name: student.name || `${student.firstName} ${student.lastName}`,
      email: student.email,
      role: "student",
    };
  } catch (err) {
    console.error("Auth verification error:", err);
    return null;
  }
}

// Helper function to get recommended courses
async function getRecommendedCourses(studentId, limit = 3) {
  // Fetch completed enrollments
  const { data: completedEnrollments, error } = await supabase
    .from("CourseEnrollments")
    .select("courseId(category, level)")
    .eq("studentId", studentId)
    .eq("status", "completed");

  if (error) throw error;

  const categories = completedEnrollments.map(e => e.courseId.category).filter(Boolean);
  const levels = completedEnrollments.map(e => e.courseId.level).filter(Boolean);

  const preferredCategory =
    categories.length > 0
      ? categories.sort((a, b) =>
          categories.filter(v => v === b).length - categories.filter(v => v === a).length
        )[0]
      : null;

  const preferredLevel =
    levels.length > 0
      ? levels.sort((a, b) =>
          levels.filter(v => v === b).length - levels.filter(v => v === a).length
        )[0]
      : null;

  // Fetch recommended courses
  let query = supabase.from("Courses").select("*").eq("status", "published").limit(limit);

  if (preferredCategory) query = query.eq("category", preferredCategory);
  if (preferredLevel) query = query.eq("level", preferredLevel);

  const { data: recommendedCourses, error: recError } = await query;
  if (recError) throw recError;

  return recommendedCourses || [];
=======
import { NextResponse } from 'next/server';
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

// Helper function to get student's course recommendations
async function getRecommendedCourses(studentId, limit = 3) {
  const objectId = Types.ObjectId.isValid(studentId) ? new Types.ObjectId(studentId) : null;
  if (!objectId) {
    throw new Error('Invalid student ID');
  }

  // Get student's completed courses to analyze their interests
  const completedEnrollments = await CourseEnrollment.find({
    studentId: objectId,
    status: 'completed'
  }).populate('courseId', 'category level');

  // Extract categories and levels from completed courses
  const categories = completedEnrollments.map(e => e.courseId.category);
  const levels = completedEnrollments.map(e => e.courseId.level);

  // Find most common category and level
  const preferredCategory = categories.length > 0 ? 
    categories.reduce((a, b) => 
      categories.filter(v => v === a).length >= categories.filter(v => v === b).length ? a : b
    ) : null;

  const preferredLevel = levels.length > 0 ?
    levels.reduce((a, b) =>
      levels.filter(v => v === a).length >= levels.filter(v => v === b).length ? a : b
    ) : null;

  // Get recommended courses based on preferences
  return Course.find({
    status: 'published',
    ...(preferredCategory && { category: preferredCategory }),
    ...(preferredLevel && { level: preferredLevel })
  })
  .limit(limit)
  .lean();
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
}

export async function GET(request) {
  try {
<<<<<<< HEAD
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ message: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const level = searchParams.get("level");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popular";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    // Fetch student's enrolled course IDs
    const { data: enrolledCourses, error: enrolledError } = await supabase
      .from("CourseEnrollments")
      .select("courseId")
      .eq("studentId", user.id)
      .not("status", "in", "refunded,cancelled");

    if (enrolledError) throw enrolledError;

    const enrolledCourseIds = enrolledCourses.map(e => e.courseId);

    // Build query
    let query = supabase.from("Courses").select("*").neq("id", enrolledCourseIds).eq("status", "published");

    if (category) query = query.eq("category", category);
    if (level) query = query.eq("level", level);
    if (search) query = query.ilike("title", `%${search}%`);

    // Sorting
    const sortOptions = {
      popular: { column: "enrollments", ascending: false },
      newest: { column: "createdAt", ascending: false },
      priceAsc: { column: "price", ascending: true },
      priceDesc: { column: "price", ascending: false }
    };
    const sortOpt = sortOptions[sort] || sortOptions.popular;
    query = query.order(sortOpt.column, { ascending: sortOpt.ascending });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: courses, count } = await query.range(from, to).throwOnError().then(res => ({ data: res.data, count: res.count }));

    // Recommended courses
    const recommendedCourses = await getRecommendedCourses(user.id);

    // Format courses
    const formattedCourses = (courses || []).map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      thumbnail: c.thumbnail,
      enrollments: c.enrollments,
      totalDuration: c.totalDuration,
      totalLessons: c.totalLessons,
      category: c.category,
      level: c.level,
      price: c.price,
      createdAt: c.createdAt
    }));

    const formattedRecommendations = (recommendedCourses || []).map(c => ({
      id: c.id,
      title: c.title,
      thumbnail: c.thumbnail,
      category: c.category,
      level: c.level,
      price: c.price
=======
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

    // Get enrolled course IDs for the student
    const enrolledCourseIds = await CourseEnrollment
      .find({ 
        studentId: decoded.userId,
        status: { $nin: ['refunded', 'cancelled'] }
      })
      .distinct('courseId');

    // Prepare query for available courses
    const query = {
      _id: { $nin: enrolledCourseIds },
      status: 'published'
    };

    // Get search params if any
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'popular'; // default sort by popularity
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;

    // Add filters to query
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Prepare sort options
    const sortOptions = {
      popular: { enrollments: -1 },
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 }
    };

    // Get available courses with pagination
    const [courses, totalCourses, recommendedCourses] = await Promise.all([
      Course
        .find(query)
        .sort(sortOptions[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Course.countDocuments(query),
      getRecommendedCourses(decoded.userId)
    ]);

    // Format the response
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      enrollments: course.enrollments,
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      category: course.category,
      level: course.level,
      price: course.price,
      createdAt: course.createdAt
    }));

    // Format recommended courses
    const formattedRecommendations = recommendedCourses.map(course => ({
      id: course._id.toString(),
      title: course.title,
      thumbnail: course.thumbnail,
      category: course.category,
      level: course.level,
      price: course.price
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    }));

    return NextResponse.json({
      courses: formattedCourses,
      recommendations: formattedRecommendations,
      pagination: {
        currentPage: page,
<<<<<<< HEAD
        totalPages: Math.ceil((count || 0) / limit),
        totalCourses: count || 0,
        hasMore: page * limit < (count || 0)
=======
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses,
        hasMore: page * limit < totalCourses
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      }
    });

  } catch (error) {
<<<<<<< HEAD
    console.error("Error fetching available courses:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
=======
    console.error('Error fetching available courses:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
