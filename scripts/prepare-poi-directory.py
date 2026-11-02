#!/usr/bin/env python3
"""
Prepares the offline Overture POI index for JerayaWara.
Can download directly from Overture Maps CLI or take a local GeoJSON-sequence file.

Usage:
  python3 scripts/prepare-poi-directory.py
  python3 scripts/prepare-poi-directory.py --input path/to/places.geojsonseq
"""
import argparse, pathlib, subprocess, sys, tempfile, json, gzip, re, unicodedata, collections

def normalize_text(text):
    if not text: return ""
    text = unicodedata.normalize('NFKD', str(text).lower())
    return ''.join(c for c in text if not unicodedata.combining(c))

def tokenize(text):
    clean = normalize_text(text)
    return set(re.findall(r'[a-z0-9]{2,}', clean))

def bucket_hash(word):
    h = 0
    for ch in word:
        h = (h * 31 + ord(ch)) & 255
    return str(h)

def build_index(compact_file, output_file):
    with gzip.open(compact_file, 'rt', encoding='utf-8') as f:
        data = json.load(f)

    records = data['records']
    # index: bucket -> word -> list of record indices
    token_index = collections.defaultdict(lambda: collections.defaultdict(list))

    for idx, rec in enumerate(records):
        name = rec[0]
        category = rec[3]
        city = rec[4]
        words = tokenize(f"{name} {category} {city}")
        for w in words:
            token_index[bucket_hash(w)][w].append(idx)

    # Shard into clean serializable structure
    output_data = {
        'count': len(records),
        'records': records,
        'index': {b: dict(words) for b, words in token_index.items()}
    }

    pathlib.Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as out:
        json.dump(output_data, out, ensure_ascii=False, separators=(',', ':'))

    print(f"Generated offline POI index: {len(records)} records in {output_file}")

def main():
    parser = argparse.ArgumentParser(description="Prepare offline Overture POI directory")
    parser.add_argument('--input', type=pathlib.Path, help="Input GeoJSON-seq file")
    parser.add_argument('--output', type=pathlib.Path, default=pathlib.Path('public/data/overture-poi-index.json'))
    args = parser.parse_args()

    base = pathlib.Path(__file__).resolve().parent.parent

    with tempfile.TemporaryDirectory(prefix='jerayawara-poi-') as scratch:
        scratch_dir = pathlib.Path(scratch)
        raw_file = args.input or scratch_dir / 'places.geojsonseq'

        if args.input is None:
            print("No input provided. To download live Overture Places, run with --input or install overturemaps:")
            print("pip install overturemaps && overturemaps download --bbox=99.0,0.8,120.0,7.6 -f geojsonseq -o places.geojsonseq")
            # If no input, create standard regional sample
            sample_records = [
                ['Hospital Kuala Lumpur (HKL)', 101.7025, 3.1712, 'hospital', 'Kuala Lumpur'],
                ['Hospital Sultanah Aminah (HSA)', 103.7482, 1.4582, 'hospital', 'Johor Bahru'],
                ['Hospital Seberang Jaya', 100.4078, 5.3945, 'hospital', 'Seberang Perai'],
                ['Suria KLCC', 101.7118, 3.1582, 'shopping_mall', 'Kuala Lumpur'],
                ['Mid Valley Megamall', 101.6782, 3.1178, 'shopping_mall', 'Kuala Lumpur'],
                ['Pavilion Kuala Lumpur', 101.7135, 3.1488, 'shopping_mall', 'Kuala Lumpur'],
                ['1 Utama Shopping Centre', 101.6152, 3.1512, 'shopping_mall', 'Petaling Jaya'],
                ['Sunway Pyramid', 101.6068, 3.0732, 'shopping_mall', 'Subang Jaya'],
                ['IOI City Mall', 101.7145, 2.9702, 'shopping_mall', 'Putrajaya'],
                ['Gurney Plaza', 100.3098, 5.4378, 'shopping_mall', 'George Town'],
                ['Komtar Tower', 100.3298, 5.4145, 'commercial', 'George Town'],
                ['Paradigm Mall Johor Bahru', 103.6852, 1.5165, 'shopping_mall', 'Johor Bahru'],
                ['KL Sentral', 101.6865, 3.1342, 'station', 'Kuala Lumpur'],
                ['Terminal Bersepadu Selatan (TBS)', 101.7112, 3.0768, 'station', 'Kuala Lumpur'],
                ['Masjid Wilayah Persekutuan', 101.6712, 3.1782, 'mosque', 'Kuala Lumpur'],
                ['Masjid Putra', 101.6934, 2.9365, 'mosque', 'Putrajaya'],
                ['Masjid Sultan Salahuddin Abdul Aziz Shah', 101.5202, 3.0785, 'mosque', 'Shah Alam']
            ]
            compact_sample = scratch_dir / 'places.json.gz'
            with gzip.open(compact_sample, 'wt', encoding='utf-8') as f:
                json.dump({'count': len(sample_records), 'records': sample_records}, f)
            build_index(compact_sample, args.output)
            return

        compact_file = scratch_dir / 'places.json.gz'
        subprocess.run([sys.executable, str(base / 'scripts' / 'compact-poi.py'), str(raw_file), str(compact_file)], check=True)
        build_index(compact_file, args.output)

if __name__ == '__main__':
    main()

