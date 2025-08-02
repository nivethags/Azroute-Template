// app/dashboard/teacher/profile/page.jsx
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

const teacherData = {
  id: 1,
  name: "Dr. Sarah Johnson",
  role: "teacher",
  email: "sarah.j@connected.edu",
  avatar: "/avatars/sarah.jpg",
  initials: "SJ",
  location: "New York, USA",
  website: "https://sarahjohnson.edu",
  bio: "Passionate educator with over 10 years of experience in web development and computer science. Dedicated to helping students master modern technologies.",
  skills: ["Web Development", "React", "Node.js", "Python", "Database Design"],
};

export default function TeacherProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader user={teacherData} isEditable={true} />
      <div className="py-8">
        <ProfileTabs user={teacherData} isEditable={true} />
      </div>
    </div>
  );
}