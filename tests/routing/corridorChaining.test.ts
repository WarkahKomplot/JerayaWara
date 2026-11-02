import { describe, it, expect } from 'vitest';
import { findChainedCorridorPath, findNearestRoadPathChained } from '../../src/services/routing/malaysiaRoadNetwork';

describe('Multi-corridor offline chaining', () => {
  const kl: [number, number] = [101.6868, 3.1390];
  const kuantan: [number, number] = [103.3290, 3.8080];
  const jb: [number, number] = [103.757, 1.465];
  const penang: [number, number] = [100.330, 5.414];

  it('routes KL → Kuantan via the E8 Karak/LPT corridor', () => {
    const match = findChainedCorridorPath(kl, kuantan);
    expect(match).not.toBeNull();
    const codes = match!.corridorsUsed.map(c => c.expresswayCode || c.id);
    expect(codes).toContain('E8');
    expect(match!.pathCoordinates.length).toBeGreaterThan(5);
  });

  it('chains multiple corridors for JB → Penang (E2 northbound then E1)', () => {
    const match = findChainedCorridorPath(jb, penang);
    expect(match).not.toBeNull();
    const codes = match!.corridorsUsed.map(c => c.expresswayCode || c.id);
    expect(codes).toContain('E2');
    expect(codes).toContain('E1');
    // Segments must run in order south → north
    expect(match!.corridorsUsed[0].expresswayCode).toBe('E2');
    expect(match!.corridorsUsed[match!.corridorsUsed.length - 1].expresswayCode).toBe('E1');
  });

  it('produces a continuous stitched polyline with no coordinate gaps', () => {
    const match = findChainedCorridorPath(jb, penang);
    expect(match).not.toBeNull();
    const path = match!.pathCoordinates;
    for (let i = 1; i < path.length; i++) {
      // Corridor nodes are tens of km apart; a chain break would show a huge jump
      // between consecutive stitched coordinates. Anything over 120km is a splice error.
      const [lng1, lat1] = path[i - 1];
      const [lng2, lat2] = path[i];
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
      const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      expect(km).toBeLessThan(120);
    }
  });

  it('findNearestRoadPathChained falls back to single-corridor snap when no chain helps', () => {
    const match = findNearestRoadPathChained(kl, kuantan);
    expect(match).not.toBeNull();
    expect(match!.pathCoordinates.length).toBeGreaterThan(5);
  });
});
