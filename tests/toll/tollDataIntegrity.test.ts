import { describe, it, expect } from 'vitest';
import { MALAYSIA_TOLL_REGISTRY } from '../../src/services/toll/tollData';
import { PHYSICAL_TOLL_GATES } from '../../src/services/toll/tollCrossing';

describe('Toll data integrity', () => {
  it('keeps gate IDs unique and inside Malaysia', () => {
    const ids = new Set<string>();

    for (const gate of PHYSICAL_TOLL_GATES) {
      expect(ids.has(gate.id)).toBe(false);
      ids.add(gate.id);
      expect(gate.coordinates[0]).toBeGreaterThanOrEqual(99);
      expect(gate.coordinates[0]).toBeLessThanOrEqual(120);
      expect(gate.coordinates[1]).toBeGreaterThanOrEqual(0.8);
      expect(gate.coordinates[1]).toBeLessThanOrEqual(7.6);
      expect(Number.isFinite(gate.carRate ?? 0)).toBe(true);
      expect(gate.carRate ?? 0).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps registry keys aligned with their plaza IDs', () => {
    for (const [key, plaza] of Object.entries(MALAYSIA_TOLL_REGISTRY)) {
      expect(plaza.id).toBe(key);
      expect(Number.isFinite(plaza.carRate)).toBe(true);
      expect(plaza.carRate).toBeGreaterThanOrEqual(0);
    }
  });
});
