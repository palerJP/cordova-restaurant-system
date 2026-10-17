'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Camera,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { api, ApiClientError } from '@/lib/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const FOOD_TYPES = [
  'Filipino',
  'Seafood',
  'Bakasi & Shellfish',
  'Grill & BBQ',
  'Cebuano / Local',
  'Cafe',
  'Fast Food',
  'Pizza & Pasta',
  'Desserts & Milktea',
  'Resort Dining',
  'Street Food',
];

const DIETARY_OPTIONS = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'no_pork', label: 'No Pork' },
  { id: 'gluten_free', label: 'Gluten-Free' },
];

const SERVICES_OPTIONS = [
  { id: 'seaside_view', label: 'Seaside / Sunset View' },
  { id: 'al_fresco', label: 'Outdoor / Al Fresco' },
  { id: 'live_music', label: 'Live Music' },
  { id: 'air_conditioned', label: 'Air Conditioned' },
  { id: 'dine_in', label: 'Dine-In' },
  { id: 'takeout', label: 'Takeout' },
  { id: 'delivery', label: 'Delivery' },
];

const PRICE_RANGES = [
  { value: 'budget', label: 'Budget', symbol: '₱' },
  { value: 'moderate', label: 'Moderate', symbol: '₱₱' },
  { value: 'expensive', label: 'Expensive', symbol: '₱₱₱' },
  { value: 'premium', label: 'Premium', symbol: '₱₱₱₱' },
];

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getInitials(name?: string | null) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0][0].toUpperCase();
}

