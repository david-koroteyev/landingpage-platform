'use client';

import { EditorToolbar } from './EditorToolbar';
import { BlockLibrary } from './BlockLibrary';
import { EditorCanvas } from './EditorCanvas';
import { BlockInspector } from './BlockInspector';
import { AIPromptBar } from './AIPromptBar';
import { useUiStore } from '@/store/uiStore';
import { useSave } from '@/hooks/useSave';

export function EditorShell() {
  const { sidebarOpen, propertiesPanelOpen } = useUiStore();
  useSave(); // wire up autosave

  return (
    <div className="flex h-screen flex-col bg-gray-100 overflow-hidden">
      <EditorToolbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Block library */}
        {sidebarOpen && (
          <div className="w-60 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
            <BlockLibrary />
          </div>
        )}

        {/* Center: Canvas */}
        <div className="flex-1 overflow-auto relative">
          <EditorCanvas />
          <AIPromptBar />
        </div>

        {/* Right: Properties */}
        {propertiesPanelOpen && (
          <div className="w-72 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
            <BlockInspector />
          </div>
        )}
      </div>
    </div>
  );
}
