'use client';

import { useVersions, useRestoreVersion } from '@/hooks/usePages';
import { X, RotateCcw } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

interface VersionHistoryProps {
  pageId: string;
  onClose: () => void;
}

export function VersionHistory({ pageId, onClose }: VersionHistoryProps) {
  const { data: versions, isLoading } = useVersions(pageId);
  const restore = useRestoreVersion();

  return (
    <div className="absolute right-0 top-12 z-30 h-[calc(100vh-48px)] w-72 border-l border-gray-200 bg-white shadow-lg overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Version History</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {versions?.map((v, idx) => (
            <li key={v.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    v{v.version}
                    {idx === 0 && <span className="ml-1.5 text-xs text-brand-600">Current</span>}
                  </p>
                  {v.message && (
                    <p className="text-xs text-gray-500 mt-0.5">{v.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {v.author.name} · {new Date(v.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {idx > 0 && (
                  <button
                    onClick={() => restore.mutate({ pageId, versionId: v.id })}
                    disabled={restore.isPending}
                    className="shrink-0 text-xs btn-secondary py-1 px-2 gap-1"
                    title="Restore this version"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