function splitName(fullName?: string | null): { first: string; last: string } {
  if (!fullName) return { first: '', last: '' };
  const idx = fullName.indexOf(' ');
  if (idx === -1) return { first: fullName, last: '' };
  return { first: fullName.slice(0, idx), last: fullName.slice(idx + 1) };
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const nameParts = splitName(user?.full_name);
  const [firstName, setFirstName] = useState(nameParts.first);
  const [lastName, setLastName] = useState(nameParts.last);
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Taste Preferences State (Only loaded and displayed for customer role)
  const [prefCuisines, setPrefCuisines] = useState<string[]>([]);
  const [prefDietary, setPrefDietary] = useState<string[]>([]);
  const [prefServices, setPrefServices] = useState<string[]>([]);
  const [prefBudget, setPrefBudget] = useState<string>('budget');
  const [prefDistance, setPrefDistance] = useState<number>(5);
  const [prefLoading, setPrefLoading] = useState<boolean>(true);
  const [prefSaving, setPrefSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user?.role !== 'customer') return;

    async function loadUserPreferences() {
      try {
        const res = await api.get('/api/users/me/preferences');
        if (res?.data?.preferences) {
          const p = res.data.preferences;
          if (p.preferred_cuisines?.length) setPrefCuisines(p.preferred_cuisines);
          if (p.dietary_restrictions?.length) setPrefDietary(p.dietary_restrictions);
          if (p.preferred_services?.length) setPrefServices(p.preferred_services);
          if (p.budget_range) setPrefBudget(p.budget_range);
          if (p.max_distance_km) setPrefDistance(Number(p.max_distance_km));
        }
      } catch {
        // guest or no preferences set yet
      } finally {
        setPrefLoading(false);
      }
    }
    loadUserPreferences();
  }, [user?.role]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#taste-preferences') {
      setTimeout(() => {
        const el = document.getElementById('taste-preferences');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);
    }
  }, []);

  const togglePreferenceItem = (
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    setArr((prev) =>
      prev.some((x) => x.toLowerCase() === item.toLowerCase())
        ? prev.filter((x) => x.toLowerCase() !== item.toLowerCase())
        : [...prev, item]
    );
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSaving(true);
    try {
      await api.put('/api/users/me/preferences', {
        preferredCuisines: prefCuisines,
        dietaryRestrictions: prefDietary,
        preferredServices: prefServices,
        budgetRange: prefBudget || null,
        maxDistanceKm: prefDistance,
      });
      showToast('Taste preferences saved successfully!', 'success');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Failed to save preferences.', 'error');
    } finally {
      setPrefSaving(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      showToast('First name is required.', 'error');
      return;
    }
    setProfileSaving(true);
    try {
      await updateProfile({
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone: phone || undefined,
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Failed to update profile.', 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await api.post<any>('/api/auth/avatar', formData, { isFormData: true });
      if (res?.data?.user) {
        await updateProfile({ avatarUrl: res.data.user.avatar_url });
      }
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Failed to upload avatar.', 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = 'Current password is required.';
    if (!newPassword || newPassword.length < 8) errs.newPassword = 'New password must be at least 8 characters.';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPasswordSaving(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      showToast('Password changed. Please log in again with your new password.', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err instanceof ApiClientError) showToast(err.message, 'error');
      else showToast('Failed to change password.', 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const provider = user?.google_id ? 'Google' : user?.facebook_id ? 'Facebook' : 'Email';
  const isOAuthOnly = user?.has_password === false || (!user?.has_password && !!(user?.google_id || user?.facebook_id));

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      {/* Ambient Lighting Cones */}
      <div className="absolute top-[10%] left-[-15%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[50%] right-[-15%] w-[450px] h-[450px] rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-[110px] pointer-events-none -z-10" />

      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white mb-8">My Profile</h1>

      {/* Avatar + Account Overview */}
      <div className="spatial-card p-6 sm:p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user?.avatar_url ? (
            <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-white/60 dark:border-white/15 shadow-spatial-sm">
              <Image src={user.avatar_url} alt={user.full_name || ''} fill className="object-cover" />
            </div>
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-cordova-green to-emerald-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-white/60 dark:border-white/15 shadow-spatial-sm">
              {getInitials(user?.full_name)}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 bg-cta-500 hover:bg-cta-600 text-white rounded-full p-2 shadow-spatial-sm transition-all duration-200 active:scale-95 border border-white/30"
            title="Change profile picture"
          >
            <Camera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>

        {/* Meta Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white truncate">
            {user?.full_name || 'CordovaEats Member'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{user?.email}</p>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 mt-4 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
              <User size={13} className="text-cordova-green dark:text-emerald-400" />
              <span className="capitalize">{user?.role} Account</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
              {user?.email_verified ? (
                <ShieldCheck size={13} className="text-emerald-500" />
              ) : (
                <ShieldAlert size={13} className="text-amber-500" />
              )}
              <span>{user?.email_verified ? 'Email Verified' : 'Email Unverified'}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
              <Mail size={13} className="text-cordova-gold" />
              <span>via {provider}</span>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/80 dark:bg-white/5 border border-stone-200/60 dark:border-white/5">
              <Calendar size={13} />
              <span>Joined {formatDate(user?.created_at)}</span>
            </span>
          </div>

          {!user?.email_verified && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
              ⚠️ Your email is not verified.{' '}
              <a href="/verify-email-required" className="underline hover:text-amber-700">
                Verify now
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Edit Profile Info */}
      <div className="spatial-card p-6 sm:p-8 mb-6">
        <h3 className="text-base font-bold text-stone-900 dark:text-white mb-5 flex items-center gap-2">
          <User size={16} className="text-cordova-green dark:text-emerald-400" />
          Personal Information
        </h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <Input
              label="Last name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
          <Input
            label="Email address"
            type="email"
            value={user?.email || ''}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <Input
            label="Phone number (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+63 9XX XXX XXXX"
          />
          <Button
            type="submit"
            className="bg-cordova-green hover:bg-cordova-greenHover dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-spatial-sm active:scale-95"
            loading={profileSaving}
          >
            Save Changes
          </Button>
        </form>
      </div>

      {/* Taste & Dining Preferences Section — Customers / Diners only */}
      {user?.role === 'customer' && (
        <div
          id="taste-preferences"
          className="spatial-card p-6 sm:p-8 mb-6 scroll-mt-24"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Utensils size={17} className="text-cordova-gold" />
              Taste & Dining Preferences
            </h3>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cordova-green dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full backdrop-blur-md">
              <Sparkles size={11} className="text-emerald-500 animate-pulse" />
              Powers AI Recommendations
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
            Personalize the restaurant recommendations you see on the Home page and Explore tab.
          </p>

          {prefLoading ? (
            <div className="py-8 text-center text-xs text-stone-400">Loading your taste profile...</div>
          ) : (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              {/* Cuisines */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Favorite Cuisines & Food Types
                  </label>
                  {prefCuisines.length > 0 && (
                    <span className="text-[11px] text-cordova-green dark:text-emerald-400 font-semibold">
                      {prefCuisines.length} selected
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {FOOD_TYPES.map((type) => {
                    const selected = prefCuisines.some((c) => c.toLowerCase() === type.toLowerCase());
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => togglePreferenceItem(prefCuisines, setPrefCuisines, type)}
                        className={`py-2 px-3.5 rounded-full border text-xs font-medium transition-all duration-200 ${
                          selected
                            ? 'border-cordova-green dark:border-emerald-500 bg-cordova-green dark:bg-emerald-600 text-white shadow-spatial-sm font-bold scale-105'
                            : 'border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-stone-800 dark:text-stone-200 hover:border-cordova-green/50 dark:hover:border-emerald-400/50'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Dietary Restrictions & Preferences
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((item) => {
                    const selected = prefDietary.some((d) => d.toLowerCase() === item.id.toLowerCase());
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => togglePreferenceItem(prefDietary, setPrefDietary, item.id)}
                        className={`py-2 px-3.5 rounded-full border text-xs font-semibold tracking-wider transition-all duration-200 ${
                          selected
                            ? 'border-cordova-gold bg-cta-500 hover:bg-cta-600 text-white shadow-spatial-sm font-bold scale-105'
                            : 'border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-stone-800 dark:text-stone-200 hover:border-cordova-gold/50'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Atmosphere & Services */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                  Preferred Atmosphere & Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICES_OPTIONS.map((service) => {
                    const selected = prefServices.some((s) => s.toLowerCase() === service.id.toLowerCase());
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => togglePreferenceItem(prefServices, setPrefServices, service.id)}
                        className={`py-2 px-3.5 rounded-full border text-xs font-medium transition-all duration-200 ${
                          selected
                            ? 'border-stone-900 dark:border-white bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-spatial-sm font-bold scale-105'
                            : 'border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-white/30'
                        }`}
                      >
                        {service.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Range & Max Distance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
                    Target Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICE_RANGES.map((pr) => {
                      const selected = prefBudget === pr.value;
                      return (
                        <button
                          key={pr.value}
                          type="button"
                          onClick={() => setPrefBudget(pr.value)}
                          className={`py-2.5 px-2 rounded-xl border text-xs text-center transition-all duration-200 ${
                            selected
                              ? 'border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-spatial-sm scale-[1.02]'
                              : 'border-stone-200 dark:border-white/10 bg-white/70 dark:bg-white/5 text-stone-700 dark:text-stone-300 hover:border-amber-400/50'
                          }`}
                        >
                          <span className="block font-bold">{pr.symbol}</span>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400">{pr.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="pref-distance-slider" className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                      Max Distance Radius
                    </label>
                    <span className="text-xs font-bold text-cordova-green dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{prefDistance} km</span>
                  </div>
                  <input
                    id="pref-distance-slider"
                    type="range"
                    min={1}
                    max={15}
                    step={0.5}
                    value={prefDistance}
                    onChange={(e) => setPrefDistance(parseFloat(e.target.value))}
                    className="w-full accent-cordova-green cursor-pointer mt-3"
                  />
                  <p className="text-[11px] text-stone-400 mt-2">
                    Recommendations will prioritize restaurants within {prefDistance} km of your location in Cordova.
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-cta-500 hover:bg-cta-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-spatial-sm hover:shadow-card-hover active:scale-95 border border-white/20"
                  loading={prefSaving}
                >
                  Save Taste Preferences
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Change Password — only for email/password accounts */}
      {!isOAuthOnly && (
        <div className="spatial-card p-6 sm:p-8">
          <h3 className="text-base font-bold text-stone-900 dark:text-white mb-5 flex items-center gap-2">
            <Lock size={16} className="text-cordova-gold" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="label text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Current password
              </label>
              <div className="relative mt-1">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="Your current password"
                  className={`input pr-10 ${pwErrors.currentPassword ? 'ring-2 ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {pwErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">{pwErrors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="label text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                New password
              </label>
              <div className="relative mt-1">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className={`input pr-10 ${pwErrors.newPassword ? 'ring-2 ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {pwErrors.newPassword && <p className="mt-1 text-sm text-red-500">{pwErrors.newPassword}</p>}
            </div>

            <Input
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={pwErrors.confirmPassword}
              autoComplete="new-password"
              placeholder="Re-enter new password"
            />

            <Button
              type="submit"
              className="bg-cta-500 hover:bg-cta-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
              loading={passwordSaving}
            >
              Change Password
            </Button>
          </form>
        </div>
      )}

      {isOAuthOnly && (
        <div className="bg-white dark:bg-[#1a211c] rounded-2xl border border-stone-200 dark:border-stone-800 shadow p-6 sm:p-8">
          <h3 className="text-base font-bold text-stone-900 dark:text-white mb-2 flex items-center gap-2">
            <Lock size={16} className="text-stone-400" />
            Password
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            You signed in with {provider}. Password management is handled by your {provider} account.
          </p>
        </div>
      )}
    </div>
  );
}
