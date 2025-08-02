// app/auth/layout.js

export const metadata = {
  title: {
    default: 'Authentication - ConnectEd',
    template: '%s | ConnectEd',
  },
  description: 'Authentication pages for ConnectEd learning platform',
};

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "../components/Navbar";

export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}