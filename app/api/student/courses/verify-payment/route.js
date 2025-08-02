// app/api/student/courses/verify-payment/route.js

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
    return decoded;
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
    const { sessionId, courseId } = body;

    await connectDB();

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Verify the metadata matches
    if (session.metadata.courseId !== courseId || 
        session.metadata.studentId !== user.id) {
      return NextResponse.json(
        { error: 'Invalid payment session' },
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

    // Check if already enrolled
    let enrollment = await CourseEnrollment.findOne({
      studentId: user.id,
      courseId: courseId
    });

    if (!enrollment) {
      // Create new enrollment
      enrollment = new CourseEnrollment({
        studentId: user.id,
        courseId: courseId,
        status: 'active',
        paymentInfo: {
          amount: session.amount_total / 100, // Convert from cents
          currency: session.currency,
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent,
          status: 'completed',
          completedAt: new Date()
        }
      });

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, {
        $inc: { enrolledStudents: 1 }
      });
    }

    return NextResponse.json({
      message: 'Payment verified successfully',
      course: {
        id: course._id,
        title: course.title
      },
      enrollment: {
        id: enrollment._id,
        status: enrollment.status
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}