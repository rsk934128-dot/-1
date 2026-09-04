import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ShoppingBag, 
  Phone, 
  UtensilsCrossed, 
  User, 
  MessageSquare, 
  Mail, 
  Languages, 
  ShieldCheck, 
  Search, 
  X, 
  CheckCircle2, 
  HelpCircle, 
  Radio,
  RotateCcw,
  Zap,
  ChevronUp,
  ChevronDown,
  QrCode,
  Share2,
  FileDown,
  ChefHat
} from 'lucide-react';
import { FoodCategory } from '../types';

export interface VoiceCommandListenerProps {
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenTableBooking?: () => void;
  onOpenTableQrScanner?: () => void;
  onOpenBackgroundSync?: () => void;
  onOpenShareAndQr?: () => void;
  onOpenPrintMenu?: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onOpenChat: () => void;
  onOpenEmail: () => void;
  onOpenAi: () => void;
  onOpenBkashSms?: () => void;
  onGoToMenu: (category?: FoodCategory) => void;
  onSearchFood: (query: string) => void;
  onToggleLang: () => void;
  onToggleAdmin: () => void;
  onToggleStaffMode?: () => void;
  lang: 'bn' | 'en';
  isListeningExternal?: boolean;
  onListeningChange?: (listening: boolean) => void;
}

interface CommandDefinition {
  id: string;
  icon: React.ReactNode;
  labelBn: string;
  labelEn: string;
  keywordsBn: string[];
  keywordsEn: string[];
  action: () => void;
  confirmVoiceBn: string;
  confirmVoiceEn: string;
}

