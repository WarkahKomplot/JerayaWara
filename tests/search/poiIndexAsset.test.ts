import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve(process.cwd(), 'public/data/malaysia-poi-index.json');

describe('Bundled Malaysian POI index', () => {
  const data = JSON.parse(readFileSync(indexPath, 'utf8'));

  it('contains a substantial, well-formed place index', () => {
    expect(data.count).toBeGreaterThan(20000);
    expect(data.records).toHaveLength(data.count);
    expect(data.attribution).toContain('GeoNames');
  });

  it('keeps every record inside Malaysia and in a supported category', () => {
    const categories = new Set(['city', 'shopping', 'hospital']);
    for (const [name, lng, lat, category] of data.records) {
      expect(typeof name).toBe('string');
      expect(lng).toBeGreaterThanOrEqual(99);
      expect(lng).toBeLessThanOrEqual(120);
      expect(lat).toBeGreaterThanOrEqual(0.8);
      expect(lat).toBeLessThanOrEqual(7.6);
      expect(categories.has(category)).toBe(true);
    }
  });
});
