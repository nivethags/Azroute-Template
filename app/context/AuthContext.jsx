'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // your Supabase client
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch student profile from your API
  const fetchStudent = async () => {
    try {
      const res = await fetch('/api/student/profile', { credentials: 'include' });
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
    // Supabase session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchStudent(); // fetch full student data from your API
      } else {
        setStudent(null);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchStudent();
      } else {
        setStudent(null);
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ student, setStudent, loading, fetchStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
