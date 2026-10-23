import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('retired claims calls to action are absent from public and owner entry points', () => {
  for (const file of ['components/Footer.tsx', 'app/dashboard/new/page.tsx', 'app/dashboard/page.tsx', 'app/for-restaurants/page.tsx']) {
    const source = fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /Claim Your Business|\/dashboard\/claims|ClaimBusinessLink/, file);
  }
});

test('overview includes the saved story and reservation form without a separate Reserve tab', () => {
  const source = fs.readFileSync(new URL('../src/app/restaurants/[slug]/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /Our Story/);
  assert.match(source, /restaurant.description/);
  assert.match(source, /<ReservationForm restaurant=\{restaurant\} \/>/);
  assert.doesNotMatch(source, /Where tradition meets excellence|activeTab === 'reservations'/);
  assert.match(source, /\['overview', 'menu', 'map', 'reviews'\]/);
  assert.match(source, /Gallery Section/);
});
