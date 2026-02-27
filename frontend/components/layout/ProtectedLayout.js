'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import WeatherHeader from './WeatherHeader';
import Sidebar from './Sidebar';

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tea-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tea-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-tea-600 text-sm">Loading SDM Tea Group...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <WeatherHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-tea-50">
          {children}
        </main>
      </div>
    </div>
  );
}
