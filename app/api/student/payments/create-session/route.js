
// app/api/student/payments/create-session/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    const body = await req.json();
    const { eventId, registrationId } = body;

    await connectDB();

    // Get event and registration details
    const [event, registration] = await Promise.all([
      Event.findById(eventId),
      EventRegistration.findOne({
        _id: registrationId,
        studentId: decoded.userId,
        status: 'pending'
      })
    ]);

    if (!event || !registration) {
      return NextResponse.json(
        { error: 'Event or registration not found' },
        { status: 404 }
      );
    }

    const ticketTier = event.ticketTiers.id(registration.ticketTier);

    // Create Stripe Checkout Session
    // Update the success_url and cancel_url in the stripe session creation
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [
    {
      price_data: {
        currency: 'gbp',
        product_data: {
          name: course.title,
          description: course.description?.substring(0, 255) || undefined,
          images: course.thumbnail ? [course.thumbnail] : undefined,
        },
        unit_amount: Math.round(course.price * 100),
      },
      quantity: 1,
    },
  ],
  metadata: {
    courseId: course._id.toString(),
    studentId: user.id,
    studentEmail: user.email
  },
  customer_email: user.email,
  mode: 'payment',
  success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/courses/${courseId}/payment/status?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/courses/${courseId}?payment=cancelled`,
});

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
