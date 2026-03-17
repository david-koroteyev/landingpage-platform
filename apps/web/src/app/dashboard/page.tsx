'use client';

import { useState } from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import { usePages, useCreatePage, useDuplicatePage, useArchivePage, useImportUrl } from '@/hooks/usePages';
import { PageCard } from '@/components/dashboard/PageCard';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/Dialog';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export default function DashboardPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = usePages({
    search: debouncedSearch,
    status: status || undefined,
  });

  const createPage = useCreatePage();
  const duplicatePage = useDuplicatePage();
  const archivePage = useArchivePage();
  const importUrl = useImportUrl();

  // Create page dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCampaign, setNewCampaign] = useState('');

  // Import dialog state
  const [importOpen, setImportOpen] = useState(false);
  const [importUrlValue, setImportUrlValue] = useState('');
  const [importTitle, setImportTitle] = useState('');

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout((window as Record<string, unknown>)._searchTimer as ReturnType<typeof setTimeout>);
    (window as Record<string, unknown>)._searchTimer = setTimeout(() => setDebouncedSearch(value), 300);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} total pages
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Import */}
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <button className="btn-secondary gap-1.5">
                <Upload className="h-4 w-4" />
                Import URL
              </button>
            </DialogTrigger>
            <DialogContent title="Import from URL" description="Fetch an existing landing page and convert it into an editable page. Only import pages you are authorized to copy.">
              <div className="space-y-4">
                <div>
                  <label className="label">Page URL *</label>
                  <input
                    className="input"
                    placeholder="https://example.com/landing-page"
                    value={importUrlValue}
                    onChange={(e) => setImportUrlValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Page title (optional)</label>
                  <input
                    className="input"
                    placeholder="My Imported Page"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <button className="btn-secondary">Cancel</button>
                  </DialogClose>
                  <button
                    className="btn-primary"
                    disabled={!importUrlValue || importUrl.isPending}
                    onClick={async () => {
                      await importUrl.mutateAsync({ url: importUrlValue, title: importTitle || undefined });
                      setImportOpen(false);
                      setImportUrlValue('');
                      setImportTitle('');
                    }}
                  >
                    {importUrl.isPending ? <><Spinner className="mr-2" />Importing...</> : 'Import Page'}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Create */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="btn-primary gap-1.5">
                <Plus className="h-4 w-4" />
                New Page
              </button>
            </DialogTrigger>
            <DialogContent title="Create New Page">
              <div className="space-y-4">
                <div>
                  <label className="label">Page Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Weight Loss Offer Q3"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label">Campaign (optional)</label>
                  <input
                    className="input"
                    placeholder="e.g. Summer Campaign 2024"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <DialogClose asChild>
                    <button className="btn-secondary">Cancel</button>
                  </DialogClose>
                  <button
                    className="btn-primary"
                    disabled={!newTitle.trim() || createPage.isPending}
                    onClick={async () => {
                      await createPage.mutateAsync({
                        title: newTitle.trim(),
                        campaign: newCampaign.trim() || undefined,
                      });
                      setCreateOpen(false);
                      setNewTitle('');
                      setNewCampaign('');
                    }}
                  >
                    {createPage.isPending ? <><Spinner className="mr-2" />Creating...</> : 'Create & Open Editor'}
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search pages..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                status === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8 text-brand-600" />
        </div>
      ) : !data?.pages.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900">No pages yet</h3>
          <p className="text-gray-500 mt-1 max-w-sm">
            Create your first landing page or import one from an existing URL.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.pages.map((page) => (
            <PageCard
              key={page.id}
              page={page}
              onDuplicate={() => duplicatePage.mutate(page.id)}
              onArchive={() => {
                if (confirm(`Archive "${page.title}"?`)) archivePage.mutate(page.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
