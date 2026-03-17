'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Page } from '@lp/shared';
import { useRouter } from 'next/navigation';

interface PageListResult {
  pages: Page[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PageFilters {
  status?: string;
  campaign?: string;
  search?: string;
  brandId?: string;
  page?: number;
  limit?: number;
}

function buildQuery(filters: PageFilters) {
  const p = new URLSearchParams();
  if (filters.status) p.set('status', filters.status);
  if (filters.campaign) p.set('campaign', filters.campaign);
  if (filters.search) p.set('search', filters.search);
  if (filters.brandId) p.set('brandId', filters.brandId);
  if (filters.page) p.set('page', String(filters.page));
  if (filters.limit) p.set('limit', String(filters.limit));
  return p.toString();
}

export function usePages(filters: PageFilters = {}) {
  return useQuery<PageListResult>({
    queryKey: ['pages', filters],
    queryFn: () => api.get<PageListResult>(`/pages?${buildQuery(filters)}`),
  });
}

export function usePage(id: string) {
  return useQuery<Page>({
    queryKey: ['page', id],
    queryFn: () => api.get<Page>(`/pages/${id}`),
    enabled: !!id,
  });
}

export function useCreatePage() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { title: string; slug?: string; campaign?: string; tags?: string[] }) =>
      api.post<Page>('/pages', data),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      router.push(`/editor/${page.id}`);
    },
  });
}

export function useUpdatePage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Page> & { id: string; versionMessage?: string }) =>
      api.patch<Page>(`/pages/${id}`, data),
    onSuccess: (page) => {
      qc.setQueryData(['page', page.id], page);
      qc.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useDuplicatePage() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => api.post<Page>(`/pages/${id}/duplicate`),
    onSuccess: (page) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      router.push(`/editor/${page.id}`);
    },
  });
}

export function useArchivePage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/pages/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useVersions(pageId: string) {
  return useQuery({
    queryKey: ['versions', pageId],
    queryFn: () => api.get<PageVersion[]>(`/pages/${pageId}/versions`),
    enabled: !!pageId,
  });
}

interface PageVersion {
  id: string;
  version: number;
  message?: string | null;
  authorId: string;
  createdAt: string;
  author: { id: string; name: string };
}

export function useRestoreVersion() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, versionId }: { pageId: string; versionId: string }) =>
      api.post<Page>(`/pages/${pageId}/versions/${versionId}/restore`),
    onSuccess: (page) => {
      qc.setQueryData(['page', page.id], page);
      qc.invalidateQueries({ queryKey: ['versions', page.id] });
    },
  });
}

export function usePublish() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ pageId, slug }: { pageId: string; slug?: string }) =>
      api.post<{ url: string; version: number }>(`/pages/${pageId}/publish`, { slug }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['page', vars.pageId] });
      qc.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useUnpublish() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => api.post(`/pages/${pageId}/unpublish`),
    onSuccess: (_, pageId) => {
      qc.invalidateQueries({ queryKey: ['page', pageId] });
      qc.invalidateQueries({ queryKey: ['pages'] });
    },
  });
}

export function useImportUrl() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ url, title }: { url: string; title?: string }) =>
      api.post<{ pageId: string; title: string; blockCount: number; warnings: string[] }>('/import/url', { url, title }),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['pages'] });
      router.push(`/editor/${result.pageId}`);
    },
  });
}
