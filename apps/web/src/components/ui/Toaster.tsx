'use client';

import { create } from 'zustand';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'success' | 'error' | 'info';
}

interface ToastStore {
  toasts: Toast[];
  toast: (t: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  toast: (t) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-3 rounded-lg border bg-white p-4 shadow-lg animate-slide-in-from-bottom',
            t.variant === 'error' && 'border-red-200',
            t.variant === 'success' && 'border-green-200',
          )}
        >
          {icons[t.variant ?? 'info']}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
