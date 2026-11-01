import { describe, it, expect } from 'vitest';
import { detectProximityBoundary, isLocationCached, MALAYSIA_REGIONS } from '../../src/services/offline/regions';
import { regionManager } from '../../src/services/offline/regionManager';

describe('Regional Offline Management', () => {
  it('detects proximity when within 15km of Northern region boundary (near Tg Malim border)', () => {
    // Tanjung Malim (approx [101.518, 3.684]) near Selangor-Perak border
    const nearby = detectProximityBoundary([101.518, 3.684], 15);
    const regionIds = nearby.map(r => r.id);
    expect(regionIds).toContain('northern');
    expect(regionIds).toContain('klang-valley');
  });

  it('correctly verifies if coordinate is within cached regions', () => {
    // KL Tower [101.703, 3.152] in klang-valley
    expect(isLocationCached([101.703, 3.152], ['klang-valley'])).toBe(true);
    expect(isLocationCached([101.703, 3.152], ['northern'])).toBe(false);
  });

  it('guarantees IndexedDB has ready status when progress listener fires completed', async () => {
    const targetRegion = MALAYSIA_REGIONS[0];
    let completedObserved = false;

    const unsubscribe = regionManager.onProgress(progress => {
      if (progress.regionId === targetRegion.id && progress.status === 'completed') {
        completedObserved = true;
      }
    });

    try {
      const success = await regionManager.downloadRegion(targetRegion);
      expect(success).toBe(true);
      expect(completedObserved).toBe(true);
      const isReady = await regionManager.isRegionReady(targetRegion.id);
      expect(isReady).toBe(true);
      const downloaded = await regionManager.getDownloadedRegions();
      expect(downloaded.some(d => d.regionId === targetRegion.id)).toBe(true);
    } finally {
      unsubscribe();
      await regionManager.deleteRegion(targetRegion.id);
    }
  });
});


