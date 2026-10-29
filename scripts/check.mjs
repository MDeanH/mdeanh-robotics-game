import { readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { MODULES } from '../dist/content.js';
const names = await readdir('dist');
for (const name of names.filter(name => name.endsWith('.js'))) {
  const checked = spawnSync(process.execPath, ['--check', `dist/${name}`], { encoding: 'utf8' });
  if (checked.status !== 0) throw new Error(checked.stderr);
}
const html = await readFile('dist/index.html', 'utf8');
for (const [, value] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (value.startsWith('#') || value === './') continue;
  await stat(`dist/${value}`);
}
if (MODULES.length !== 4 || new Set(MODULES.map(part => part.id)).size !== 4) throw new Error('The workshop needs four unique lessons.');
await stat('baseline/index.html');
console.log(`Source checks passed: ${names.filter(name => name.endsWith('.js')).length} ES modules, HTML assets, four lessons, kept baseline.`);
