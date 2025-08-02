"use client"
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Check, X, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";

export default function AssignmentSubmissions() {
  const params = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignment();
  }, [params.id]);

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/teacher/assignments/${params.id}/submissions`);
      if (!res.ok) throw new Error('Failed to fetch assignment');
      const data = await res.json();
      setAssignment(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = async (submissionId, grade, feedback) => {
    try {
      const res = await fetch(`/api/teacher/assignments/${params.id}/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grade, feedback }),
      });

      if (!res.ok) throw new Error('Failed to update grade');
      
      await fetchAssignment();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">Assignment not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">{assignment.title}</h2>
          <p className="text-muted-foreground">
            Course: {assignment.course?.title}
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back to Assignments
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>{assignment.description}</p>
            <div className="flex space-x-4 text-sm text-muted-foreground">
              <div>Due: {new Date(assignment.dueDate).toLocaleString()}</div>
              <div>Points: {assignment.points}</div>
              <div>Submissions: {assignment.submissions?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            <TableBody>
              {assignment.submissions?.map((submission) => (
                <TableRow key={submission._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{submission.student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {submission.student.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(submission.submittedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {submission.submittedAt > assignment.dueDate ? (
                      <span className="text-yellow-500">Late</span>
                    ) : (
                      <span className="text-green-500">On Time</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="w-20"
                      value={submission.grade || ''}
                      onChange={(e) => 
                        updateGrade(
                          submission._id,
                          parseInt(e.target.value),
                          submission.feedback
                        )
                      }
                      min="0"
                      max={assignment.points}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(submission.submissionUrl)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const feedback = prompt('Enter feedback:', submission.feedback);
                          if (feedback !== null) {
                            updateGrade(submission._id, submission.grade, feedback);
                          }
                        }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}