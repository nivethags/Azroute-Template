"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Book,
  Calendar,
  Video,
  Upload,
  Settings,
  Layout,
  ChevronLeft,
  ChevronRight,
  User2,
  GraduationCap,
  MessageSquare,
  BarChart
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.role === 'teacher') {
          setTeacher({
            name: getFullName(data.user),
            email: data.user.email,
            avatar: data.user.profile?.avatar,
            initials: getInitials(data.user)
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (user) => {
    if (!user) return '';
    return [user.firstName, user.middleName, user.lastName]
      .filter(Boolean)
      .join(' ');
  };

  const getInitials = (user) => {
    if (!user) return '';
    return [user.firstName, user.lastName]
      .filter(Boolean)
      .map(name => name?.[0] || '')
      .join('')
      .toUpperCase();
  };

  const menuItems = [
    { 
      icon: Layout, 
      label: 'Dashboard', 
      href: '/dashboard/teacher' 
    },
    { 
      icon: Book, 
      label: 'My Courses', 
      href: '/dashboard/teacher/courses' 
    },
    // { 
    //   icon: GraduationCap, 
    //   label: 'Students', 
    //   href: '/dashboard/teacher/students' 
    // },
    { 
      icon: Calendar, 
      label: 'Events', 
      href: '/dashboard/teacher/events' 
    },
    { 
      icon: MessageSquare, 
      label: 'Live Classes', 
      href: '/dashboard/teacher/livestreams' 
    },
    // { 
    //   icon: BarChart, 
    //   label: 'Earnings', 
    //   href: '/dashboard/teacher/earnings' 
    // },
    // { 
    //   icon: Upload, 
    //   label: 'Upload Course', 
    //   href: '/dashboard/teacher/courses/upload' 
    // }
  ];

  return (
    <div 
      className={`relative min-h-screen bg-white border-r shadow-sm transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-white border rounded-full p-1.5 shadow-md hover:bg-gray-50"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Teacher Profile Section */}
      <div className="p-4 border-t">
        <Link
          href="/dashboard/teacher/profile"
          className="flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gray-100"
        >
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
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                {teacher?.avatar ? (
                  <img 
                    src={teacher.avatar} 
                    alt={teacher.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {teacher?.initials || ''}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {teacher?.name || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {teacher?.email || 'Loading...'}
                  </p>
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