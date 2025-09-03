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
    }));

    return NextResponse.json({
      courses: formattedCourses,
      recommendations: formattedRecommendations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses,
        hasMore: page * limit < totalCourses
      }
    });

  } catch (error) {
    console.error('Error fetching available courses:', error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}