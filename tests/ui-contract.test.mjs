import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('lab_navigation_bindings_match_real_document_or_panel_elements', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  const app = await readFile(new URL('../dist/app.js', import.meta.url), 'utf8');
  const elementIds = new Set([...`${html}\n${app}`.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
  const bindings = new Set([...app.matchAll(/\$\('([^']+)'\)/g)].map(match => match[1]));
  assert.deepEqual([...bindings].filter(id => !elementIds.has(id)), [], 'A missing lab control prevents the entire app from initializing.');
});
