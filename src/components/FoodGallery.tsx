import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Flame, 
  Video, 
  ShoppingBag, 
  Eye, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Clock, 
  Award, 
  Check, 
  Plus, 
  Minus, 
  PhoneCall, 
  Radio, 
  Zap, 
  Camera, 
  Wand2, 
  RotateCw, 
  CheckCircle2, 
  Share2, 
  Utensils, 
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  TrendingUp,
  ShieldCheck,
  Search
} from 'lucide-react';
import { FoodItem, CartItem, PortionOption } from '../types';

export interface GalleryFoodItem {
  id: string;
  foodId: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  category: 'all' | 'specials' | 'biryani_meat' | 'fish' | 'sweets' | 'snacks';
  imageUrl: string;
  hdImageUrl: string;
  videoThumbUrl?: string;
  price: number;
  unitBn: string;
  unitEn: string;
  badgeBn: string;
  badgeEn: string;
  badgeType: 'hot' | 'special' | 'express' | 'sweet';
  temperatureC: number;
  preparationMinutes: number;
  spiciness: 'mild' | 'medium' | 'rich_spicy';
  oilTypeBn: string;
  oilTypeEn: string;
  calories: number;
  chefSecretBn: string;
  chefSecretEn: string;
  portions?: PortionOption[];
  ingredientsBn: string[];
  ingredientsEn: string[];
}

