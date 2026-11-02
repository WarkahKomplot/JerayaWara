/**
 * Lightweight Malaysian POI Ingestion & Compiler
 *
 * Can ingest GeoJSON / Overture / OSM GeoJSON files and compile them into
 * a micro-compact payload for JerayaWara PWA.
 *
 * Usage:
 *   npx ts-node scripts/ingest-pois.ts <path-to-geojson-or-csv>
 */

import * as fs from 'fs';
import * as path from 'path';

interface RawPOI {
  name: string;
  lng: number;
  lat: number;
  category: string;
  city?: string;
}

export function compilePOIToCompactAsset(pois: RawPOI[], outputPath: string) {
  // Deduplicate by name & approximate coords (to 3 decimal places ~100m)
  const seen = new Set<string>();
  const records: [string, number, number, string, string][] = [];

  for (const poi of pois) {
    if (!poi.name || isNaN(poi.lng) || isNaN(poi.lat)) continue;
    const key = `${poi.name.trim().toLowerCase()}_${poi.lng.toFixed(3)}_${poi.lat.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);

    records.push([
      poi.name.trim(),
      Number(poi.lng.toFixed(5)),
      Number(poi.lat.toFixed(5)),
      poi.category || 'landmark',
      poi.city || ''
    ]);
  }

  const payload = {
    count: records.length,
    updatedAt: new Date().toISOString(),
    records
  };

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(payload), 'utf8');
  console.log(`Successfully compiled ${records.length} POIs to ${outputPath}`);
}

