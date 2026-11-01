import { ManeuverType } from '../routing/types';

export type Language = 'ms' | 'en';

export const UI_TRANSLATIONS = {
  ms: {
    // Header & Badges
    appName: 'JerayaWara',
    gpsActive: 'GPS Aktif',
    gpsSearching: 'Mencari GPS...',
    offlineMap: 'Peta Luar Talian',
    autoSolar: 'AUTO (Suria)',
    dayMode: 'SIANG',
    nightMode: 'MALAM',
    switchLangTooltip: 'Tukar ke English (EN)',
    flashFloodAlert: 'Banjir Kilat: Awas takungan air di',
    motorcycleShelterAlert: 'Pondok Teduhan Motosikal:',
    ahead: 'di hadapan',
    driveCarefully: 'Pandu dengan cermat',

    // Search Bar
    searchPlaceholder: 'Cari destinasi di Malaysia (cth: KLCC, Penang, Genting)...',
    searchTitle: 'Carian Lokasi',
    recentSearches: 'Carian Terkini',
    clearAll: 'Padam Semua',
    popularDestinations: 'Destinasi Popular',
    noResults: 'Tiada hasil carian ditemui',
    searching: 'Mencari...',

    // Favorites
    favHome: 'Rumah',
    favWork: 'Kerja',
    favHometown: 'Balik Kampung',
    deleteFav: 'Padam / Reset',

    // Mode Selector
    modeCar: 'Kereta',
    modeMotorcycle: 'Motosikal',
    modeWalker: 'Pejalan Kaki',

    // Turn Banner
    inDistance: 'Dalam',
    motorcycleLaneAlert: 'Lorong Motosikal Khas (Dedicated Lane)',
    turnLeft: 'Belok kiri ke',
    turnRight: 'Belok kanan ke',
    slightLeft: 'Kekal kiri ke',
    slightRight: 'Kekal kanan ke',
    exitLeft: 'Susur keluar kiri ke',
    exitRight: 'Susur keluar kanan ke',
    uTurn: 'Pusingan U di hadapan',
    roundabout: 'Di bulatan, teruskan ke',
    arriveDest: 'Tiba di destinasi',
    continueOn: 'Teruskan di',
    voiceMuteTooltip: 'Matikan Suara',
    voiceUnmuteTooltip: 'Aktifkan Suara',
    voiceLangTooltip: 'Tukar bahasa suara',

    // Speedometer & Overlays
    speedUnit: 'km/j',
    speedLimit: 'HAD',
    cautionCamera: 'AWAS: Kamera AES',
    cameraDistance: 'Jarak',
    cameraLimit: 'Had',
    rainWarning: 'Hujan · Jarakkan Kenderaan',
    hudMirrorTip: 'Buka HUD Cermin Depan',
    showDateWeatherTip: 'Papar Tarikh & Cuaca',
    hideDateWeatherTip: 'Sorok Tarikh & Cuaca',

    // Trip Summary Drawer
    minUnit: 'min',
    hourUnit: 'jam',
    kmUnit: 'km',
    eta: 'ETA',
    trafficTitle: 'LALULINTAS:',
    trafficSmooth: 'Trafik Lancar',
    trafficModerate: 'Trafik Sederhana',
    trafficHeavy: 'Kesesakan Teruk',
    tollFares: 'Kadar Tol',
    tollFree: 'Bebas Tol',
    highwayCctv: 'Kamera CCTV Lebuhraya',
    enRouteAmenities: 'Stesen Minyak & EV',
    amenitiesNearby: 'berdekatan',
    show: 'Papar',
    hide: 'Sorok',
    routeStepsTurns: 'Langkah Laluan & Jalan',
    turnsCount: 'simpang',
    exitNav: 'Keluar Navigasi',
    exitNavCompact: 'Tamat',
    exportGpx: 'Eksport GPX',
    liveGpsRoute: 'Laluan GPS Langsung',
    infoToggle: 'Info',

    // En Route Amenities
    alongRoute: 'Sepanjang Laluan',
    allCategory: 'Semua',
    petrolCategory: 'Petrol',
    evCategory: 'EV Charger',
    noAmenitiesFound: 'Tiada stesen petrol/EV dikesan berhampiran koridor ini.',
    plugshareLink: 'Buka di PlugShare',
    syncOsmEv: 'Kemas Kini EV (OSM)',
    syncingOsmEv: 'Memuat turun stesen...',
    evSyncedSuccess: 'stesen EV dikemas kini',
    osmEvCommunityNotice: 'Data sumber terbuka OpenStreetMap & ulasan PlugShare',

    // Toll Breakdown Modal
    tollModalTitle: 'Pecahan Tol Lebuhraya Malaysia',
    tollModalSubtitle: 'Anggaran rasmi kadar plaza tol PLUS, KESAS, MEX, LDP & Jambatan Pulau Pinang',
    totalTollEstimate: 'Jumlah Anggaran Tol',
    tollClassCar: 'Kelas 1 (Kereta / Van)',
    tollClassMotorcycle: 'Motosikal (Percuma)',
    tollClassWalker: 'Pejalan Kaki (Bebas Tol)',
    paymentMethods: 'Kaedah Pembayaran',
    paymentMethodsDesc: 'Touch \'n Go, SmartTAG, RFID & MyDebit / Kad Kredit (PayDirect)',
    close: 'Tutup',

    // Region Download Modal
    offlineModalTitle: 'Peta Luar Talian Malaysia',
    offlineModalSubtitle: 'Muat turun pek peta vektor MapLibre mengikut zon negeri untuk navigasi tanpa capaian internet.',
    readyToUse: 'Sedia Digunakan',
    downloading: 'Memuat turun...',
    download: 'Muat Turun',
    delete: 'Padam',

    // Windshield HUD Overlay
    hudModeTitle: 'Mod HUD Cermin Depan',
    hudInstructions: 'Letakkan telefon di atas papan pemuka (dashboard). Paparan terbalik akan memantulkan info navigasi pada cermin depan.',
    mirrorActive: 'PANTULAN CERMIN AKTIF',
    closeHud: 'TUTUP HUD',
    driveSafely: 'PANDU DENGAN CERMAT',

    // Map Controls
    mapRouteOverview: 'Lihat Semua Laluan',
    mapResetNorth: 'Reset Ke Utara',
    mapRecenter: 'Ikut Lokasi Saya',
    mapToggle3d: 'Paparan 3D',
    mapZoomIn: 'Zum Masuk',
    mapZoomOut: 'Zum Keluar'
  },
  en: {
    // Header & Badges
    appName: 'JerayaWara',
    gpsActive: 'GPS Active',
    gpsSearching: 'Searching GPS...',
    offlineMap: 'Offline Maps',
    autoSolar: 'AUTO (Solar)',
    dayMode: 'DAY',
    nightMode: 'NIGHT',
    switchLangTooltip: 'Switch to Bahasa Melayu (BM)',
    flashFloodAlert: 'Flash Flood: Water ponding alert at',
    motorcycleShelterAlert: 'Motorcycle Rain Shelter:',
    ahead: 'ahead',
    driveCarefully: 'Drive safely',

    // Search Bar
    searchPlaceholder: 'Search Malaysian city, highway, or R&R (e.g. KLCC, Tapah, Genting)...',
    searchTitle: 'Location Search',
    recentSearches: 'Recent Searches',
    clearAll: 'Clear All',
    popularDestinations: 'Popular Destinations',
    noResults: 'No search results found',
    searching: 'Searching...',

    // Favorites
    favHome: 'Home',
    favWork: 'Work',
    favHometown: 'Hometown',
    deleteFav: 'Delete / Reset',

    // Mode Selector
    modeCar: 'Car',
    modeMotorcycle: 'Motorcycle',
    modeWalker: 'Walker',

    // Turn Banner
    inDistance: 'In',
    motorcycleLaneAlert: 'Dedicated Motorcycle Lane',
    turnLeft: 'Turn left onto',
    turnRight: 'Turn right onto',
    slightLeft: 'Keep left onto',
    slightRight: 'Keep right onto',
    exitLeft: 'Take exit on left onto',
    exitRight: 'Take exit on right onto',
    uTurn: 'Make a U-turn ahead',
    roundabout: 'At roundabout, take exit onto',
    arriveDest: 'Arrive at destination',
    continueOn: 'Continue on',
    voiceMuteTooltip: 'Mute Voice',
    voiceUnmuteTooltip: 'Unmute Voice',
    voiceLangTooltip: 'Switch voice language',

    // Speedometer & Overlays
    speedUnit: 'km/h',
    speedLimit: 'LIMIT',
    cautionCamera: 'CAUTION: Speed Camera',
    cameraDistance: 'Distance',
    cameraLimit: 'Limit',
    rainWarning: 'Raining · Keep Safe Distance',
    hudMirrorTip: 'Open Windshield HUD',
    showDateWeatherTip: 'Show Date & Weather',
    hideDateWeatherTip: 'Hide Date & Weather',

    // Trip Summary Drawer
    minUnit: 'min',
    hourUnit: 'hr',
    kmUnit: 'km',
    eta: 'ETA',
    trafficTitle: 'TRAFFIC:',
    trafficSmooth: 'Smooth Traffic',
    trafficModerate: 'Moderate Traffic',
    trafficHeavy: 'Heavy Congestion',
    tollFares: 'Toll Fares',
    tollFree: 'Toll Free',
    highwayCctv: 'Highway CCTV Cameras',
    enRouteAmenities: 'Petrol & EV Stations',
    amenitiesNearby: 'nearby',
    show: 'Show',
    hide: 'Hide',
    routeStepsTurns: 'Route Steps & Roads',
    turnsCount: 'turns',
    exitNav: 'Exit Navigation',
    exitNavCompact: 'Exit',
    exportGpx: 'Export GPX',
    liveGpsRoute: 'Live GPS Route',
    infoToggle: 'Info',

    // En Route Amenities
    alongRoute: 'Along Route',
    allCategory: 'All',
    petrolCategory: 'Petrol',
    evCategory: 'EV Charger',
    noAmenitiesFound: 'No petrol or EV charging stations detected along this corridor.',
    plugshareLink: 'Open in PlugShare',
    syncOsmEv: 'Sync EV (OSM)',
    syncingOsmEv: 'Downloading stations...',
    evSyncedSuccess: 'EV stations updated',
    osmEvCommunityNotice: 'OpenStreetMap open data & PlugShare community check-ins',

    // Toll Breakdown Modal
    tollModalTitle: 'Malaysian Highway Toll Breakdown',
    tollModalSubtitle: 'Official toll plaza rates for PLUS, KESAS, MEX, LDP & Penang Bridges',
    totalTollEstimate: 'Total Estimated Toll',
    tollClassCar: 'Class 1 (Car / Van)',
    tollClassMotorcycle: 'Motorcycle (Toll Free)',
    tollClassWalker: 'Pedestrian (Free)',
    paymentMethods: 'Payment Methods',
    paymentMethodsDesc: 'Touch \'n Go, SmartTAG, RFID & MyDebit / Credit Card (PayDirect)',
    close: 'Close',

    // Region Download Modal
    offlineModalTitle: 'Malaysia Offline Maps',
    offlineModalSubtitle: 'Download MapLibre vector map packs by state zone for offline navigation without internet access.',
    readyToUse: 'Ready to Use',
    downloading: 'Downloading...',
    download: 'Download',
    delete: 'Delete',

    // Windshield HUD Overlay
    hudModeTitle: 'Windshield HUD Mode',
    hudInstructions: 'Place your phone on the dashboard. The mirrored display will reflect navigation info onto your windshield.',
    mirrorActive: 'MIRROR REFLECTION ACTIVE',
    closeHud: 'CLOSE HUD',
    driveSafely: 'DRIVE SAFELY',

    // Map Controls
    mapRouteOverview: 'Route Overview: View full road path',
    mapResetNorth: 'Reset North',
    mapRecenter: 'Re-center My Location',
    mapToggle3d: 'Toggle 3D View',
    mapZoomIn: 'Zoom In',
    mapZoomOut: 'Zoom Out'
  }
} as const;

