
// app/api/student/events/available/route.js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Event from '@/models/Event';
import EventRegistration from '@/models/EventRegistration';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(req) {
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

    // Get registered event IDs for the student
    const registeredEventIds = await EventRegistration
      .find({ studentId: decoded.userId })
      .distinct('eventId');

    // Get available events (excluding registered ones)
    const events = await Event
      .find({
        _id: { $nin: registeredEventIds },
        status: 'published',
        startDate: { $gt: new Date() }
      })
      .sort({ startDate: 1 });

    // Format the response
    const formattedEvents = events.map(event => ({
      id: event?._id,
      title: event.title,
      description: event.description,
      thumbnail: event.thumbnail,
      type: event.location.type,
      startDate: event.startDate,
      endDate: event.endDate,
      duration: Math.ceil((new Date(event.endDate) - new Date(event.startDate)) / (1000 * 60 * 60)),
      category: event.category,
      location: event.location,
      currentRegistrations: event.currentRegistrations,
      maximumRegistrations: event.maximumRegistrations,
      ticketTiers: event.ticketTiers,
      isRegistrationOpen: event.isRegistrationOpen
    }));

    return NextResponse.json({ events: formattedEvents });
  } catch (error) {
    console.error('Error fetching available events:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}