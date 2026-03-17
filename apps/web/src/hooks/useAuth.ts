'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { login, register, getMe, logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import type { User } from '@lp/shared';

export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (session) => {
      qc.setQueryData(['me'], session.user);
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      register(email, password, name),
    onSuccess: (session) => {
      qc.setQueryData(['me'], session.user);
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    qc.clear();
    logout();
  };
}
