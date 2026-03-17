'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { api } from '@/lib/api';
import type { Page } from '@lp/shared';

const AUTOSAVE_DELAY = 2000; // 2 seconds after last change

export function useSave() {
  const { schema, pageId, pageTitle, pageSlug, isDirty, setIsSaving, setSaveError } =
    useEditorStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    if (!pageId || !schema) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await api.patch<Page>(`/pages/${pageId}`, {
        title: pageTitle,
        slug: pageSlug,
        schema,
      });
      useEditorStore.setState({ isDirty: false });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  }, [pageId, schema, pageTitle, pageSlug, setIsSaving, setSaveError]);

  // Autosave whenever isDirty changes
  useEffect(() => {
    if (!isDirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, AUTOSAVE_DELAY);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isDirty, schema, save]);

  return { save };
}
