'use client';

import { useState, useRef } from 'react';
import { Sparkles, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useAiPrompt } from '@/hooks/useAiPrompt';
import { cn } from '@/lib/cn';
import { useUiStore } from '@/store/uiStore';

const EXAMPLE_PROMPTS = [
  'Add a 3-question quiz after the hero section',
  'Create an FAQ about pricing objections with 4 questions',
  'Add a testimonials section with 3 real-sounding customers',
  'Rewrite the hero headline to be more urgent and benefit-focused',
  'Add a countdown timer set for 7 days from now',
  'Add a compliance disclaimer at the bottom',
];

export function AIPromptBar() {
  const [prompt, setPrompt] = useState('');
  const { aiPanelExpanded, setAiPanelExpanded } = useUiStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiPrompt = useAiPrompt();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || aiPrompt.isPending) return;
    await aiPrompt.mutateAsync(prompt.trim());
    setPrompt('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-20">
      <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
        {/* Expanded: example prompts */}
        {aiPanelExpanded && (
          <div className="p-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLE_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPrompt(p); textareaRef.current?.focus(); }}
                  className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-2 p-3">
          <div className="flex items-center gap-2 shrink-0 text-brand-600">
            <Sparkles className="h-4 w-4" />
          </div>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to add or change… (Enter to send)"
            rows={1}
            className="flex-1 resize-none border-none outline-none text-sm text-gray-900 placeholder-gray-400 bg-transparent leading-5 max-h-32"
            style={{ height: 'auto', minHeight: '20px' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = `${Math.min(t.scrollHeight, 128)}px`;
            }}
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setAiPanelExpanded(!aiPanelExpanded)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
              title="Show examples"
            >
              {aiPanelExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || aiPrompt.isPending}
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-lg transition-colors',
                prompt.trim() && !aiPrompt.isPending
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              {aiPrompt.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
