"use client";

import { useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Calendar, Clock, VideoIcon, Users, ChevronLeft, ChevronRight
} from "lucide-react";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const schedule = [
    {
      id: 1,
      title: "Opening Strategies - Live Lesson",
      instructor: "Coach Ankit Sharma",
      time: "10:00 AM - 11:30 AM",
      type: "lesson",
      attendees: 18,
      link: "zoom-link-opening"
    },
    {
      id: 2,
      title: "Chess Tactics Training",
      instructor: "Coach Priya Mehra",
      time: "03:00 PM - 04:30 PM",
      type: "workshop",
      attendees: 12,
      link: "zoom-link-tactics"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chess Schedule</h1>
          <p className="text-muted-foreground">Stay updated with your upcoming chess sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="month">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day View</SelectItem>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#3b82f6] hover:bg-[#2563eb]">
            Add to Calendar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>August 2025</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-6 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="font-medium text-sm text-muted-foreground">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center rounded-full text-sm
                      ${i === 15 ? 'bg-[#3b82f6] text-white' : 'hover:bg-gray-100 cursor-pointer'}
                    `}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Today's Chess Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {schedule.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.instructor}
                      </p>
                    </div>
                    <Badge 
                      variant={event.type === 'lesson' ? 'default' : 'secondary'}
                      className="bg-[#3b82f6]"
                    >
                      {event.type}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees} students
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-[#3b82f6] hover:bg-[#2563eb]">
                    <VideoIcon className="h-4 w-4 mr-2" />
                    Join Session
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
