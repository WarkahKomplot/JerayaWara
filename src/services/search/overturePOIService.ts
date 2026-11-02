import { SearchItem, POICategory } from './types';

export interface OvertureIndexData {
  count: number;
  records: [string, number, number, string, string][];
  index: Record<string, Record<string, number[]>>;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');
}

function tokenize(text: string): string[] {
  const clean = normalize(text);
  const matches = clean.match(/[a-z0-9]{2,}/g);
  return matches || [];
}

export function bucketHash(word: string): string {
  let h = 0;
  for (let i = 0; i < word.length; i++) {
    h = (h * 31 + word.charCodeAt(i)) & 255;
  }
  return h.toString();
}

function mapOvertureCategory(cat: string): POICategory {
  const norm = cat.toLowerCase();
  if (norm.includes('hospital') || norm.includes('clinic') || norm.includes('health')) return 'hospital';
  if (norm.includes('shopping') || norm.includes('mall') || norm.includes('store')) return 'shopping';
  if (norm.includes('station') || norm.includes('terminal') || norm.includes('transit') || norm.includes('airport')) return 'transit';
  if (norm.includes('university') || norm.includes('college') || norm.includes('school')) return 'university';
  if (norm.includes('toll')) return 'toll_plaza';
  return 'landmark';
}

/**
 * Searches indexed Overture POI records using token prefix and intersection matching.
 */
export function searchOvertureIndex(
  query: string,
  indexData: OvertureIndexData,
  limit: number = 8
): SearchItem[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0 || !indexData || !indexData.records) {
    return [];
  }

  // Find candidate record indices matching tokens
  const matchCounts = new Map<number, number>();

  for (const token of queryTokens) {
    const bucket = bucketHash(token);
    const bucketWords = indexData.index?.[bucket];

    if (bucketWords) {
      // Check prefix / exact matches inside bucket
      for (const [indexedWord, indices] of Object.entries(bucketWords)) {
        if (indexedWord.startsWith(token) || token.startsWith(indexedWord)) {
          for (const idx of indices) {
            matchCounts.set(idx, (matchCounts.get(idx) || 0) + 1);
          }
        }
      }
    } else {
      // Fallback linear scan on records if bucket index is empty
      for (let i = 0; i < indexData.records.length; i++) {
        const nameNorm = normalize(indexData.records[i][0]);
        if (nameNorm.includes(token)) {
          matchCounts.set(i, (matchCounts.get(i) || 0) + 1);
        }
      }
    }
  }

  // Sort by token hit count (relevance)
  const sortedIndices = Array.from(matchCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, limit);

  return sortedIndices.map(idx => {
    const rec = indexData.records[idx];
    const name = rec[0];
    const lng = rec[1];
    const lat = rec[2];
    const category = rec[3];
    const city = rec[4];

    return {
      id: `overture-${idx}-${lng.toFixed(3)}-${lat.toFixed(3)}`,
      title: name,
      subtitle: city ? `${city} · ${category.replace(/_/g, ' ')}` : category.replace(/_/g, ' '),
      category: mapOvertureCategory(category),
      coordinates: [lng, lat],
      regionId: 'central'
    };
  });
}

