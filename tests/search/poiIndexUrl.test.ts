import { describe, it, expect } from 'vitest';
import { buildPoiIndexUrl } from '../../src/services/search/bulkPOIDbService';

describe('buildPoiIndexUrl', () => {
  it('resolves the POI index under an absolute Vite base path', () => {
    expect(buildPoiIndexUrl('/')).toBe('/data/malaysia-poi-index.json');
    expect(buildPoiIndexUrl('/JerayaWara/')).toBe('/JerayaWara/data/malaysia-poi-index.json');
  });

  it('normalizes a base path without a trailing slash', () => {
    expect(buildPoiIndexUrl('/JerayaWara')).toBe('/JerayaWara/data/malaysia-poi-index.json');
  });

  it('supports the relative base used by the production build', () => {
    expect(buildPoiIndexUrl('./')).toBe('./data/malaysia-poi-index.json');
  });

  it('defaults to the Vite BASE_URL at build time', () => {
    const base = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`;
    expect(buildPoiIndexUrl()).toBe(`${base}data/malaysia-poi-index.json`);
  });
});
