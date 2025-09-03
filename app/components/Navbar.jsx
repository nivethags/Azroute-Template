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
  Search,
  Globe,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    checkAuth();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check", { credentials: "include" });
      const data = await response.json();
      const role = data.user?.role || "student";
      if (response.ok) {
        if (data.code === "TOKEN_EXPIRED") {
          await handleLogout();
          router.push(`/auth/${role}/login`);
        }
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const role = user?.role || "student";
      const response = await fetch(`/api/auth/${role}/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
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
    if (user?.role === "teacher") {
      return [{ label: "My Courses", icon: BookOpen, href: "/dashboard/teacher/courses" }];
    }
    return [{ label: "My Learning", icon: BookOpen, href: "/dashboard/student" }];
  };

  const getUserFullName = () => {
    if (!user) return "";
    const { firstName, middleName, lastName } = user;
    return [firstName, middleName, lastName].filter(Boolean).join(" ");
  };

  const getUserInitials = () => {
    if (!user) return "AZ";
    return [user.firstName, user.lastName]
      .filter(Boolean)
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  // Messages shown when clicking the bell
  const notifications = [
    { id: 1, icon: MessageSquare, text: "Welcome to Azroute! 🎉", href: "/dashboard" },
    { id: 2, icon: Calendar, text: "Your next class starts at 6:00 PM.", href: "/calendar" },
  ];

  // Styling for avatar
  const avatarRing =
    user?.role === "student" ? "ring-blue-600 ring-offset-2" : "ring-gray-300 ring-offset-2";
  const avatarFallbackBg = "text-white bg-[hsl(222.2,47.4%,11.2%)]";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? `/dashboard/${user.role}` : "/"} className="flex items-center space-x-2">
          <img src="/Azroute.jpeg" alt="Azroute Logo" className="h-20 w-34 object-contain" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Clickable "search bar" that routes to dashboard search */}
        
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-medium text-gray-700 hover:text-blue-600">
                {/* minimal trigger per your layout */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {categories.map((category) => (
                <DropdownMenuItem key={category.name} className="py-2">
                  <Link href={category.href} className="w-full">
                    {category.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2">
                <Link href="/request-category" className="flex items-center w-full text-blue-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Request New Category
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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

          {!user && (
            <Button
              variant="ghost"
              asChild
              className="font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Link href="/auth/teacher/login">Coach on Azroute</Link>
            </Button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Mobile search icon → dashboard search or explore */}
          

          {user ? (
            <>
              {/* Bell icon WITHOUT numeric badge; opens a message dropdown */}
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
                      {user.profile?.avatar ? (
                        <AvatarImage src={user.profile.avatar} alt={getUserFullName()} />
                      ) : (
                        <AvatarFallback className={avatarFallbackBg}>
                          {getUserInitials()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserFullName()}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
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
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className={`h-10 w-10 ring ${avatarRing}`}>
                        {user.profile?.avatar ? (
                          <AvatarImage src={user.profile.avatar} alt={getUserFullName()} />
                        ) : (
                          <AvatarFallback className={avatarFallbackBg}>
                            {getUserInitials()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{getUserFullName()}</p>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full justify-start py-6" asChild>
                      <Link href="/explore" className="flex items-center">
                        <Globe className="h-5 w-5 mr-3 text-gray-500" />
                        Explore
                      </Link>
                    </Button>

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
                    <div className="space-y-2">
                      <Link href="/explore" className="flex items-center py-3 text-gray-700 hover:text-blue-600">
                        <Globe className="h-5 w-5 mr-2" />
                        Explore
                      </Link>
                      <Link href="/teachers" className="flex items-center py-3 text-gray-700 hover:text-blue-600">
                        <GraduationCap className="h-5 w-5 mr-2" />
                        Our Coaches
                      </Link>
                      <Link href="/auth/teacher/login" className="block py-3 text-gray-700 hover:text-blue-600">
                        Coach on Azroute
                      </Link>
                    </div>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full py-6" onClick={() => router.push("/auth/student/login")}>
                        Log In
                      </Button>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 py-6" onClick={() => router.push("/auth/student/signup")}>
                        Get Started
                      </Button>
                    </div>
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