export type TranslationKey = keyof typeof UI_TRANSLATIONS['ms'];

export function t(key: TranslationKey, lang: Language = 'ms'): string {
  const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['ms'];
  return dict[key] || UI_TRANSLATIONS['ms'][key] || key;
}

/**
 * Extracts road name from instruction string
 */
function extractRoadName(instruction: string): string {
  // Use word boundaries so words like 'Take' do not match 'ke', etc.
  const ontoMatch = instruction.match(/(?:\bonto\b|\bke\b|\bdi\b)\s+([^,]+)/i);
  if (ontoMatch && ontoMatch[1]) {
    return ontoMatch[1].trim();
  }
  const clean = instruction
    .replace(/^(?:\b(?:turn|head|take exit|exit|merge|keep|continue|proceed|belok|kekal|susur keluar|ambil|teruskan)\b\s*)+(?:\b(?:on|onto|at|left|right|straight|kiri|kanan|ke|di)\b\s*)*/i, '')
    .trim();
  return clean || '';
}

export interface LocalizableStep {
  instruction: string;
  maneuver?: ManeuverType;
}

/**
 * Localizes step instruction between English and Bahasa Melayu
 */
export function getLocalizedStepInstruction(
  step?: LocalizableStep,
  lang: Language = 'ms',
  destinationName?: string
): string {
  if (!step) {
    return lang === 'ms' ? 'Teruskan di laluan anda' : 'Continue on your route';
  }

  const rawInstruction = step.instruction;
  const maneuver: ManeuverType = step.maneuver || 'straight';
  const road = extractRoadName(rawInstruction) || (lang === 'ms' ? 'laluan utama' : 'primary road');

  if (maneuver === 'arrive') {
    return lang === 'ms'
      ? `Tiba di ${destinationName || road || 'destinasi'}`
      : `Arrive at ${destinationName || road || 'destination'}`;
  }

  if (lang === 'ms') {
    switch (maneuver) {
      case 'turn_left':
        return `Belok kiri ke ${road}`;
      case 'turn_right':
        return `Belok kanan ke ${road}`;
      case 'slight_left':
        return `Kekal kiri ke ${road}`;
      case 'slight_right':
        return `Kekal kanan ke ${road}`;
      case 'exit_left':
        return `Susur keluar kiri ke ${road}`;
      case 'exit_right':
        return `Susur keluar kanan ke ${road}`;
      case 'u_turn':
        return 'Lakukan pusingan U di hadapan';
      case 'roundabout':
        return `Di bulatan, teruskan ke ${road}`;
      default:
        return `Teruskan di ${road}`;
    }
  } else {
    switch (maneuver) {
      case 'turn_left':
        return `Turn left onto ${road}`;
      case 'turn_right':
        return `Turn right onto ${road}`;
      case 'slight_left':
        return `Keep left onto ${road}`;
      case 'slight_right':
        return `Keep right onto ${road}`;
      case 'exit_left':
        return `Take exit on left onto ${road}`;
      case 'exit_right':
        return `Take exit on right onto ${road}`;
      case 'u_turn':
        return 'Make a U-turn ahead';
      case 'roundabout':
        return `At roundabout, continue onto ${road}`;
      default:
        return `Continue on ${road}`;
    }
  }
}
