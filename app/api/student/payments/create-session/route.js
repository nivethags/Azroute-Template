<<<<<<< HEAD
// app/api/student/payments/create-session/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
=======

// app/api/student/payments/create-session/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

<<<<<<< HEAD
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

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
      name: student.name,
      email: student.email
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { eventId, registrationId } = body;

    // Get event
    const { data: event, error: eventErr } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventErr || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Get registration
    const { data: registration, error: regErr } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('student_id', user.id)
      .eq('status', 'pending')
      .single();

    if (regErr || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Get ticket tier
    const ticketTier = event.ticket_tiers.find(tier => tier.id === registration.ticket_tier);

    if (!ticketTier) {
      return NextResponse.json({ error: 'Invalid ticket tier' }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: event.title,
              description: event.description?.substring(0, 255) || undefined,
              images: event.thumbnail ? [event.thumbnail] : undefined,
            },
            unit_amount: Math.round(ticketTier.price * 100), // Convert to pence
          },
          quantity: 1,
        },
      ],
      metadata: {
        eventId: event.id,
        registrationId: registration.id,
        studentId: user.id,
        studentEmail: user.email
      },
      customer_email: user.email,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/events/${eventId}/payment/status?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/events/${eventId}?payment=cancelled`,
    });
=======
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
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating payment session:', error);
<<<<<<< HEAD
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
=======
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
  }
}
