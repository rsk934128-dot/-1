import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Clock, 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Share2, 
  X, 
  Train, 
  Store, 
  Sparkles, 
  Layers, 
  Footprints, 
  AlertCircle, 
  Bike, 
  Car, 
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { SoundNotificationService } from '../services/soundNotificationService';

interface ShopLocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const ShopLocationMapModal: React.FC<ShopLocationMapModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'landmark_map' | 'google_map' | 'pickup_guide'>('landmark_map');
  const [copiedLink, setCopiedLink] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedLandmark, setSelectedLandmark] = useState<string | null>('hotel');

  if (!isOpen) return null;

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'Hotel Al Sheikh Farid, Railway Station Main Gate, Station Road'
  )}`;

  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    'Hotel Al Sheikh Farid, Railway Station Road'
  )}`;

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(
      `${HOTEL_INFO.nameBn} - ${HOTEL_INFO.locationBn} (মোবাইল: ${HOTEL_INFO.phone1}, ${HOTEL_INFO.phone2})\nGoogle Maps: ${googleMapsSearchUrl}`
    );
    setCopiedLink(true);
    SoundNotificationService.playNotificationChime();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenGoogleMaps = () => {
    window.open(googleMapsDirectionsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-stone-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="px-5 py-4 bg-gradient-to-r from-stone-950 via-amber-950 to-stone-950 border-b border-amber-500/30 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-stone-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white font-serif tracking-tight">
                  {lang === 'bn' ? 'দোকানের ম্যাপ ও লোকেশন গাইড' : 'Shop Location & Map Guide'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {lang === 'bn' ? '🟢 এখন খোলা (সকাল ৬:০০ - রাত ১২:০০)' : '🟢 Open Now (6 AM - 12 AM)'}
                </span>
              </div>
              <p className="text-xs text-amber-300/90 font-medium">
                {lang === 'bn' ? HOTEL_INFO.nameBn : HOTEL_INFO.nameEn} • {lang === 'bn' ? HOTEL_INFO.locationBn : HOTEL_INFO.locationEn}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer shrink-0"
            title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prominent Self-Pickup Notice Banner */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border-b border-amber-500/30 shrink-0">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold shrink-0 mt-0.5">
              <Footprints className="w-4 h-4" />
            </div>
            <div className="text-xs text-amber-100">
              <p className="font-bold text-amber-300 text-xs sm:text-sm">
                {lang === 'bn' 
                  ? '🛍️ অনলাইনে অর্ডার করে খাবার দোকানে এসে নিয়ে যান (সেলফ পিক-আপ)' 
                  : '🛍️ Order Online & Pick Up Directly From Shop (Self-Pickup)'}
              </p>
              <p className="text-stone-300 text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                {lang === 'bn'
                  ? 'আমাদের অ্যাপে অনলাইনে অর্ডার করে নিশ্চিন্তে থাকুন। খাবার প্রস্তুত হলে আমাদের কাউন্টারে এসে গরম গরম খাবার সংগ্রহ করতে হবে। পরবর্তীতে হয়তো হোম ডেলিভারি ব্যবস্থা চালু করা হবে।'
                  : 'You can smoothly order online. Meals must be collected in person from our shop counter. Home delivery may be arranged in the future.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-stone-950 border-b border-stone-800 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('landmark_map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'landmark_map'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'স্টেশন এরিয়া ম্যাপ' : 'Station Area Map'}</span>
            </button>

            <button
              onClick={() => setActiveTab('google_map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'google_map'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'গুগল ম্যাপ ভিউ' : 'Google Maps View'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pickup_guide')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'pickup_guide'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পিক-আপ ও পৌঁছানোর পথ' : 'Pickup & Walking Guide'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenGoogleMaps}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              title={lang === 'bn' ? 'গুগল ম্যাপে লাইভ রুট চালু করুন' : 'Open in Google Maps'}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'গুগল ম্যাপে রুট' : 'Live Directions'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              onClick={handleCopyLocation}
              className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold border border-stone-700 flex items-center gap-1 transition-all cursor-pointer"
              title={lang === 'bn' ? 'ঠিকানা কপি করুন' : 'Copy Address'}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[11px]">{copiedLink ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {activeTab === 'landmark_map' && (
            <div className="space-y-4">
              {/* Map Canvas Card */}
              <div className="relative rounded-3xl bg-stone-950 border border-stone-800 overflow-hidden shadow-xl">
                {/* Canvas Controls Header */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 text-[11px] text-stone-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-white">{lang === 'bn' ? 'রেলওয়ে স্টেশন এলাকা ম্যাপ' : 'Railway Station Schematic Map'}</span>
                </div>

                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-stone-900/90 backdrop-blur-md p-1 rounded-xl border border-stone-800">
                  <button
                    onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.45))}
                    className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.85))}
                    className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SVG Schematic Station Vector Map */}
                <div 
                  className="w-full overflow-hidden transition-transform duration-200 flex items-center justify-center p-2"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                >
                  <svg
                    viewBox="0 0 900 520"
                    className="w-full h-auto max-h-[380px] sm:max-h-[460px] select-none"
                  >
                    {/* Background Terrain */}
                    <rect width="900" height="520" fill="#0c0a09" rx="20" />
                    
                    {/* Grid Lines */}
                    <defs>
                      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#292524" strokeWidth="0.8" opacity="0.4" />
                      </pattern>
                      <linearGradient id="hotel-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
                      </linearGradient>
                      <linearGradient id="road-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1c1917" />
                        <stop offset="50%" stopColor="#292524" />
                        <stop offset="100%" stopColor="#1c1917" />
                      </linearGradient>
                    </defs>
                    <rect width="900" height="520" fill="url(#grid-pattern)" />

                    {/* Railway Platform & Tracks (Top Section) */}
                    <rect x="50" y="35" width="800" height="110" rx="12" fill="#1e1b18" stroke="#44403c" strokeWidth="1.5" />
                    {/* Train Tracks */}
                    <line x1="60" y1="65" x2="840" y2="65" stroke="#78716c" strokeWidth="3" strokeDasharray="12 4" />
                    <line x1="60" y1="85" x2="840" y2="85" stroke="#78716c" strokeWidth="3" strokeDasharray="12 4" />
                    <line x1="60" y1="105" x2="840" y2="105" stroke="#78716c" strokeWidth="3" strokeDasharray="12 4" />

                    {/* Platform 1 & 2 Text */}
                    <rect x="70" y="45" width="220" height="30" rx="6" fill="#292524" />
                    <text x="80" y="65" fill="#fef08a" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                      🚉 রেলওয়ে প্ল্যাটফর্ম ১ ও ২ (Platform 1 & 2)
                    </text>

                    {/* Train Graphic */}
                    <rect x="420" y="55" width="280" height="38" rx="8" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="440" y="79" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                      🚆 আন্তঃনগর এক্সপ্রেস ট্রেন (Intercity Express)
                    </text>

                    {/* Railway Station Main Building & Exit Gate */}
                    <rect 
                      x="160" 
                      y="160" 
                      width="320" 
                      height="90" 
                      rx="16" 
                      fill={selectedLandmark === 'station_gate' ? '#292524' : '#1c1917'} 
                      stroke={selectedLandmark === 'station_gate' ? '#38bdf8' : '#57534e'} 
                      strokeWidth="2" 
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedLandmark('station_gate')}
                    />
                    <text x="180" y="195" fill="#ffffff" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                      🏛️ রেলওয়ে স্টেশন মেইন গেট
                    </text>
                    <text x="180" y="215" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
                      Railway Station Main Exit & Ticket Counter
                    </text>
                    <rect x="250" y="225" width="140" height="24" rx="6" fill="#0284c7" />
                    <text x="265" y="241" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      🚪 মূল বাহির হওয়ার পথ
                    </text>

                    {/* Main Station Road (Horizontal Arterial Highway) */}
                    <rect x="40" y="270" width="820" height="85" rx="14" fill="url(#road-grad)" stroke="#44403c" strokeWidth="2" />
                    {/* Road Center Line */}
                    <line x1="50" y1="312" x2="850" y2="312" stroke="#eab308" strokeWidth="2.5" strokeDasharray="16 12" />
                    <text x="70" y="300" fill="#a8a29e" fontSize="12" fontWeight="bold" letterSpacing="1">
                      🛣️ স্টেশন রোড (STATION MAIN ROAD)
                    </text>
                    <text x="70" y="332" fill="#78716c" fontSize="10">
                      ← শহরের কেন্দ্রস্থল ও বাসস্ট্যান্ড | রেলওয়ে বাজার ও পোস্ট অফিস →
                    </text>

                    {/* Walking Path Line from Station Gate to Hotel Entrance */}
                    <path
                      d="M 320 250 L 320 290 L 510 290 L 510 375"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeDasharray="8 6"
                      className="animate-pulse"
                    />
                    {/* Footprint Walking Badge */}
                    <rect x="360" y="276" width="125" height="24" rx="8" fill="#78350f" stroke="#f59e0b" strokeWidth="1" />
                    <text x="370" y="292" fill="#fef08a" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                      👣 মাত্র ২০ গজ / ৩০ সেকেন্ড
                    </text>

                    {/* HOTEL AL SHEIKH FARID (STAR OF THE MAP) */}
                    <g 
                      className="cursor-pointer group"
                      onClick={() => setSelectedLandmark('hotel')}
                    >
                      {/* Pulsing Outer Aura */}
                      <circle cx="530" cy="425" r="75" fill="#f59e0b" opacity="0.15" className="animate-ping" />
                      
                      {/* Hotel Building Base */}
                      <rect 
                        x="430" 
                        y="370" 
                        width="240" 
                        height="125" 
                        rx="18" 
                        fill="#1c1917" 
                        stroke="#f59e0b" 
                        strokeWidth="3.5" 
                        filter="drop-shadow(0 8px 16px rgba(245, 158, 11, 0.35))"
                      />

                      {/* Header Ribbon on Hotel */}
                      <rect x="430" y="370" width="240" height="36" rx="16" fill="url(#hotel-glow)" />
                      <text x="445" y="394" fill="#0c0a09" fontSize="14" fontWeight="black" fontFamily="sans-serif">
                        ⭐ হোটেল আল শেখ ফরিদ
                      </text>

                      {/* Hotel Details inside box */}
                      <text x="445" y="426" fill="#fef3c7" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                        📍 স্টেশন মেইন গেট সংলগ্ন
                      </text>
                      <text x="445" y="445" fill="#e2e8f0" fontSize="10.5" fontFamily="sans-serif">
                        • তাজা ঘরোয়া খাবার ও সেলফ পিক-আপ
                      </text>
                      <text x="445" y="462" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">
                        • সকাল ৬:০০ টা - রাত ১২:০০ টা পর্যন্ত খোলা
                      </text>
                      <text x="445" y="482" fill="#fbbf24" fontSize="10.5" fontWeight="bold" fontFamily="sans-serif">
                        📞 {HOTEL_INFO.phone1}
                      </text>

                      {/* Prominent Glowing Map Pin on Hotel */}
                      <circle cx="530" cy="370" r="16" fill="#ef4444" stroke="#ffffff" strokeWidth="2.5" />
                      <text x="524" y="375" fill="#ffffff" fontSize="14" fontWeight="bold">📍</text>
                    </g>

                    {/* Surrounding Landmark 1: Auto / Rickshaw Stand */}
                    <g 
                      className="cursor-pointer"
                      onClick={() => setSelectedLandmark('auto_stand')}
                    >
                      <rect 
                        x="120" 
                        y="380" 
                        width="180" 
                        height="85" 
                        rx="14" 
                        fill={selectedLandmark === 'auto_stand' ? '#292524' : '#141312'} 
                        stroke={selectedLandmark === 'auto_stand' ? '#eab308' : '#44403c'} 
                        strokeWidth="1.5" 
                      />
                      <text x="135" y="408" fill="#e2e8f0" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                        🛺 অটো ও সিএনজি স্ট্যান্ড
                      </text>
                      <text x="135" y="428" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">
                        Station Rickshaw & CNG Stand
                      </text>
                      <text x="135" y="448" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">
                        হোটেল থেকে দূরত্ব: ৫০ গজ
                      </text>
                    </g>

                    {/* Surrounding Landmark 2: Station Central Mosque */}
                    <g 
                      className="cursor-pointer"
                      onClick={() => setSelectedLandmark('mosque')}
                    >
                      <rect 
                        x="690" 
                        y="380" 
                        width="170" 
                        height="85" 
                        rx="14" 
                        fill={selectedLandmark === 'mosque' ? '#292524' : '#141312'} 
                        stroke={selectedLandmark === 'mosque' ? '#10b981' : '#44403c'} 
                        strokeWidth="1.5" 
                      />
                      <text x="705" y="408" fill="#e2e8f0" fontSize="13" fontWeight="bold" fontFamily="sans-serif">
                        🕌 স্টেশন জামে মসজিদ
                      </text>
                      <text x="705" y="428" fill="#94a3b8" fontSize="10.5" fontFamily="sans-serif">
                        Station Jame Mosque
                      </text>
                      <text x="705" y="448" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">
                        হোটেল থেকে দূরত্ব: ৭০ গজ
                      </text>
                    </g>

                    {/* Compass Rose Widget in Corner */}
                    <g transform="translate(820, 200)">
                      <circle cx="0" cy="0" r="22" fill="#1c1917" stroke="#44403c" strokeWidth="1" />
                      <text x="-4" y="-7" fill="#ef4444" fontSize="11" fontWeight="black">N</text>
                      <text x="-3" y="15" fill="#94a3b8" fontSize="9">S</text>
                      <text x="8" y="3" fill="#94a3b8" fontSize="9">E</text>
                      <text x="-16" y="3" fill="#94a3b8" fontSize="9">W</text>
                    </g>
                  </svg>
                </div>

                {/* Map Bottom Highlight Bar */}
                <div className="p-3 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      {lang === 'bn' ? 'চিহ্নিত অবস্থান:' : 'Active Landmark:'}
                    </span>
                    <span className="text-white font-semibold">
                      {selectedLandmark === 'hotel' && (lang === 'bn' ? 'হোটেল আল শেখ ফরিদ (গন্তব্য)' : 'Hotel Al Sheikh Farid (Destination)')}
                      {selectedLandmark === 'station_gate' && (lang === 'bn' ? 'রেলওয়ে স্টেশন মেইন গেট ও টিকিট কাউন্টার' : 'Station Main Gate & Ticket Counter')}
                      {selectedLandmark === 'auto_stand' && (lang === 'bn' ? 'অটোরিকশা ও সিএনজি স্ট্যান্ড' : 'Auto & CNG Stand')}
                      {selectedLandmark === 'mosque' && (lang === 'bn' ? 'স্টেশন কেন্দ্রীয় জামে মসজিদ' : 'Station Central Mosque')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedLandmark('hotel')}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold cursor-pointer hover:bg-amber-500/30"
                    >
                      {lang === 'bn' ? 'হোটেল দেখুন' : 'Focus Hotel'}
                    </button>
                    <button
                      onClick={() => setSelectedLandmark('station_gate')}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white text-[11px] cursor-pointer"
                    >
                      {lang === 'bn' ? 'স্টেশন গেট' : 'Station Gate'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Landmark Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div 
                  onClick={() => setSelectedLandmark('station_gate')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLandmark === 'station_gate'
                      ? 'bg-stone-800 border-amber-500/60 shadow-md'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Train className="w-4 h-4 text-sky-400" />
                    <h5 className="text-xs font-bold text-white">
                      {lang === 'bn' ? 'স্টেশন মেইন এক্সিট গেট' : 'Station Main Exit'}
                    </h5>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'bn' ? 'ট্রেন থেকে নেমে মেইন গেট দিয়ে বের হলে মাত্র ২০ গজ বামে।' : '20 yards left from station main exit gate.'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-amber-300">
                    ⏱️ {lang === 'bn' ? '৩০ সেকেন্ড হাঁটা পথ' : '30s walk'}
                  </span>
                </div>

                <div 
                  onClick={() => setSelectedLandmark('hotel')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLandmark === 'hotel'
                      ? 'bg-stone-800 border-amber-500/60 shadow-md'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-4 h-4 text-amber-400" />
                    <h5 className="text-xs font-bold text-white">
                      {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ' : 'Hotel Al Sheikh Farid'}
                    </h5>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'bn' ? 'দোতলা ভবন, সামনে বড় সাইনবোর্ড ও খাবার প্রদর্শন কাউন্টার।' : '2-story building with front display counter.'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-emerald-400">
                    📍 {lang === 'bn' ? 'মূল গন্তব্য ও পার্সেল কাউন্টার' : 'Pickup Counter'}
                  </span>
                </div>

                <div 
                  onClick={() => setSelectedLandmark('auto_stand')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLandmark === 'auto_stand'
                      ? 'bg-stone-800 border-amber-500/60 shadow-md'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bike className="w-4 h-4 text-emerald-400" />
                    <h5 className="text-xs font-bold text-white">
                      {lang === 'bn' ? 'অটো ও সিএনজি স্ট্যান্ড' : 'Auto/CNG Stand'}
                    </h5>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {lang === 'bn' ? 'শহরের যেকোনো প্রান্ত থেকে স্টেশন রোডের মুখে নামুন।' : 'Arrive at Station Road entrance from town.'}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-mono font-bold text-amber-300">
                    ⏱️ {lang === 'bn' ? '১ মিনিট হাঁটা পথ' : '1 min walk'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'google_map' && (
            <div className="space-y-4">
              {/* Google Maps Embed Frame */}
              <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl overflow-hidden border border-stone-800 shadow-xl bg-stone-950">
                <iframe
                  title="Hotel Al Sheikh Farid Google Maps"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent('Railway Station Road, Bangladesh')}&t=&z=16&ie=UTF8&iwloc=&output=embed&solution_id=gmp_git_agentskills_v1`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />

                {/* Overlay Floating Action Pill */}
                <div className="absolute bottom-4 left-4 right-4 bg-stone-950/90 backdrop-blur-md p-3 rounded-2xl border border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{HOTEL_INFO.nameBn}</p>
                      <p className="text-[10px] text-stone-400">{HOTEL_INFO.locationBn}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOpenGoogleMaps}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'গুগল ম্যাপে নেভিগেশন চালু করুন' : 'Start Google Maps Navigation'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Coordinates & Contact Bar */}
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-stone-400 block text-[11px]">{lang === 'bn' ? 'ঠিকানা ও অবস্থান:' : 'Exact Location:'}</span>
                  <p className="font-bold text-white mt-0.5">
                    {HOTEL_INFO.nameBn}, {HOTEL_INFO.locationBn}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${HOTEL_INFO.phone1}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{HOTEL_INFO.phone1}</span>
                  </a>
                  <a
                    href={`tel:${HOTEL_INFO.phone2}`}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center gap-1.5 border border-stone-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{HOTEL_INFO.phone2}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pickup_guide' && (
            <div className="space-y-4">
              {/* Step-by-Step Self-Pickup Workflow */}
              <div className="p-4 sm:p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Footprints className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'অনলাইন অর্ডার সংগ্রহ ও সেলফ পিক-আপ নিয়মাবলী' : 'Online Order Self-Pickup Guide'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 relative">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center mb-2">
                      ১
                    </span>
                    <h5 className="text-xs font-bold text-white mb-1">
                      {lang === 'bn' ? 'অনলাইনে খাবার নির্বাচন ও অর্ডার' : 'Select Food & Order Online'}
                    </h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {lang === 'bn'
                        ? 'অ্যাপ থেকে আপনার পছন্দের খাবার, পরিমাণ বা অংশ নির্বাচন করে কার্ট থেকে পার্সেল/পিক-আপ অর্ডার করুন।'
                        : 'Pick your items, portions, and place a takeaway/parcel order via cart.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 relative">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center mb-2">
                      ২
                    </span>
                    <h5 className="text-xs font-bold text-white mb-1">
                      {lang === 'bn' ? 'কিচেনে তাজা ও গরম রান্না' : 'Fresh Cooking in Kitchen'}
                    </h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {lang === 'bn'
                        ? 'অর্ডার পাওয়ার পর সাধারণত ১০-১৫ মিনিটের মধ্যে স্বাস্থ্যকর পরিবেশে তাজা গরম খাবার প্যাকেট করে রাখা হয়।'
                        : 'Meals are packed fresh & hot in hygienic containers within 10-15 minutes.'}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 relative">
                    <span className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 font-black text-xs flex items-center justify-center mb-2">
                      ৩
                    </span>
                    <h5 className="text-xs font-bold text-white mb-1">
                      {lang === 'bn' ? 'কাউন্টারে এসে সংগ্রহ করুন' : 'Collect at Shop Counter'}
                    </h5>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {lang === 'bn'
                        ? 'দোকানের ক্যাশ বা ডেলিভারি কাউন্টারে এসে আপনার অর্ডার আইডি বা মোবাইল নম্বর বলুন এবং গরম খাবার বুঝে নিন।'
                        : 'Show your Order ID or phone at counter to collect your piping hot package!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Reach Guide */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-800 space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span>{lang === 'bn' ? 'দোকানে যেভাবে সহজে পৌঁছাবেন:' : 'How to Reach Hotel Al Sheikh Farid:'}</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-start gap-3">
                    <Train className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">
                        {lang === 'bn' ? '১. ট্রেন প্ল্যাটফর্ম থেকে (From Platform):' : '1. Arriving by Train:'}
                      </span>
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        {lang === 'bn' 
                          ? 'যেকোনো প্ল্যাটফর্ম থেকে মেইন এক্সিট গেটের দিকে আসুন। গেট পেরিয়ে বের হয়ে সোজা বাম দিকে ২০ গজ হাঁটলেই হোটেল আল শেখ ফরিদের নিয়ন সাইনবোর্ড ও প্রবেশদ্বার দেখতে পাবেন।'
                          : 'Exit through the Railway Station Main Gate and walk just 20 yards to your left.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-start gap-3">
                    <Bike className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">
                        {lang === 'bn' ? '২. শহর বা অটো/রিকশা দিয়ে আসলে (From Town / Auto):' : '2. Arriving by Auto / Rickshaw:'}
                      </span>
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        {lang === 'bn'
                          ? 'চালককে বলুন "রেলওয়ে স্টেশন মেইন গেট সংলগ্ন হোটেল আল শেখ ফরিদ"। স্টেশন রোডের ঠিক মুখের পাশেই অবস্থান।'
                          : 'Tell the driver to drop you at Railway Station Main Gate, right in front of Hotel Al Sheikh Farid.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex items-start gap-3">
                    <Car className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-0.5">
                        {lang === 'bn' ? '৩. মোটরসাইকেল ও ব্যক্তিগত যানবাহন (Vehicle Parking):' : '3. Personal Vehicle / Bike:'}
                      </span>
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        {lang === 'bn'
                          ? 'হোটেল চত্বরে মোটরসাইকেল রাখার নিরাপদ জায়গা রয়েছে। পার্সেল সংগ্রহের জন্য দ্রুত পার্ক করা যায়।'
                          : 'Convenient motorcycle parking space available right in front of the restaurant.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Future Plan Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <span className="font-bold text-amber-300 block mb-0.5">
                    {lang === 'bn' ? 'ভবিষ্যত হোম ডেলিভারি আপডেট:' : 'Future Home Delivery Plan:'}
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    {lang === 'bn'
                      ? 'আমরা বর্তমানে গ্রাহকদের মানসম্মত ও গরম খাবার নিশ্চিত করতে সরাসরি কাউন্টার সংগ্রহ পদ্ধতি চালু রেখেছি। ইনশাআল্লাহ পরবর্তীতে হোম ডেলিভারির জন্য নিজস্ব রাইডার টিম চালু করার পরিকল্পনা রয়েছে।'
                      : 'Currently, to ensure the freshest quality, orders are for self-pickup at counter. Dedicated home delivery riders will be introduced soon!'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${HOTEL_INFO.phone1}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'কাউন্টারে ফোন দিন' : 'Call Counter'}</span>
            </a>

            <button
              onClick={handleOpenGoogleMaps}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'Google Maps রুট' : 'Google Maps'}</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs border border-stone-700 transition-colors cursor-pointer"
          >
            {lang === 'bn' ? 'ঠিক আছে / বন্ধ করুন' : 'Got It / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
