'use client';

import { useMe } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isError) {
      router.push('/login');
    }
  }, [isLoading, isError, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-brand-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
