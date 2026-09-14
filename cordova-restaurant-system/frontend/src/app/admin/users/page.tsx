'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Store,
  ShieldAlert,
  Calendar,
  Mail,
  Phone,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api, ApiClientError } from '@/lib/api';
import { useToast } from '@/lib/toast-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDebounce } from '@/hooks/useDebounce';
import type { User } from '@/lib/types';

function AdminUsersContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialRole = searchParams.get('role') || '';
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState(initialRole);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync state if URL param changes
  useEffect(() => {
    const urlRole = searchParams.get('role') || '';
    if (urlRole !== roleFilter) {
      setRoleFilter(urlRole);
    }
  }, [searchParams]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter) params.set('role', roleFilter);
      params.set('limit', '50');
      const res = await api.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data || []);
    } catch (err) {
      setUsers([]);
      toast(err instanceof ApiClientError ? err.message : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRoleChange = (role: string) => {
    setRoleFilter(role);
    if (role) {
      router.replace(`/admin/users?role=${role}`, { scroll: false });
    } else {
      router.replace(`/admin/users`, { scroll: false });
    }
  };

  const toggleActive = async (user: User) => {
    try {
      await api.patch(`/api/admin/users/${user.id}/active`, { isActive: !user.is_active });
      toast(user.is_active ? 'User deactivated' : 'User activated', 'success');
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to update user status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/admin/users/${deleteTarget.id}`);
      toast('User account permanently deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : 'Failed to delete user account', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge color="warning">Admin</Badge>;
      case 'owner':
        return <Badge color="brand">Restaurant Owner</Badge>;
      default:
        return <Badge color="neutral">Customer</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
          User Account Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Oversee all registered diners, restaurant owners, and administrators across Cordova.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#1a211c] p-3 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: '', label: 'All Users', icon: Users },
            { id: 'customer', label: 'Customers', icon: UserCheck },
            { id: 'owner', label: 'Restaurant Owners', icon: Store },
            { id: 'admin', label: 'Admins', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleRoleChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-cordova-green text-white shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs w-full"
          />
        </div>
      </div>

      {/* Table / Results */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : users.length === 0 ? (
        <div className="spatial-card bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-3xl p-12 text-center text-stone-500">
          <Users className="mx-auto text-stone-300 dark:text-stone-700 mb-3" size={40} />
          <p className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
            No users found matching the filters
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Try clearing your search query or selecting a different role.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/50 font-serif text-stone-600 dark:text-stone-300">
                <th className="p-4">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-cordova-green/10 text-cordova-green font-bold text-xs flex items-center justify-center border border-cordova-green/20 shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-white">
                          {u.full_name}
                        </p>
                        <p className="text-xs text-stone-400 font-mono">
                          ID: {u.id.substring(0, 8)}...
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-stone-600 dark:text-stone-300">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Mail size={12} className="text-stone-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-stone-400">
                          <Phone size={12} />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4">
                    {getRoleBadge(u.role)}
                  </td>

                  <td className="p-4">
                    <Badge color={u.is_active ? 'success' : 'danger'}>
                      {u.is_active ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>

                  <td className="p-4 text-stone-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-stone-400" />
                      <span>{new Date(u.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => toggleActive(u)}
                          className={`text-xs font-semibold ${
                            u.is_active
                              ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <UserX size={13} className="mr-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck size={13} className="mr-1" /> Activate
                            </>
                          )}
                        </Button>

                        {!u.is_active && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setDeleteTarget(u)}
                            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40"
                            title="Permanently delete deactivated user"
                          >
                            <Trash2 size={13} className="mr-1" /> Delete
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        title="Delete User Account"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
            <div className="text-xs space-y-1">
              <p className="font-bold">Permanent Account Deletion</p>
              <p>
                Are you sure you want to permanently delete the account of{' '}
                <strong className="font-semibold text-rose-900 dark:text-rose-100">{deleteTarget?.full_name}</strong>{' '}
                ({deleteTarget?.email})?
              </p>
              <p className="text-rose-600 dark:text-rose-400">
                This user is currently deactivated. Deleting will permanently remove their account, taste preferences, and associated data from the database. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
            >
              <Trash2 size={13} className="mr-1" /> {isDeleting ? 'Deleting...' : 'Confirm Permanent Deletion'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
      <AdminUsersContent />
    </Suspense>
  );
}
