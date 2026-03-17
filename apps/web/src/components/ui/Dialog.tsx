'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

interface DialogContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function DialogContent({ children, title, description, className }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/50 animate-fade-in" />
      <RadixDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
          'rounded-xl bg-white shadow-xl border border-gray-200 p-6 animate-fade-in',
          className
        )}
      >
        {title && (
          <div className="flex items-start justify-between mb-4">
            <div>
              <RadixDialog.Title className="text-lg font-semibold text-gray-900">
                {title}
              </RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-1 text-sm text-gray-500">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close className="text-gray-400 hover:text-gray-600 mt-0.5">
              <X className="h-5 w-5" />
            </RadixDialog.Close>
          </div>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
