'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Zap } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLogout } from '@/hooks/useAuth';
import type { User } from '@lp/shared';

interface SidebarProps {
  user: User;
}

const navItems = [
  { href: '/dashboard', label: 'Pages', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="flex h-full w-56 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">LP Platform</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t border-gray-200 p-3">
        <div className="mb-1 flex items-center gap-2.5 px-3 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.role.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