export const VoiceCommandListener: React.FC<VoiceCommandListenerProps> = ({
  onOpenCart,
  onOpenAccount,
  onOpenTableBooking,
  onOpenTableQrScanner,
  onOpenBackgroundSync,
  onOpenShareAndQr,
  onOpenPrintMenu,
  onStartCall,
  onOpenChat,
  onOpenEmail,
  onOpenAi,
  onOpenBkashSms,
  onGoToMenu,
  onSearchFood,
  onToggleLang,
  onToggleAdmin,
  onToggleStaffMode,
  lang,
  isListeningExternal,
  onListeningChange,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [lastExecutedCommand, setLastExecutedCommand] = useState<string | null>(null);
  const [isHudOpen, setIsHudOpen] = useState<boolean>(false);
  const [voiceSoundEnabled, setVoiceSoundEnabled] = useState<boolean>(true);
  const [recognitionLanguage, setRecognitionLanguage] = useState<'bn-BD' | 'en-US'>(
    lang === 'bn' ? 'bn-BD' : 'en-US'
  );
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sync language with app lang when app lang changes
  useEffect(() => {
    setRecognitionLanguage(lang === 'bn' ? 'bn-BD' : 'en-US');
  }, [lang]);

  // Handle external listening toggle if passed
  useEffect(() => {
    if (typeof isListeningExternal === 'boolean' && isListeningExternal !== isListening) {
      if (isListeningExternal) {
        startListening();
      } else {
        stopListening();
      }
    }
  }, [isListeningExternal]);

  // Voice confirmation TTS (SpeechSynthesis)
  const speakFeedback = useCallback((text: string, language: 'bn' | 'en') => {
    if (!voiceSoundEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // stop previous speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Speech synthesis fallback
    }
  }, [voiceSoundEnabled]);

  // Chime sound on command execution
  const playChime = useCallback(() => {
    if (!voiceSoundEnabled) return;
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio context fallback
    }
  }, [voiceSoundEnabled]);

  // List of all voice command definitions
  const commands: CommandDefinition[] = [
    {
      id: 'open_cart',
      icon: <ShoppingBag className="w-4 h-4 text-amber-500" />,
      labelBn: 'অর্ডার ব্যাগ / কার্ট খুলুন',
      labelEn: 'Open Cart / Bag',
      keywordsBn: ['কার্ট', 'ব্যাগ', 'অর্ডার ব্যাগ', 'ব্যাগ খুলুন', 'কার্ট দেখাও', 'অর্ডার লিস্ট', 'কার্ট ওপেন', 'shopping bag', 'cart'],
      keywordsEn: ['open cart', 'show cart', 'cart', 'bag', 'order bag', 'view cart', 'my cart', 'open shopping bag', 'checkout'],
      action: () => {
        onOpenCart();
      },
      confirmVoiceBn: 'অর্ডার ব্যাগ খোলা হয়েছে',
      confirmVoiceEn: 'Opening your order bag',
    },
    {
      id: 'call_hotel',
      icon: <Phone className="w-4 h-4 text-emerald-500" />,
      labelBn: 'হোটেল / ম্যানেজারকে কল করুন',
      labelEn: 'Call Hotel / Manager',
      keywordsBn: ['কল', 'ফোন', 'হোটেল কল', 'ম্যানেজারকে কল', 'ম্যানেজার কল', 'অডিও কল', 'কথা বলব', 'ফোন দিন', 'কথা বলতে চাই', 'ম্যানেজার'],
      keywordsEn: ['call hotel', 'call manager', 'call', 'audio call', 'phone hotel', 'contact manager', 'phone call', 'speak to manager'],
      action: () => {
        onStartCall('audio');
      },
      confirmVoiceBn: 'ম্যানেজারের সাথে কল সংযোগ করা হচ্ছে',
      confirmVoiceEn: 'Connecting audio call to hotel manager',
    },
    {
      id: 'table_booking',
      icon: <UtensilsCrossed className="w-4 h-4 text-amber-500" />,
      labelBn: 'টেবিল / সিট বুকিং করুন',
      labelEn: 'Book a Table / Seat',
      keywordsBn: ['টেবিল বুকিং', 'টেবিল', 'সিট বুকিং', 'বুক টেবিল', 'রিজার্ভেশন', 'সিট রিজার্ভ', 'টেবিল বুক'],
      keywordsEn: ['book table', 'table booking', 'reserve table', 'seat booking', 'reservation', 'book a seat'],
      action: () => {
        if (onOpenTableBooking) {
          onOpenTableBooking();
        } else {
          onOpenAccount();
        }
      },
      confirmVoiceBn: 'টেবিল বুকিং ও সিট রিজার্ভেশন ফরম খোলা হয়েছে',
      confirmVoiceEn: 'Opening table booking form',
    },
    {
      id: 'scan_table_qr',
      icon: <QrCode className="w-4 h-4 text-amber-400" />,
      labelBn: 'টেবিল কিউআর স্ক্যান করুন',
      labelEn: 'Scan Table QR Code',
      keywordsBn: ['টেবিল কিউআর', 'কিউআর স্ক্যান', 'টেবিল স্ক্যান', 'কিউআর কোড স্ক্যান', 'কিউআর স্ক্যানার', 'টেবিল কোড'],
      keywordsEn: ['scan table', 'table qr', 'scan qr', 'table scan', 'scan code', 'qr scanner'],
      action: () => {
        if (onOpenTableQrScanner) {
          onOpenTableQrScanner();
        } else if (onOpenTableBooking) {
          onOpenTableBooking();
        }
      },
      confirmVoiceBn: 'টেবিল কিউআর কোড স্ক্যানার চালু করা হয়েছে',
      confirmVoiceEn: 'Launching table QR camera scanner',
    },
    {
      id: 'background_sync',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      labelBn: 'অলওয়েজ একটিভ ও ব্যাকগ্রাউন্ড সিঙ্ক',
      labelEn: 'Always Active & Background Sync',
      keywordsBn: ['ব্যাকগ্রাউন্ড', 'সিঙ্ক', 'অলওয়েজ একটিভ', 'নোটিফিকেশন সেটিংস', 'একটিভ রাখুন', 'রিয়েল টাইম'],
      keywordsEn: ['background sync', 'always active', 'notifications', 'background', 'sync', 'real time'],
      action: () => {
        if (onOpenBackgroundSync) {
          onOpenBackgroundSync();
        }
      },
      confirmVoiceBn: 'অলওয়েজ একটিভ ও ব্যাকগ্রাউন্ড সিঙ্ক চালু করা হয়েছে',
      confirmVoiceEn: 'Opening always active and background sync center',
    },
    {
      id: 'go_to_menu',
      icon: <UtensilsCrossed className="w-4 h-4 text-orange-500" />,
      labelBn: 'খাবারের মেনু দেখুন',
      labelEn: 'Go to Food Menu',
      keywordsBn: ['মেনু', 'খাবার', 'মেনু দেখাও', 'খাবারের তালিকা', 'খাবার মেনু', 'মেনু দেখুন', 'সব খাবার', 'খাবার তালিকা'],
      keywordsEn: ['go to menu', 'show menu', 'food menu', 'open menu', 'menu', 'view menu', 'all items', 'dishes', 'foods'],
      action: () => {
        onGoToMenu('all');
      },
      confirmVoiceBn: 'খাবারের মেনুতে নিয়ে যাচ্ছি',
      confirmVoiceEn: 'Navigating to fresh food menu',
    },
    {
      id: 'print_menu',
      icon: <FileDown className="w-4 h-4 text-amber-500" />,
      labelBn: 'মেনু ডাউনলোড ও প্রিন্ট',
      labelEn: 'Download & Print Menu',
      keywordsBn: ['মেনু প্রিন্ট', 'প্রিন্ট মেনু', 'মেনু ডাউনলোড', 'পিডিএফ মেনু', 'পিডিএফ ডাউনলোড', 'মূল্যতালিকা প্রিন্ট', 'খাবারের তালিকা প্রিন্ট', 'রেট কার্ড'],
      keywordsEn: ['print menu', 'download menu', 'pdf menu', 'menu pdf', 'download daily menu', 'print rate card'],
      action: () => {
        if (onOpenPrintMenu) onOpenPrintMenu();
      },
      confirmVoiceBn: 'দৈনিক খাবারের মেনু প্রিন্ট ও ডাউনলোড উইন্ডো খোলা হয়েছে',
      confirmVoiceEn: 'Opening printable daily food menu window',
    },
    {
      id: 'category_sweets',
      icon: <span className="text-sm">🥨</span>,
      labelBn: 'জিলাপি ও মিষ্টি নাশতা',
      labelEn: 'Sweets & Jilapi',
      keywordsBn: ['জিলাপি', 'মিষ্টি', 'সিঙ্গারা', 'সমুচা', 'নাশতা', 'মিষ্টি নাশতা', 'চমচম', 'রসগোল্লা'],
      keywordsEn: ['jilapi', 'sweets', 'snacks', 'singara', 'samosa', 'sweet snacks'],
      action: () => {
        onGoToMenu('sweets_snacks');
      },
      confirmVoiceBn: 'জিলাপি ও মিষ্টি নাশতার মেনু ফিল্টার করা হয়েছে',
      confirmVoiceEn: 'Showing Sweets and Jilapi snacks',
    },
    {
      id: 'category_rice',
      icon: <span className="text-sm">🍚</span>,
      labelBn: 'ভাত, খিচুড়ি ও পোলাও',
      labelEn: 'Rice & Khichuri',
      keywordsBn: ['ভাত', 'খিচুড়ি', 'খিচুড়ি', 'পোলাও', 'বিরিয়ানি', 'ডাল', 'সাদা ভাত', 'দুপুরের খাবার'],
      keywordsEn: ['rice', 'khichuri', 'polao', 'biryani', 'dal', 'lunch', 'dinner'],
      action: () => {
        onGoToMenu('lunch_dinner');
      },
      confirmVoiceBn: 'ভাত ও খিচুড়ির মেনু দেখানো হচ্ছে',
      confirmVoiceEn: 'Showing Rice and Khichuri dishes',
    },
    {
      id: 'category_meat_fish',
      icon: <span className="text-sm">🥩</span>,
      labelBn: 'গরু, মুরগি ও মাছের কারি',
      labelEn: 'Meat & Fish Curries',
      keywordsBn: ['মাংস', 'গরু', 'মুরগি', 'মাছ', 'গরুর মাংস', 'দেশি মুরগি', 'রুই মাছ', 'ইলিশ', 'কারি'],
      keywordsEn: ['meat', 'beef', 'chicken', 'fish', 'meat curry', 'fish curry'],
      action: () => {
        onGoToMenu('fish_meat');
      },
      confirmVoiceBn: 'মাছ ও মাংসের খাবারের মেনু দেখানো হচ্ছে',
      confirmVoiceEn: 'Showing Meat and Fish dishes',
    },
    {
      id: 'category_breakfast',
      icon: <span className="text-sm">🫓</span>,
      labelBn: 'সকালের নাশতা ও পরোটা',
      labelEn: 'Breakfast & Paratha',
      keywordsBn: ['সকালের নাশতা', 'সকালের নাস্তা', 'পরোটা', 'ডিম', 'ডিম ভুনা', 'ভাজি', 'নাস্তা'],
      keywordsEn: ['breakfast', 'paratha', 'egg', 'breakfast items', 'morning meal'],
      action: () => {
        onGoToMenu('breakfast');
      },
      confirmVoiceBn: 'সকালের নাশতার মেনু ফিল্টার করা হয়েছে',
      confirmVoiceEn: 'Showing breakfast menu items',
    },
    {
      id: 'category_tea',
      icon: <span className="text-sm">☕</span>,
      labelBn: 'স্পেশাল চা ও পানীয়',
      labelEn: 'Tea & Beverage',
      keywordsBn: ['চা', 'দুধ চা', 'কফি', 'বোরহানি', 'পানীয়', 'মালাই চা', 'লিকার চা'],
      keywordsEn: ['tea', 'milk tea', 'coffee', 'beverage', 'drinks', 'borhani'],
      action: () => {
        onGoToMenu('beverage');
      },
      confirmVoiceBn: 'স্পেশাল চা ও পানীয় মেনু ফিল্টার করা হয়েছে',
      confirmVoiceEn: 'Showing Tea and beverages',
    },
    {
      id: 'open_ai_chef',
      icon: <Sparkles className="w-4 h-4 text-purple-500" />,
      labelBn: 'এআই শেফ বারিক সহকারী',
      labelEn: 'AI Chef Barik',
      keywordsBn: ['এআই', 'শেফ', 'শেফ বারিক', 'এআই সহকারী', 'সহকারী', 'রান্না পরামর্শ', 'এআই খুলুন', 'ai'],
      keywordsEn: ['ai', 'ai chef', 'ask chef', 'chef barik', 'ai assistant', 'open ai', 'chef'],
      action: () => {
        onOpenAi();
      },
      confirmVoiceBn: 'শেফ বারিক এআই সহকারী চালু করা হয়েছে',
      confirmVoiceEn: 'Opening AI Chef Assistant',
    },
    {
      id: 'open_account',
      icon: <User className="w-4 h-4 text-blue-500" />,
      labelBn: 'আমার অ্যাকাউন্ট / প্রোফাইল',
      labelEn: 'My Account / Profile',
      keywordsBn: ['অ্যাকাউন্ট', 'প্রোফাইল', 'আমার অ্যাকাউন্ট', 'লগইন', 'সাইন ইন', 'অর্ডার হিস্টোরি', 'ইউজার'],
      keywordsEn: ['open account', 'my account', 'profile', 'sign in', 'login', 'my profile', 'account', 'user profile'],
      action: () => {
        onOpenAccount();
      },
      confirmVoiceBn: 'আপনার অ্যাকাউন্ট প্রোফাইল খোলা হয়েছে',
      confirmVoiceEn: 'Opening your user account',
    },
    {
      id: 'open_chat',
      icon: <MessageSquare className="w-4 h-4 text-teal-500" />,
      labelBn: 'লাইভ মেসেজিং চ্যাট',
      labelEn: 'Live Chat',
      keywordsBn: ['মেসেজ', 'চ্যাট', 'মেসেজিং', 'চ্যাট খুলুন', 'বার্তা পাঠান'],
      keywordsEn: ['open chat', 'chat', 'message', 'live chat', 'messaging', 'send message'],
      action: () => {
        onOpenChat();
      },
      confirmVoiceBn: 'লাইভ মেসেজিং চ্যাট খোলা হয়েছে',
      confirmVoiceEn: 'Opening live chat support',
    },
    {
      id: 'open_email',
      icon: <Mail className="w-4 h-4 text-indigo-500" />,
      labelBn: 'ইমেইল ও ইনভয়েস ফর্ম',
      labelEn: 'Email & Invoice',
      keywordsBn: ['ইমেইল', 'ইমেল', 'মেইল', 'ইমেইল পাঠান', 'মেমো ইমেইল'],
      keywordsEn: ['open email', 'send email', 'email', 'mail', 'email memo'],
      action: () => {
        onOpenEmail();
      },
      confirmVoiceBn: 'ইমেইল ফর্ম খোলা হয়েছে',
      confirmVoiceEn: 'Opening email modal',
    },
    {
      id: 'open_bkash_sms',
      icon: <div className="w-4 h-4 rounded bg-pink-600 text-white text-[9px] font-black flex items-center justify-center">bK</div>,
      labelBn: 'বিকাশ এসএমএস লেটার',
      labelEn: 'bKash SMS Letters',
      keywordsBn: ['বিকাশ', 'বিকাশ এসএমএস', 'এসএমএস', 'বিকাশ চিঠি', 'পেমেন্ট ভেরিফাই'],
      keywordsEn: ['bkash', 'bkash sms', 'sms letter', 'verify payment', 'sms'],
      action: () => {
        if (onOpenBkashSms) onOpenBkashSms();
      },
      confirmVoiceBn: 'বিকাশ এসএমএস লেটার খোলা হয়েছে',
      confirmVoiceEn: 'Opening bKash SMS Letters',
    },
    {
      id: 'open_share_qr',
      icon: <QrCode className="w-4 h-4 text-amber-500" />,
      labelBn: 'অ্যাপ শেয়ার ও কিউআর কোড',
      labelEn: 'Share App & QR Code',
      keywordsBn: ['শেয়ার', 'অ্যাপ শেয়ার', 'কিউআর কোড', 'কিউআর', 'শেয়ার করুন', 'ইন্সটল কিউআর', 'মিডিয়া শেয়ার', 'কিউ আর'],
      keywordsEn: ['share app', 'share', 'qr code', 'qr', 'scan qr', 'install app', 'social share'],
      action: () => {
        if (onOpenShareAndQr) onOpenShareAndQr();
      },
      confirmVoiceBn: 'অ্যাপ শেয়ার এবং কিউআর কোড খোলা হয়েছে',
      confirmVoiceEn: 'Opening App Share and QR code',
    },
    {
      id: 'toggle_language',
      icon: <Languages className="w-4 h-4 text-stone-500" />,
      labelBn: 'ভাষা পরিবর্তন (বাংলা / English)',
      labelEn: 'Switch Language',
      keywordsBn: ['ভাষা পরিবর্তন', 'ইংরেজি', 'ইংলিশ', 'বাংলা', 'ভাষা বদল'],
      keywordsEn: ['change language', 'switch language', 'toggle language', 'english', 'bangla'],
      action: () => {
        onToggleLang();
      },
      confirmVoiceBn: 'ভাষা পরিবর্তন করা হয়েছে',
      confirmVoiceEn: 'Language toggled',
    },
    {
      id: 'toggle_admin',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      labelBn: 'মালিক / ম্যানেজার প্যানেল',
      labelEn: 'Owner Admin Dashboard',
      keywordsBn: ['মালিক মোড', 'ম্যানেজার মোড', 'অ্যাডমিন', 'ড্যাশবোর্ড', 'মালিক প্যানেল'],
      keywordsEn: ['admin mode', 'owner mode', 'admin dashboard', 'manager mode', 'admin'],
      action: () => {
        onToggleAdmin();
      },
      confirmVoiceBn: 'মালিক মোড টগল করা হয়েছে',
      confirmVoiceEn: 'Toggling Owner Admin Dashboard',
    },
    {
      id: 'toggle_staff_mode',
      icon: <ChefHat className="w-4 h-4 text-amber-500" />,
      labelBn: 'কিচেন ও স্টাফ মোড (শেফ টুলস)',
      labelEn: 'Kitchen & Staff Mode',
      keywordsBn: ['স্টাফ মোড', 'কিচেন মোড', 'শেফ মোড', 'রান্নাঘর মোড', 'শেফ টুলস', 'কিচেন'],
      keywordsEn: ['staff mode', 'kitchen mode', 'chef mode', 'kitchen tools', 'chef'],
      action: () => {
        if (onToggleStaffMode) onToggleStaffMode();
      },
      confirmVoiceBn: 'কিচেন ও স্টাফ মোড টগল করা হয়েছে',
      confirmVoiceEn: 'Toggling Kitchen & Staff Mode',
    },
  ];

  // Process and match spoken text to action
  const processSpokenText = useCallback((text: string) => {
    const cleanText = text.trim().toLowerCase();
    if (!cleanText) return;

    // Check direct search queries: "খুঁজুন [আইটেম]" or "Search [item]"
    const searchMatchBn = cleanText.match(/(?:খুঁজুন|খোঁজ|খুঁজ|খুজুন|খুজ|দেখাও)\s+(.+)/i);
    const searchMatchEn = cleanText.match(/(?:search|find|looking for|show me)\s+(.+)/i);

    if (searchMatchBn && searchMatchBn[1] && searchMatchBn[1].trim().length > 1) {
      const query = searchMatchBn[1].trim();
      onSearchFood(query);
      onGoToMenu();
      playChime();
      speakFeedback(`"${query}" খোঁজা হচ্ছে`, 'bn');
      setLastExecutedCommand(`খোঁজা হচ্ছে: "${query}"`);
      setFeedbackMessage(`খোঁজা হচ্ছে: "${query}"`);
      setTimeout(() => setFeedbackMessage(''), 4000);
      return;
    }

    if (searchMatchEn && searchMatchEn[1] && searchMatchEn[1].trim().length > 1) {
      const query = searchMatchEn[1].trim();
      onSearchFood(query);
      onGoToMenu();
      playChime();
      speakFeedback(`Searching for "${query}"`, 'en');
      setLastExecutedCommand(`Searching: "${query}"`);
      setFeedbackMessage(`Searching: "${query}"`);
      setTimeout(() => setFeedbackMessage(''), 4000);
      return;
    }

    // Match against pre-defined commands with fuzzy keyword scoring
    let matchedCommand: CommandDefinition | null = null;
    let highestScore = 0;

    for (const cmd of commands) {
      const allKeywords = [...cmd.keywordsBn, ...cmd.keywordsEn];
      for (const kw of allKeywords) {
        const lowerKw = kw.toLowerCase();
        if (cleanText === lowerKw) {
          matchedCommand = cmd;
          highestScore = 100;
          break;
        } else if (cleanText.includes(lowerKw)) {
          const score = lowerKw.length;
          if (score > highestScore) {
            highestScore = score;
            matchedCommand = cmd;
          }
        }
      }
      if (highestScore === 100) break;
    }

    if (matchedCommand) {
      playChime();
      matchedCommand.action();
      const feedbackText = lang === 'bn' ? matchedCommand.confirmVoiceBn : matchedCommand.confirmVoiceEn;
      speakFeedback(feedbackText, lang);
      const displayLabel = lang === 'bn' ? matchedCommand.labelBn : matchedCommand.labelEn;
      setLastExecutedCommand(displayLabel);
      setFeedbackMessage(`সম্পন্ন: ${displayLabel}`);
      setTimeout(() => setFeedbackMessage(''), 3500);
    } else {
      // Fallback: If spoken phrase is a known single food dish, search it directly
      if (cleanText.length > 2) {
        onSearchFood(cleanText);
        onGoToMenu();
        playChime();
        setLastExecutedCommand(cleanText);
        setFeedbackMessage(lang === 'bn' ? `খাবার মেনুতে অনুসন্ধান: "${cleanText}"` : `Searching menu for: "${cleanText}"`);
        setTimeout(() => setFeedbackMessage(''), 4000);
      }
    }
  }, [commands, lang, onGoToMenu, onSearchFood, playChime, speakFeedback]);

  // Setup Web Speech API Recognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setFeedbackMessage(lang === 'bn' ? 'ব্রাউজার স্পিচ রিকগনিশন সমর্থন করে না।' : 'Speech recognition not supported in this browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = recognitionLanguage;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        if (onListeningChange) onListeningChange(true);
        setFeedbackMessage(lang === 'bn' ? 'শুনছি... আপনার কমান্ড মুখে বলুন' : 'Listening... Speak your command');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          currentTranscript += res[0].transcript;
          if (res.isFinal) {
            isFinal = true;
          }
        }

        setTranscript(currentTranscript);

        if (isFinal && currentTranscript.trim()) {
          processSpokenText(currentTranscript);
          setTimeout(() => {
            setTranscript('');
          }, 2000);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setFeedbackMessage(lang === 'bn' ? 'মাইক্রোফোনের অনুমতি দিন' : 'Please allow microphone access');
          setIsListening(false);
          isListeningRef.current = false;
          if (onListeningChange) onListeningChange(false);
        }
      };

      recognition.onend = () => {
        // If user still wants listening, restart seamlessly
        if (isListeningRef.current) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
            isListeningRef.current = false;
            if (onListeningChange) onListeningChange(false);
          }
        } else {
          setIsListening(false);
          if (onListeningChange) onListeningChange(false);
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
      isListeningRef.current = true;
      if (onListeningChange) onListeningChange(true);
    } catch (e) {
      console.error('Failed to initialize speech recognition', e);
      setIsListening(false);
      isListeningRef.current = false;
      if (onListeningChange) onListeningChange(false);
    }
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (onListeningChange) onListeningChange(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignored
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setIsHudOpen(true);
    }
  };

  const handleQuickCommandClick = (cmd: CommandDefinition) => {
    playChime();
    cmd.action();
    const feedbackText = lang === 'bn' ? cmd.confirmVoiceBn : cmd.confirmVoiceEn;
    speakFeedback(feedbackText, lang);
    const displayLabel = lang === 'bn' ? cmd.labelBn : cmd.labelEn;
    setLastExecutedCommand(displayLabel);
    setFeedbackMessage(`সম্পন্ন: ${displayLabel}`);
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  return (
    <>
      {/* Persistent Floating Mic Launcher (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-40 flex flex-col items-start gap-2">
        {/* Active Listening Animated Tooltip Notification */}
        {(feedbackMessage || (isListening && !isHudOpen)) && (
          <div className="animate-bounce bg-stone-900/95 text-white text-xs px-3.5 py-2 rounded-2xl shadow-xl border border-amber-500/40 backdrop-blur-md flex items-center gap-2 max-w-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-semibold truncate">
              {feedbackMessage || (transcript ? `"${transcript}"` : (lang === 'bn' ? 'ভয়েস কমান্ড শুনছি...' : 'Listening for commands...'))}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Main Floating Voice Mic Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`relative p-3.5 sm:px-4 sm:py-3.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 shadow-2xl transition-all active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white ring-4 ring-red-400/40 animate-pulse'
                : 'bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 hover:border-amber-500/60'
            }`}
            title={lang === 'bn' ? 'ভয়েস কমান্ড ন্যাভিগেশন চালু করুন' : 'Activate Voice Command Navigation'}
          >
            {isListening ? (
              <div className="relative">
                <Mic className="w-5 h-5 text-white animate-bounce" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-stone-900 animate-ping" />
              </div>
            ) : (
              <Mic className="w-5 h-5 text-amber-400" />
            )}

            <div className="text-left hidden sm:block">
              <span className="block text-[11px] font-black uppercase tracking-wider text-amber-300">
                {isListening ? (lang === 'bn' ? 'ভয়েস শুনছি...' : 'Listening...') : (lang === 'bn' ? 'ভয়েস কমান্ড' : 'Voice Command')}
              </span>
              <span className="block text-[10px] text-stone-300 font-normal">
                {isListening ? (lang === 'bn' ? 'কথা বলুন' : 'Speak now') : (lang === 'bn' ? 'যেমন: কার্ট খুলুন, কল দিন' : 'e.g. Open Cart, Call')}
              </span>
            </div>

            {/* Pulsing waves when listening */}
            {isListening && (
              <div className="flex items-center gap-0.5 ml-1">
                <span className="w-1 h-3.5 bg-white rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                <span className="w-1 h-5 bg-amber-300 rounded-full animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" />
                <span className="w-1 h-2 bg-white rounded-full animate-[pulse_0.7s_ease-in-out_infinite_0.2s]" />
              </div>
            )}
          </button>

          {/* Quick HUD Open / Expand Button */}
          <button
            type="button"
            onClick={() => setIsHudOpen(!isHudOpen)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              isHudOpen
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md'
                : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border-stone-700'
            }`}
            title={lang === 'bn' ? 'ভয়েস কমান্ড চিটশিট ও কন্ট্রোল' : 'Voice Command Cheat Sheet & Settings'}
          >
            {isHudOpen ? <ChevronDown className="w-4 h-4" /> : <HelpCircle className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </div>

      {/* Floating Voice Navigation HUD Card (Expandable Modal / Drawer) */}
      {isHudOpen && (
        <div className="fixed bottom-24 left-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 max-h-[80vh] bg-stone-950/95 border border-amber-500/40 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden text-stone-200 animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* HUD Header */}
          <div className="p-4 bg-gradient-to-r from-stone-900 via-amber-950/50 to-stone-900 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-serif">
                  <span>{lang === 'bn' ? 'হোটেল ভয়েস কমান্ড ন্যাভিগেশন' : 'Voice Command Navigation'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono border border-amber-500/30">AI Mic</span>
                </h4>
                <p className="text-[10px] text-stone-400">
                  {isListening ? (lang === 'bn' ? '🔴 মাইক্রোফোন সক্রিয় - মুখে বলুন' : '🔴 Mic active - speak commands') : (lang === 'bn' ? '⚪ বন্ধ রয়েছে - শুরু করতে ক্লিক করুন' : '⚪ Inactive - tap to listen')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Feedback Toggle */}
              <button
                type="button"
                onClick={() => setVoiceSoundEnabled(!voiceSoundEnabled)}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  voiceSoundEnabled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-stone-900 text-stone-500 border-stone-800'
                }`}
                title={voiceSoundEnabled ? 'ভয়েস ও সাউন্ড ফিডব্যাক চালু' : 'ভয়েস ও সাউন্ড ফিডব্যাক বন্ধ'}
              >
                {voiceSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              {/* Close HUD */}
              <button
                type="button"
                onClick={() => setIsHudOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Speech Waveform & Live Transcript Box */}
          <div className="p-4 space-y-3 bg-stone-900/40 border-b border-stone-800/80">
            {/* Waveform / Visualizer */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-900 border border-stone-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'থামান' : 'Stop'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'শুনুন' : 'Listen'}</span>
                    </>
                  )}
                </button>

                {/* Animated visual wave bars */}
                <div className="flex items-center gap-1 h-6">
                  {[40, 70, 95, 60, 85, 50, 90, 65, 80, 45].map((height, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isListening
                          ? 'bg-gradient-to-t from-amber-500 to-rose-500'
                          : 'bg-stone-700'
                      }`}
                      style={{
                        height: isListening ? `${Math.max(15, (height * (Math.sin(Date.now() / 200 + i) + 1.2)) / 2.2)}%` : '20%',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Language Switch for Speech Recognition */}
              <button
                type="button"
                onClick={() => {
                  const nextLang = recognitionLanguage === 'bn-BD' ? 'en-US' : 'bn-BD';
                  setRecognitionLanguage(nextLang);
                  if (isListening) {
                    stopListening();
                    setTimeout(startListening, 150);
                  }
                }}
                className="px-2 py-1 rounded-lg bg-stone-950 border border-stone-700 text-[10px] font-bold text-amber-300 hover:text-amber-200 transition-colors"
                title="রিকগনিশন ভাষা পরিবর্তন"
              >
                {recognitionLanguage === 'bn-BD' ? 'বাংলা (bn-BD)' : 'English (US)'}
              </button>
            </div>

            {/* Real-time transcribed speech or latest execution display */}
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                {isListening ? (lang === 'bn' ? 'মাইক্রোফোনে যা শোনা যাচ্ছে:' : 'Recognized Live Speech:') : (lang === 'bn' ? 'সর্বশেষ কমান্ড:' : 'Last Command:')}
              </span>
              <p className={`font-mono text-xs ${transcript ? 'text-amber-300 font-bold' : lastExecutedCommand ? 'text-emerald-400 font-semibold' : 'text-stone-500 italic'}`}>
                {transcript || (lastExecutedCommand ? `✓ ${lastExecutedCommand}` : (lang === 'bn' ? '“Open Cart” বা “মেনু দেখাও” মুখে বলুন...' : 'Say "Open Cart" or "Call Hotel"...'))}
              </p>
            </div>
          </div>

          {/* Quick Voice Command Cheat Sheet List */}
          <div className="p-4 space-y-2.5 overflow-y-auto max-h-[280px] pr-2">
            <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold">
              <span>{lang === 'bn' ? 'সমর্থিত ভয়েস কমান্ডসমূহ (ক্লিক করেও পরীক্ষা করুন):' : 'Supported Commands (Tap to test):'}</span>
              <Zap className="w-3 h-3 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {commands.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => handleQuickCommandClick(cmd)}
                  className="p-2 rounded-xl bg-stone-900/80 hover:bg-amber-950/40 border border-stone-800 hover:border-amber-500/40 text-left flex items-center justify-between text-xs transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-stone-950 border border-stone-800 group-hover:border-amber-500/40">
                      {cmd.icon}
                    </div>
                    <div>
                      <span className="font-bold text-stone-200 group-hover:text-amber-200 block text-xs">
                        {lang === 'bn' ? cmd.labelBn : cmd.labelEn}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {lang === 'bn' 
                          ? `মুখে বলুন: "${cmd.keywordsBn[0]}" বা "${cmd.keywordsEn[0]}"` 
                          : `Say: "${cmd.keywordsEn[0]}" or "${cmd.keywordsBn[0]}"`}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-amber-400/80 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {lang === 'bn' ? 'চালান →' : 'Run →'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* HUD Footer */}
          <div className="p-3 bg-stone-900 border-t border-stone-800 text-[10px] text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'স্বয়ংক্রিয় এআই ম্যাচিং সক্রিয়' : 'Voice command listener active'}</span>
            </span>
            <span className="font-mono text-stone-500">WebSpeech API</span>
          </div>

        </div>
      )}
    </>
  );
};
