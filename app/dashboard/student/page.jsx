// app/dashboard/student/page.jsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Book,
  Clock,
  Medal,
  Target,
  Calendar,
  TrendingUp,
  Loader2,
  ChevronRight,
  PlayCircle,
  CheckCircle,
  
} from "lucide-react";

function LearningOverview({ stats }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Book className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Courses Enrolled</h3>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{stats?.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeCourses} active courses
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Learning Time</h3>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{Math.round(stats?.totalHours)}h</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Medal className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Certificates</h3>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{stats?.completedCourses}</div>
            <p className="text-xs text-muted-foreground">
              Courses completed
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Average Progress</h3>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold">{Math.round(stats?.averageProgress)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActiveCourses({ courses, onContinue }) {
  const router = useRouter();
  
  if (!courses.length) {
    return (
      <div className="text-center py-12">
        <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Active Courses</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Start learning by enrolling in a course
        </p>
        <Button onClick={() => router.push('/courses')}>
          Browse Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <div className="aspect-video relative">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button onClick={() => onContinue(course.id)}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {course.teacher ? 
                        `${course.teacher.firstName} ${course.teacher.lastName}` : 
                        'Unknown Teacher'}
                    </p>
                    {course.teacher?.department && (
                      <Badge variant="secondary" className="text-xs">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {course.teacher.department}
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant={course.progress === 100 ? "success" : "secondary"}>
                  {course.progress}% Complete
                </Badge>
              </div>
              <Progress value={course.progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {course.completedLessons} / {course.totalLessons} lessons
                </span>
                <span>
                  {Math.ceil(course.remainingTime / 60)} hours left
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Certificates({ certificates }) {
  if (!certificates.length) {
    return (
      <div className="text-center py-12">
        <Medal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">No Certificates Yet</h3>
        <p className="text-sm text-muted-foreground">
          Complete a course to earn your first certificate
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {certificates.map((cert) => (
        <Card key={cert.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div>
                  <Badge className="mb-2">Certificate</Badge>
                  <h3 className="font-semibold mb-1">{cert.courseTitle}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Completed on {new Date(cert.completedAt).toLocaleDateString()}</span>
                    {cert.metadata?.teacher && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {`${cert.metadata.teacher.firstName} ${cert.metadata.teacher.lastName}`}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                {cert.metadata?.teacher?.department && (
                  <Badge variant="outline">
                    {cert.metadata.teacher.department}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => window.open(cert.url, '_blank')}
                >
                  View Certificate
                </Button>
              </div>
              <Medal className="h-12 w-12 text-primary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LearningGoals({ goals, onUpdateGoal }) {
  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <Card key={goal.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  goal.completed ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {goal.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Target className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Due {new Date(goal.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Progress 
                value={goal.progress} 
                className="w-24 h-2"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeCourses, setActiveCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursesRes, certificatesRes, goalsRes] = await Promise.all([
        fetch('/api/student/stats'),
        fetch('/api/student/courses/active'),
        fetch('/api/student/certificates'),
        fetch('/api/student/goals')
      ]);

      const [statsData, coursesData, certificatesData, goalsData] = await Promise.all([
        statsRes.json(),
        coursesRes.json(),
        certificatesRes.json(),
        goalsRes.json()
      ]);

      // Process courses data to ensure consistent teacher information
      const processedCourses = coursesData.courses.map(course => ({
        ...course,
        teacher: course.teacher || {
          firstName: course.instructorName?.split(' ')[0] || '',
          lastName: course.instructorName?.split(' ').slice(1).join(' ') || '',
          department: course.instructorDepartment
        }
      }));

      setStats(statsData);
      setActiveCourses(processedCourses);
      setCertificates(certificatesData.certificates);
      setGoals(goalsData.goals);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleContinueLearning = (courseId) => {
    router.push(`/learn/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your learning progress
          </p>
        </div>
        <Button onClick={() => router.push('/courses')}>
          Browse Courses
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="space-y-8">
        {/* Learning Overview */}
        <LearningOverview stats={stats} />

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">
              <Book className="h-4 w-4 mr-2" />
              Active Courses
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Medal className="h-4 w-4 mr-2" />
              Certificates
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              Learning Goals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <ActiveCourses
              courses={activeCourses}
              onContinue={handleContinueLearning}
            />
          </TabsContent>

          <TabsContent value="certificates">
            <Certificates certificates={certificates} />
          </TabsContent>

          <TabsContent value="goals">
            <LearningGoals
              goals={goals}
              onUpdateGoal={(goalId, updates) => {
                // Handle goal updates
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}