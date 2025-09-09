// app/api/student/events/register/route.js
import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Helper: Verify student authentication
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
      email: student.email,
      role: 'student'
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
}

export async function POST(req) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, ticketTierId, registrationDetails } = body;

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (!event.isRegistrationOpen) {
      return NextResponse.json({ error: 'Registration is closed for this event' }, { status: 400 });
    }

    // Check if student already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('eventId', eventId)
      .eq('studentId', user.id)
      .single();

    if (existingRegistration) {
      return NextResponse.json({ error: 'Already registered for this event' }, { status: 400 });
    }

    // Get selected ticket tier
    const selectedTier = event.ticketTiers.find(t => t.id === ticketTierId);
    if (!selectedTier) {
      return NextResponse.json({ error: 'Invalid ticket tier' }, { status: 400 });
    }

    if (selectedTier.availableCount === 0) {
      return NextResponse.json({ error: 'Selected ticket tier is sold out' }, { status: 400 });
    }

    // Create registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert([{
        eventId,
        studentId: user.id,
        ticketTier: ticketTierId,
        status: selectedTier.price > 0 ? 'pending' : 'confirmed',
        additionalInfo: {
          dietary: registrationDetails?.dietary || '',
          specialRequirements: registrationDetails?.specialRequirements || '',
          questions: registrationDetails?.questions || []
        },
        createdAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (regError) {
      console.error('Registration insert error:', regError);
      return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }

    // Update event statistics
    const updatedTiers = event.ticketTiers.map(t => {
      if (t.id === ticketTierId) t.availableCount -= 1;
      return t;
    });

    await supabase
      .from('events')
      .update({
        currentRegistrations: event.currentRegistrations + 1,
        ticketTiers: updatedTiers
      })
      .eq('id', eventId);

    // Return response based on ticket price
    if (selectedTier.price > 0) {
      return NextResponse.json({
        requiresPayment: true,
        registrationId: registration.id,
=======
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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
    await connectDB();

    const body = await req.json();
    const { eventId, ticketTierId, registrationDetails } = body;

    // Validate event and check registration status
    const event = await Event.findById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.isRegistrationOpen) {
      return NextResponse.json(
        { error: 'Registration is closed for this event' },
        { status: 400 }
      );
    }

    // Check if student is already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId,
      studentId: decoded.userId
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Get selected ticket tier
    const selectedTier = event.ticketTiers.id(ticketTierId);
    
    if (!selectedTier) {
      return NextResponse.json(
        { error: 'Invalid ticket tier' },
        { status: 400 }
      );
    }

    if (selectedTier.availableCount === 0) {
      return NextResponse.json(
        { error: 'Selected ticket tier is sold out' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = new EventRegistration({
      eventId,
      studentId: decoded.userId,
      ticketTier: ticketTierId,
      status: selectedTier.price > 0 ? 'pending' : 'confirmed',
      additionalInfo: {
        dietary: registrationDetails.dietary,
        specialRequirements: registrationDetails.specialRequirements,
        questions: registrationDetails.questions
      }
    });

    await registration.save();

    // Update event statistics
    event.currentRegistrations += 1;
    selectedTier.availableCount -= 1;
    await event.save();

    // Return appropriate response based on ticket price
    if (selectedTier.price > 0) {
      return NextResponse.json({
        requiresPayment: true,
        registrationId: registration._id,
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
        amount: selectedTier.price
      });
    } else {
      return NextResponse.json({
        requiresPayment: false,
        message: 'Registration successful'
      });
    }
  } catch (error) {
    console.error('Error processing registration:', error);
<<<<<<< HEAD
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
=======
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
