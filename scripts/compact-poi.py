#!/usr/bin/env python3
"""
Compacts Overture Maps / Open POI data into a minimal footprint.
Filters Malaysian bounding boxes, removes duplicate POIs, and rounds coordinates
to 4 decimal places (~11m precision).
"""
import sys, json, gzip, re, unicodedata

def normalize_text(text):
    if not text:
        return ""
    text = unicodedata.normalize('NFKD', str(text).lower())
    return ''.join(c for c in text if not unicodedata.combining(c))

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 compact-poi.py <input.geojsonseq|json> <output.json.gz>")
        sys.exit(1)

    infile = sys.argv[1]
    outfile = sys.argv[2]

    # Malaysian bounding box: [99.0, 0.8, 120.0, 7.6]
    seen = set()
    records = []

    opener = gzip.open if infile.endswith('.gz') else open
    with opener(infile, 'rt', encoding='utf-8', errors='ignore') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                item = json.loads(line)
            except Exception:
                continue

            # Extract fields from GeoJSON or raw Overture item
            props = item.get('properties', item)
            geom = item.get('geometry', {})
            coords = geom.get('coordinates', props.get('coordinates'))
            if not coords or len(coords) < 2:
                continue

            lng, lat = float(coords[0]), float(coords[1])
            # Bounding box filter for Malaysia
            if not (99.0 <= lng <= 120.0 and 0.8 <= lat <= 7.6):
                continue

            # Primary names
            names = props.get('names', {})
            name = (
                names.get('primary') or
                props.get('name') or
                names.get('common', {}).get('en') or
                names.get('common', {}).get('ms')
            )
            if not name or len(name) < 2:
                continue

            category = props.get('categories', {}).get('primary') or props.get('category', 'place')
            city = props.get('addresses', [{}])[0].get('city', '') if isinstance(props.get('addresses'), list) and props.get('addresses') else ''

            key = (normalize_text(name), round(lng, 3), round(lat, 3))
            if key in seen:
                continue
            seen.add(key)

            records.append([
                name.strip(),
                round(lng, 4),
                round(lat, 4),
                category,
                city
            ])

    payload = {
        'count': len(records),
        'records': records
    }

    compressed = gzip.compress(json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))
    with open(outfile, 'wb') as out:
        out.write(compressed)

    print(f"Compacted {len(records)} Malaysian POIs into {outfile} ({len(compressed)} bytes).")

if __name__ == '__main__':
    main()