export const GALLERY_ITEMS: GalleryFoodItem[] = [
  {
    id: 'gal-kacchi',
    foodId: 'beef-1',
    nameBn: 'শাহী খাসির কাচ্চি বিরিয়ানি হ্যান্ডি',
    nameEn: 'Royal Mutton Kacchi Biryani Handi',
    taglineBn: 'সুগন্ধি জাফরান বাসমতী চাল, নরম জুসি খাসির মাংস ও গাওয়া ঘিয়ে দম দেওয়া ঐতিহ্যবাহী কাচ্চি',
    taglineEn: 'Authentic saffron-infused Basmati rice with succulent mutton cooked in pure ghee dum',
    category: 'biryani_meat',
    imageUrl: '/images/gallery-kacchi-biryani.jpg',
    hdImageUrl: '/images/gallery-kacchi-biryani.jpg',
    price: 220,
    unitBn: 'হ্যান্ডি / প্লেট',
    unitEn: 'handi/plate',
    badgeBn: '👑 সিগনেচার স্পেশাল',
    badgeEn: '👑 Signature Special',
    badgeType: 'special',
    temperatureC: 78,
    preparationMinutes: 3,
    spiciness: 'medium',
    oilTypeBn: 'খাঁটি গাওয়া ঘি ও সরিষার তেল',
    oilTypeEn: 'Pure Ghee & Mustard Oil',
    calories: 520,
    chefSecretBn: 'বিশেষ ১৮ পদের শাহী গরম মশলা এবং আলু বোখারা সহযোগে মাটির চুলায় দীর্ঘ ৪ ঘণ্টা ভাপে রান্না।',
    chefSecretEn: 'Slow-cooked in clay oven with 18 royal spices and dried plums for 4 hours.',
    portions: [
      { labelBn: 'হাফ প্লেট (১ পিস খাসি)', labelEn: 'Half Plate (1pc Mutton)', multiplier: 0.7, price: 160 },
      { labelBn: 'ফুল প্লেট (২ পিস খাসি + ডিম + আলু)', labelEn: 'Full Plate (2pc Mutton + Egg + Potato)', multiplier: 1, price: 220 },
      { labelBn: 'শাহী ফ্যামিলি হ্যান্ডি (৪ জন)', labelEn: 'Royal Family Handi (4 Person)', multiplier: 3.5, price: 770 },
    ],
    ingredientsBn: ['বাসমতী চাল', 'দেশি খাসির মাংস', 'জাফরান', 'গাওয়া ঘি', 'ভাজা আলু', 'সিদ্ধ ডিম', 'বেরেস্তা'],
    ingredientsEn: ['Basmati Rice', 'Mutton', 'Saffron', 'Pure Ghee', 'Golden Potato', 'Boiled Egg', 'Fried Onions'],
  },
  {
    id: 'gal-beef-kosha',
    foodId: 'beef-1',
    nameBn: 'ঐতিহ্যবাহী কষা গরুর মাংস',
    nameEn: 'Traditional Spicy Beef Kosha',
    taglineBn: 'ঘন তেলমশলার গ্রেভি ও নরম জুসি গরুর মাংসের সিগনেচার রেসিপি, ধোঁয়া ওঠা ভাতের সেরা সঙ্গী',
    taglineEn: 'Signature tender beef slow-braised in caramelized onion gravy and aromatic spices',
    category: 'biryani_meat',
    imageUrl: '/images/gallery-beef-kosha.jpg',
    hdImageUrl: '/images/gallery-beef-kosha.jpg',
    price: 80,
    unitBn: 'বাটি (ঝোলসহ)',
    unitEn: 'bowl with gravy',
    badgeBn: '🔥 ফুটন্ত গরম',
    badgeEn: '🔥 Piping Hot',
    badgeType: 'hot',
    temperatureC: 76,
    preparationMinutes: 2,
    spiciness: 'rich_spicy',
    oilTypeBn: 'খাঁটি সরিষার তেলে কষানো',
    oilTypeEn: 'Cooked in pure mustard oil',
    calories: 340,
    chefSecretBn: 'প্রতিদিন সকাল থেকে হালকা আঁচে পেঁয়াজ বেরেস্তা ও আদা-রসুনের পেস্টে মাংস কষিয়ে নরম করা হয়।',
    chefSecretEn: 'Braised on low flame with caramelized onions and hand-ground ginger garlic.',
    portions: [
      { labelBn: '১ পিস (ঘন ঝোলসহ)', labelEn: '1 Piece with Gravy', multiplier: 1, price: 80 },
      { labelBn: '২ পিস ডাবল বাটি', labelEn: '2 Pieces Double Bowl', multiplier: 2, price: 160 },
      { labelBn: '৪ পিস ফ্যামিলি বাটি', labelEn: '4 Pieces Family Pack', multiplier: 3.8, price: 300 },
    ],
    ingredientsBn: ['দেশি গরুর মাংস', 'খাঁটি সরিষার তেল', 'পেঁয়াজ বেরেস্তা', 'কাঁচামরিচ', 'দারুচিনি-এলাচ', 'আদা-রসুন'],
    ingredientsEn: ['Beef', 'Mustard Oil', 'Fried Onions', 'Green Chilies', 'Cardamom-Cinnamon', 'Ginger-Garlic'],
  },
  {
    id: 'gal-shorshe-ilish',
    foodId: 'fish-curry-1',
    nameBn: 'পদ্মার তাজা সরিষা ইলিশ',
    nameEn: 'Authentic Shorshe Ilish (Mustard Hilsa)',
    taglineBn: 'ঝাঁঝালো হলুদ সরিষার বাটা, কাঁচামরিচ ও কাঁচা সরিষার তেলে রান্না লোভনীয় পদ্মার ইলিশ',
    taglineEn: 'Fresh Padma river Hilsa fish steak simmered in pungent stone-ground mustard paste',
    category: 'fish',
    imageUrl: '/images/gallery-shorshe-ilish.jpg',
    hdImageUrl: '/images/gallery-shorshe-ilish.jpg',
    price: 180,
    unitBn: 'পিস (১ বাটি ঝোল)',
    unitEn: 'piece with mustard sauce',
    badgeBn: '🐟 নদীর তাজা মাছ',
    badgeEn: '🐟 Fresh River Fish',
    badgeType: 'special',
    temperatureC: 74,
    preparationMinutes: 3,
    spiciness: 'rich_spicy',
    oilTypeBn: 'ঘানির খাঁটি সরিষার তেল',
    oilTypeEn: 'Cold-pressed Mustard Oil',
    calories: 290,
    chefSecretBn: 'সাদা ও কালো সরিষা শিলপাটায় বেটে কাঁচামরিচ দিয়ে অল্প সময়ে ফুটানো যাতে মাছের প্রাকৃতিক তেল অক্ষুণ্ণ থাকে।',
    chefSecretEn: 'Stone-ground yellow and black mustard paste with green chilies retaining natural fish oils.',
    portions: [
      { labelBn: '১ পিস পেটি/গাদা', labelEn: '1 Fish Steak', multiplier: 1, price: 180 },
      { labelBn: '২ পিস স্পেশাল কম্বো', labelEn: '2 Fish Steaks Combo', multiplier: 1.9, price: 340 },
    ],
    ingredientsBn: ['পদ্মার তাজা ইলিশ', 'শিলপাটা বাটা সরিষা', 'কাঁচামরিচ', 'খাঁটি সরিষার তেল', 'কালোজিরা ফোড়ন'],
    ingredientsEn: ['Padma Hilsa', 'Ground Mustard', 'Green Chilies', 'Mustard Oil', 'Nigella Seeds'],
  },
  {
    id: 'gal-jilapi',
    foodId: 'jilapi-1',
    nameBn: 'রসালো গরম মচমচে জিলাপি',
    nameEn: 'Hot Crispy Saffron Jilapi',
    taglineBn: 'কড়াই থেকে নামানো গরম মচমচে প্যাঁচের জিলাপি, খাঁটি এলাচ ও জাফরানের সুবাসিত সিরায় টইটম্বুর',
    taglineEn: 'Piping hot crispy spiral jilapi soaked in aromatic saffron and cardamom sugar syrup',
    category: 'sweets',
    imageUrl: '/images/gallery-hot-jilapi.jpg',
    hdImageUrl: '/images/gallery-hot-jilapi.jpg',
    price: 160,
    unitBn: 'কেজি',
    unitEn: 'kg',
    badgeBn: '⚡ লাইভ কড়াই থেকে',
    badgeEn: '⚡ Freshly Fried',
    badgeType: 'hot',
    temperatureC: 82,
    preparationMinutes: 2,
    spiciness: 'mild',
    oilTypeBn: 'ফ্রেশ পরিশোধিত সয়াবিন তেল',
    oilTypeEn: 'Fresh Refined Oil',
    calories: 380,
    chefSecretBn: 'বিশেষ ফার্মেন্টেড ব্যাটার দিয়ে ডুবো তেলে কড়া করে ভেজে ফুটন্ত সিরায় সরাসরি ডুবানো হয়।',
    chefSecretEn: 'Traditional fermented batter deep-fried to crisp perfection and steeped in hot syrup.',
    portions: [
      { labelBn: '২৫০ গ্রাম (এক পোয়া)', labelEn: '250 gm', multiplier: 0.25, price: 40 },
      { labelBn: '৫০০ গ্রাম (আধা কেজি)', labelEn: '500 gm', multiplier: 0.5, price: 80 },
      { labelBn: '১ কেজি পূর্ণ প্যাকেট', labelEn: '1 kg Full Box', multiplier: 1, price: 160 },
      { labelBn: '২ কেজি ফ্যামিলি মিষ্টি প্যাক', labelEn: '2 kg Family Pack', multiplier: 2, price: 320 },
    ],
    ingredientsBn: ['উন্নত ময়দা', 'জাফরানি সিরা', 'এলাচ গুঁড়া', 'লেবুর রস', 'খাঁটি তেল'],
    ingredientsEn: ['Fine Flour', 'Saffron Sugar Syrup', 'Cardamom', 'Lemon Juice', 'Pure Oil'],
  },
  {
    id: 'gal-khichuri-egg',
    foodId: 'khichuri-1',
    nameBn: 'সুগন্ধি ঘিয়ে ভাজা ভুনা খিচুড়ি ও রোস্ট ডিম',
    nameEn: 'Ghee Bhuna Khichuri with Roasted Egg',
    taglineBn: 'সুগন্ধি চাল, সোনা মুগ ডাল ও ঘৃতের মোলায়েম ঘ্রাণে ট্রেনের যাত্রীদের দ্রুততম তৃপ্তিদায়ক আহার',
    taglineEn: 'Aromatic short-grain rice and roasted mung lentils cooked in ghee, served with spiced egg',
    category: 'specials',
    imageUrl: '/images/gallery-bhuna-khichuri.jpg',
    hdImageUrl: '/images/gallery-bhuna-khichuri.jpg',
    price: 30,
    unitBn: 'প্লেট',
    unitEn: 'plate',
    badgeBn: '⏱️ ৩ মিনিটে রেডি',
    badgeEn: '⏱️ 3-Min Express',
    badgeType: 'express',
    temperatureC: 75,
    preparationMinutes: 2,
    spiciness: 'medium',
    oilTypeBn: 'গাওয়া ঘি ও সরিষার তেল',
    oilTypeEn: 'Pure Ghee & Mustard Oil',
    calories: 360,
    chefSecretBn: 'মুগ ডাল হালকা ভেজে সুবাস বের করে চালের সাথে সমপরিমাণে খাঁটি ঘিয়ে ভাজা হয়।',
    chefSecretEn: 'Dry-roasted golden lentils combined with fragrant rice and tempered with whole spices.',
    portions: [
      { labelBn: '১ প্লেট ভুনা খিচুড়ি (আচারসহ)', labelEn: '1 Plate Khichuri with Pickle', multiplier: 1, price: 30 },
      { labelBn: '১ প্লেট স্পেশাল ডিম ভুনা কম্বো', labelEn: '1 Plate with Spiced Egg Combo', multiplier: 1.66, price: 50 },
      { labelBn: '১ প্লেট খিচুড়ি + গরুর মাংস কম্বো', labelEn: '1 Plate + Beef Curry Combo', multiplier: 3.66, price: 110 },
    ],
    ingredientsBn: ['সুগন্ধি চাল', 'সোনা মুগ ও মসুর ডাল', 'গাওয়া ঘি', 'ভাজা পেঁয়াজ', 'আচার', 'সিদ্ধ ডিম'],
    ingredientsEn: ['Aromatic Rice', 'Mung & Masoor Lentils', 'Pure Ghee', 'Fried Onions', 'Pickle', 'Boiled Egg'],
  },
  {
    id: 'gal-tea-shingara',
    foodId: 'tea-1',
    nameBn: 'মাটির ভাঁড়ের মালাই দুধ চা ও খাস্তা সিঙ্গারা',
    nameEn: 'Clay-Cup Malai Milk Tea & Crispy Shingara',
    taglineBn: 'ঘন দুধের সর ও এলাচি সুবাসিত গরম চা এবং বাদাম-আলুর খাস্তা গরম গরম সিঙ্গারা',
    taglineEn: 'Steaming rich milk tea in rustic earthen clay cup paired with crispy hot Bengali samosas',
    category: 'snacks',
    imageUrl: '/images/gallery-malai-tea-shingara.jpg',
    hdImageUrl: '/images/gallery-malai-tea-shingara.jpg',
    price: 20,
    unitBn: 'সেট (১ চা + ১ সিঙ্গারা)',
    unitEn: 'set (1 tea + 1 shingara)',
    badgeBn: '☕ স্টেশন ফেভারিট',
    badgeEn: '☕ Station Favorite',
    badgeType: 'hot',
    temperatureC: 85,
    preparationMinutes: 1,
    spiciness: 'mild',
    oilTypeBn: 'হাতে বানানো ঘি-খামির',
    oilTypeEn: 'Handmade Shortcrust Pastry',
    calories: 250,
    chefSecretBn: 'খাঁটি গাভীর দুধ একটানা ফুটিয়ে ঘন মালাই তৈরি করা হয় এবং মাটির পাত্রে ঢেলে পরিবেশন করা হয়।',
    chefSecretEn: 'Slow-simmered farm milk reduced to thick clotted cream, served in authentic terracotta cups.',
    portions: [
      { labelBn: '১ কাপ মালাই চা + ১টি সিঙ্গারা', labelEn: '1 Malai Tea + 1 Shingara', multiplier: 1, price: 20 },
      { labelBn: '২ কাপ মালাই চা + ৪টি সিঙ্গারা প্যাক', labelEn: '2 Cups Tea + 4 Shingaras Pack', multiplier: 2.8, price: 60 },
    ],
    ingredientsBn: ['খাঁটি গরুর দুধ', 'সিলেটি চা পাতা', 'এলাচ', 'আলুর পুর', 'চীনাবাদাম', 'মৌরি ফোড়ন'],
    ingredientsEn: ['Farm Fresh Milk', 'Sylheti Tea Leaves', 'Cardamom', 'Spiced Potato Filling', 'Peanuts', 'Fennel'],
  },
];

