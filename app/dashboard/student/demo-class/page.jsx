"use client";

import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Video } from 'lucide-react';

export default function DemoClassPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white-200 px-6 py-12">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Free Demo Chess Class</h1>
        <p className="text-lg text-gray-700 mb-8">
          Experience the excitement of chess learning with our expert coaches. Perfect for beginners and young learners.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DemoDetail icon={<CalendarDays className="w-6 h-6 text-orange-500" />} title="Next Class Date" value="Saturday, August 10, 2025" />
          <DemoDetail icon={<Clock className="w-6 h-6 text-orange-500" />} title="Time" value="4:00 PM - 5:00 PM IST" />
          <DemoDetail icon={<Video className="w-6 h-6 text-orange-500" />} title="Mode" value="Online via Zoom" />
          <DemoDetail icon={<UserIcon />} title="Coach" value="IM Raghav Sharma" />
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
            Register Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function DemoDetail({ icon, title, value }) {
  return (
    <div className="flex items-start space-x-4">
      <div>{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A10 10 0 1119 9.75m-6.879 8.054A4 4 0 1119 9.75" />
    </svg>
  );
}
