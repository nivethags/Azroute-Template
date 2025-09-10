"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileImage } from "@/components/profile/ProfileImage";
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData) => {
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
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-[400px]" />
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );

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
    </div>
  );
}