interface FoodGalleryProps {
  foodItems: FoodItem[];
  onAddToCart: (item: CartItem) => void;
  onOpenDetails: (food: FoodItem) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  lang: 'bn' | 'en';
}

export const FoodGallery: React.FC<FoodGalleryProps> = ({
  foodItems,
  onAddToCart,
  onOpenDetails,
  onStartCall,
  lang,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedItemForLightbox, setSelectedItemForLightbox] = useState<GalleryFoodItem | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'live_stream' | 'ai_studio'>('gallery');
  const [selectedPortions, setSelectedPortions] = useState<{ [galleryId: string]: PortionOption | undefined }>({});
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);
  
  // Live Stream Simulation State
  const [isAudioAmbiancePlaying, setIsAudioAmbiancePlaying] = useState<boolean>(false);
  const [liveViewerCount, setLiveViewerCount] = useState<number>(84);
  const [liveKitchenTemp, setLiveKitchenTemp] = useState<number>(76.4);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioOscillatorRef = useRef<any>(null);

  // AI Food Studio Prompt State
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [isGeneratingAiView, setIsGeneratingAiView] = useState<boolean>(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<{
    headlineBn: string;
    headlineEn: string;
    descriptionBn: string;
    descriptionEn: string;
    generatedImg: string;
    matchedGalleryId: string;
  } | null>(null);

  // Filter items
  const filteredGalleryItems = GALLERY_ITEMS.filter((item) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'specials') return item.badgeType === 'special' || item.badgeType === 'express';
    return item.category === activeCategory;
  });

  // Simulated live viewers fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewerCount((prev) => Math.max(65, Math.min(130, prev + Math.floor(Math.random() * 5) - 2)));
      setLiveKitchenTemp((prev) => +(74.5 + Math.random() * 4).toFixed(1));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio API ambient kitchen sizzle synthesizer
  const toggleKitchenAudioAmbiance = () => {
    if (isAudioAmbiancePlaying) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsAudioAmbiancePlaying(false);
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        
        // Generate soft white noise buffer for kitchen sizzling sound
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = (Math.random() * 2 - 1) * 0.04;
        }
        
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter to mimic frying pan sizzle
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2200;
        filter.Q.value = 1.8;

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.25;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(0);
        audioOscillatorRef.current = whiteNoise;
        setIsAudioAmbiancePlaying(true);
      } catch (err) {
        console.warn('Audio context init failed:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Handle Quick Add to Cart
  const handleQuickAdd = (galleryItem: GalleryFoodItem) => {
    // Find matching real food item in state
    const matchedFood = foodItems.find((f) => f.id === galleryItem.foodId) || {
      id: galleryItem.foodId,
      nameBn: galleryItem.nameBn,
      nameEn: galleryItem.nameEn,
      category: 'lunch_dinner' as any,
      price: galleryItem.price,
      unitBn: galleryItem.unitBn,
      unitEn: galleryItem.unitEn,
      descriptionBn: galleryItem.taglineBn,
      descriptionEn: galleryItem.taglineEn,
      image: galleryItem.imageUrl,
      inStock: true,
      availableTimesBn: 'সারাদিন উপলব্ধ',
      preparationTimeMinutes: galleryItem.preparationMinutes,
      portions: galleryItem.portions,
    };

    const selectedPortion = selectedPortions[galleryItem.id] || galleryItem.portions?.[0];

    onAddToCart({
      food: matchedFood,
      quantity: 1,
      selectedPortion,
    });

    setAddedItemSuccess(galleryItem.id);
    setTimeout(() => setAddedItemSuccess(null), 2500);
  };

  // Simulated AI Image Prompt Generator
  const handleGenerateAiPrompt = (presetPrompt?: string) => {
    const promptToUse = presetPrompt || aiCustomPrompt;
    if (!promptToUse.trim()) return;

    setIsGeneratingAiView(true);
    setTimeout(() => {
      // Choose best matching image based on keyword
      let matched = GALLERY_ITEMS[0];
      if (promptToUse.includes('মাংস') || promptToUse.includes('beef') || promptToUse.includes('কষা')) {
        matched = GALLERY_ITEMS[1];
      } else if (promptToUse.includes('ইলিশ') || promptToUse.includes('মাছ') || promptToUse.includes('fish')) {
        matched = GALLERY_ITEMS[2];
      } else if (promptToUse.includes('জিলাপি') || promptToUse.includes('মিষ্টি') || promptToUse.includes('sweet')) {
        matched = GALLERY_ITEMS[3];
      } else if (promptToUse.includes('খিচুড়ি') || promptToUse.includes('khichuri') || promptToUse.includes('ডিম')) {
        matched = GALLERY_ITEMS[4];
      } else if (promptToUse.includes('চা') || promptToUse.includes('সিঙ্গারা') || promptToUse.includes('tea')) {
        matched = GALLERY_ITEMS[5];
      }

      setAiGeneratedResult({
        headlineBn: `এআই স্পেশাল ভিউ: ${matched.nameBn}`,
        headlineEn: `AI Visualized Shot: ${matched.nameEn}`,
        descriptionBn: `আপনার অনুরোধ "${promptToUse}" অনুযায়ী হোটেল আল শেখ ফরিদের মাস্টার শেফের তাজা রন্ধনশৈলীর আল্ট্রা-৮K ক্লোজআপ ভিউ তৈরি করা হয়েছে।`,
        descriptionEn: `Generated photorealistic 8K culinary view tailored to your prompt: "${promptToUse}".`,
        generatedImg: matched.hdImageUrl,
        matchedGalleryId: matched.id,
      });
      setIsGeneratingAiView(false);
    }, 1200);
  };

  return (
    <section id="food-gallery-section" className="mx-4 sm:mx-6 lg:mx-8 my-8 scroll-mt-24">
      {/* Section Container Card */}
      <div className="bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white rounded-3xl p-5 sm:p-8 lg:p-10 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md animate-pulse">
                <Radio className="w-3.5 h-3.5 text-white" />
                {lang === 'bn' ? 'লাইভ ভিডিও সেলিং ও ৮K গ্যালালি' : 'Live Video Selling & 8K Gallery'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'bn' ? `রান্নার তাপমাত্রা ${liveKitchenTemp}°C` : `Cooking Temp ${liveKitchenTemp}°C`}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700">
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'bn' ? `${liveViewerCount} জন কাস্টমার দেখছেন` : `${liveViewerCount} Live Viewers`}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-amber-50 tracking-tight flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-amber-400 hidden sm:inline" />
              {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ স্পেশাল ফুড গ্যালালি' : 'Hotel Al Sheikh Farid Gourmet Gallery'}
            </h2>
            <p className="mt-1.5 text-sm text-stone-300 max-w-2xl">
              {lang === 'bn' 
                ? 'ক্যামেরায় সরাসরি খাবার তৈরির দৃশ্য ও হাই-রেজোলিউশন ভিজ্যুয়াল দেখে অর্ডার করুন। ট্রেনের যাত্রী ও অতিথিদের জন্য শতভাগ খাঁটি ও টাটকা।'
                : 'Mouth-watering 8K visuals and live kitchen cooking transparency. Handcrafted with authentic spices and delivered in minutes.'}
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Ambient Sound Sizzle Button */}
            <button
              onClick={toggleKitchenAudioAmbiance}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isAudioAmbiancePlaying 
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/25' 
                  : 'bg-stone-800/80 hover:bg-stone-700 text-stone-200 border-stone-700'
              }`}
              title="রান্নার শব্দ শুনুন"
            >
              {isAudioAmbiancePlaying ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
              <span>{isAudioAmbiancePlaying ? (lang === 'bn' ? 'সবার শব্দ চালু' : 'Sizzle Audio ON') : (lang === 'bn' ? 'কিচেন সাউন্ড' : 'Kitchen Sizzle')}</span>
            </button>

            {/* Live Video Call to Chef */}
            <button
              onClick={() => onStartCall('video')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all cursor-pointer transform active:scale-95"
            >
              <Video className="w-4 h-4" />
              <span>{lang === 'bn' ? 'শেফকে ভিডিও কল' : 'Video Call Chef'}</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 p-2 rounded-2xl border border-stone-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setViewMode('gallery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'gallery'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{lang === 'bn' ? '৮K স্পেশাল মেনু ফটো' : '8K Food Visuals'}</span>
            </button>

            <button
              onClick={() => setViewMode('live_stream')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'live_stream'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md font-extrabold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Radio className="w-4 h-4 text-red-400" />
              <span>{lang === 'bn' ? 'লাইভ কিচেন ভিডিও স্ট্রিম' : 'Live Kitchen Video'}</span>
            </button>

            <button
              onClick={() => setViewMode('ai_studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'ai_studio'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md font-extrabold'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Wand2 className="w-4 h-4 text-amber-300" />
              <span>{lang === 'bn' ? 'এআই ফুড ভিউ স্টুডিও' : 'AI Food Visual Studio'}</span>
            </button>
          </div>

          {/* Express Handoff Guarantee Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'ট্রেনের বগিতে ২-৩ মিনিটে ডেলিভারি গ্যারান্টি' : '2-3 Min Train Seat Handoff'}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: 8K FOOD GALLERY GRID */}
        {/* ========================================================================= */}
        {viewMode === 'gallery' && (
          <div className="relative z-10 mt-6 space-y-6">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {[
                { id: 'all', labelBn: 'সব সেরা খাবার', labelEn: 'All Top Items' },
                { id: 'specials', labelBn: '👑 সিগনেচার স্পেশাল', labelEn: '👑 Specials' },
                { id: 'biryani_meat', labelBn: '🍖 বিরিয়ানি ও মাংস', labelEn: '🍖 Biryani & Meat' },
                { id: 'fish', labelBn: '🐟 নদীর তাজা মাছ', labelEn: '🐟 River Fish' },
                { id: 'sweets', labelBn: '🍯 গরম জিলাপি ও মিষ্টি', labelEn: '🍯 Sweets & Jilapi' },
                { id: 'snacks', labelBn: '☕ চা ও গরম নাস্তা', labelEn: '☕ Tea & Snacks' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </button>
              ))}
            </div>

            {/* Gallery Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGalleryItems.map((item) => {
                const currentPortion = selectedPortions[item.id] || item.portions?.[0];
                const activePrice = currentPortion ? currentPortion.price : item.price;
                const isJustAdded = addedItemSuccess === item.id;

                return (
                  <div
                    key={item.id}
                    className="group bg-stone-900/90 rounded-2xl border border-stone-800 hover:border-amber-500/60 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Area with Steam & Badges */}
                    <div className="relative aspect-4/3 overflow-hidden bg-stone-950">
                      <img
                        src={item.imageUrl}
                        alt={item.nameBn}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />

                      {/* Dark gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md ${
                          item.badgeType === 'special' 
                            ? 'bg-amber-500 text-stone-950' 
                            : item.badgeType === 'hot' 
                            ? 'bg-red-600 text-white animate-pulse' 
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {lang === 'bn' ? item.badgeBn : item.badgeEn}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-stone-950/80 backdrop-blur-sm text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                          🌡️ {item.temperatureC}°C
                        </span>
                      </div>

                      {/* Bottom Image Quick Actions */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2 py-1 rounded-md bg-stone-950/90 text-stone-300 text-[11px] flex items-center gap-1 border border-stone-800">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>{lang === 'bn' ? `প্রস্তুতি: ${item.preparationMinutes} মিনিট` : `${item.preparationMinutes} min ready`}</span>
                        </span>

                        <button
                          onClick={() => setSelectedItemForLightbox(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/90 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? '৮K ভিউ' : '8K Zoom'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Food Info Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-lg font-bold font-serif text-amber-100 group-hover:text-amber-300 transition-colors">
                            {lang === 'bn' ? item.nameBn : item.nameEn}
                          </h3>
                        </div>

                        <p className="mt-1 text-xs text-stone-300 line-clamp-2 leading-relaxed">
                          {lang === 'bn' ? item.taglineBn : item.taglineEn}
                        </p>

                        {/* Oil & Spiciness Micro-Tags */}
                        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-200 border border-stone-700">
                            {lang === 'bn' ? item.oilTypeBn : item.oilTypeEn}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                            🔥 {lang === 'bn' ? (item.spiciness === 'rich_spicy' ? 'মাখামাখা ঝাল' : item.spiciness === 'medium' ? 'সহনীয় ঝাল' : 'মৃদু স্বাদ') : item.spiciness}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                            ⚡ {item.calories} ক্যালোরি
                          </span>
                        </div>

                        {/* Portion Selector if available */}
                        {item.portions && item.portions.length > 0 && (
                          <div className="mt-3.5">
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              {lang === 'bn' ? 'পরিমাণ / সাইজ নির্বাচন করুন:' : 'Select Portion:'}
                            </label>
                            <div className="grid grid-cols-1 gap-1.5">
                              {item.portions.map((portion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedPortions((prev) => ({ ...prev, [item.id]: portion }))}
                                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                                    (currentPortion?.labelBn === portion.labelBn)
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold'
                                      : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 border border-stone-700'
                                  }`}
                                >
                                  <span>{lang === 'bn' ? portion.labelBn : portion.labelEn}</span>
                                  <span className="font-mono font-bold text-amber-200">৳ {portion.price}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price and Cart Button Footer */}
                      <div className="mt-5 pt-3.5 border-t border-stone-800 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-stone-400">{lang === 'bn' ? 'বর্তমান মূল্য' : 'Price'}</p>
                          <p className="text-xl font-black font-mono text-amber-400">
                            ৳ {activePrice}
                            <span className="text-xs font-normal text-stone-400 font-sans ml-1">
                              /{lang === 'bn' ? item.unitBn : item.unitEn}
                            </span>
                          </p>
                        </div>

                        <button
                          onClick={() => handleQuickAdd(item)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                            isJustAdded
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black shadow-amber-500/25'
                          }`}
                        >
                          {isJustAdded ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-white" />
                              <span>{lang === 'bn' ? 'কার্টে যুক্ত!' : 'Added!'}</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              <span>{lang === 'bn' ? 'অর্ডার করুন' : 'Add to Cart'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: LIVE VIDEO SELLING & KITCHEN STREAM */}
        {/* ========================================================================= */}
        {viewMode === 'live_stream' && (
          <div className="relative z-10 mt-6 bg-stone-950 rounded-2xl border border-stone-800 p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Left Video Mockup / Stream Screen */}
              <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-amber-500/30 bg-stone-900 shadow-2xl">
                <img
                  src="/images/live-kitchen.jpg"
                  alt="হোটেল আল শেখ ফরিদ লাইভ কিচেন"
                  referrerPolicy="no-referrer"
                  className="w-full aspect-16/10 object-cover object-center filter brightness-95"
                />

                {/* Top Live Video Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white shadow-lg animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE কিচেন ফিড
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-950/80 text-amber-300 border border-amber-500/30">
                    স্টেশন মেইন ব্রাঞ্চ #১
                  </span>
                </div>

                {/* Live Temperature & Hygiene Gauge */}
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                    <div>
                      <p className="text-[10px] text-stone-400">{lang === 'bn' ? 'কড়াই তাপমাত্রা' : 'Wok Temp'}</p>
                      <p className="text-sm font-black text-amber-400 font-mono">{liveKitchenTemp}°C</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-[10px] text-stone-400">{lang === 'bn' ? 'হাইজিন মান' : 'Hygiene'}</p>
                      <p className="text-sm font-bold text-emerald-400">১০০% স্বাস্থ্যসম্মত</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-[10px] text-stone-400">{lang === 'bn' ? 'পরবর্তী ব্যাচ' : 'Next Batch'}</p>
                      <p className="text-sm font-bold text-amber-200">মাত্র ২ মিনিট</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Live Selling Pitch & Instant Call */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 mb-2">
                    {lang === 'bn' ? 'সরাসরি রান্নার দৃশ্য দেখে অর্ডার' : 'Transparent Live Cooking'}
                  </span>
                  <h3 className="text-2xl font-black font-serif text-amber-50">
                    {lang === 'bn' ? 'লাইভ কিচেন দেখে নিশ্চিত হয়ে নিন আপনার খাবারের মান' : 'Watch Live Cooking Before You Order'}
                  </h3>
                  <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                    {lang === 'bn'
                      ? 'হোটেল আল শেখ ফরিদ কোনো বাসি বা ফ্রোজেন খাবার পরিবেশন করে না। খাঁটি সরিষার তেলে টাটকা মাছ-মাংস ও সুগন্ধি বিরিয়ানি সরাসরি কড়াই থেকে গরম পরিবেশন করা হয়।'
                      : 'Zero frozen ingredients. Freshly cooked with stone-ground spices and pure oil right before your eyes.'}
                  </p>
                </div>

                {/* Live Pitch Highlights */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === 'bn' ? 'ট্রেনের বগি ও সিটে ২-৩ মিনিটে ডেলিভারি' : 'Express Delivery to Train Bogie/Seat'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === 'bn' ? 'লাইভ ভিডিও কলে শেফের সাথে সরাসরি কথা বলুন' : '1-Click Direct Video Call with Chef'}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === 'bn' ? 'বিকাশ / নগদ বা ক্যাশ অন ডেলিভারিতে ১০০% নিরাপদ' : 'bKash/Nagad & Cash on Delivery Accepted'}</span>
                  </div>
                </div>

                {/* Call to Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onStartCall('video')}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'শেফকে লাইভ ভিডিও কল দিন' : 'Call Chef on Video'}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('gallery')}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-lg transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'খাবার বাছাই করুন' : 'Choose Items'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 3: AI FOOD STUDIO & PROMPT GENERATOR */}
        {/* ========================================================================= */}
        {viewMode === 'ai_studio' && (
          <div className="relative z-10 mt-6 bg-stone-950 rounded-2xl border border-stone-800 p-5 sm:p-7">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold mb-3">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'bn' ? 'কৃত্রিম বুদ্ধিমত্তা চালিত ফুড ভিজ্যুয়াল জেনারেটর' : 'AI Food Visual Studio'}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-serif text-amber-50">
                {lang === 'bn' ? 'আপনার পছন্দের পদের এআই আল্ট্রা-ভিউ জেনারেট করুন' : 'Generate Custom AI Visuals of Your Favorite Dish'}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-stone-300">
                {lang === 'bn'
                  ? 'আপনার চাহিদা অনুযায়ী কষা মাংস, শাহী বিরিয়ানি বা গরম জিলাপির এক্সট্রা বেরেস্তা ও গ্রেভিযুক্ত ফটো জেনারেট করে স্বাদ ও পরিবেশন পরখ করুন।'
                  : 'Type what you crave and generate custom AI gourmet visuals to preview before ordering.'}
              </p>

              {/* Preset Prompt Pills */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {[
                  { labelBn: '🍖 অতিরিক্ত গ্রেভিসহ কষা গরুর মাংস', labelEn: 'Extra Gravy Beef Kosha', query: 'কষা গরুর মাংস অতিরিক্ত গ্রেভি' },
                  { labelBn: '👑 শাহী কাচ্চি বিরিয়ানি ও ডিম', labelEn: 'Royal Kacchi Biryani & Egg', query: 'শাহী কাচ্চি বিরিয়ানি জাফরান' },
                  { labelBn: '🐟 সরিষা ইলিশ ও গরম ভাত', labelEn: 'Shorshe Ilish with Rice', query: 'পদ্মার সরিষা ইলিশ কাঁচামরিচ' },
                  { labelBn: '🍯 ফুটন্ত গরম রসালো জিলাপি', labelEn: 'Hot Syrupy Crispy Jilapi', query: 'গরম রসালো জিলাপি মচমচে' },
                  { labelBn: '☕ মাটির কাপে মালাই চা ও সিঙ্গারা', labelEn: 'Malai Tea in Clay Cup', query: 'মালাই চা ও খাস্তা সিঙ্গারা' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiCustomPrompt(preset.query);
                      handleGenerateAiPrompt(preset.query);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-500/20 text-stone-300 hover:text-amber-200 border border-stone-800 hover:border-amber-500/40 text-xs transition-all cursor-pointer"
                  >
                    {lang === 'bn' ? preset.labelBn : preset.labelEn}
                  </button>
                ))}
              </div>

              {/* Custom Prompt Input */}
              <div className="mt-5 flex gap-2 max-w-xl mx-auto">
                <input
                  type="text"
                  value={aiCustomPrompt}
                  onChange={(e) => setAiCustomPrompt(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: কষা গরুর মাংস, কাচ্চি বিরিয়ানি হ্যান্ডি...' : 'e.g. Extra spicy beef kosha with green chilies...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleGenerateAiPrompt()}
                  disabled={isGeneratingAiView || !aiCustomPrompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 text-stone-950 font-black text-sm transition-all cursor-pointer"
                >
                  {isGeneratingAiView ? <RotateCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  <span>{isGeneratingAiView ? (lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...') : (lang === 'bn' ? 'ভিউ তৈরি করুন' : 'Generate')}</span>
                </button>
              </div>

              {/* AI Generated Result Preview Card */}
              {aiGeneratedResult && (
                <div className="mt-8 text-left bg-stone-900 p-5 rounded-2xl border border-amber-500/40 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                    <img
                      src={aiGeneratedResult.generatedImg}
                      alt={aiGeneratedResult.headlineBn}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-amber-500 text-stone-950 font-bold text-[10px] shadow">
                      ✨ AI Rendered 8K
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xl font-bold font-serif text-amber-200">
                      {lang === 'bn' ? aiGeneratedResult.headlineBn : aiGeneratedResult.headlineEn}
                    </h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {lang === 'bn' ? aiGeneratedResult.descriptionBn : aiGeneratedResult.descriptionEn}
                    </p>
                    
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => {
                          const item = GALLERY_ITEMS.find((g) => g.id === aiGeneratedResult.matchedGalleryId) || GALLERY_ITEMS[0];
                          handleQuickAdd(item);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'এই পদটি এখনই অর্ডার করুন' : 'Order This Item Now'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 8K LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {selectedItemForLightbox && (
        <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-stone-900 text-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-amber-500/40 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemForLightbox(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-stone-950/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8">
              
              {/* Left Full Image */}
              <div className="md:col-span-6 relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-950 border border-stone-800">
                <img
                  src={selectedItemForLightbox.hdImageUrl}
                  alt={selectedItemForLightbox.nameBn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-stone-950 text-xs font-black shadow-lg">
                  ৮K আল্ট্রা-এইচডি
                </div>
                <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-stone-950/80 backdrop-blur-sm border border-stone-700 flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-bold">🌡️ বর্তমান তাপমাত্রা: {selectedItemForLightbox.temperatureC}°C</span>
                  <span className="text-emerald-400">🔥 ১০০% টাটকা রান্না</span>
                </div>
              </div>

              {/* Right Details & Direct Order */}
              <div className="md:col-span-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {lang === 'bn' ? selectedItemForLightbox.badgeBn : selectedItemForLightbox.badgeEn}
                  </span>
                  <h3 className="text-2xl font-black font-serif text-white mt-1">
                    {lang === 'bn' ? selectedItemForLightbox.nameBn : selectedItemForLightbox.nameEn}
                  </h3>
                  <p className="mt-2 text-sm text-stone-300 leading-relaxed">
                    {lang === 'bn' ? selectedItemForLightbox.taglineBn : selectedItemForLightbox.taglineEn}
                  </p>

                  {/* Chef Secret Box */}
                  <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      {lang === 'bn' ? 'মাস্টার শেফের স্পেশাল রেসিপি রহস্য:' : 'Chef Secret Recipe:'}
                    </p>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {lang === 'bn' ? selectedItemForLightbox.chefSecretBn : selectedItemForLightbox.chefSecretEn}
                    </p>
                  </div>

                  {/* Ingredients Tags */}
                  <div className="mt-4">
                    <p className="text-[11px] font-medium text-stone-400 mb-1.5">
                      {lang === 'bn' ? 'উপকরণসমূহ:' : 'Key Ingredients:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(lang === 'bn' ? selectedItemForLightbox.ingredientsBn : selectedItemForLightbox.ingredientsEn).map((ing, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 text-[11px] border border-stone-700">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Price and Cart Footer */}
                <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-stone-400">{lang === 'bn' ? 'মূল্য' : 'Price'}</p>
                    <p className="text-2xl font-black font-mono text-amber-400">
                      ৳ {selectedItemForLightbox.price}
                      <span className="text-xs font-normal text-stone-400 font-sans ml-1">
                        /{lang === 'bn' ? selectedItemForLightbox.unitBn : selectedItemForLightbox.unitEn}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleQuickAdd(selectedItemForLightbox);
                      setSelectedItemForLightbox(null);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ট্রেনের সিটে এখনই অর্ডার করুন' : 'Order to Train Seat'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
