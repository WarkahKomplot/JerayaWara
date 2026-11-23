import { ManeuverType } from '../routing/types';

export type Language = 'ms' | 'en';

export const UI_TRANSLATIONS = {
  ms: {
    // Header & Badges
    appName: 'JerayaWara',
    gpsActive: 'GPS Aktif',
    gpsSearching: 'Mencari GPS...',
    autoSolar: 'AUTO (Suria)',
    dayMode: 'SIANG',
    nightMode: 'MALAM',
    switchLangTooltip: 'Tukar ke English (EN)',
    flashFloodAlert: 'Banjir Kilat: Awas takungan air di',
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

    // Turn Banner
    inDistance: 'Dalam',
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
    paymentMethods: 'Kaedah Pembayaran',
    paymentMethodsDesc: 'Touch \'n Go, SmartTAG, RFID & MyDebit / Kad Kredit (PayDirect)',
    close: 'Tutup',

    // Region Download Modal

    // Map Controls
    mapRouteOverview: 'Lihat Semua Laluan',
    mapResetNorth: 'Reset Ke Utara',
    mapRecenter: 'Ikut Lokasi Saya',
    mapToggle3d: 'Paparan 3D',
    mapZoomIn: 'Zum Masuk',
    mapZoomOut: 'Zum Keluar',

    // Status banners
    offlineBanner: 'Luar talian — peta dan data cache digunakan.',
    floodCautionPrefix: 'AWAS:',
    floodBannerBody: 'Kawasan berisiko banjir kilat semasa hujan lebat. Pandu cermat.',
    gpsLostBanner: 'Isyarat GPS Terputus. Mencari satelit (Terowong atau kanopi tebal).',
    tunnelModeBanner: 'Mod Terowong: Simulasi pergerakan kenderaan aktif.',
    gpsDegradedBanner: 'Ketepatan GPS menurun. Anggaran kedudukan laluan digunakan.',
    offRouteBanner: 'Laluan terpesong. Mengira semula laluan...',
    offlineFollowSigns: 'Tiada sambungan internet. Teruskan mengikut papan tanda.',
    arriveSideLeft: 'Destinasi di kiri jalan: {name}',
    arriveSideRight: 'Destinasi di kanan jalan: {name}',
    arriveGeneric: 'Tiba di destinasi: {name}',
    destNameFallback: 'destinasi',

    // Route panel & errors
    routeStepsTitle: 'Langkah Laluan Berperingkat',
    stepLabel: 'Langkah',
    noInternetRoute: 'Tiada sambungan internet. Navigasi memerlukan talian.',
    routeCalcFailed: 'Gagal mengira laluan. Sila cuba lagi.',

    // Route preview sheet
    calculatingRoute: 'Mengira laluan...',
    realRoadsOnly: 'JerayaWara hanya menggunakan data jalan sebenar — tiada laluan karangan.',
    cancel: 'Batal',
    cachedRouteLabel: 'Laluan cache',
    realRoadRoute: 'Laluan jalan sebenar',
    distanceLabel: 'Jarak',
    etaLabel: 'Masa',
    tollsLabel: 'Tol',
    offlineCopyNotice: 'Salinan luar talian — laluan mungkin tidak terkini.',
    startNavigation: 'Mula Navigasi',

    // PWA install banner
    installTitle: 'Pasang Aplikasi JerayaWara',
    installBlurb: 'Navigasi skrin penuh tanpa bar carian pelayar & sokongan luar talian pantas.',
    installIosTitle: 'Cara Pasang di iPhone/iPad',
    installIosStep1: 'Tekan butang Kongsi (Share)',
    installIosStep2: 'Pilih "Add to Home Screen"',
    installAddToHome: 'Pasang ke Skrin Utama',
    installLater: 'Nanti',

    // Update prompt
    updateAvailable: 'Versi baharu tersedia',
    reloadAction: 'Muat semula',

    // Trip summary drawer
    tapForRouteDetails: 'Ketik untuk butiran lanjut laluan',
    destinationLabel: 'Destinasi',
    viewFullSummary: 'Papar butiran penuh laluan',
    exitNavTooltip: 'Tamat Pandu Arah',
    tripSummaryTitle: 'Butiran Pandu Arah',
    collapseSummaryTip: 'Kecilkan butiran laluan',
    collapseAction: 'Kecilkan',
    servicesNearbyTitle: 'Stesen Minyak & EV Berdekatan',
    servicesTitle: 'Stesen Minyak & EV',
    downloadGpxTip: 'Muat turun laluan sebagai fail GPX',

    // Toll breakdown modal
    vehicleLabel: 'Kenderaan',
    estimateRatesAsOf: 'Anggaran sahaja · kadar setakat',
    noTollsOnRoute: 'Tiada tol di sepanjang laluan ini (Laluan Bebas Tol).',
    tollPlazaList: 'Senarai Plaza Tol',

    // Speedometer / AES
    aesSlowDown: 'KURANGKAN LAJU',
    aesCaution: 'AWAS',
    rainKeepDistance: 'Hujan · Jarakkan Kenderaan',

    // En-route services card
    fetchingEvStations: 'Memuat turun stesen EV...',
    usingCachedStations: 'Stesen luar talian sedia ada',
    offlineModeActive: 'Mod luar talian aktif',
    evDataSources: 'Data OpenStreetMap & PlugShare',
    syncEvFromOsm: 'Kemas kini stesen EV daripada Overpass OSM',
    openPlugshare: 'Buka ulasan & ketersediaan di PlugShare',

    // Turn banner
    voiceLanguageName: 'Bahasa Melayu'
  },
  en: {
    // Header & Badges
    appName: 'JerayaWara',
    gpsActive: 'GPS Active',
    gpsSearching: 'Searching GPS...',
    autoSolar: 'AUTO (Solar)',
    dayMode: 'DAY',
    nightMode: 'NIGHT',
    switchLangTooltip: 'Switch to Bahasa Melayu (BM)',
    flashFloodAlert: 'Flash Flood: Water ponding alert at',
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

    // Turn Banner
    inDistance: 'In',
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
    paymentMethods: 'Payment Methods',
    paymentMethodsDesc: 'Touch \'n Go, SmartTAG, RFID & MyDebit / Credit Card (PayDirect)',
    close: 'Close',

    // Region Download Modal

    // Map Controls
    mapRouteOverview: 'Route Overview: View full road path',
    mapResetNorth: 'Reset North',
    mapRecenter: 'Re-center My Location',
    mapToggle3d: 'Toggle 3D View',
    mapZoomIn: 'Zoom In',
    mapZoomOut: 'Zoom Out',

    // Status banners
    offlineBanner: 'Offline — using cached maps and data.',
    floodCautionPrefix: 'CAUTION:',
    floodBannerBody: 'Flash flood risk area during heavy rain. Drive carefully.',
    gpsLostBanner: 'GPS Signal Lost. Searching for satellites (Tunnel or dense canopy).',
    tunnelModeBanner: 'Tunnel Mode: Dead-reckoning corridor simulation active.',
    gpsDegradedBanner: 'GPS accuracy degraded. Simulating corridor dead-reckoning.',
    offRouteBanner: 'Off route. Recalculating route...',
    offlineFollowSigns: 'No internet connection. Follow road signs to destination.',
    arriveSideLeft: 'Destination on your left: {name}',
    arriveSideRight: 'Destination on your right: {name}',
    arriveGeneric: 'Arriving at destination: {name}',
    destNameFallback: 'destination',

    // Route panel & errors
    routeStepsTitle: 'Route Step By Step',
    stepLabel: 'Step',
    noInternetRoute: 'No internet connection. Navigation requires internet.',
    routeCalcFailed: 'Failed to calculate route. Please try again.',

    // Route preview sheet
    calculatingRoute: 'Calculating route...',
    realRoadsOnly: 'JerayaWara only uses real road data — no fabricated routes.',
    cancel: 'Cancel',
    cachedRouteLabel: 'Cached route',
    realRoadRoute: 'Real road route',
    distanceLabel: 'Distance',
    etaLabel: 'ETA',
    tollsLabel: 'Tolls',
    offlineCopyNotice: 'Offline copy — the route may be out of date.',
    startNavigation: 'Start Navigation',

    // PWA install banner
    installTitle: 'Install JerayaWara PWA',
    installBlurb: 'Full-screen navigation without browser bars & instant offline access.',
    installIosTitle: 'Install on iPhone/iPad',
    installIosStep1: 'Tap the Share button in Safari',
    installIosStep2: 'Select "Add to Home Screen"',
    installAddToHome: 'Add to Home Screen',
    installLater: 'Later',

    // Update prompt
    updateAvailable: 'New version available',
    reloadAction: 'Reload',

    // Trip summary drawer
    tapForRouteDetails: 'Tap for full route details',
    destinationLabel: 'Destination',
    viewFullSummary: 'View full route summary',
    exitNavTooltip: 'Exit Navigation',
    tripSummaryTitle: 'Trip Summary',
    collapseSummaryTip: 'Collapse route summary',
    collapseAction: 'Collapse',
    servicesNearbyTitle: 'Nearby Petrol & EV Stations',
    servicesTitle: 'Petrol & EV Stations',
    downloadGpxTip: 'Download route as GPX file',

    // Toll breakdown modal
    vehicleLabel: 'Vehicle',
    estimateRatesAsOf: 'Estimate only · rates as of',
    noTollsOnRoute: 'No tolls along this route (Toll-Free Route).',
    tollPlazaList: 'Toll Plaza Breakdown',

    // Speedometer / AES
    aesSlowDown: 'SLOW DOWN',
    aesCaution: 'CAUTION',
    rainKeepDistance: 'Raining · Keep distance',

    // En-route services card
    fetchingEvStations: 'Fetching live EV stations...',
    usingCachedStations: 'Using cached offline stations',
    offlineModeActive: 'Offline mode active',
    evDataSources: 'OpenStreetMap & PlugShare data',
    syncEvFromOsm: 'Sync EV stations from OSM Overpass',
    openPlugshare: 'Open community check-in & photos on PlugShare',

    // Turn banner
    voiceLanguageName: 'English'
  }
} as const;

export type TranslationKey = keyof typeof UI_TRANSLATIONS['ms'];

export function t(key: TranslationKey, lang: Language = 'ms'): string {
  const dict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['ms'];
  return dict[key] || UI_TRANSLATIONS['ms'][key] || key;
}

/**
 * Translates `key` and substitutes {placeholder} tokens with the given values.
 * Placeholders left unfilled are kept as-is so missing data is visible, not silent.
 */
export function tf(
  key: TranslationKey,
  lang: Language,
  vars: Record<string, string | number>
): string {
  return t(key, lang).replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole
  );
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
