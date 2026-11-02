import { describe, it, expect } from 'vitest';
import {
  searchOvertureIndex,
  bucketHash,
  OvertureIndexData
} from '../../src/services/search/overturePOIService';

describe('Overture POI Offline Index Search', () => {
  const sampleIndex: OvertureIndexData = {
    count: 3,
    records: [
      ['Hospital Kuala Lumpur (HKL)', 101.7025, 3.1712, 'hospital', 'Kuala Lumpur'],
      ['Suria KLCC', 101.7118, 3.1582, 'shopping_mall', 'Kuala Lumpur'],
      ['Terminal Bersepadu Selatan (TBS)', 101.7112, 3.0768, 'station', 'Kuala Lumpur']
    ],
    index: {
      [bucketHash('hospital')]: { hospital: [0] },
      [bucketHash('kuala')]: { kuala: [0, 1, 2] },
      [bucketHash('lumpur')]: { lumpur: [0, 1, 2] },
      [bucketHash('hkl')]: { hkl: [0] },
      [bucketHash('suria')]: { suria: [1] },
      [bucketHash('klcc')]: { klcc: [1] },
      [bucketHash('terminal')]: { terminal: [2] },
      [bucketHash('tbs')]: { tbs: [2] }
    }
  };

  it('computes consistent bucket hash for words', () => {
    const h1 = bucketHash('hospital');
    const h2 = bucketHash('hospital');
    expect(h1).toBe(h2);
    expect(typeof h1).toBe('string');
  });

  it('finds records matching specific tokens (e.g. KLCC)', () => {
    const results = searchOvertureIndex('klcc', sampleIndex);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe('Suria KLCC');
    expect(results[0].category).toBe('shopping');
    expect(results[0].coordinates).toEqual([101.7118, 3.1582]);
  });

  it('finds hospital record and categorizes properly', () => {
    const results = searchOvertureIndex('hkl', sampleIndex);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Hospital Kuala Lumpur');
    expect(results[0].category).toBe('hospital');
  });

  it('ranks multi-token matches higher than single-token matches', () => {
    const results = searchOvertureIndex('terminal tbs kuala lumpur', sampleIndex);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('Terminal Bersepadu Selatan');
  });

  it('returns empty array when search query has no matching tokens', () => {
    const results = searchOvertureIndex('zzzznotfound', sampleIndex);
    expect(results).toEqual([]);
  });

  it('handles empty query gracefully', () => {
    const results = searchOvertureIndex('', sampleIndex);
    expect(results).toEqual([]);
  });
});

