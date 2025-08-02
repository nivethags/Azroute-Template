// app/dashboard/student/progress/page.jsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Trophy,
  Star,
  Target,
  BarChart,
  Calendar,
} from "lucide-react";
import { ProgressChart } from "@/components/dashboard/student/ProgressChart";
import { CourseProgress } from "@/components/dashboard/student/CourseProgress";
import { Achievements } from "@/components/dashboard/student/Achievements";

export default function StudentProgressPage() {
  const stats = {
    coursesCompleted: 5,
    coursesInProgress: 3,
    totalHours: 45,
    averageScore: 88,
    streak: 15,
    certificates: 3,
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Learning Progress</h2>
        <p className="text-muted-foreground">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Course Progress
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.coursesInProgress} Active
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.coursesCompleted} courses completed
            </p>
            <Progress
              value={(stats.coursesCompleted / (stats.coursesCompleted + stats.coursesInProgress)) * 100}
              className="mt-3"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total learning hours
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="secondary">{stats.streak} day streak</Badge>
              <Badge variant="outline">Top 10%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Achievements
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">
              Certificates earned
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" className="w-full">
                View Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ProgressChart />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CourseProgress />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Achievements />
        </TabsContent>
      </Tabs>
    </div>
  );
}

