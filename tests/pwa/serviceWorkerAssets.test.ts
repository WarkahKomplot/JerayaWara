import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Vitest runs with the project root as cwd (see npm test).
const projectRoot = process.cwd();
const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(projectRoot, relativePath), 'utf8');

/**
 * The service worker owns the cache namespace. The HTML bootstrap used to keep a
 * second copy of that version list and deleted the active cache on every load,
 * which wiped the precached app shell. These tests pin cache-name ownership to
 * public/sw.js and prevent a hardcoded registration version from drifting again.
 */
describe('PWA service worker asset versioning', () => {
  it('keeps cache-name ownership inside the service worker, not index.html', () => {
    const html = readProjectFile('index.html');
    expect(html).not.toMatch(/jerayawara-v\d+/);
    expect(html).not.toContain('caches.delete');
  });

  it('registers the service worker without a hardcoded version query', () => {
    const main = readProjectFile('src/main.tsx');
    expect(main).not.toMatch(/sw\.js\?v=\d+/);
  });

  it('bypasses the HTTP cache when checking for service worker updates', () => {
    const main = readProjectFile('src/main.tsx');
    expect(main).toContain("updateViaCache: 'none'");
  });
});
