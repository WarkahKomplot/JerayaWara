import { RegionPack, detectProximityBoundary } from './regions';
import { offlineDb, CachedRegionRecord } from './db';

export interface DownloadProgress {
  regionId: string;
  progressPercent: number;
  downloadedMB: number;
  totalMB: number;
  status: 'idle' | 'downloading' | 'completed' | 'error';
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
   */
  async downloadRegion(region: RegionPack): Promise<boolean> {
    const regionId = region.id;
    try {
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
    } catch {
      this.notifyProgress({
        regionId,
        progressPercent: 0,
        downloadedMB: 0,
        totalMB: region.sizeMB,
        status: 'error'
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
   * automatically triggers background download.
   */
  async handleProximityGeofence(coord: [number, number]): Promise<string[]> {
    const nearbyRegions = detectProximityBoundary(coord, 15);
    const triggered: string[] = [];

    for (const region of nearbyRegions) {
      const ready = await this.isRegionReady(region.id);
      const isCurrentlyDownloading = this.activeDownloads.get(region.id)?.status === 'downloading';

      if (!ready && !isCurrentlyDownloading) {
        triggered.push(region.id);
        // Start background download without blocking UI
        this.downloadRegion(region).catch(() => {});
      }
    }

    return triggered;
  }
}

export const regionManager = new RegionManager();
