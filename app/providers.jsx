// app/providers.jsx
'use client';

import { AuthProvider } from './context/AuthContext';
// ✅ use relative path from /app/providers.jsx → /app/components/Notifications/NotificationContext
import { NotificationProvider } from './components/Notifications/NotificationContext';
import { Toaster } from 'sonner';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        {children}
        <Toaster />
      </NotificationProvider>
    </AuthProvider>
  );
}
