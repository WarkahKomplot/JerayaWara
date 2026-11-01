import { SearchItem } from './types';

export const MALAYSIA_OFFLINE_POIS: SearchItem[] = [
  // Major Cities & Hubs
  {
    id: 'poi-kl-cc',
    title: 'Kuala Lumpur City Centre (KLCC / Petronas Towers)',
    subtitle: 'WP Kuala Lumpur',
    category: 'landmark',
    coordinates: [101.7118, 3.1578],
    regionId: 'klang-valley'
  },
  {
    id: 'poi-kl-sentral',
    title: 'KL Sentral Transport Hub',
    subtitle: 'Brickfields, Kuala Lumpur',
    category: 'transit',
    coordinates: [101.6865, 3.1343],
    regionId: 'klang-valley'
  },
  {
    id: 'poi-putrajaya',
    title: 'Putrajaya Administrative Centre',
    subtitle: 'WP Putrajaya',
    category: 'city',
    coordinates: [101.6964, 2.9264],
    regionId: 'klang-valley'
  },
  {
    id: 'poi-georgetown',
    title: 'George Town (Heritage City)',
    subtitle: 'Penang Island, Pulau Pinang',
    category: 'city',
    coordinates: [100.3327, 5.4164],
    regionId: 'northern'
  },
  {
    id: 'poi-ipoh',
    title: 'Ipoh Old Town',
    subtitle: 'Kinta, Perak',
    category: 'city',
    coordinates: [101.0758, 4.5975],
    regionId: 'northern'
  },
  {
    id: 'poi-alor-setar',
    title: 'Alor Setar (Menara Alor Setar)',
    subtitle: 'Kota Setar, Kedah',
    category: 'city',
    coordinates: [100.3685, 6.1248],
    regionId: 'northern'
  },
  {
    id: 'poi-jb',
    title: 'Johor Bahru Central / CIQ',
    subtitle: 'Johor Bahru, Johor',
    category: 'city',
    coordinates: [103.7634, 1.4655],
    regionId: 'southern'
  },
  {
    id: 'poi-melaka',
    title: 'Melaka Historic Town / Jonker Walk',
    subtitle: 'Melaka Tengah, Melaka',
    category: 'city',
    coordinates: [102.2474, 2.1956],
    regionId: 'southern'
  },
  {
    id: 'poi-seremban',
    title: 'Seremban City Centre',
    subtitle: 'Negeri Sembilan',
    category: 'city',
    coordinates: [101.9381, 2.7258],
    regionId: 'southern'
  },
  {
    id: 'poi-kuantan',
    title: 'Kuantan / Teluk Cempedak',
    subtitle: 'Kuantan, Pahang',
    category: 'city',
    coordinates: [103.3256, 3.8168],
    regionId: 'east-coast'
  },
  {
    id: 'poi-kuala-terengganu',
    title: 'Kuala Terengganu (Pasar Payang)',
    subtitle: 'Terengganu',
    category: 'city',
    coordinates: [103.1324, 5.3302],
    regionId: 'east-coast'
  },
  {
    id: 'poi-kota-bharu',
    title: 'Kota Bharu (Pasar Siti Khadijah)',
    subtitle: 'Kelantan',
    category: 'city',
    coordinates: [102.2381, 6.1254],
    regionId: 'east-coast'
  },

  // East Malaysia (Sarawak & Sabah)
  {
    id: 'poi-kuching',
    title: 'Kuching Waterfront & Old Court House',
    subtitle: 'Kuching, Sarawak',
    category: 'city',
    coordinates: [110.3444, 1.5583],
    regionId: 'sarawak'
  },
  {
    id: 'poi-sibu',
    title: 'Sibu Town Centre / Rejang River',
    subtitle: 'Sibu, Sarawak',
    category: 'city',
    coordinates: [111.8214, 2.3000],
    regionId: 'sarawak'
  },
  {
    id: 'poi-miri',
    title: 'Miri City / Canada Hill',
    subtitle: 'Miri, Sarawak',
    category: 'city',
    coordinates: [113.9914, 4.3995],
    regionId: 'sarawak'
  },
  {
    id: 'poi-kk',
    title: 'Kota Kinabalu Waterfront & Gaya Street',
    subtitle: 'Kota Kinabalu, Sabah',
    category: 'city',
    coordinates: [116.0735, 5.9804],
    regionId: 'sabah'
  },
  {
    id: 'poi-sandakan',
    title: 'Sandakan Harbour',
    subtitle: 'Sandakan, Sabah',
    category: 'city',
    coordinates: [118.1174, 5.8394],
    regionId: 'sabah'
  },

  // Highway R&Rs (Rest & Service Areas)
  {
    id: 'rnr-tapah-nb',
    title: 'Tapah R&R (Northbound / Arah Utara)',
    subtitle: 'KM 332 PLUS Highway E1',
    category: 'rnr',
    expressway: 'PLUS E1',
    coordinates: [101.3005, 4.1950],
    regionId: 'northern'
  },
  {
    id: 'rnr-tapah-sb',
    title: 'Tapah R&R (Southbound / Arah Selatan)',
    subtitle: 'KM 332 PLUS Highway E1',
    category: 'rnr',
    expressway: 'PLUS E1',
    coordinates: [101.3008, 4.1945],
    regionId: 'northern'
  },
  {
    id: 'rnr-rawang',
    title: 'Rawang R&R (Northbound)',
    subtitle: 'KM 440 PLUS Highway E1',
    category: 'rnr',
    expressway: 'PLUS E1',
    coordinates: [101.5540, 3.3280],
    regionId: 'klang-valley'
  },
  {
    id: 'rnr-seremban-sb',
    title: 'Seremban R&R (Southbound / Arah Selatan)',
    subtitle: 'KM 274 PLUS Highway E2',
    category: 'rnr',
    expressway: 'PLUS E2',
    coordinates: [101.9125, 2.7050],
    regionId: 'southern'
  },
  {
    id: 'rnr-ayer-keroh',
    title: 'Ayer Keroh Overhead Bridge Restaurant R&R',
    subtitle: 'KM 210 PLUS Highway E2 (Restoran Jejantas)',
    category: 'rnr',
    expressway: 'PLUS E2',
    coordinates: [102.2605, 2.3920],
    regionId: 'southern'
  },
  {
    id: 'rnr-pagoh',
    title: 'Pagoh R&R (Southbound / Arah Selatan)',
    subtitle: 'KM 135 PLUS Highway E2',
    category: 'rnr',
    expressway: 'PLUS E2',
    coordinates: [102.7750, 2.1550],
    regionId: 'southern'
  },
  {
    id: 'rnr-genting-sempah',
    title: 'Genting Sempah R&R / Rest Stop',
    subtitle: 'Karak Expressway E8',
    category: 'rnr',
    expressway: 'KL-Karak E8',
    coordinates: [101.7920, 3.3550],
    regionId: 'east-coast'
  },

  // Major Toll Plazas & Exits
  {
    id: 'toll-sg-besi',
    title: 'Sungai Besi Toll Plaza',
    subtitle: 'Exit 210 PLUS E2 Entry/Exit Barrier',
    category: 'toll_plaza',
    expressway: 'PLUS E2',
    coordinates: [101.7100, 3.0550],
    regionId: 'klang-valley'
  },
  {
    id: 'toll-duta',
    title: 'Jalan Duta Toll Plaza',
    subtitle: 'PLUS E1 Northern Entry',
    category: 'toll_plaza',
    expressway: 'PLUS E1',
    coordinates: [101.6650, 3.1850],
    regionId: 'klang-valley'
  },
  {
    id: 'toll-salak-selatan',
    title: 'Salak Selatan Toll Plaza (MEX)',
    subtitle: 'Maju Expressway E20',
    category: 'toll_plaza',
    expressway: 'MEX E20',
    coordinates: [101.7050, 3.0900],
    regionId: 'klang-valley'
  },
  {
    id: 'toll-penang-bridge',
    title: 'Penang Bridge Toll Plaza',
    subtitle: 'Perai / Butterworth Entry E36',
    category: 'toll_plaza',
    expressway: 'Penang Bridge E36',
    coordinates: [100.4050, 5.3580],
    regionId: 'northern'
  }
];
