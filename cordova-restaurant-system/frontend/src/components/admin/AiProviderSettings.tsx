'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api, ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';

export interface AiProviderStatus {
  provider: 'groq';
  configured: boolean;
}

interface ProviderSettings {
  provider: string;
  configured: boolean;
  expiresAt: string | null;
  model: string;
  timeoutMs: number;
  canConfigure: boolean;
}

interface ConnectionCheck {
  provider: 'groq';
  connected: boolean;
  message: string;
  checkedAt: string;
  model: string;
}

function expiryNotice(expiresAt: string | null) {
  if (!expiresAt || !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) return null;
  const [year, month, day] = expiresAt.split('-').map(Number);
  const expiration = new Date(year, month - 1, day);
  if (Number.isNaN(expiration.getTime())) return null;
  const now = new Date();
  const daysLeft = Math.round((
    Date.UTC(year, month - 1, day) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  ) / 86400000);
  const date = expiration.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  if (daysLeft < 0) return { urgent: true, message: `The saved Groq key's recorded expiration date was ${date}. Replace it and test the connection.` };
  if (daysLeft <= 7) return { urgent: true, message: `The saved Groq key expires on ${date}. Replace it soon to keep AI suggestions available.` };
  return { urgent: false, message: `The saved Groq key expires on ${date}. Replace it before that date.` };
}

