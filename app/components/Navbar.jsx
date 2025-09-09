"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import {
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Globe,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { student, setStudent, loading } = useAuth(); // ✅ fixed
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return null; // or return a skeleton if you want
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/student/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setStudent(null); // ✅ fixed
        router.push("/");
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const categories = [
    { name: "Dentistry", href: "/explore?category=dentistry" },
    { name: "Medical", href: "/explore?category=medical" },
    { name: "Nursing", href: "/explore?category=nursing" },
  ];

  const getNavItems = () => {
    if (!student) return [];
    return student.role === "teacher"
      ? [{ label: "My Courses", icon: BookOpen, href: "/dashboard/teacher/courses" }]
      : [{ label: "My Learning", icon: BookOpen, href: "/dashboard/student" }];
  };

  const getUserFullName = () => student?.Student_name || "";
const getUserInitials = () => {
  if (student && student.Student_name) {
    const parts = student.Student_name.trim().split(/\s+/);
    return parts.map((p) => p[0].toUpperCase()).join("");
  }
  return "AZ";
};
  student?.Student_name
    ? student.Student_name.charAt(0).toUpperCase()
    : "A"; // fallback if no name

  const notifications = [
    { id: 1, icon: MessageSquare, text: "Welcome to Azroute! 🎉", href: "/dashboard" },
    { id: 2, icon: Calendar, text: "Your next class starts at 6:00 PM.", href: "/calendar" },
  ];

  const avatarRing = "ring-blue-600 ring-offset-2";
  const avatarFallbackBg = "text-white bg-[hsl(222.2,47.4%,11.2%)]";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={student ? `/dashboard/student` : "/"} className="flex items-center space-x-2">
          <img src="/Azroute.jpeg" alt="Azroute Logo" className="h-20 w-34 object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          

          <Button variant="ghost" asChild className="font-medium text-gray-700 hover:text-blue-600">
            <Link href="/explore" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" />
              Explore
            </Link>
          </Button>

          <Button variant="ghost" asChild className="font-medium text-gray-700 hover:text-blue-600">
            <Link href="/teachers" className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2" />
              Our Coaches
            </Link>
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {student ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-700 hover:text-blue-600"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-sm text-gray-500">No new notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <DropdownMenuItem key={n.id} asChild className="py-2">
                        <Link href={n.href} className="flex items-center">
                          <n.icon className="h-4 w-4 mr-3 text-gray-500" />
                          {n.text}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-gray-100/80"
                    aria-label="User menu"
                  >
                    <Avatar className={`h-8 w-8 ring ${avatarRing}`}>
                      <AvatarFallback className={avatarFallbackBg}>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserFullName()}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {getNavItems().map((item) => (
                    <DropdownMenuItem key={item.href} className="py-2" asChild>
                      <Link href={item.href} className="flex items-center w-full">
                        <item.icon className="h-4 w-4 mr-3 text-gray-500" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 py-2" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-3" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="font-medium text-gray-700 hover:text-blue-600"
                onClick={() => router.push("/auth/student/login")}
              >
                Log In
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => router.push("/auth/student/signup")}
              >
                Get Started
              </Button>
            </>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="pb-6">
                <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Azroute
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                {student ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`h-10 w-10 ring ${avatarRing}`}>
                        <AvatarFallback className={avatarFallbackBg}>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{getUserFullName()}</p>
                        <p className="text-sm text-gray-500 capitalize">{student.role}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {getNavItems().map((item) => (
                        <Button key={item.label} variant="ghost" className="w-full justify-start py-6" asChild>
                          <Link href={item.href}>
                            <item.icon className="h-5 w-5 mr-3 text-gray-500" />
                            {item.label}
                          </Link>
                        </Button>
                      ))}
                    </div>

                    <div className="border-t pt-6">
                      <Button variant="ghost" className="w-full justify-start text-red-600 py-6" onClick={handleLogout}>
                        <LogOut className="h-5 w-5 mr-3" />
                        Log Out
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <Link href="/explore" className="flex items-center py-3 text-gray-700 hover:text-blue-600">
                      <Globe className="h-5 w-5 mr-2" />
                      Explore
                    </Link>
                    <Link href="/teachers" className="flex items-center py-3 text-gray-700 hover:text-blue-600">
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Our Coaches
                    </Link>
                    <Button variant="outline" className="w-full py-6" onClick={() => router.push("/auth/student/login")}>
                      Log In
                    </Button>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6" onClick={() => router.push("/auth/student/signup")}>
                      Get Started
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
