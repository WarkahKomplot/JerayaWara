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

  it('ships PNG and maskable icons plus an iOS apple-touch-icon', () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../../public/manifest.json'), 'utf-8')
    );

    const png192 = manifest.icons.find(
      (icon: any) => icon.sizes === '192x192' && icon.type === 'image/png'
    );
    const maskable = manifest.icons.find((icon: any) => icon.purpose === 'maskable');

    expect(png192).toBeDefined();
    expect(maskable).toBeDefined();
    expect(fs.existsSync(path.resolve(__dirname, '../../public/icons/icon-192.png'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../../public/icons/icon-512.png'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../../public/apple-touch-icon.png'))).toBe(true);
  });
});

