/**
 * Generates a valid GPX 1.1 XML string from route coordinates.
 * Coordinates are formatted as [lng, lat].
 */
export function exportRouteToGPX(
  destinationTitle: string,
  coordinates: [number, number][],
  timestamps?: number[]
): string {
  const safeName = destinationTitle
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const nowIso = new Date().toISOString();

  let trackPointsXml = '';
  for (let i = 0; i < coordinates.length; i++) {
    const [lon, lat] = coordinates[i];
    const timeIso = timestamps && timestamps[i]
      ? new Date(timestamps[i]).toISOString()
      : nowIso;

    trackPointsXml += `      <trkpt lat="${lat}" lon="${lon}">\n        <time>${timeIso}</time>\n      </trkpt>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="JerayaWara Malaysia Nav" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
    <time>${nowIso}</time>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <trkseg>
${trackPointsXml}    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Triggers a browser file download of the GPX string.
 */
export function downloadGPXFile(filename: string, gpxContent: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.gpx') ? filename : `${filename}.gpx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
