"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import {
  Bell, Menu, ChevronDown, LogOut, BookOpen, GraduationCap,
  PlusCircle, Globe, MessageSquare, Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import supabase from "@/lib/supabaseClient"; // ⬅️ default export singleton (see note above)

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null); // Supabase auth user
  const [role, setRole] = useState("student");          // "student" | "teacher"
  const [coachRow, setCoachRow] = useState(null);       // row from public.coach
  const router = useRouter();

  // ---- helpers ----
  const categories = [
    { name: "Dentistry", href: "/explore?category=dentistry" },
    { name: "Medical", href: "/explore?category=medical" },
    { name: "Nursing", href: "/explore?category=nursing" },
  ];

  const notifications = [
    { id: 1, icon: MessageSquare, text: "Welcome to Azroute! 🎉", href: "/dashboard" },
    { id: 2, icon: Calendar, text: "Your next class starts at 6:00 PM.", href: "/calendar" },
  ];

  const avatarRing = role === "student" ? "ring-blue-600 ring-offset-2" : "ring-gray-300 ring-offset-2";
  const avatarFallbackBg = "text-white bg-[hsl(222.2,47.4%,11.2%)]";

  const getNavItems = () =>
    role === "teacher"
      ? [{ label: "My Courses", icon: BookOpen, href: "/dashboard/teacher/courses" }]
      : [{ label: "My Learning", icon: BookOpen, href: "/dashboard/student" }];

  const user = useMemo(() => {
    if (!sessionUser) return null;
    const fullName =
      coachRow?.full_name ||
      sessionUser.user_metadata?.full_name ||
      sessionUser.email;

    const parts = String(fullName || "").trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";

    return {
      role,
      email: sessionUser.email,
      firstName,
      middleName,
      lastName,
      profile: { avatar: null },
    };
  }, [sessionUser, coachRow, role]);

  const getUserFullName = () => {
    if (!user) return "";
    const { firstName, middleName, lastName } = user;
    return [firstName, middleName, lastName].filter(Boolean).join(" ");
  };

  const getUserInitials = () => {
    if (!user) return "AZ";
    return [user.firstName, user.lastName].filter(Boolean).map(n => n[0]).join("").toUpperCase();
  };

  // ---- role resolution ----
  const fetchCoachByEmail = useCallback(async (email) => {
    const { data, error } = await supabase
      .from("coach")
      .select("id, full_name, email")
      .eq("email", String(email).toLowerCase())
      .maybeSingle();
    if (!error && data) {
      setCoachRow(data);
      setRole("teacher");
    } else {
      setCoachRow(null);
      setRole("student");
    }
  }, []);

  // Get current user from server cookies (works after server-side login)
  const hydrateFromServer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      const u = data?.user ?? null;
      setSessionUser(u);

      if (!u) {
        setCoachRow(null);
        setRole("student");
        return;
      }

      // Prefer metadata role first
      const metaRole = u.user_metadata?.role;
      if (metaRole === "coach") {
        setRole("teacher");
        setCoachRow((prev) => prev ?? null);
        return;
      }
      if (metaRole === "student") {
        setRole("student");
        setCoachRow(null);
        return;
      }

      // Fallback check in coach table
      await fetchCoachByEmail(u.email);
    } catch {
      setSessionUser(null);
      setCoachRow(null);
      setRole("student");
    }
  }, [fetchCoachByEmail]);

  // ---- effects ----
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll);

    (async () => {
      await hydrateFromServer(); // initial hydrate via server
      setLoading(false);
    })();

    // auth state subscription (for any client-driven sign-in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setSessionUser(u);
      if (!u) {
        setCoachRow(null);
        setRole("student");
      } else {
        const metaRole = u.user_metadata?.role;
        if (metaRole === "coach") {
          setRole("teacher");
          setCoachRow((prev) => prev ?? null);
        } else if (metaRole === "student") {
          setRole("student");
          setCoachRow(null);
        } else {
          await fetchCoachByEmail(u.email);
        }
      }
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      subscription?.unsubscribe();
    };
  }, [hydrateFromServer, fetchCoachByEmail]);

  // ---- logout ----
  async function handleLogout() {
    try {
      const endpoint = role === "teacher" ? "/api/auth/teacher/logout" : "/api/auth/student/logout";
      const res = await fetch(endpoint, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Logout failed");
      await supabase.auth.signOut().catch(() => {});
      setSessionUser(null);
      setCoachRow(null);
      setRole("student");
      router.push("/");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }

  // small loading guard to avoid UI flicker on first paint
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white">
        <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-100 rounded animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
            <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 bg-white ${isScrolled ? "shadow-sm" : ""}`}>
      <nav className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href={user ? `/dashboard/${user.role}` : "/"} className="flex items-center space-x-2">
          <img src="/Azroute.jpeg" alt="Azroute Logo" className="h-20 w-34 object-contain" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="font-medium text-gray-700 hover:text-blue-600" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {categories.map((c) => (
                <DropdownMenuItem key={c.name} className="py-2" asChild>
                  <Link href={c.href} className="w-full">{c.name}</Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="py-2" asChild>
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
            <Button variant="ghost" asChild className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
              <Link href="/auth/teacher/login">Coach on Azroute</Link>
            </Button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-600" aria-label="Notifications">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-100/80" aria-label="User menu">
                    <Avatar className={`h-8 w-8 ring ${avatarRing}`}>
                      {user.profile?.avatar ? (
                        <AvatarImage src={user.profile.avatar} alt={getUserFullName()} />
                      ) : (
                        <AvatarFallback className={avatarFallbackBg}>{getUserInitials()}</AvatarFallback>
                      )}
                    </Avatar>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{getUserFullName()}</p>
                      <p className="text-xs text-gray-500">{sessionUser?.email}</p>
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
              <Button variant="ghost" className="font-medium text-gray-700 hover:text-blue-600"
                onClick={() => router.push("/auth/student/login")}>
                Log In
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow-md hover:shadow-lg transition-all"
                onClick={() => router.push("/auth/student/signup")}>
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
                          <AvatarFallback className={avatarFallbackBg}>{getUserInitials()}</AvatarFallback>
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