export function AiProviderSettings({ onStatusChange }: { onStatusChange: (status: AiProviderStatus | null) => void }) {
  const [settings, setSettings] = useState<ProviderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [model, setModel] = useState('');
  const [timeoutMs, setTimeoutMs] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionCheck | null>(null);

  const applySettings = useCallback((next: ProviderSettings) => {
    if (next.provider !== 'groq') {
      throw new Error('The server is still using older AI settings. Restart the backend to enable Groq.');
    }
    setSettings(next);
    setApiKey('');
    setExpiresAt(next.expiresAt || '');
    setModel(next.model);
    setTimeoutMs(String(next.timeoutMs));
    setConnection(null);
    onStatusChange({ provider: 'groq', configured: next.configured });
  }, [onStatusChange]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.get<{ data: ProviderSettings }>('/api/recommendations/provider');
      applySettings(response.data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load the Groq connection settings.');
      onStatusChange(null);
    } finally {
      setLoading(false);
    }
  }, [applySettings, onStatusChange]);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  const hasChanges = Boolean(settings && (
    apiKey.trim() || expiresAt !== (settings.expiresAt || '')
    || model.trim() !== settings.model || Number(timeoutMs) !== settings.timeoutMs
  ));
  const busy = saving || testing;
  const expiry = expiryNotice(settings?.configured ? settings.expiresAt : null);

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settings?.canConfigure || busy || !hasChanges) return;
    setActionError(null);
    setSaveMessage(null);
    setSaving(true);
    try {
      const response = await api.patch<{ data: ProviderSettings }>('/api/recommendations/provider', {
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
        expiresAt,
        model: model.trim(),
        timeoutMs: Number(timeoutMs),
      });
      applySettings(response.data);
      setSaveMessage('Settings saved. Test the connection to confirm Groq can respond.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not save the Groq connection settings.');
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    if (!settings?.configured || busy || hasChanges) return;
    setTesting(true);
    setActionError(null);
    setConnection(null);
    try {
      const response = await api.post<{ data: ConnectionCheck }>('/api/recommendations/provider/test');
      setConnection(response.data);
    } catch (error) {
      setActionError(error instanceof ApiClientError ? error.message : 'The connection check could not be completed.');
    } finally {
      setTesting(false);
    }
  }

  return (
    <section className="bg-white dark:bg-[#1a211c] border border-stone-200 dark:border-stone-800 rounded-lg p-6 space-y-5 shadow-sm">
      <div>
        <h2 className="font-bold text-stone-900 dark:text-white">Groq AI connection</h2>
        <p className="text-sm text-stone-500 mt-1">Groq helps understand customer requests and suggest matching restaurants. Restaurant scores still come from CordovaEats.</p>
      </div>
      {loading ? <Skeleton className="h-48 w-full" /> : loadError ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
          <Button variant="secondary" size="sm" onClick={loadSettings}>Retry connection settings</Button>
        </div>
      ) : settings ? (
        <>
          <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 p-4 text-sm">
            <p className="font-semibold text-stone-800 dark:text-stone-200">{settings.configured ? 'Groq API key saved' : 'Groq API key needed'}</p>
            <p className="mt-1 text-stone-500">{settings.configured
              ? 'A saved key does not confirm access. Use the connection test below.'
              : 'Local recommendations remain available. Add a Groq key to enable AI suggestions.'}</p>
            {expiry && <p role={expiry.urgent ? 'alert' : undefined}
              className={`mt-2 ${expiry.urgent ? 'text-amber-700 dark:text-amber-300' : 'text-stone-600 dark:text-stone-300'}`}>
              {expiry.message}
            </p>}
          </div>
          {!settings.canConfigure && <p className="text-sm text-amber-700 dark:text-amber-300">
            Connection settings can be edited only from this computer in local development. For a hosted system, ask the server administrator to configure Groq.
          </p>}
          <form onSubmit={saveSettings} className="space-y-4">
            <fieldset disabled={!settings.canConfigure || busy} className="space-y-4 disabled:opacity-60">
              <Input id="ai-api-key" type="password" label={settings.configured ? 'Replace Groq API key (optional)' : 'Groq API key'}
                value={apiKey} onChange={(event) => {
                  if (!apiKey && event.target.value) setExpiresAt('');
                  setApiKey(event.target.value);
                  setSaveMessage(null);
                }}
                autoComplete="off" spellCheck={false} maxLength={515}
                placeholder={settings.configured ? 'Leave blank to keep the saved key' : 'Paste your API key'} required={!settings.configured} />
              <p className="text-xs text-stone-500">
                {settings.canConfigure ? 'A key saved here stays in a server-only local settings file excluded from Git and is not shown again.'
                  : 'The key is held by the server and is not shown here.'}{' '}
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                  className="text-cordova-green dark:text-emerald-400 underline underline-offset-2">Create a Groq API key</a>.
              </p>
              <Input id="ai-key-expiry" type="date" label="API key expiration date (if known)"
                value={expiresAt} onChange={(event) => { setExpiresAt(event.target.value); setSaveMessage(null); }} />
              <p className="text-xs text-stone-500">The expiration date is for reminders here. If the key expires, create a replacement and save it above.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input id="ai-model" label="Groq model" value={model}
                  onChange={(event) => { setModel(event.target.value); setSaveMessage(null); }} required maxLength={100} spellCheck={false} />
                <Input id="ai-timeout" label="Response timeout (milliseconds)" type="number" min={1000} max={60000} step={1}
                  value={timeoutMs} onChange={(event) => { setTimeoutMs(event.target.value); setSaveMessage(null); }} required />
              </div>
            </fieldset>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={saving} disabled={!settings.canConfigure || !hasChanges || busy}>Save connection</Button>
              <Button type="button" variant="secondary" onClick={testConnection} loading={testing}
                disabled={!settings.configured || busy || hasChanges}>Test saved connection</Button>
            </div>
            <p className="text-xs text-stone-500">{hasChanges ? 'Save your changes before testing. ' : ''}
              Testing sends a small sample request to Groq and counts toward that account&apos;s usage limits.</p>
          </form>
          <div aria-live="polite" className="space-y-2">
            {saveMessage && <p className="text-sm text-emerald-700 dark:text-emerald-400">{saveMessage}</p>}
            {actionError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{actionError}</p>}
            {connection && <div className={`rounded-lg border p-4 text-sm ${connection.connected
              ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
              : 'border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'}`}>
              <p className="font-semibold">Groq connection {connection.connected ? 'verified' : 'failed'}</p>
              <p className="mt-1">{connection.message}</p>
              <p className="text-xs mt-2">{connection.model} · Checked {new Date(connection.checkedAt).toLocaleString()}</p>
            </div>}
          </div>
        </>
      ) : null}
    </section>
  );
}
