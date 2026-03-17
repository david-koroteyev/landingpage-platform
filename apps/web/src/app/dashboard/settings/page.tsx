'use client';

import { useState } from 'react';
import { useMe } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toaster';
import { useQueryClient } from '@tanstack/react-query';

export default function SettingsPage() {
  const { data: user } = useMe();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
      <div className="card p-6 space-y-4">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={user.email} disabled />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input" value={user.role} disabled />
        </div>
        <button
          className="btn-primary"
          disabled={saving || !name.trim()}
          onClick={async () => {
            setSaving(true);
            try {
              const updated = await api.patch('/users/me', { name: name.trim() });
              qc.setQueryData(['me'], updated);
              toast({ title: 'Profile updated', variant: 'success' });
            } catch {
              toast({ title: 'Update failed', variant: 'error' });
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
