import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Icons', () => {
  it('has valid manifest with name JerayaWara, standalone display, and theme colors', () => {
    const raw = fs.readFileSync(path.resolve(__dirname, '../../public/manifest.json'), 'utf-8');
    const manifest = JSON.parse(raw);
    expect(manifest.name).toBe('JerayaWara — Malaysia Navigation');
    expect(manifest.short_name).toBe('JerayaWara');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.length).toBeGreaterThan(0);
  });
});

