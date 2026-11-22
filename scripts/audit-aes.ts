/**
 * Informational AES audit: checks the camera table for basic integrity and shows
 * how close each camera is to a few common corridors.
 *
 * Usage: npm run audit:aes
 */
Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });

import { MALAYSIA_AES_CAMERAS, distancePointToSegmentMeters } from '../src/services/traffic/aesCameraData';

const routes: Array<{ name: string; a: [number, number]; b: [number, number] }> = [
  { name: 'Sg Besi -> Seremban', a: [101.712, 3.052], b: [101.938, 2.725] },
  { name: 'KL -> Penang', a: [101.693, 3.141], b: [100.4505, 5.3223] },
  { name: 'Kajang -> Cheras', a: [101.7888, 2.9911], b: [101.764479, 3.0332544] }
];

function minDistanceToRoute(route: [number, number][], point: [number, number]): number {
  let best = Infinity;
  for (let i = 0; i < route.length - 1; i++) {
    best = Math.min(best, distancePointToSegmentMeters(point, route[i], route[i + 1]));
  }
  return best;
}

const ids = new Set<string>();
let invalid = 0;
for (const camera of MALAYSIA_AES_CAMERAS) {
  if (ids.has(camera.id)) {
    console.error(`duplicate camera id: ${camera.id}`);
    invalid++;
  }
  ids.add(camera.id);
  const [lng, lat] = camera.coordinates;
  if (lng < 99 || lng > 120 || lat < 0.8 || lat > 7.6) {
    console.error(`camera outside Malaysia: ${camera.id} (${lng}, ${lat})`);
    invalid++;
  }
}
console.log(`${MALAYSIA_AES_CAMERAS.length} cameras, ${invalid} integrity problem(s).`);

for (const trip of routes) {
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${trip.a[0]},${trip.a[1]};${trip.b[0]},${trip.b[1]}?overview=full&geometries=geojson`
  );
  const data: any = await res.json();
  if (data.code !== 'Ok') {
    console.error(`${trip.name}: OSRM ${data.code}`);
    continue;
  }
  const route = data.routes[0].geometry.coordinates as [number, number][];
  const nearby = MALAYSIA_AES_CAMERAS.map(camera => ({
    camera,
    distance: minDistanceToRoute(route, camera.coordinates)
  }))
    .filter(entry => entry.distance <= 250)
    .sort((a, b) => a.distance - b.distance);

  console.log(`\n${trip.name} (${(data.routes[0].distance / 1000).toFixed(1)} km)`);
  if (nearby.length === 0) console.log('  no camera within 250 m of the route');
  for (const entry of nearby) {
    console.log(`  ${entry.camera.id}: ${entry.distance.toFixed(0)} m`);
  }
}
