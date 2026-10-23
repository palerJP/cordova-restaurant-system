import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const filename = new URL('../src/components/menu/SpatialRestaurantMenu.tsx', import.meta.url);
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, {
  module, exports: module.exports,
  require(name) {
    if (name === 'next/image') return { default: props => React.createElement('img', { src: props.src, alt: props.alt }) };
    if (name === 'framer-motion') return { motion: { div: ({ children }) => React.createElement('div', null, children) } };
    if (name === '@/data/burandatMenu') return { BURANDAT_PRICE_UNITS: new Map() };
    if (name === '@/data/cascadjaMenu') return { CASCADJA_IMAGE_ATTRIBUTIONS: new Map(), CASCADJA_REPRESENTATIVE_IMAGES: new Map() };
    if (name === '@/data/catalogImages') return { catalogDishPhoto: (_slug, _category, _name, _id, image) => ({ image, representative: false }) };
    return require(name);
  },
});
const render = items => renderToStaticMarkup(React.createElement(module.exports.SpatialRestaurantMenu, {
  restaurant: { slug: 'owner-business', name: 'Owner Business', category: 'Restaurant' }, items, categories: [],
}));

test('an empty menu displays no invented dishes', () => {
  const html = render([]);
  assert.match(html, /No menu has been added yet/);
  assert.doesNotMatch(html, /Grilled Stuffed Squid|Baked Scallops|₱/);
});

test('one owner dish is displayed without padding, invented descriptions or awards', () => {
  const html = render([{ id: 'owner-dish', name: 'Owner Test Dish', price: 50, description: '', is_available: false }]);
  assert.equal((html.match(/<h4/g) || []).length, 1);
  assert.match(html, /Owner Test Dish/);
  assert.match(html, /Out of stock/);
  assert.match(html, /Photo unavailable/);
  assert.doesNotMatch(html, /Grilled Stuffed Squid|Baked Scallops|Chef Special|Signature|Crafted fresh/);
});
