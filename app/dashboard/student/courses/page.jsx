"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // see alias setup below

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('course')
        .select('id, title, description, level, price, status, coach_id, created_at');

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data ?? []);
      }
    })();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses.map(c => (
        <Card key={c.id}>
          <CardHeader><CardTitle>{c.title}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm opacity-80">{c.description}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push(`/dashboard/student/courses/${c.id}`)}>
              View
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
