"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2, Book, Users, Calendar, TrendingUp,
  Clock, DollarSign, BarChart2, Upload, MessageSquare,
  Video
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TeacherDashboard() {
  const router = useRouter();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    upcomingClasses: 0,
    totalEarnings: 0,
    courseCompletionRate: 0,
    totalAssignments: 0
  });

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          fetch('/api/teacher/profile'),
          fetch('/api/teacher/stats')
        ]);

        if (!profileRes.ok) {
          if (profileRes.status === 401) {
            router.push('/auth/teacher/login');
            return;
          }
          throw new Error('Failed to fetch profile data');
        }

        const [profileData, statsData] = await Promise.all([
          profileRes.json(),
          statsRes.json()
        ]);
        
        setTeacher(profileData?.teacher);
        setStats(statsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [router]);

  const handleUpload = (type) => {
    if (type === 'live') {
      router.push('/dashboard/teacher/livestreams');
    } else {
      router.push('/dashboard/teacher/courses/create');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => router.push('/auth/teacher/login')}>
          Return to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {teacher?.name}
          </p>
        </div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Content
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpload('live')}>
                Go Live
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleUpload('recorded')}>
                Upload Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled across all courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">
              Currently published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingClasses}</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.courseCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion rate
            </p>
          </CardContent>
        </Card> */}

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Button 
    variant="outline"
    className="h-24 flex flex-col items-center justify-center space-y-2"
    onClick={() => router.push('/dashboard/teacher/courses/create')}
  >
    <Book className="h-6 w-6" />
    <span>Create Course</span>
  </Button>
  <Button 
    variant="outline" 
    className="h-24 flex flex-col items-center justify-center space-y-2"
    onClick={() => router.push('/dashboard/teacher/assignments')}
  >
    <Clock className="h-6 w-6" />
    <span>Create Assignment</span>
  </Button>
  
  

  {/* <Button 
    variant="outline"
    className="h-24 flex flex-col items-center justify-center space-y-2"
    onClick={() => router.push('/dashboard/teacher/livestreams/create')}
  >
    <Video className="h-6 w-6" />
    <span>Start Live Session</span>
  </Button> */}

  <Button 
    variant="outline"
    className="h-24 flex flex-col items-center justify-center space-y-2"
    onClick={() => router.push('/dashboard/teacher/discussions')}
  >
    <MessageSquare className="h-6 w-6" />
    <span>Start Discussion</span>
  </Button>

  {/* <Button 
    variant="outline"
    className="h-24 flex flex-col items-center justify-center space-y-2"
    onClick={() => router.push('/dashboard/teacher/analytics')}
  >
    <BarChart2 className="h-6 w-6" />
    <span>View Analytics</span>
  </Button> */}

  <Button 
    variant="outline"
    className="h-24 flex flex-col items-center justify-center space-y-2"
    onClick={() => router.push('/dashboard/teacher/students')}
  >
    <Users className="h-6 w-6" />
    <span>Manage Students</span>
  </Button>
</div>
    </div>
  );
}