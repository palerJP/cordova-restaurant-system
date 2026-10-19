import type { OperatingHour } from './types';

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function formatTime(value: string): string {
  const [h, m] = value.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
function minutes(value: string): number | null {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return null;
  return Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
}
function interval(row: OperatingHour | undefined) {
  if (!row || row.is_closed) return null;
  const open = minutes(row.open_time), close = minutes(row.close_time);
  // Equal times are ambiguous; do not silently treat them as 24 hours.
  return open !== null && close !== null && open !== close ? { open, close } : null;
}
export function describeHours(rows: OperatingHour[], now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)?.value || '';
  const day = days.indexOf(part('weekday'));
  const time = Number(part('hour')) * 60 + Number(part('minute'));
  const today = rows.find(r => r.day_of_week === day);
  const previous = rows.find(r => r.day_of_week === (day + 6) % 7);
  const current = interval(today), carry = interval(previous);
  if (carry && carry.close < carry.open && time < carry.close) {
    return { status: 'open' as const, label: 'Open now', text: `Closes ${formatTime(previous!.close_time)} today (opened yesterday)` };
  }
  if (!today || (!today.is_closed && !current)) {
    return { status: 'unknown' as const, label: 'Hours unconfirmed', text: 'Opening and closing times have not been confirmed.' };
  }
  const text = today.is_closed ? 'Closed today' : `Today: ${formatTime(today.open_time)} – ${formatTime(today.close_time)}${current!.close < current!.open ? ' (next day)' : ''}`;
  if (current && time >= current.open && (current.close < current.open || time < current.close)) {
    return { status: 'open' as const, label: 'Open now', text };
  }
  if (!previous || (!previous.is_closed && !carry)) return { status: 'unknown' as const, label: 'Status unconfirmed', text };
  return { status: 'closed' as const, label: 'Closed now', text };
}
