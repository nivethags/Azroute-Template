// app/layout.jsx
import './globals.scss';
import { Inter } from 'next/font/google';
import { cn } from './lib/utils';
import Providers from "./providers";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ConnectEd Learning Platform',
  description: 'Transform your future with expert-led learning',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn(
        inter.className,
        "min-h-screen bg-background antialiased"
      )}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}