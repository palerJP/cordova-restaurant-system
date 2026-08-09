'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
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
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mb-6">
        User Account Management
      </h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <div className="flex gap-2 items-center">
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
        <div className="overflow-x-auto bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-stone-200 dark:border-stone-800 font-serif">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-stone-100 dark:border-stone-800/60 last:border-0 hover:bg-stone-50 dark:hover:bg-stone-800/40">
                  <td className="p-3 font-medium">{u.full_name}</td>
                  <td className="p-3 text-stone-500">{u.email}</td>
                  <td className="p-3">
                    <Badge>{u.role}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge color={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'active' : 'inactive'}</Badge>
                  </td>
                  <td className="p-3 text-right">
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
    </div>
  );
}
