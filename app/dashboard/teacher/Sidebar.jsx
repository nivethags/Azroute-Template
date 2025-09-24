"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book, Calendar, Layout, ChevronLeft, ChevronRight, MessageSquare,
  FileText, Video, Users, TrendingUp, ClipboardList,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import supabase from "@/lib/supabaseClient"; // ← singleton browser client

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null); // { name, email, avatar, initials }
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      try {
        // 1) Ask server who is logged in (reads sb-* HttpOnly cookies)
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const me = await meRes.json();
        const user = me?.user ?? null;
        if (!user?.email) {
          setTeacher(null);
          return;
        }

        // 2) Look up coach by email to decide if this is a teacher and get name
        const { data: coach, error } = await supabase
          .from("coach")
          .select("id, full_name, email")
          .eq("email", String(user.email).toLowerCase())
          .maybeSingle();

        if (error || !coach) {
          // Not a coach → don’t render teacher card
          setTeacher(null);
          return;
        }

        const fullName = coach.full_name || user.email;
        const initials = fullName
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((p) => p[0]?.toUpperCase() ?? "")
          .slice(0, 2)
          .join("");

        setTeacher({
          name: fullName,
          email: coach.email,
          avatar: null, // set if you have an avatar column
          initials,
        });
      } catch (e) {
        console.error(e);
        setTeacher(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const menuItems = [
    { icon: Layout, label: "Dashboard", href: "/dashboard/teacher" },
    { icon: Book, label: "My Courses", href: "/dashboard/teacher/courses" },
    { icon: Users, label: "Students", href: "/dashboard/teacher/students" },
    { icon: TrendingUp, label: "Progress", href: "/dashboard/teacher/progress" },
    { icon: ClipboardList, label: "Assessments", href: "/dashboard/teacher/assessment" },
    { icon: Calendar, label: "Events", href: "/dashboard/teacher/events" },
    { icon: MessageSquare, label: "Live Classes", href: "/dashboard/teacher/livestreams" },
    { icon: FileText, label: "Add Marks", href: "/dashboard/teacher/marks" },
    { icon: Video, label: "Demo Class", href: "/dashboard/teacher/demo-class" },
  ];

  const activeCls = (href) =>
    pathname === href ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100";

  return (
    <div className={`relative min-h-screen bg-white border-r shadow-sm transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border rounded-full p-1.5 shadow-md hover:bg-gray-50"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
      </button>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${activeCls(href)}`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-white" : "text-gray-500"}`} />
                  {!isCollapsed && <span className="ml-3">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Link href="/dashboard/teacher/profile" className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100">
          {loading ? (
            <>
              <Skeleton className="w-8 h-8 rounded-full" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              )}
            </>
          ) : teacher ? (
            <>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                {teacher.avatar ? (
                  <img src={teacher.avatar} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-white">{teacher.initials}</span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{teacher.name}</p>
                  <p className="text-xs text-gray-500 truncate">{teacher.email}</p>
                </div>
              )}
            </>
          ) : (
            // Not a teacher (or not logged in): render nothing or a placeholder
            <>
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-500 truncate">Not a coach</p>
                  <p className="text-xs text-gray-400 truncate">—</p>
                </div>
              )}
            </>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
