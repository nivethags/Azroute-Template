// app/dashboard/teacher/courses/[courseId]/page.jsx
"use client";

import { useState, useEffect,use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { 
  ArrowLeft,
  Edit2,
  Trash2,
  Play,
  Users,
  Clock,
  FileText,
  BarChart2,
  MessageSquare,
  Star,
  Loader2,
  DollarSign
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default  function CourseDetails({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          router.push('/auth/teacher/login');
          return;
        }

        const data = await res.json();
        if (data.user?.role !== 'teacher') {
          router.push('/dashboard');
          return;
        }

        fetchCourseDetails();
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/teacher/login');
      }
    };

    if (courseId) {
      checkAuth();
    }
  }, [courseId, router]);

  const fetchCourseDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch course details');
      }
      
      const data = await response.json();
      
      if (!data) {
        throw new Error('No data received');
      }

      setCourse(data.course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load course details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCourse = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });

      router.push('/dashboard/teacher/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/teacher/courses', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update course status');
      }

      toast({
        title: "Success",
        description: `Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });

      fetchCourseDetails();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  const handleLessonClick = (sectionId, lessonId) => {
    router.push(`/learn/${course.id}/lessons/${lessonId}`);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Course not found</h2>
        <p className="text-muted-foreground mb-4">
          This course may have been deleted or you don't have access to it.
        </p>
        <Button onClick={() => router.push('/dashboard/teacher/courses')}>
          Return to Courses
        </Button>
      </div>
    );
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-start space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard/teacher/courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant={getStatusBadgeVariant(course.status)}>
              {(course.status ?? "unknown").charAt(0).toUpperCase() + (course.status ?? "unknown").slice(1)}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {course.enrollments} students
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {formatDuration(course.totalDuration)}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4 mr-1" />
                ${course.price}
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleStatusChange(
              course.status === 'published' ? 'draft' : 'published'
            )}
            disabled={actionLoading}
          >{console.log("pb",course)}
            {actionLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : course.status === 'published' ? (
              'Unpublish'
            ) : (
              'Publish'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/teacher/courses/${courseId}/edit`)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
            disabled={actionLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="students">Students ({course.enrollments})</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({course.reviews?.length || 0})</TabsTrigger>
          <TabsTrigger value="discussions">Discussions ({course.discussionsCount || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {course.sections?.map((section, index) => (
              <AccordionItem key={index} value={`section-${index}`}>
                <AccordionTrigger>
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center space-x-2">
                      <span>{section.title}</span>
                      <Badge variant="secondary">
                        {section.lessons?.length || 0} lessons
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDuration(
                        section.lessons?.reduce((acc, lesson) => acc + (lesson.duration || 0), 0) || 0
                      )}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {section.lessons?.map((lesson, lessonIndex) => (
                      <button 
                        key={lessonIndex}
                        onClick={() => handleLessonClick(section.id, lesson.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-lg cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <Play className="h-4 w-4 text-muted-foreground" />
                            <span>{lesson.title}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDuration(lesson.duration || 0)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Category</h4>
                <Badge variant="outline">{course.category}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Level</h4>
                <Badge>{course.level}</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Prerequisites</h4>
                <p className="text-sm text-muted-foreground">
                  {course.prerequisites || 'None'}
                </p>
              </div>
              {course.objectives?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Learning Objectives</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {course.objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Total Students</p>
                <div className="flex items-center mt-1">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-2xl font-bold">{course.enrollments}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Total Lessons</p>
                <div className="flex items-center mt-1">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-2xl font-bold">{course.totalLessons}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Average Rating</p>
                <div className="flex items-center mt-1">
                  <Star className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {course.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Discussions</p>
                <div className="flex items-center mt-1">
                  <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-2xl font-bold">{course.discussionsCount || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>


        <TabsContent value="students">
          {/* Student list and management component */}
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {course.students?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Student</th>
                          <th className="px-4 py-2 text-left">Enrolled On</th>
                          <th className="px-4 py-2 text-left">Progress</th>
                          <th className="px-4 py-2 text-left">Last Active</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {course.students.map((student) => (
                          <tr key={student._id} className="border-t">
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  {student.name[0]}
                                </div>
                                <div>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-sm text-muted-foreground">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {new Date(student.enrolledAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${student.progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm">{student.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {student.lastActive ? 
                                new Date(student.lastActive).toLocaleDateString() : 
                                'Never'
                              }
                            </td>
                            <td className="px-4 py-2">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-1">No Students Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Share your course link to start getting enrollments.
                    </p>
                    <Button variant="outline" onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/courses/${courseId}`);
                      toast({
                        title: "Link Copied",
                        description: "Course link copied to clipboard",
                      });
                    }}>
                      Copy Course Link
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {course.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {course.reviews.map((review) => (
                    <div key={review._id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {review.studentName[0]}
                          </div>
                          <div>
                            <div className="font-medium">{review.studentName}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">No Reviews Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Reviews will appear here once students start rating your course.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussions">
          <Card>
            <CardHeader>
              <CardTitle>Discussions</CardTitle>
            </CardHeader>
            <CardContent>
              {course.discussions?.length > 0 ? (
                <div className="space-y-4">
                  {course.discussions.map((discussion) => (
                    <div key={discussion._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {discussion.studentName[0]}
                          </div>
                          <div>
                            <div className="font-medium">{discussion.title}</div>
                            <div className="text-sm text-muted-foreground">
                              by {discussion.studentName} • {new Date(discussion.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {discussion.replies?.length || 0} replies
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {discussion.content}
                      </p>
                      <div className="mt-2">
                        <Button variant="ghost" size="sm">
                          View Discussion
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-1">No Discussions Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Discussions will appear here once students start conversations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Course Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course
              and remove all associated data including student enrollments and progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Course'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );}