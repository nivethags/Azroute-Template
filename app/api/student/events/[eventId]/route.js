// app/api/student/events/[eventId]/route.js
import { NextResponse } from 'next/server';
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

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Format response
    const formattedEvent = {
      id: event?._id,
      title: event.title,
      description: event.description,
      thumbnail: event.thumbnail,
      startDate: event.startDate,
      endDate: event.endDate,
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

