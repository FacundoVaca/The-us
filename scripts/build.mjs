import { cpSync, mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'src');
const output = resolve(root, 'dist');

const started = performance.now();
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true });

const files = ['index.html', 'styles.css', 'game.js', 'manifest.webmanifest', 'icon.svg'];
for (const file of files) {
  const size = statSync(resolve(output, file)).size;
  if (size === 0) throw new Error(`Built asset is empty: ${file}`);
}

writeFileSync(
  resolve(output, 'build-info.json'),
  JSON.stringify({ builtAt: new Date().toISOString(), files }, null, 2) + '\n',
);

console.log(`build: ${output} (${((performance.now() - started) / 1000).toFixed(3)}s)`);
