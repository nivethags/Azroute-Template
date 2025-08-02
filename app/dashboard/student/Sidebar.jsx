"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Video,
  User2,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  MessageSquare,
  Clock
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch student data');
        }

        const data = await response.json();
        if (data.user && data.user.role === 'student') {
          setStudent({
            name: getFullName(data.user),
            email: data.user.email,
            avatar: data.user.profile?.avatar,
            initials: getInitials(data.user)
          });
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

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
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard/student'
    },
    {
      icon: BookOpen,
      label: 'My Learning',
      href: '/dashboard/student/courses'
    },
    // {
    //   icon: FileText,
    //   label: 'Assignments',
    //   href: '/dashboard/student/assignments'
    // },
    {
      icon: Calendar,
      label: 'Events',
      href: '/dashboard/student/events'
    },
    {
      icon: Video,
      label: 'Live Sessions',
      href: '/dashboard/student/livestreams'
    },
    // {
    //   icon: MessageSquare,
    //   label: 'Discussions',
    //   href: '/dashboard/student/discussions'
    // },
    // {
    //   icon: Clock,
    //   label: 'Schedule',
    //   href: '/dashboard/student/schedule'
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

      {/* User Profile Section */}
      <div className="p-4 border-t">
        <Link
          href="/dashboard/student/profile"
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
                {student?.avatar ? (
                  <img 
                    src={student.avatar} 
                    alt={student.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {student?.initials || ''}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {student?.name || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {student?.email || 'Loading...'}
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