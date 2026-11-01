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
  },

  // Major Malaysian Shopping Malls
  {
    id: 'mall-midvalley',
    title: 'Mid Valley Megamall & The Gardens',
    subtitle: 'Lingkaran Syed Putra, Kuala Lumpur',
    category: 'shopping',
    coordinates: [101.6770, 3.1176],
    regionId: 'klang-valley'
  },
  {
    id: 'mall-pavilion-kl',
    title: 'Pavilion Kuala Lumpur (Bukit Bintang)',
    subtitle: 'Jalan Bukit Bintang, Kuala Lumpur',
    category: 'shopping',
    coordinates: [101.7134, 3.1488],
    regionId: 'klang-valley'
  },
  {
    id: 'mall-1-utama',
    title: '1 Utama Shopping Centre',
    subtitle: 'Bandar Utama, Petaling Jaya, Selangor',
    category: 'shopping',
    coordinates: [101.6152, 3.1506],
    regionId: 'klang-valley'
  },
  {
    id: 'mall-sunway-pyramid',
    title: 'Sunway Pyramid Shopping Mall',
    subtitle: 'Bandar Sunway, Subang Jaya, Selangor',
    category: 'shopping',
    coordinates: [101.6067, 3.0733],
    regionId: 'klang-valley'
  },
  {
    id: 'mall-ioi-city',
    title: 'IOI City Mall Putrajaya / Sepang',
    subtitle: 'Lebuh IRC, IOI Resort, Putrajaya',
    category: 'shopping',
    coordinates: [101.7144, 2.9698],
    regionId: 'klang-valley'
  },
  {
    id: 'mall-queensbay',
    title: 'Queensbay Mall Penang',
    subtitle: 'Bayan Lepas, Pulau Pinang',
    category: 'shopping',
    coordinates: [100.3067, 5.3328],
    regionId: 'northern'
  },
  {
    id: 'mall-tebrau-city',
    title: 'AEON Mall Tebrau City & Toppen JB',
    subtitle: 'Desa Tebrau, Johor Bahru, Johor',
    category: 'shopping',
    coordinates: [103.7964, 1.5487],
    regionId: 'southern'
  },
  {
    id: 'mall-vivacity-kuching',
    title: 'Vivacity Megamall Kuching',
    subtitle: 'Jalan Wan Alwi, Kuching, Sarawak',
    category: 'shopping',
    coordinates: [110.3621, 1.5283],
    regionId: 'sarawak'
  },
  {
    id: 'mall-imago-kk',
    title: 'Imago Shopping Mall Kota Kinabalu',
    subtitle: 'KK Times Square, Kota Kinabalu, Sabah',
    category: 'shopping',
    coordinates: [116.0645, 5.9714],
    regionId: 'sabah'
  },

  // Airports & Major Transit Hubs
  {
    id: 'airport-klia-t1',
    title: 'KLIA Terminal 1 (Main Terminal Airport)',
    subtitle: 'Sepang, Selangor',
    category: 'transit',
    coordinates: [101.7042, 2.7456],
    regionId: 'klang-valley'
  },
  {
    id: 'airport-klia-t2',
    title: 'KLIA Terminal 2 (klia2 AirAsia / Low Cost)',
    subtitle: 'Sepang, Selangor',
    category: 'transit',
    coordinates: [101.6842, 2.7433],
    regionId: 'klang-valley'
  },
  {
    id: 'airport-subang',
    title: 'Subang Airport (Skypark Sultan Abdul Aziz Shah)',
    subtitle: 'Subang, Selangor',
    category: 'transit',
    coordinates: [101.5492, 3.1325],
    regionId: 'klang-valley'
  },
  {
    id: 'transit-tbs',
    title: 'Terminal Bersepadu Selatan (TBS Bus Hub)',
    subtitle: 'Bandar Tasik Selatan, Kuala Lumpur',
    category: 'transit',
    coordinates: [101.7108, 3.0768],
    regionId: 'klang-valley'
  },
  {
    id: 'airport-penang',
    title: 'Penang International Airport (PIA)',
    subtitle: 'Bayan Lepas, Pulau Pinang',
    category: 'transit',
    coordinates: [100.2767, 5.2971],
    regionId: 'northern'
  },
  {
    id: 'airport-senai',
    title: 'Senai International Airport JB',
    subtitle: 'Senai, Kulai, Johor',
    category: 'transit',
    coordinates: [103.6697, 1.6413],
    regionId: 'southern'
  },
  {
    id: 'airport-kuching',
    title: 'Kuching International Airport (KIA)',
    subtitle: 'Kuching, Sarawak',
    category: 'transit',
    coordinates: [110.3469, 1.4847],
    regionId: 'sarawak'
  },
  {
    id: 'airport-kk',
    title: 'Kota Kinabalu International Airport (BKI)',
    subtitle: 'Kepayan, Kota Kinabalu, Sabah',
    category: 'transit',
    coordinates: [116.0512, 5.9372],
    regionId: 'sabah'
  },

  // Major Public Hospitals
  {
    id: 'hosp-hkl',
    title: 'Hospital Kuala Lumpur (HKL)',
    subtitle: 'Jalan Pahang, Kuala Lumpur',
    category: 'hospital',
    coordinates: [101.7028, 3.1712],
    regionId: 'klang-valley'
  },
  {
    id: 'hosp-kajang',
    title: 'Hospital Kajang',
    subtitle: 'Jalan Semenyih, Kajang, Selangor',
    category: 'hospital',
    coordinates: [101.7925, 2.9922],
    regionId: 'klang-valley'
  },
  {
    id: 'hosp-serdang',
    title: 'Hospital Sultan Idris Shah (Hospital Serdang)',
    subtitle: 'Jalan Puchong, Serdang, Selangor',
    category: 'hospital',
    coordinates: [101.7214, 2.9772],
    regionId: 'klang-valley'
  },
  {
    id: 'hosp-selayang',
    title: 'Hospital Selayang',
    subtitle: 'Lebuhraya Selayang-Kepong, Batu Caves, Selangor',
    category: 'hospital',
    coordinates: [101.6442, 3.2508],
    regionId: 'klang-valley'
  },
  {
    id: 'hosp-penang',
    title: 'Hospital Pulau Pinang (General Hospital)',
    subtitle: 'Jalan Residensi, George Town, Pulau Pinang',
    category: 'hospital',
    coordinates: [100.3125, 5.4172],
    regionId: 'northern'
  },
  {
    id: 'hosp-hsa-jb',
    title: 'Hospital Sultanah Aminah (HSA JB)',
    subtitle: 'Jalan Skudai, Johor Bahru, Johor',
    category: 'hospital',
    coordinates: [103.7464, 1.4589],
    regionId: 'southern'
  },
  {
    id: 'hosp-sarawak-general',
    title: 'Hospital Umum Sarawak (Sarawak General Hospital)',
    subtitle: 'Jalan Hospital, Kuching, Sarawak',
    category: 'hospital',
    coordinates: [110.3392, 1.5425],
    regionId: 'sarawak'
  },

  // Major Universities
  {
    id: 'univ-um',
    title: 'Universiti Malaya (UM)',
    subtitle: 'Lembah Pantai, Kuala Lumpur',
    category: 'university',
    coordinates: [101.6567, 3.1209],
    regionId: 'klang-valley'
  },
  {
    id: 'univ-ukm-bangi',
    title: 'Universiti Kebangsaan Malaysia (UKM Bangi)',
    subtitle: 'Bandar Baru Bangi, Selangor',
    category: 'university',
    coordinates: [101.7803, 2.9289],
    regionId: 'klang-valley'
  },
  {
    id: 'univ-upm',
    title: 'Universiti Putra Malaysia (UPM)',
    subtitle: 'Serdang, Selangor',
    category: 'university',
    coordinates: [101.7144, 2.9997],
    regionId: 'klang-valley'
  },
  {
    id: 'univ-utm-skudai',
    title: 'Universiti Teknologi Malaysia (UTM Skudai)',
    subtitle: 'Skudai, Johor Bahru, Johor',
    category: 'university',
    coordinates: [103.6382, 1.5583],
    regionId: 'southern'
  },
  {
    id: 'univ-usm-penang',
    title: 'Universiti Sains Malaysia (USM)',
    subtitle: 'Gelugor, Pulau Pinang',
    category: 'university',
    coordinates: [100.3012, 5.3558],
    regionId: 'northern'
  },
  {
    id: 'univ-uitm-shah-alam',
    title: 'Universiti Teknologi MARA (UiTM Shah Alam)',
    subtitle: 'Seksyen 1, Shah Alam, Selangor',
    category: 'university',
    coordinates: [101.5036, 3.0697],
    regionId: 'klang-valley'
  },

  // Top Attractions & National Landmarks
  {
    id: 'landmark-batu-caves',
    title: 'Batu Caves Murugan Temple',
    subtitle: 'Gombak, Selangor',
    category: 'landmark',
    coordinates: [101.6842, 3.2374],
    regionId: 'klang-valley'
  },
  {
    id: 'landmark-genting',
    title: 'Genting Highlands (SkyAvenue & Resort)',
    subtitle: 'Genting Highlands, Pahang',
    category: 'landmark',
    coordinates: [101.7933, 3.4242],
    regionId: 'east-coast'
  },
  {
    id: 'landmark-cameron',
    title: 'Cameron Highlands (Tanah Rata Town)',
    subtitle: 'Tanah Rata, Pahang',
    category: 'landmark',
    coordinates: [101.3783, 4.4717],
    regionId: 'east-coast'
  },
  {
    id: 'landmark-legoland',
    title: 'Legoland Malaysia Resort',
    subtitle: 'Iskandar Puteri, Johor',
    category: 'landmark',
    coordinates: [103.6297, 1.4272],
    regionId: 'southern'
  }
];

