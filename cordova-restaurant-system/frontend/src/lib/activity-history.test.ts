import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  setActivityAccount, saveSearchHistory, getSearchHistory, clearSearchHistory,
  recordRestaurantView, getRecentlyViewed, clearRecentlyViewed,
} from './activity-history';

test('activity stays isolated by account and survives logout without appearing for guests', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'window', { configurable: true, value: Object.assign(new EventTarget(), { localStorage: storage }) });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  try {
    storage.setItem('cordova_recent_searches_v1', JSON.stringify([{ query: 'Legacy private search' }]));
    setActivityAccount('account-a');
    assert.deepEqual(getSearchHistory(), []);
    assert.equal(storage.getItem('cordova_recent_searches_v1'), null);
    saveSearchHistory({ query: 'Entoy' });
    recordRestaurantView({ id: 'entoy', slug: 'entoys-bakasihan', name: "Entoy's Bakasihan" });
    setActivityAccount(null);
    assert.deepEqual(getSearchHistory(), []);
    assert.deepEqual(getRecentlyViewed(), []);
    saveSearchHistory({ query: 'Guest search' });
    setActivityAccount('account-b');
    assert.deepEqual(getSearchHistory(), []);
    assert.deepEqual(getRecentlyViewed(), []);
    saveSearchHistory({ query: 'Cafe' });
    clearRecentlyViewed();
    setActivityAccount('account-a');
    assert.equal(getSearchHistory()[0].query, 'Entoy');
    assert.equal(getRecentlyViewed()[0].id, 'entoy');
    clearSearchHistory();
    clearRecentlyViewed();
    assert.deepEqual(getSearchHistory(), []);
    assert.deepEqual(getRecentlyViewed(), []);
    setActivityAccount('account-b');
    assert.equal(getSearchHistory()[0].query, 'Cafe');
  } finally {
    setActivityAccount(null);
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
