// app/api/student/payments/[eventId]/route.js
import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

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

export async function GET(req, { params }) {
  try {
    const user = await verifyAuth();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { eventId } = params;

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
      .eq('event_id', eventId)
      .eq('student_id', user.id)
      .eq('status', 'pending')
      .single();

    if (regErr || !registration) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Get ticket tier from event data
    const ticketTier = event.ticket_tiers.find(tier => tier.id === registration.ticket_tier);

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        startDate: event.start_date,
        currentRegistrations: event.current_registrations
      },
      registration: {
        id: registration.id,
        ticketTier: ticketTier
          ? {
              id: ticketTier.id,
              name: ticketTier.name,
              price: ticketTier.price
            }
          : null,
=======
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req, { params }) {
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
    await connectDB();
    const {eventId}=await params
    // Get event and registration details
    const [event, registration] = await Promise.all([
      Event.findById(eventId),
      EventRegistration.findOne({
        eventId: eventId,
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

    return NextResponse.json({
      event: {
        id: event?._id,
        title: event.title,
        startDate: event.startDate,
        currentRegistrations: event.currentRegistrations
      },
      registration: {
        id: registration._id,
        ticketTier: {
          id: ticketTier?._id,
          name: ticketTier?.name,
          price: ticketTier?.price
        },
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        status: registration.status
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
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
