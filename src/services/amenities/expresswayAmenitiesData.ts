import { EnRouteAmenity } from './types';

export const MALAYSIA_EXPRESSWAY_AMENITIES: EnRouteAmenity[] = [
  // PLUS E1 (Northern Route)
  {
    id: 'amenity-rawang-petronas',
    name: 'Petronas R&R Rawang (Arah Utara)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'PLUS E1',
    kmMarker: 'KM 440',
    coordinates: [101.575, 3.325]
  },
  {
    id: 'amenity-rawang-ev',
    name: 'Gentari 60kW DC Fast Charger R&R Rawang',
    type: 'ev_fast_charger',
    brand: 'Gentari',
    expressway: 'PLUS E1',
    kmMarker: 'KM 440',
    coordinates: [101.576, 3.326],
    evSpecs: { operator: 'Gentari', maxKw: 60, plugs: ['CCS2'] }
  },
  {
    id: 'amenity-ulu-bernam-shell',
    name: 'Shell Hentian Sebelah Ulu Bernam (Arah Utara)',
    type: 'shell',
    brand: 'Shell',
    expressway: 'PLUS E1',
    kmMarker: 'KM 398',
    coordinates: [101.401, 3.650]
  },
  {
    id: 'amenity-tapah-petronas',
    name: 'Petronas R&R Tapah (Arah Utara)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'PLUS E1',
    kmMarker: 'KM 332',
    coordinates: [101.296, 4.020]
  },
  {
    id: 'amenity-tapah-shell',
    name: 'Shell R&R Tapah (Arah Utara)',
    type: 'shell',
    brand: 'Shell',
    expressway: 'PLUS E1',
    kmMarker: 'KM 332',
    coordinates: [101.297, 4.022]
  },
  {
    id: 'amenity-tapah-ev',
    name: 'Gentari 150kW DC Fast Charger R&R Tapah',
    type: 'ev_fast_charger',
    brand: 'Gentari',
    expressway: 'PLUS E1',
    kmMarker: 'KM 332',
    coordinates: [101.298, 4.021],
    evSpecs: { operator: 'Gentari', maxKw: 150, plugs: ['CCS2'] }
  },
  {
    id: 'amenity-gunung-semanggol-caltex',
    name: 'Caltex R&R Gunung Semanggol (Arah Utara)',
    type: 'caltex',
    brand: 'Caltex',
    expressway: 'PLUS E1',
    kmMarker: 'KM 195',
    coordinates: [100.640, 4.960]
  },
  {
    id: 'amenity-juru-petronas',
    name: 'Petronas Layby Juru (Arah Utara)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'PLUS E1',
    kmMarker: 'KM 141',
    coordinates: [100.435, 5.320]
  },
  {
    id: 'amenity-juru-ev',
    name: 'ChargEV 120kW DC Fast Charger Juru Autocity',
    type: 'ev_fast_charger',
    brand: 'ChargEV',
    expressway: 'PLUS E1',
    kmMarker: 'KM 141',
    coordinates: [100.434, 5.322],
    evSpecs: { operator: 'ChargEV', maxKw: 120, plugs: ['CCS2'] }
  },

  // PLUS E2 (Southern Route)
  {
    id: 'amenity-seremban-petronas',
    name: 'Petronas R&R Seremban (Arah Selatan)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'PLUS E2',
    kmMarker: 'KM 274',
    coordinates: [101.915, 2.715]
  },
  {
    id: 'amenity-seremban-shell',
    name: 'Shell R&R Seremban (Arah Selatan)',
    type: 'shell',
    brand: 'Shell',
    expressway: 'PLUS E2',
    kmMarker: 'KM 274',
    coordinates: [101.916, 2.716]
  },
  {
    id: 'amenity-seremban-ev',
    name: 'Gentari 180kW DC Ultra Fast Charger R&R Seremban',
    type: 'ev_fast_charger',
    brand: 'Gentari',
    expressway: 'PLUS E2',
    kmMarker: 'KM 274',
    coordinates: [101.917, 2.714],
    evSpecs: { operator: 'Gentari', maxKw: 180, plugs: ['CCS2'] }
  },
  {
    id: 'amenity-ayer-keroh-petronas',
    name: 'Petronas R&R Ayer Keroh (Arah Selatan)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'PLUS E2',
    kmMarker: 'KM 206',
    coordinates: [102.260, 2.380]
  },
  {
    id: 'amenity-ayer-keroh-ev',
    name: 'DC Handal 200kW Fast Charger Ayer Keroh OBR',
    type: 'ev_fast_charger',
    brand: 'DC Handal',
    expressway: 'PLUS E2',
    kmMarker: 'KM 206',
    coordinates: [102.261, 2.381],
    evSpecs: { operator: 'DC Handal', maxKw: 200, plugs: ['CCS2'] }
  },
  {
    id: 'amenity-machap-petronas',
    name: 'Petronas R&R Machap (Arah Selatan)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'PLUS E2',
    kmMarker: 'KM 74',
    coordinates: [103.265, 1.885]
  },
  {
    id: 'amenity-pagoh-caltex',
    name: 'Caltex R&R Pagoh (Arah Selatan)',
    type: 'caltex',
    brand: 'Caltex',
    expressway: 'PLUS E2',
    kmMarker: 'KM 135',
    coordinates: [102.775, 2.150]
  },

  // Karak & LPT E8 (East Coast Route)
  {
    id: 'amenity-genting-sempah-petronas',
    name: 'Petronas R&R Genting Sempah',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'Karak E8',
    kmMarker: 'KM 38',
    coordinates: [101.785, 3.355]
  },
  {
    id: 'amenity-genting-sempah-ev',
    name: 'ChargEV 120kW DC Fast Charger Genting Sempah',
    type: 'ev_fast_charger',
    brand: 'ChargEV',
    expressway: 'Karak E8',
    kmMarker: 'KM 38',
    coordinates: [101.786, 3.356],
    evSpecs: { operator: 'ChargEV', maxKw: 120, plugs: ['CCS2'] }
  },
  {
    id: 'amenity-temerloh-shell',
    name: 'Shell R&R Temerloh (Arah Timur)',
    type: 'shell',
    brand: 'Shell',
    expressway: 'LPT E8',
    kmMarker: 'KM 126',
    coordinates: [102.420, 3.480]
  },
  {
    id: 'amenity-gambang-petronas',
    name: 'Petronas R&R Gambang (Arah Timur)',
    type: 'petronas',
    brand: 'Petronas',
    expressway: 'LPT E8',
    kmMarker: 'KM 220',
    coordinates: [103.110, 3.710]
  }
];
