import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Bike, 
  Compass, 
  Clock, 
  Phone, 
  PhoneCall, 
  CheckCircle2, 
  RotateCw, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  ThermometerSun, 
  Flame, 
  Train, 
  Store, 
  User, 
  Sparkles, 
  Radio, 
  Layers,
  ChevronRight,
  Send,
  MessageSquare
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface OrderDeliveryMapProps {
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
  onCallRider?: (riderPhone: string, riderName: string) => void;
  lang: 'bn' | 'en';
}

export const OrderDeliveryMap: React.FC<OrderDeliveryMapProps> = ({
  orders,
  onUpdateOrderStatus,
  onCallRider,
  lang,
}) => {
  // Filter for orders with status 'on_the_way'
  const onTheWayOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'on_the_way');
  }, [orders]);

  // If no order is 'on_the_way', find cooking or pending order to allow instant dispatch simulation
  const candidateOrder = useMemo(() => {
    return orders.find((o) => o.status === 'cooking' || o.status === 'pending') || orders[0];
  }, [orders]);

  // Selected active order index or ID
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  useEffect(() => {
    if (onTheWayOrders.length > 0) {
      if (!onTheWayOrders.some(o => o.id === selectedOrderId)) {
        setSelectedOrderId(onTheWayOrders[0].id);
      }
    } else if (candidateOrder) {
      setSelectedOrderId(candidateOrder.id);
    }
  }, [onTheWayOrders, candidateOrder, selectedOrderId]);

  const activeOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId) || onTheWayOrders[0] || candidateOrder;
  }, [orders, selectedOrderId, onTheWayOrders, candidateOrder]);

  const isOnTheWay = activeOrder?.status === 'on_the_way';

  // Live simulation state for animated rider progress along route
  const [progressPercent, setProgressPercent] = useState<number>(45);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'schematic'>('street');
  const [showRiderCallPrompt, setShowRiderCallPrompt] = useState<boolean>(false);

  // Delivery rider mock profile
  const riderProfile = useMemo(() => ({
    nameBn: 'মো: তানভীর আহমেদ',
    nameEn: 'Md. Tanvir Ahmed',
    phone: '01761869921',
    vehicleBn: 'এক্সপ্রেস ডেলিভারি বাইসাইকেল #০৭',
    vehicleEn: 'Express Delivery Bicycle #07',
    rating: '4.9 ★ (৩৫০+ ডেলিভারি)',
    foodTemp: '৭৪°C (গরম ও সতেজ)',
    speed: '১৮ কিমি/ঘণ্টা',
  }), []);

  // Auto-increment progress when simulating and order is on the way
  useEffect(() => {
    if (!isSimulating || !isOnTheWay) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) {
          return 15; // Loop for visualization
        }
        return prev + 1.5;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, isOnTheWay]);

  // Calculate dynamic coordinates along an SVG bezier curve route
  // Path starts at Hotel (X: 70, Y: 260) -> Junction (X: 240, Y: 180) -> Overpass (X: 420, Y: 220) -> Station/Dest (X: 630, Y: 90)
  const riderCoordinates = useMemo(() => {
    const t = Math.min(Math.max(progressPercent / 100, 0), 1);
    
    // Cubic bezier interpolation between 4 points
    // P0 = (70, 260), P1 = (220, 160), P2 = (420, 240), P3 = (630, 90)
    const p0 = { x: 70, y: 260 };
    const p1 = { x: 220, y: 150 };
    const p2 = { x: 430, y: 240 };
    const p3 = { x: 630, y: 90 };

    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
    const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

    return { x, y };
  }, [progressPercent]);

  // Derived metrics
  const remainingDistanceMeters = Math.max(Math.round((1 - progressPercent / 100) * 850), 30);
  const remainingMinutes = Math.max(Math.ceil((1 - progressPercent / 100) * 6), 1);

  // If there are no orders at all or none on the way and no active order
  if (!activeOrder) {
    return null;
  }

  const destinationText = activeOrder.orderType === 'dine_in' 
    ? (lang === 'bn' ? `হোটেল ডাইনিং • ${activeOrder.tableNumber || 'টেবিল ৩'}` : `Hotel Dine-in • ${activeOrder.tableNumber || 'Table 3'}`)
    : (activeOrder.deliveryAddress || (lang === 'bn' ? 'রেলওয়ে প্ল্যাটফর্ম এলাকা' : 'Railway Station Area'));

  return (
    <section 
      id="order-delivery-map-section" 
      aria-label="Live Delivery Route Map"
      className="mx-4 sm:mx-6 lg:mx-8 my-8"
    >
      <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl text-stone-100 relative overflow-hidden">
        
        {/* Background ambient lighting */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>
                {isOnTheWay 
                  ? (lang === 'bn' ? 'লাইভ জিপিএস রুট ট্র্যাকিং • অন দ্য ওয়ে' : 'Live GPS Route Tracking • On The Way')
                  : (lang === 'bn' ? 'ডেলিভারি রুট ও লোকেশন ম্যাপ প্রাকদর্শন' : 'Delivery Route & Location Map Preview')}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black font-serif text-white flex items-center gap-2.5">
              <Navigation className="w-6 h-6 text-amber-400" />
              <span>
                {lang === 'bn' ? 'হোটেল থেকে গ্রাহকের অবস্থানে ডেলিভারি রুট' : 'Hotel to Customer Delivery Route'}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              {lang === 'bn' 
                ? 'হোটেল আল শেখ ফরিদের রান্নাঘর থেকে গরম পার্সেল নিয়ে আপনার অবস্থানে রাইডারের আনুমানিক গতিপথ।'
                : 'Approximate live transit route from Hotel Al Sheikh Farid kitchen to your delivery destination.'}
            </p>
          </div>

          {/* On-The-Way Order Switcher Tabs (if multiple) */}
          <div className="flex flex-wrap items-center gap-2">
            {onTheWayOrders.length > 1 && (
              <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
                <span className="text-[11px] text-stone-500 px-1 font-bold">অর্ডার:</span>
                {onTheWayOrders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedOrderId === ord.id
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {ord.id}
                  </button>
                ))}
              </div>
            )}

            {/* If order is not on the way yet, offer 1-click test button */}
            {!isOnTheWay && onUpdateOrderStatus && (
              <button
                type="button"
                id="btn-dispatch-order-map"
                onClick={() => onUpdateOrderStatus(activeOrder.id, 'on_the_way')}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 shadow-md flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95"
              >
                <Truck className="w-3.5 h-3.5 text-stone-950" />
                <span>{lang === 'bn' ? 'অর্ডার অন দ্য ওয়ে (On the Way) করুন' : 'Dispatch Order (On the Way)'}</span>
              </button>
            )}

            {/* Expand / Minimize map view */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
              title={isExpanded ? 'ছোট করুন' : 'বড় ভিউ'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Live Metrics Telemetry Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          
          {/* Estimated Time */}
          <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider block">
                {lang === 'bn' ? 'আনুমানিক সময় (ETA)' : 'Estimated ETA'}
              </span>
              <span className="text-sm sm:text-base font-black text-white font-serif">
                {remainingMinutes} {lang === 'bn' ? 'মিনিট' : 'mins'}
              </span>
            </div>
          </div>

          {/* Remaining Distance */}
          <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider block">
                {lang === 'bn' ? 'অবশিষ্ট দূরত্ব' : 'Distance'}
              </span>
              <span className="text-sm sm:text-base font-black text-white font-serif">
                {remainingDistanceMeters} {lang === 'bn' ? 'মিটার' : 'meters'}
              </span>
            </div>
          </div>

          {/* Food Hot & Fresh Temperature */}
          <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center justify-center shrink-0">
              <ThermometerSun className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider block">
                {lang === 'bn' ? 'খাবারের তাপমাত্রা' : 'Food Warmth'}
              </span>
              <span className="text-sm sm:text-base font-black text-amber-200 font-serif">
                {riderProfile.foodTemp}
              </span>
            </div>
          </div>

          {/* Rider / Order Status */}
          <div className="bg-stone-950/80 p-3.5 rounded-2xl border border-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Bike className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 tracking-wider block">
                {lang === 'bn' ? 'রাইডারের গতি' : 'Rider Speed'}
              </span>
              <span className="text-sm sm:text-base font-black text-cyan-200 font-serif">
                {riderProfile.speed}
              </span>
            </div>
          </div>

        </div>

        {/* Map Visualization Canvas (Interactive Vector SVG) */}
        <div className={`relative z-10 rounded-2xl overflow-hidden border-2 border-stone-800 bg-[#161c24] transition-all duration-300 ${
          isExpanded ? 'h-[460px] sm:h-[540px]' : 'h-[320px] sm:h-[380px]'
        }`}>
          
          {/* Map Layer Controls & Quick Badges */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            <div className="bg-stone-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-2 text-xs shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-stone-200">
                {lang === 'bn' ? 'সরাসরি স্যাটেলাইট ও রুট ভিউ' : 'Live Schematic Route'}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-stone-950/90 backdrop-blur-md p-1 rounded-xl border border-stone-800 text-[11px]">
              <button
                type="button"
                onClick={() => setMapLayer('street')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  mapLayer === 'street' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                রাস্তা
              </button>
              <button
                type="button"
                onClick={() => setMapLayer('schematic')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  mapLayer === 'schematic' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
                }`}
              >
                স্টেশন গ্রিড
              </button>
            </div>
          </div>

          {/* Simulation Toggle & Progress Scrub Bar */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className="bg-stone-950/90 hover:bg-stone-900 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-800 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-lg cursor-pointer transition-colors"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isSimulating ? (lang === 'bn' ? 'পজ' : 'Pause') : (lang === 'bn' ? 'অ্যানিমেশন চালু' : 'Play')}</span>
            </button>

            <button
              type="button"
              onClick={() => setProgressPercent(10)}
              className="bg-stone-950/90 hover:bg-stone-900 backdrop-blur-md p-2 rounded-xl border border-stone-800 text-xs text-stone-300 hover:text-white shadow-lg cursor-pointer"
              title="পুনরায় শুরু করুন"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* SVG Map Graphic */}
          <svg 
            viewBox="0 0 700 350" 
            className="w-full h-full object-cover select-none"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              {/* Background Grid Pattern */}
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#252f3e" strokeWidth="0.8" strokeOpacity="0.4" />
              </pattern>

              {/* Glowing Route Gradient */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>

              {/* Pulse glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Background & Grid */}
            <rect width="700" height="350" fill="#131923" />
            <rect width="700" height="350" fill="url(#mapGrid)" />

            {/* Water Canal / Lake Feature */}
            <path
              d="M -10,320 C 150,300 280,340 450,310 C 580,280 660,330 720,310 L 720,360 L -10,360 Z"
              fill="#1e293b"
              opacity="0.8"
            />
            <text x="310" y="335" fill="#475569" fontSize="9" fontWeight="bold" letterSpacing="2">
              পৌর খাল / লেক (POND & WATERWAY)
            </text>

            {/* Railway Tracks Visualization */}
            <g opacity="0.6">
              <path d="M 480,-10 L 680,360" stroke="#334155" strokeWidth="12" fill="none" />
              <path d="M 480,-10 L 680,360" stroke="#0f172a" strokeWidth="8" fill="none" />
              <path 
                d="M 480,-10 L 680,360" 
                stroke="#64748b" 
                strokeWidth="6" 
                strokeDasharray="4,8" 
                fill="none" 
              />
              <text x="575" y="190" fill="#64748b" fontSize="8" fontWeight="bold" transform="rotate(62, 575, 190)">
                🚆 বাংলাদেশ রেলওয়ে প্রধান লাইন (RAILWAY TRACKS)
              </text>
            </g>

            {/* Major Station Roads Network */}
            <g stroke="#1e293b" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Secondary Cross roads */}
              <path d="M 30,120 L 320,100 L 500,40" />
              <path d="M 220,330 L 250,50" />
              <path d="M 380,330 L 430,30" />
              <path d="M 50,260 L 650,260" />
            </g>

            {/* Road Centers */}
            <g stroke="#2c3a4f" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M 30,120 L 320,100 L 500,40" />
              <path d="M 220,330 L 250,50" />
              <path d="M 380,330 L 430,30" />
              <path d="M 50,260 L 650,260" />
            </g>

            {/* Road Center Dotted Lines */}
            <g stroke="#475569" strokeWidth="1" strokeDasharray="6,8" fill="none">
              <path d="M 30,120 L 320,100 L 500,40" />
              <path d="M 220,330 L 250,50" />
              <path d="M 380,330 L 430,30" />
              <path d="M 50,260 L 650,260" />
            </g>

            {/* Road Names Labels */}
            <text x="110" y="275" fill="#475569" fontSize="8" fontWeight="bold">
              স্টেশন মেইন রোড (STATION MAIN ROAD)
            </text>
            <text x="260" y="145" fill="#475569" fontSize="8" fontWeight="bold">
              হাজী মার্কেট গলি (HAJI MARKET)
            </text>
            <text x="360" y="80" fill="#475569" fontSize="8" fontWeight="bold">
              ওভারব্রিজ সংযোগ সড়ক (OVERPASS)
            </text>

            {/* Buildings / Area Footprints */}
            <g fill="#1a2230" stroke="#2a374a" strokeWidth="1">
              <rect x="40" y="190" width="60" height="40" rx="4" />
              <text x="45" y="212" fill="#64748b" fontSize="7" fontWeight="bold">বাজার এলাকা</text>

              <rect x="180" y="190" width="50" height="35" rx="4" />
              <rect x="300" y="170" width="70" height="45" rx="4" />
              <text x="310" y="195" fill="#64748b" fontSize="7" fontWeight="bold">হাজী মার্কেট</text>

              <rect x="490" y="60" width="85" height="45" rx="4" />
              <text x="500" y="85" fill="#64748b" fontSize="7" fontWeight="bold">স্টেশন প্ল্যাটফর্ম</text>
            </g>

            {/* THE ACTIVE DELIVERY ROUTE (Glow + Animated Pulse Line) */}
            {/* Base Path Glow */}
            <path
              d="M 70,260 C 220,150 430,240 630,90"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />

            {/* Animated Flowing Route Line */}
            <path
              d="M 70,260 C 220,150 430,240 630,90"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8,6"
              className="animate-pulse"
            />

            {/* Intermediate Checkpoint Markers */}
            {/* Point 1: Overpass Junction */}
            <g transform="translate(240, 180)">
              <circle r="4" fill="#38bdf8" />
              <circle r="8" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
              <text x="10" y="4" fill="#94a3b8" fontSize="8" fontWeight="bold">চেকপয়েন্ট: ওভারব্রিজ মোড়</text>
            </g>

            {/* Point 2: Station Approach */}
            <g transform="translate(420, 220)">
              <circle r="4" fill="#38bdf8" />
              <circle r="8" fill="none" stroke="#38bdf8" strokeWidth="1" strokeOpacity="0.6" />
              <text x="10" y="4" fill="#94a3b8" fontSize="8" fontWeight="bold">চেকপয়েন্ট: প্ল্যাটফর্ম ক্রসিং</text>
            </g>

            {/* ORIGIN PIN: Hotel Al Sheikh Farid */}
            <g transform="translate(70, 260)" className="cursor-pointer">
              {/* Ripple circles */}
              <circle r="18" fill="#f59e0b" fillOpacity="0.2" className="animate-ping" />
              <circle r="12" fill="#f59e0b" fillOpacity="0.4" />
              <circle r="8" fill="#f59e0b" />
              
              {/* Hotel icon & badge */}
              <rect x="-55" y="-45" width="110" height="28" rx="8" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="0" y="-27" fill="#fbbf24" fontSize="9" fontWeight="900" textAnchor="middle">
                🏨 হোটেল আল শেখ ফরিদ
              </text>
              <text x="0" y="-36" fill="#94a3b8" fontSize="6" fontWeight="bold" textAnchor="middle">
                উৎপত্তি ও রান্নাঘর
              </text>
            </g>

            {/* DESTINATION PIN: Customer Location */}
            <g transform="translate(630, 90)" className="cursor-pointer">
              {/* Target pulse ring */}
              <circle r="22" fill="#10b981" fillOpacity="0.15" className="animate-ping" />
              <circle r="14" fill="#10b981" fillOpacity="0.3" />
              <circle r="8" fill="#10b981" />
              
              {/* Destination text box */}
              <rect x="-65" y="-48" width="130" height="32" rx="8" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
              <text x="0" y="-30" fill="#34d399" fontSize="8.5" fontWeight="900" textAnchor="middle">
                🎯 {activeOrder.customerName}
              </text>
              <text x="0" y="-20" fill="#94a3b8" fontSize="6.5" fontWeight="bold" textAnchor="middle">
                {destinationText.substring(0, 24)}
              </text>
            </g>

            {/* ANIMATED DELIVERY RIDER PIN */}
            <g transform={`translate(${riderCoordinates.x}, ${riderCoordinates.y})`} className="transition-all duration-300">
              {/* Rider Pulse Shadow */}
              <circle r="16" fill="#f59e0b" fillOpacity="0.3" className="animate-ping" />
              <circle r="12" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
              
              {/* Center icon dot */}
              <circle r="5" fill="#f59e0b" />
              
              {/* Rider Label Floating Pill */}
              <g transform="translate(0, -22)">
                <rect x="-42" y="-14" width="84" height="18" rx="6" fill="#b45309" stroke="#fbbf24" strokeWidth="1" />
                <text x="0" y="-2" fill="#ffffff" fontSize="7.5" fontWeight="900" textAnchor="middle">
                  🚴 রাইডার ({Math.round(progressPercent)}%)
                </text>
              </g>
            </g>

          </svg>

          {/* Bottom Overlay Info Card */}
          <div className="absolute bottom-3 left-3 right-3 z-20 bg-stone-950/90 backdrop-blur-md p-3 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-2xl">
            
            {/* Rider Identity & Vehicle */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                <Bike className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {lang === 'bn' ? riderProfile.nameBn : riderProfile.nameEn}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {riderProfile.rating}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 truncate">
                  {lang === 'bn' ? riderProfile.vehicleBn : riderProfile.vehicleEn} • {riderProfile.phone}
                </p>
              </div>
            </div>

            {/* Rider Direct Call & Delivery Confirmation Controls */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              
              {/* Direct Call Button */}
              <a
                href={`tel:${riderProfile.phone}`}
                onClick={(e) => {
                  if (onCallRider) {
                    e.preventDefault();
                    onCallRider(riderProfile.phone, riderProfile.nameBn);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-stone-700 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'রাইডারকে কল' : 'Call Rider'}</span>
              </a>

              {/* If on the way, allow customer/admin to mark completed */}
              {isOnTheWay && onUpdateOrderStatus && (
                <button
                  type="button"
                  onClick={() => onUpdateOrderStatus(activeOrder.id, 'completed')}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{lang === 'bn' ? 'ডেলিভারি পেয়েছি' : 'Delivered'}</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Route Details & Checkpoint Timeline */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-2">
          
          {/* Step 1 */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
              ১
            </div>
            <div>
              <h5 className="text-xs font-bold text-stone-200">
                {lang === 'bn' ? 'রান্নাঘর থেকে পার্সেল হস্তান্তর' : 'Kitchen Dispatch'}
              </h5>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ থেকে গরম খাবার থার্মাল বক্সে প্যাক করা হয়েছে।' : 'Packed fresh in thermal hot-box from kitchen.'}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
              ২
            </div>
            <div>
              <h5 className="text-xs font-bold text-stone-200">
                {lang === 'bn' ? 'স্টেশন রোড ও বাজার ওভারব্রিজ পার' : 'Station Road & Overpass'}
              </h5>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {lang === 'bn' ? 'রাইডার দ্রুততম রুটে ট্রানজিট অতিক্রম করছে।' : 'Rider traversing the express bypass route.'}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
              ৩
            </div>
            <div>
              <h5 className="text-xs font-bold text-stone-200">
                {lang === 'bn' ? 'গন্তব্যে হস্তান্তর ও ক্যাশ/বিকাশ' : 'Destination Handover'}
              </h5>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {lang === 'bn' ? `লোকেশন: ${destinationText.substring(0, 35)}` : `Location: ${destinationText.substring(0, 35)}`}
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
