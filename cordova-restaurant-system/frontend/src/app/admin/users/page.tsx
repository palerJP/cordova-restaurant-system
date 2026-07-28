'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { RequireRole } from '@/components/RequireRole';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import type { User } from '@/lib/types';

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter) params.set('role', roleFilter);
      params.set('limit', '30');
      const res = await api.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data);
    } catch (err) {
      setUsers([]);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (user: User) => {
    try {
      await api.patch(`/api/admin/users/${user.id}/active`, { isActive: !user.is_active });
      toast(user.is_active ? 'User deactivated' : 'User activated', 'success');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed', 'error');
    }
  };

  return (
    <RequireRole roles={['admin']}>
      <h1 className="text-2xl font-bold mb-6">User Account Management</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-2">
          {['', 'customer', 'owner', 'admin'].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}>
              <Badge color={roleFilter === r ? 'brand' : 'neutral'}>{r || 'all'}</Badge>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-[var(--border)]">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3 text-[var(--text-muted)]">{u.email}</td>
                  <td className="p-3">
                    <Badge>{u.role}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge color={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'active' : 'inactive'}</Badge>
                  </td>
                  <td className="p-3">
                    {u.role !== 'admin' && (
                      <Button variant="secondary" onClick={() => toggleActive(u)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </RequireRole>
  );
}
