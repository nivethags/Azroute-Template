// app/api/student/events/register/route.js
import { NextResponse } from 'next/server';
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
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}