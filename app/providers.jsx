// app/providers.jsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './components/Notifications/NotificationContext';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <NotificationProvider>
          {children}
          <Toaster />
        </NotificationProvider>
      </AuthProvider>
    </SessionProvider>
  );
}