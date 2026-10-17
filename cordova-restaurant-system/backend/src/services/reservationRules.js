const ApiError = require('../utils/apiError');
const DAY = 86400000;
const HALF_HOUR = 1800000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const localDate = (value) => new Date(new Date(value).getTime() + 8 * 3600000).toISOString().slice(0,10);

function dateStart(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw ApiError.badRequest('Choose a valid reservation date.');
  const time = Date.parse(`${date}T00:00:00+08:00`);
  if (!Number.isFinite(time) || localDate(time) !== date) throw ApiError.badRequest('Choose a valid reservation date.');
  return time;
}

function windowsForDate(hours, date) {
  const midnight = dateStart(date);
  const windows = [];
  for (const offset of [-1,0]) {
    const dayStart = midnight + offset * DAY;
    const day = new Date(dayStart + 8 * 3600000).getUTCDay();
    const row = hours.find((h) => Number(h.day_of_week) === day && !h.is_closed);
    if (!row?.open_time || !row.close_time) continue;
    const minutes = (time) => Number(time.slice(0,2)) * 60 + Number(time.slice(3,5));
    const open = minutes(row.open_time), close = minutes(row.close_time);
    if (!Number.isFinite(open) || !Number.isFinite(close)) continue;
    windows.push({ start: dayStart + open * 60000, end: dayStart + (close <= open ? close + 1440 : close) * 60000 });
  }
  return windows;
}

function fitsHours(hours, start, end) {
  return windowsForDate(hours,localDate(start)).some((w) => start >= w.start && end <= w.end);
}

function seatsAvailable(bookings, start, end, capacity) {
  let peak = 0;
  for (let bucket = start; bucket < end; bucket += HALF_HOUR) {
    const occupied = bookings.filter((r) => new Date(r.starts_at).getTime() <= bucket && new Date(r.ends_at).getTime() > bucket)
      .reduce((sum,r) => sum + Number(r.party_size),0);
    peak = Math.max(peak, occupied);
  }
  return Math.max(0, capacity - peak);
}

function validateBooking(body, policy, now) {
  if (!body || !UUID.test(body.requestKey || '')) throw ApiError.badRequest('A valid request key is required. Please reload the form.');
  const starts = typeof body.startsAt === 'string' ? Date.parse(body.startsAt) : NaN;
  if (!Number.isFinite(starts) || new Date(starts).toISOString() !== body.startsAt || starts % HALF_HOUR !== 0) {
    throw ApiError.badRequest('Choose one of the available reservation times.');
  }
  if (!Number.isInteger(body.partySize) || body.partySize < 1 || body.partySize > policy.max_party_size) {
    throw ApiError.badRequest(`Party size must be between 1 and ${policy.max_party_size}.`);
  }
  if (starts < now + policy.min_notice_minutes * 60000 || dateStart(localDate(starts)) > dateStart(localDate(now)) + policy.advance_days * DAY) {
    throw ApiError.badRequest(`Book at least ${policy.min_notice_minutes} minutes ahead and within ${policy.advance_days} days.`);
  }
  const name = typeof body.contactName === 'string' ? body.contactName.trim() : '';
  const phone = typeof body.contactPhone === 'string' ? body.contactPhone.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const digits = phone.replace(/\D/g,'');
  if (name.length < 2 || name.length > 100) throw ApiError.badRequest('Enter a contact name between 2 and 100 characters.');
  if (!/^[+\d() -]{7,30}$/.test(phone) || digits.length < 7 || digits.length > 15) throw ApiError.badRequest('Enter a valid contact phone number.');
  if ((body.notes !== undefined && typeof body.notes !== 'string') || notes.length > 500) throw ApiError.badRequest('Special requests must be 500 characters or fewer.');
  return { starts, ends: starts + policy.duration_minutes * 60000, name, phone, notes };
}

function validatePolicy(body) {
  const fields = { capacity:[1,200], maxPartySize:[1,20], durationMinutes:[60,120], minNoticeMinutes:[0,4320] };
  for (const [key,[min,max]] of Object.entries(fields)) {
    if (!Number.isInteger(body[key]) || body[key]<min || body[key]>max) throw ApiError.badRequest(`${key} must be an integer between ${min} and ${max}.`);
  }
  if (typeof body.enabled !== 'boolean' || ![60,90,120].includes(body.durationMinutes) || body.maxPartySize>body.capacity) {
    throw ApiError.badRequest('Check the booking capacity, party limit, duration, and enabled setting.');
  }
}

module.exports = { UUID, DAY, HALF_HOUR, localDate, dateStart, windowsForDate, fitsHours, seatsAvailable, validateBooking, validatePolicy };
