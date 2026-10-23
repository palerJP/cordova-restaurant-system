import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('retired claims calls to action are absent from public and owner entry points', () => {
  for (const file of ['components/Footer.tsx', 'app/dashboard/new/page.tsx', 'app/dashboard/page.tsx', 'app/for-restaurants/page.tsx']) {
    const source = fs.readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /Claim Your Business|\/dashboard\/claims|ClaimBusinessLink/, file);
  }
});

test('user overview does not render the retired story block or invented quote', () => {
  const source = fs.readFileSync(new URL('../src/app/restaurants/[slug]/page.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Our Story|Where tradition meets excellence|Story Image/);
  assert.match(source, /Gallery Section/);
});
