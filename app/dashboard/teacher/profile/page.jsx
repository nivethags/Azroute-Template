// app/dashboard/teacher/profile/page.jsx
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import ProfileHeader from "@/components/profile/ProfileHeader";  // Default import
import { ProfileTabs } from "@/components/profile/ProfileTabs";  // Named import


export default function TeacherProfilePage() {
  const [teacher, setTeacher] = useState(null);
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teacher/profile", { cache: "no-store" });
        if (res.status === 401) {
          router.replace("/auth/teacher/login?next=/dashboard/teacher/profile");
          return;
        }
        const data = await res.json();
        setTeacher(data);
      } catch (e) {
        console.error("Profile fetch error:", e);
        setErr("Failed to load profile");
      }
    })();
  }, [router]);

  if (err) return <div className="text-center mt-20 text-red-600">{err}</div>;
  if (!teacher) return <div className="text-center mt-20">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader user={teacher} isEditable={true} />
      <div className="py-8">
        <ProfileTabs user={teacher} isEditable={true} />
      </div>
    </div>
  );
}