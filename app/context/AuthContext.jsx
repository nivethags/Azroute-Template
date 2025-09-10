// context/AuthContext.jsx
<<<<<<< HEAD
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged-in user from API
  const fetchStudent = async () => {
    try {
      const res = await fetch("/api/student/profile", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
      } else {
        setStudent(null);
      }
    } catch (err) {
      setStudent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <AuthContext.Provider value={{ student, setStudent, loading, fetchStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
=======
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
  }, [session]);

  const value = {
    user,
    loading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
>>>>>>> 7f49367b755124f43e41b029e14312711e8732aa
