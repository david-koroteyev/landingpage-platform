'use client';

import { useEffect } from 'react';
import { usePage } from '@/hooks/usePages';
import { useEditorStore } from '@/store/editorStore';
import { EditorShell } from '@/components/editor/EditorShell';
import { Spinner } from '@/components/ui/Spinner';
import type { PageSchema } from '@lp/shared';

export default function EditorPage({ params }: { params: { pageId: string } }) {
  const { data: page, isLoading, isError } = usePage(params.pageId);
  const initEditor = useEditorStore((s) => s.initEditor);

  useEffect(() => {
    if (page) {
      initEditor(page.id, page.title, page.slug, page.schema as unknown as PageSchema);
    }
  }, [page, initEditor]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-8 w-8 text-brand-600" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Page not found.</p>
      </div>
    );
  }

  return <EditorShell />;
}
