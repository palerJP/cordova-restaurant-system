import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { rankRestaurantNames } from './restaurant-search';

const names = ["Eat n' Repeat", "Entoy's Bakasihan", '10,000 Roses Cafe & More', 'New Entoy Cafe', 'Coffee Corner'].map(name => ({ name }));

test('name prefixes rank before word prefixes and interior matches', () => {
  const results = rankRestaurantNames(names, 'En');
  assert.equal(results[0].name, "Entoy's Bakasihan");
  assert.equal(results[1].name, 'New Entoy Cafe');
  assert.ok(!results.some(item => item.name === 'Coffee Corner'));
});

test('supports substitutions, transpositions, and multiword typos', () => {
  for (const query of ['Entoi', 'Entyo', 'entoi bakasihan', 'entoy bakasihna']) {
    assert.equal(rankRestaurantNames(names, query)[0].name, "Entoy's Bakasihan");
  }
});

test('exact names outrank fuzzy names and punctuation is ignored', () => {
  assert.equal(rankRestaurantNames(names, "Entoy’s Bakasihan")[0].name, "Entoy's Bakasihan");
  assert.equal(rankRestaurantNames(names, '10000 roses')[0].name, '10,000 Roses Cafe & More');
});

test('empty and unrelated queries do not return suggestions', () => {
  assert.deepEqual(rankRestaurantNames(names, ''), []);
  assert.deepEqual(rankRestaurantNames(names, 'zz'), []);
  assert.deepEqual(rankRestaurantNames(names, 'unrelated establishment'), []);
});
