<<<<<<< HEAD
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
=======

// File: app/(dashboard)/profile/page.js
"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileImage } from "@/components/profile/ProfileImage";
<<<<<<< HEAD
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { student } = useAuth(); // Get logged-in student
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!student) {
      router.push("/auth/student/login");
      return;
    }
    fetchProfileData();
  }, [student]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/student/profile", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) router.push("/auth/student/login");
        else throw new Error(`Failed to fetch profile data: ${res.status}`);
        return;
      }

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setProfile(data);
=======
import  ProfileEditForm  from "@/components/profile/ProfileEditForm";
import { EducationForm } from "@/components/profile/EducationForm";
import { SkillsManager } from "@/components/profile/SkillsManager";

export default function ProfilePage() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/student/profile', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      setStudent(data);
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
<<<<<<< HEAD
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setProfile(data);
=======
    console.log("handleprif")
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();
      setStudent(data);
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    } catch (err) {
      setError(err.message);
    }
  };

<<<<<<< HEAD
  if (loading)
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );

  if (error)
=======
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  if (error) {
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
<<<<<<< HEAD

  if (!profile) return null;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <ProfileImage user={profile} onUpdate={handleProfileUpdate} />
        <div>
          <h1 className="text-2xl font-bold">{profile.Student_name}</h1>
          <p className="text-muted-foreground">{profile.email}</p>
          <p className="text-sm">{profile.mobile || "No contact number"}</p>
        </div>
      </div>

      {/* Profile Edit Form */}
      <Card className="p-6">
        <ProfileEditForm user={profile} onSubmit={handleProfileUpdate} />
      </Card>
=======
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-6">
        <ProfileImage 
          user={student} 
          onUpdate={handleProfileUpdate}
        />
        <div>
          <h1 className="text-2xl font-bold">
            {student.firstName} {student.middleName} {student.lastName}
          </h1>
          <p className="text-muted-foreground">{student.email}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-6">
            <ProfileEditForm
              user={student}
              onSubmit={handleProfileUpdate}
            />
          </Card>
        </TabsContent>

        <TabsContent value="education">
  <Card className="p-6">
    <div className="space-y-6">
      {/* Render each EducationForm for existing entries */}
      {Array.isArray(student.profile.education) && student.profile.education.length > 0 ? (
        student.profile.education.map((edu, index) => (
          <EducationForm
            key={index}
            education={edu} // Pass the current education entry to the form
            onSubmit={(updatedEdu) => {
              const newEducation = [...student.profile.education];
              newEducation[index] = updatedEdu; // Update the education entry
              handleProfileUpdate({
                profile: {
                  ...student.profile,
                  education: newEducation // Set the updated education list
                }
              });
            }}
            onDelete={() => {
              const newEducation = student.profile.education.filter((_, i) => i !== index); // Delete the entry at this index
              handleProfileUpdate({
                profile: {
                  ...student.profile,
                  education: newEducation // Set the updated education list after deletion
                }
              });
            }}
          />
        ))
      ) : (
        <p>No education entries available.</p>
      )}

      {/* Add new Education Form (only rendered once at the end) */}
      <EducationForm
        onSubmit={(newEdu) => {
          handleProfileUpdate({
            profile: {
              ...student.profile,
              education: [...student.profile.education, newEdu] // Add the new education entry
            }
          });
        }}
      />
    </div>
  </Card>
</TabsContent>



        <TabsContent value="skills">
          <Card className="p-6">
            <SkillsManager
              skills={student.profile.skills}
              onUpdate={(skills) => {
                handleProfileUpdate({
                  profile: {
                    ...student.profile,
                    skills
                  }
                });
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Account Settings</h3>
              {/* Add account settings form here */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Email Preferences</h4>
                  {/* Add email preferences settings */}
                </div>
                <div>
                  <h4 className="font-medium">Privacy Settings</h4>
                  {/* Add privacy settings */}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
    </div>
  );
}
