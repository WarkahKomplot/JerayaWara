#!/usr/bin/env python3
"""
Builds the bundled Malaysian offline POI index from the GeoNames country dump.

GeoNames is CC BY 4.0 and country-specific, which avoids the border pollution of
a raw bbox extract. We keep populated places (cities, towns, villages) plus the
few mall/hospital spot codes, and leave the curated POIs in
src/services/search/malaysiaPOIData.ts for everything else.

Usage:
  python3 scripts/build-geonames-poi-index.py
  python3 scripts/build-geonames-poi-index.py --output public/data/malaysia-poi-index.json
"""
from __future__ import annotations

import argparse
import collections
import io
import json
import pathlib
import subprocess
import zipfile

GEONAMES_URL = 'https://download.geonames.org/export/dump/MY.zip'
ADMIN1_URL = 'https://download.geonames.org/export/dump/admin1CodesASCII.txt'
SPOT_CATEGORIES = {'MALL': 'shopping', 'HSP': 'hospital', 'HSPC': 'hospital'}


def download(url: str) -> bytes:
    # curl handles the TLS negotiation reliably across the system Pythons used
    # by contributors; urllib on older macOS Python builds fails against GeoNames.
    result = subprocess.run(
        ['curl', '-sSL', '--max-time', '120', '-A', 'JerayaWara-POI-Builder/1.0', url],
        capture_output=True
    )
    if result.returncode != 0:
        raise RuntimeError(f'Download failed ({result.returncode}): {url}')
    return result.stdout


def load_admin1_names(local_file: pathlib.Path | None = None) -> dict:
    names = {}
    try:
        raw = local_file.read_bytes() if local_file else download(ADMIN1_URL)
    except Exception:
        # The admin-name file is a nicety; fall back to "Malaysia" subtitles.
        return names
    for line in raw.decode('utf-8').splitlines():
        parts = line.split('\t')
        if len(parts) >= 2 and parts[0].startswith('MY.'):
            names[parts[0]] = parts[1]
    return names


def main() -> None:
    parser = argparse.ArgumentParser(description='Build the Malaysian GeoNames POI index')
    parser.add_argument(
        '--output',
        type=pathlib.Path,
        default=pathlib.Path('public/data/malaysia-poi-index.json')
    )
    parser.add_argument('--geonames-zip', type=pathlib.Path, help='Local MY.zip instead of downloading')
    parser.add_argument('--admin1-file', type=pathlib.Path, help='Local admin1CodesASCII.txt')
    args = parser.parse_args()

    admin1 = load_admin1_names(args.admin1_file)
    zip_bytes = args.geonames_zip.read_bytes() if args.geonames_zip else download(GEONAMES_URL)
    archive = zipfile.ZipFile(io.BytesIO(zip_bytes))
    raw = archive.read('MY.txt').decode('utf-8')

    seen = set()
    records = []
    category_counts = collections.Counter()

    for line in raw.splitlines():
        fields = line.split('\t')
        if len(fields) < 19:
            continue

        name = fields[1].strip()
        lat = fields[4].strip()
        lng = fields[5].strip()
        feature_class = fields[6]
        feature_code = fields[7]
        admin1_code = fields[10]
        population = int(fields[14] or 0)

        if not name or not lat or not lng:
            continue

        if feature_class == 'P':
            category = 'city'
        elif feature_class == 'S' and feature_code in SPOT_CATEGORIES:
            category = SPOT_CATEGORIES[feature_code]
        else:
            continue

        # Skip unnamed/odd entries such as "?", "-" or purely numeric names.
        if name in {'?', '-', '--'} or name.isdigit():
            continue

        lat_f = round(float(lat), 4)
        lng_f = round(float(lng), 4)

        # Guard against GeoNames records with obviously wrong coordinates
        # (e.g. "Kampong Diri" at 0.33N, outside Malaysia).
        if not (99.0 <= lng_f <= 120.0 and 0.8 <= lat_f <= 7.6):
            continue

        key = f'{name.lower()}|{lat_f}|{lng_f}'
        if key in seen:
            continue
        seen.add(key)

        city = admin1.get(f'MY.{admin1_code}', 'Malaysia')
        records.append([name, lng_f, lat_f, category, city, population])
        category_counts[category] += 1

    records.sort(key=lambda record: (-record[5], record[0].lower()))
    records = [record[:5] for record in records]

    payload = {
        'count': len(records),
        'updatedAt': '2026-11-22',
        'attribution': 'Place names from GeoNames (CC BY 4.0)',
        'records': records
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
        encoding='utf-8'
    )

    size_mb = args.output.stat().st_size / (1024 * 1024)
    print(f'Wrote {len(records)} POIs to {args.output} ({size_mb:.2f} MB)')
    print('Categories:', dict(category_counts))


if __name__ == '__main__':
    main()
