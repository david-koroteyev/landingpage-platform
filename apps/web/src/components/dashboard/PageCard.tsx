'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit2, Copy, Archive, ExternalLink } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Badge } from '@/components/ui/Badge';
import type { Page } from '@lp/shared';
import { cn } from '@/lib/cn';

interface PageCardProps {
  page: Page;
  onDuplicate: () => void;
  onArchive: () => void;
}

export function PageCard({ page, onDuplicate, onArchive }: PageCardProps) {
  const status = page.status.toLowerCase() as 'draft' | 'published' | 'archived';
  const updatedAt = new Date(page.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="card group flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail placeholder */}
      <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <span className="text-4xl opacity-30">📄</span>
        <div className="absolute top-2 right-2">
          <Badge variant={status}>{page.status}</Badge>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{page.title}</h3>
            {page.campaign && (
              <p className="text-xs text-gray-500 mt-0.5 truncate">{page.campaign}</p>
            )}
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="shrink-0 rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                sideOffset={4}
                align="end"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/editor/${page.id}`}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
                  onSelect={onDuplicate}
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </DropdownMenu.Item>
                {page.status === 'PUBLISHED' && (
                  <DropdownMenu.Item asChild>
                    <a
                      href={`/p/${page.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Live
                    </a>
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Separator className="my-1 border-t border-gray-100" />
                <DropdownMenu.Item
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
                  onSelect={onArchive}
                >
                  <Archive className="h-3.5 w-3.5" /> Archive
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">Updated {updatedAt}</span>
          <Link
            href={`/editor/${page.id}`}
            className="text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
}
