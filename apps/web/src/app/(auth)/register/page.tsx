'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRegister } from '@/hooks/useAuth';
import { Zap } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useRegister();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 mb-3">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Create Account</h1>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); register.mutate({ name, email, password }); }} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          </div>

          {register.error && <p className="text-sm text-red-600">{(register.error as Error).message}</p>}

          <button type="submit" className="btn-primary w-full py-2.5" disabled={register.isPending}>
            {register.isPending ? <><Spinner className="mr-2" />Creating…</> : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
