// app/api/student/events/[eventId]/route.js
import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // Use service role key for server-side operations
);

// Helper: Verify student authentication
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) return null;

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

    // Fetch student from Supabase
    const { data: student, error } = await supabase
      .from('students')
      .select('id, name, email')
      .eq('id', decoded.userId)
      .single();

    if (error || !student) return null;

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId } = params;

    // Fetch event from Supabase
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Check if student is already registered
    const { data: existingRegistration, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('eventId', eventId)
      .eq('studentId', user.id)
      .single();
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
    const event = await Event.findById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if student is already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId: event?._id,
      studentId: decoded.userId
    });
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Format response
    const formattedEvent = {
<<<<<<< HEAD
      id: event.id,
=======
      id: event?._id,
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      title: event.title,
      description: event.description,
      thumbnail: event.thumbnail,
      startDate: event.startDate,
      endDate: event.endDate,
<<<<<<< HEAD
      durationHours: Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)),
      location: event.location,
      currentRegistrations: event.currentRegistrations,
      maximumRegistrations: event.maximumRegistrations,
      ticketTiers: event.ticketTiers || [],
=======
      duration: Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)),
      location: event.location,
      currentRegistrations: event.currentRegistrations,
      maximumRegistrations: event.maximumRegistrations,
      ticketTiers: event.ticketTiers.map(tier => ({
        id: tier._id,
        name: tier.name,
        price: tier.price,
        benefits: tier.benefits,
        availableCount: tier.availableCount
      })),
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
      registrationQuestions: event.prerequisites || [],
      category: event.category,
      agenda: event.agenda,
      speakers: event.speakers,
      isRegistrationOpen: event.isRegistrationOpen
    };

    return NextResponse.json({ event: formattedEvent });
  } catch (error) {
    console.error('Error fetching event details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
<<<<<<< HEAD
=======

>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
