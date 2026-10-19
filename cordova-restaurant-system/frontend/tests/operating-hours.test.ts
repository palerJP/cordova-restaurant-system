import test from 'node:test';
import assert from 'node:assert/strict';
import { describeHours, formatTime } from '../src/lib/operating-hours';
import type { OperatingHour } from '../src/lib/types';
const week = (open = '09:00', close = '21:00'): OperatingHour[] => Array.from({length:7}, (_,day_of_week) => ({day_of_week,open_time:open,close_time:close,is_closed:false}));
const at = (time: string) => new Date(`2026-10-20T${time}+08:00`); // Tuesday in Manila

test('uses Manila date and time, independent of the visitor timezone', () => {
  const rows=week(); rows[2].open_time='08:00';
  assert.equal(describeHours(rows,new Date('2026-10-20T00:30:00Z')).status,'open');
  assert.equal(describeHours(rows,new Date('2026-10-19T23:59:00Z')).status,'closed');
  assert.match(describeHours(rows,at('08:30:00')).text,/8:00 AM.*9:00 PM/);
});
test('opening is inclusive and closing is exclusive', () => {
  assert.equal(describeHours(week(),at('08:59:00')).status,'closed');
  assert.equal(describeHours(week(),at('09:00:00')).status,'open');
  assert.equal(describeHours(week(),at('20:59:00')).status,'open');
  assert.equal(describeHours(week(),at('21:00:00')).status,'closed');
});
test('overnight hours carry into the next day, even when today is marked closed', () => {
  const rows=week('17:00','02:00');rows[2].is_closed=true;
  assert.equal(describeHours(rows,at('01:59:00')).status,'open');
  assert.match(describeHours(rows,at('01:59:00')).text,/2:00 AM today/);
  assert.equal(describeHours(rows,at('02:00:00')).status,'closed');
  rows[2].is_closed=false;
  assert.match(describeHours(rows,at('18:00:00')).text,/next day/);
});
test('Sunday overnight carries into Monday across the week boundary', () => {
  const rows=week('20:00','02:00');
  assert.equal(describeHours(rows,new Date('2026-10-19T01:00:00+08:00')).status,'open');
});
test('missing, invalid and ambiguous schedules never claim open', () => {
  assert.equal(describeHours([],at('12:00:00')).status,'unknown');
  assert.equal(describeHours(week('00:00','00:00'),at('12:00:00')).status,'unknown');
  assert.equal(describeHours(week('99:00','21:00'),at('12:00:00')).status,'unknown');
  assert.equal(describeHours([week()[2]],at('01:00:00')).status,'unknown');
});
test('formats midnight and noon without ambiguity', () => {
  assert.equal(formatTime('00:00:00'),'12:00 AM');
  assert.equal(formatTime('12:30:00'),'12:30 PM');
});
