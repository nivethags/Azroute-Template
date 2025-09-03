// app/api/student/payments/[eventId]/route.js
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
        status: registration.status
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
