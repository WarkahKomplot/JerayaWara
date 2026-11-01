import { RegionPack, detectProximityBoundary } from './regions';
import { offlineDb, CachedRegionRecord } from './db';

export interface DownloadProgress {
  regionId: string;
  progressPercent: number;
  downloadedMB: number;
  totalMB: number;
  status: 'idle' | 'downloading' | 'completed' | 'quota_exceeded' | 'error';
  errorMessage?: string;
}

export class RegionManager {
  private activeDownloads = new Map<string, DownloadProgress>();
  private listeners: ((progress: DownloadProgress) => void)[] = [];

  async getDownloadedRegions(): Promise<CachedRegionRecord[]> {
    try {
      return await offlineDb.regions.where('status').equals('ready').toArray();
    } catch {
      return [];
    }
  }

  async isRegionReady(regionId: string): Promise<boolean> {
    try {
      const rec = await offlineDb.regions.get(regionId);
      return rec?.status === 'ready';
    } catch {
      return false;
    }
  }

  onProgress(listener: (progress: DownloadProgress) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyProgress(progress: DownloadProgress) {
    this.activeDownloads.set(progress.regionId, progress);
    for (const listener of this.listeners) {
      listener(progress);
    }
  }

  /**
   * Simulates/fetches regional package chunk and stores in IndexedDB
   * Handles QuotaExceededError for iOS Safari and other storage-constrained devices
   */
  async downloadRegion(region: RegionPack): Promise<boolean> {
    const regionId = region.id;
    try {
      // Check storage estimate if API is available
      if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const availableBytes = (estimate.quota || 0) - (estimate.usage || 0);
        const requiredBytes = region.sizeMB * 1024 * 1024;
        if (estimate.quota && availableBytes < requiredBytes) {
          throw new DOMException('Storage quota insufficient for this region.', 'QuotaExceededError');
        }
      }

      await offlineDb.regions.put({
        regionId,
        name: region.name,
        sizeMB: region.sizeMB,
        downloadedAt: Date.now(),
        version: '2026.11',
        status: 'downloading'
      });

      // Simulation of chunked stream download
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        await new Promise(res => setTimeout(res, 80));
        const progressPercent = i * 10;
        const downloadedMB = Math.round((region.sizeMB * (progressPercent / 100)) * 10) / 10;
        this.notifyProgress({
          regionId,
          progressPercent,
          downloadedMB,
          totalMB: region.sizeMB,
          status: i === steps ? 'completed' : 'downloading'
        });
      }

      await offlineDb.regions.put({
        regionId,
        name: region.name,
        sizeMB: region.sizeMB,
        downloadedAt: Date.now(),
        version: '2026.11',
        status: 'ready'
      });

      return true;
    } catch (err: any) {
      const isQuota = err?.name === 'QuotaExceededError' || err?.code === 22;
      this.notifyProgress({
        regionId,
        progressPercent: 0,
        downloadedMB: 0,
        totalMB: region.sizeMB,
        status: isQuota ? 'quota_exceeded' : 'error',
        errorMessage: isQuota
          ? 'Storage quota exceeded on this device. Evict older regional packs to reclaim space.'
          : 'Download failed. Check connection.'
      });
      return false;
    }
  }

  async deleteRegion(regionId: string): Promise<void> {
    await offlineDb.regions.delete(regionId);
    await offlineDb.tiles.where('regionId').equals(regionId).delete();
  }

  /**
   * Proactive boundary geofence check: if within 15km of an uncached region,
   * automatically triggers background download with exponential backoff retry.
   */
  async handleProximityGeofence(coord: [number, number]): Promise<string[]> {
    const nearbyRegions = detectProximityBoundary(coord, 15);
    const triggered: string[] = [];

    for (const region of nearbyRegions) {
      const ready = await this.isRegionReady(region.id);
      const isCurrentlyDownloading = this.activeDownloads.get(region.id)?.status === 'downloading';

      if (!ready && !isCurrentlyDownloading) {
        triggered.push(region.id);
        // Exponential backoff retry loop (tries up to 3 times: immediate, 2s, 6s)
        (async () => {
          let attempts = 0;
          let success = false;
          while (attempts < 3 && !success) {
            attempts++;
            success = await this.downloadRegion(region);
            if (!success && attempts < 3) {
              await new Promise(r => setTimeout(r, Math.pow(2, attempts) * 1000));
            }
          }
        })();
      }
    }

    return triggered;
  }
}

export const regionManager = new RegionManager();
