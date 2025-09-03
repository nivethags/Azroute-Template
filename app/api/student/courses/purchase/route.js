// app/api/student/courses/purchase/route.js

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import CourseEnrollment from "@/models/CourseEnrollment";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Stripe from 'stripe';
import Student from "@/models/Student";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getUser(request) {
  const cookieStore =await cookies();
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
      email: student.email,
      name: student.name
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export async function POST(request) {
  try {
    const user = await getUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, promoCode } = body;

    await connectDB();

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      studentId: user.id,
      courseId: courseId
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Calculate price after promo code (if applicable)
    let finalPrice = course.price;
    if (promoCode) {
      const discount = await validatePromoCode(promoCode, courseId);
      if (discount) {
        finalPrice = course.price - (course.price * discount.percentage / 100);
      }
    }

    // If course is free, create enrollment directly
    if (finalPrice === 0) {
      const enrollment = new CourseEnrollment({
        studentId: user.id,
        courseId: course._id,
        status: 'active',
        paymentInfo: {
          amount: 0,
          status: 'completed',
          completedAt: new Date()
        }
      });

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrolledStudents: 1 }
      });

      return NextResponse.json({
        message: 'Successfully enrolled in course',
        enrollment
      });
    }

    // Create Stripe checkout session for paid courses
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: course.title,
              description: course.description?.substring(0, 255),
              images: course.thumbnail ? [course.thumbnail] : undefined,
            },
            unit_amount: Math.round(finalPrice * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: course._id.toString(),
        studentId: user.id,
        studentEmail: user.email,
        studentName: user.name,
        promoCode: promoCode || ''
      },
      customer_email: user.email,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}/checkout?canceled=true`,
    });

    return NextResponse.json({
      sessionId: session.id,
      course: {
        id: course._id,
        title: course.title
      }
    });

  } catch (error) {
    console.error('Course purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to process purchase' },
      { status: 500 }
    );
  }
}

async function validatePromoCode(code, courseId) {
  // Add your promo code validation logic here
  // This is just a placeholder implementation
  const promoCode = await PromoCode.findOne({
    code,
    courseId,
    status: 'active',
    expiresAt: { $gt: new Date() }
  });

  if (!promoCode) {
    return null;
  }

  return {
    percentage: promoCode.discountPercentage,
    code: promoCode.code
  };
}