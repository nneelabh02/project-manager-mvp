"use client";

// src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export default function RootLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/login');
  };

  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-50 text-gray-800">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden md:block">
          <div className="p-6 border-b border-gray-200 flex justify-center">
            <Image
              src="/kronix.png"
              alt="Kronix Logo"
              width={300}
              height={300}
              className="rounded-lg"
            />
          </div>

          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/recent"
                  className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Recent Activity</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/completed"
                  className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Completed Tasks</span>
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="h-16 border-b flex items-center justify-between px-4">
            <h1 className="text-lg font-semibold">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </header>

          <main className="p-4">{children}</main>
        </div>
      </body>
    </html>
  );
}
