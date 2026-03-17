'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEditorStore } from '@/store/editorStore';
import type { AiPromptResponse } from '@lp/shared';
import { useToast } from '@/components/ui/Toaster';

export function useAiPrompt() {
  const schema = useEditorStore((s) => s.schema);
  const pageId = useEditorStore((s) => s.pageId);
  const applyAiOperations = useEditorStore((s) => s.applyAiOperations);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (prompt: string) => {
      if (!schema || !pageId) throw new Error('No page loaded');
      return api.post<AiPromptResponse>('/ai/prompt', {
        prompt,
        pageId,
        currentSchema: schema,
      });
    },
    onSuccess: async (result) => {
      applyAiOperations(result.operations);

      // Tell the server that operations were applied
      await api.post(`/ai/prompt/${result.promptLogId}/applied`).catch(() => {});

      toast({
        title: 'AI edits applied',
        description: result.explanation,
        variant: 'success',
      });
    },
    onError: (err) => {
      toast({
        title: 'AI prompt failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'error',
      });
    },
  });

  return mutation;
}
