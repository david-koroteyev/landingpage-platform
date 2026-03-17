'use client';

import Link from 'next/link';
import {
  ArrowLeft, Save, Eye, History, Globe, Copy, Undo2, Redo2,
  PanelLeft, PanelRight, Loader2, Check, AlertCircle
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';
import { usePublish, useUnpublish } from '@/hooks/usePages';
import { useSave } from '@/hooks/useSave';
import { cn } from '@/lib/cn';
import { useState } from 'react';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/Dialog';
import { VersionHistory } from './VersionHistory';

export function EditorToolbar() {
  const {
    pageTitle, pageId, isDirty, isSaving, saveError,
    historyIndex, history, undo, redo, setPageTitle,
  } = useEditorStore();
  const { sidebarOpen, setSidebar, propertiesPanelOpen, setPropertiesPanel, versionHistoryOpen, setVersionHistory } = useUiStore();
  const { save } = useSave();
  const publish = usePublish();
  const unpublish = useUnpublish();
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  const saveStatus = isSaving ? 'saving' : isDirty ? 'unsaved' : saveError ? 'error' : 'saved';

  return (
    <>
      <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 shrink-0">
        {/* Left */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="btn-ghost px-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
          <div className="w-px h-5 bg-gray-200" />
          <button onClick={() => setSidebar(!sidebarOpen)} className={cn('btn-ghost px-2', sidebarOpen && 'bg-gray-100')}>
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Center: title + save status */}
        <div className="flex items-center gap-3">
          <input
            className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-1 focus:ring-brand-500 rounded px-2 py-0.5 text-center min-w-40"
            value={pageTitle}
            onChange={(e) => setPageTitle(e.target.value)}
          />
          <div className="flex items-center gap-1 text-xs">
            {saveStatus === 'saving' && <><Loader2 className="h-3 w-3 animate-spin text-gray-400" /><span className="text-gray-400">Saving…</span></>}
            {saveStatus === 'saved' && <><Check className="h-3 w-3 text-green-500" /><span className="text-green-600">Saved</span></>}
            {saveStatus === 'unsaved' && <span className="text-amber-600">Unsaved changes</span>}
            {saveStatus === 'error' && <><AlertCircle className="h-3 w-3 text-red-500" /><span className="text-red-500">Save failed</span></>}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="btn-ghost px-2 disabled:opacity-30"
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="btn-ghost px-2 disabled:opacity-30"
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setVersionHistory(!versionHistoryOpen)} className="btn-ghost gap-1.5">
            <History className="h-4 w-4" /> History
          </button>
          <Link href={pageId ? `/p/preview?id=${pageId}` : '#'} target="_blank" className="btn-ghost gap-1.5">
            <Eye className="h-4 w-4" /> Preview
          </Link>
          <button onClick={() => save()} disabled={isSaving} className="btn-secondary gap-1.5">
            <Save className="h-4 w-4" /> Save
          </button>
          <button
            onClick={() => setPublishDialogOpen(true)}
            className="btn-primary gap-1.5"
          >
            <Globe className="h-4 w-4" /> Publish
          </button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setPropertiesPanel(!propertiesPanelOpen)} className={cn('btn-ghost px-2', propertiesPanelOpen && 'bg-gray-100')}>
            <PanelRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Version History drawer */}
      {versionHistoryOpen && pageId && (
        <VersionHistory pageId={pageId} onClose={() => setVersionHistory(false)} />
      )}

      {/* Publish dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent title="Publish Page" description="Make this page live at the published URL.">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Publishing will make the current version of this page publicly accessible.
            </p>
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <button className="btn-secondary">Cancel</button>
              </DialogClose>
              <button
                className="btn-primary"
                disabled={publish.isPending}
                onClick={async () => {
                  if (!pageId) return;
                  await publish.mutateAsync({ pageId });
                  setPublishDialogOpen(false);
                }}
              >
                {publish.isPending ? 'Publishing…' : 'Publish Now'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
