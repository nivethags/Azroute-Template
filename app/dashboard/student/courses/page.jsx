// app/dashboard/student/courses/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  Book, 
  Clock, 
  Users,
  GraduationCap,
  BookOpen,
  Loader2
} from "lucide-react";

export default function StudentCoursesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const [enrolledRes, availableRes] = await Promise.all([
        fetch('/api/student/courses/enrolled'),
        fetch('/api/student/courses/available')
      ]);

      if (!enrolledRes.ok || !availableRes.ok) {
        throw new Error('Failed to fetch courses');
      }

      const [enrolledData, availableData] = await Promise.all([
        enrolledRes.json(),
        availableRes.json()
      ]);

      setEnrolledCourses(enrolledData.courses);
      setAvailableCourses(availableData.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteLesson = (sections, progress) => {
    for (const section of sections || []) {
      for (const lesson of section.lessons || []) {
        const lessonProgress = progress?.find(p => p.lessonId === lesson._id);
        if (!lessonProgress || !lessonProgress.completed) {
          return lesson._id;
        }
      }
    }
    return null;
  };

  const handleContinueCourse = (course) => {
    // Find first incomplete lesson or last accessed lesson
    const firstIncompleteLesson = findFirstIncompleteLesson(course.sections, course.progress);
    const lastAccessedLesson = course.progress?.sort((a, b) => 
      new Date(b.lastAccessed) - new Date(a.lastAccessed)
    )[0]?.lessonId;

    const lessonId = firstIncompleteLesson || lastAccessedLesson || course.sections?.[0]?.lessons?.[0]?._id;

    if (!lessonId) {
      // If no lesson found, go to course overview
      router.push(`/dashboard/student/courses/${course.id}`);
      return;
    }

    // Navigate to specific lesson
    router.push(`/dashboard/student/courses/${course.id}/learn/${lessonId}`);
  };

  const categories = [
    'Dentistry',
    'Medical',
    'Nursing',
    'Other'
  ];

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const CourseCard = ({ course, isEnrolled = false }) => (
    <Card className="h-full">
      <CardHeader>
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
        <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{course.enrollments} students</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{Math.ceil(course.totalDuration / 60)} hours</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>{course.totalLessons} lessons</span>
            </div>
          </div>
          {isEnrolled && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(course.progress)}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isEnrolled ? (
          <Button 
            className="w-full"
            onClick={() => handleContinueCourse(course)}
          >
            Continue Learning
          </Button>
        ) : (
          <Button 
            className="w-full"
            onClick={() => router.push(`/dashboard/student/courses/${course.id}`)}
          >
            View Course
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  const filteredAvailableCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
          <p className="text-muted-foreground">
            Manage and explore your learning journey
          </p>
        </div>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="enrolled">
            <GraduationCap className="h-4 w-4 mr-2" />
            Enrolled Courses
          </TabsTrigger>
          <TabsTrigger value="available">
            <Book className="h-4 w-4 mr-2" />
            Available Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          {enrolledCourses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Enrolled Courses</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button onClick={() => router.push('/courses')}>
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  isEnrolled={true}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem 
                    key={category.toLowerCase()} 
                    value={category.toLowerCase()}
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={levelFilter}
              onValueChange={setLevelFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels.slice(1).map((level) => (
                  <SelectItem 
                    key={level.toLowerCase()} 
                    value={level.toLowerCase()}
                  >
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAvailableCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}