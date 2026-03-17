'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLogin } from '@/hooks/useAuth';
import { Zap } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 mb-3">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">LP Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); login.mutate({ email, password }); }}
          className="space-y-4"
        >
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {login.error && (
            <p className="text-sm text-red-600">
              {(login.error as Error).message}
            </p>
          )}

          <button type="submit" className="btn-primary w-full py-2.5" disabled={login.isPending}>
            {login.isPending ? <><Spinner className="mr-2" />Signing in…</> : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          No account?{' '}
          <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
            Create one
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500">
          <p className="font-medium text-gray-600 mb-1">Demo credentials:</p>
          <p>admin@example.com / admin123!</p>
          <p>marketer@example.com / marketer123!</p>
        </div>
      </div>
    </div>
  );
}
