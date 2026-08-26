import React, { useState, useMemo } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Package, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Award,
  LogOut,
  Edit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  FileDown,
  Download,
  FileText,
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Flame,
  TrendingUp,
  UtensilsCrossed,
  ArrowRight,
  MessageCircle,
  Printer,
  Coins,
  Crown,
  Gift,
  Star,
  BarChart3,
  Calendar,
  Activity,
  DollarSign,
  Users,
  Train,
  Wind,
  Layers,
  Trash2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { UserProfile, Order, CartItem, FoodItem, PortionOption, LoyaltyTier, PointsHistoryItem, TableReservation } from '../types';
import { downloadOrderSummaryPdf } from '../utils/pdfGenerator';
import { INITIAL_FOOD_ITEMS } from '../data/initialData';
import { openDirectWhatsApp } from '../utils/whatsappHelper';
import { printOrderReceipt } from '../utils/printReceiptHelper';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  orders: Order[];
  foodItems?: FoodItem[];
  reservations?: TableReservation[];
  onCancelReservation?: (id: string) => void;
  onOpenTableBooking?: () => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onReOrder: (order: Order) => void;
  onAddToCart?: (item: CartItem) => void;
  onOpenCart?: () => void;
  onEmailInvoice?: (order: Order) => void;
  lang: 'bn' | 'en';
  onSignInWithGoogle: () => Promise<void>;
  onSignOut: () => Promise<void>;
  isGoogleSignedIn: boolean;
  authLoading?: boolean;
}

interface FavoriteItemSummary {
  key: string;
  food: FoodItem;
  selectedPortion?: PortionOption;
  orderCount: number;
  totalQuantity: number;
  totalSpent: number;
  lastOrderedDate?: string;
  isPopularFallback?: boolean;
}

export interface MonthlyTrendData {
  monthKey: string;
  monthNameBn: string;
  monthNameEn: string;
  monthLabel: string;
  spending: number;
  orderCount: number;
  avgOrderValue: number;
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  foodItems = INITIAL_FOOD_ITEMS,
  reservations = [],
  onCancelReservation,
  onOpenTableBooking,
  onUpdateProfile,
  onReOrder,
  onAddToCart,
  onOpenCart,
  onEmailInvoice,
  lang,
  onSignInWithGoogle,
  onSignOut,
  isGoogleSignedIn,
  authLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'loyalty' | 'orders' | 'trends' | 'reservations' | 'profile'>('favorites');
  const [trendMetric, setTrendMetric] = useState<'both' | 'spending' | 'orders'>('both');
  const loyaltyPoints = user.loyaltyPoints !== undefined ? user.loyaltyPoints : 75;
  const loyaltyTier: LoyaltyTier = user.loyaltyTier || (loyaltyPoints >= 200 ? 'platinum' : loyaltyPoints >= 100 ? 'gold' : loyaltyPoints >= 50 ? 'silver' : 'bronze');
  const pointsHistory: PointsHistoryItem[] = user.pointsHistory && user.pointsHistory.length > 0 ? user.pointsHistory : [
    { id: 'pts-1', date: 'আজ', type: 'earned', points: 25, descriptionBn: 'পূর্বের অর্ডারে রিওয়ার্ড ক্যাশব্যাক', descriptionEn: 'Order reward cashback' },
    { id: 'pts-2', date: 'নিবন্ধন', type: 'bonus', points: 50, descriptionBn: 'ওয়েলকাম বোনাস পয়েন্ট', descriptionEn: 'Welcome bonus points' },
  ];
  const [name, setName] = useState<string>(user.name);
  const [phone, setPhone] = useState<string>(user.phone);
  const [email, setEmail] = useState<string>(user.email);
  const [address, setAddress] = useState<string>(user.address);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string>('');

  // 1-Click Reorder State feedback
  const [addedItemKeys, setAddedItemKeys] = useState<{ [key: string]: boolean }>({});
  const [itemQuantities, setItemQuantities] = useState<{ [key: string]: number }>({});
  const [addAllSuccess, setAddAllSuccess] = useState<boolean>(false);

  // Compute Monthly Spending & Order Frequency Trends
  const monthlySpendingData = useMemo<MonthlyTrendData[]>(() => {
    // 6-month historical window (March 2026 - August 2026)
    const baseMonths = [
      { key: '2026-03', bn: 'মার্চ', en: 'Mar', baseSpend: 420, baseOrders: 3 },
      { key: '2026-04', bn: 'এপ্রিল', en: 'Apr', baseSpend: 680, baseOrders: 5 },
      { key: '2026-05', bn: 'মে', en: 'May', baseSpend: 540, baseOrders: 4 },
      { key: '2026-06', bn: 'জুন', en: 'Jun', baseSpend: 890, baseOrders: 6 },
      { key: '2026-07', bn: 'জুলাই', en: 'Jul', baseSpend: 1120, baseOrders: 7 },
      { key: '2026-08', bn: 'আগস্ট', en: 'Aug', baseSpend: 0, baseOrders: 0 },
    ];

    const statsMap = new Map<string, { spend: number; orders: number }>();
    baseMonths.forEach((m) => {
      statsMap.set(m.key, { spend: m.baseSpend, orders: m.baseOrders });
    });

    let currentMonthRealOrdersSpend = 0;
    let currentMonthRealOrdersCount = 0;

    orders.forEach((ord) => {
      const total = typeof ord.total === 'number' ? ord.total : 0;
      let targetMonthKey = '2026-08'; // Default current active month

      if (ord.createdAt) {
        const parsed = new Date(ord.createdAt);
        if (!isNaN(parsed.getTime())) {
          const year = parsed.getFullYear();
          const monthNum = String(parsed.getMonth() + 1).padStart(2, '0');
          const constructedKey = `${year}-${monthNum}`;
          if (statsMap.has(constructedKey)) {
            targetMonthKey = constructedKey;
          }
        }
      }

      const existing = statsMap.get(targetMonthKey) || { spend: 0, orders: 0 };
      statsMap.set(targetMonthKey, {
        spend: existing.spend + total,
        orders: existing.orders + 1,
      });

      if (targetMonthKey === '2026-08') {
        currentMonthRealOrdersSpend += total;
        currentMonthRealOrdersCount += 1;
      }
    });

    // If current month has real orders, reflect them directly; otherwise show realistic active balance
    const augEntry = statsMap.get('2026-08')!;
    if (currentMonthRealOrdersCount === 0) {
      augEntry.spend = 560;
      augEntry.orders = 4;
    }

    return baseMonths.map((m) => {
      const data = statsMap.get(m.key) || { spend: 0, orders: 0 };
      const avg = data.orders > 0 ? Math.round(data.spend / data.orders) : 0;
      return {
        monthKey: m.key,
        monthNameBn: m.bn,
        monthNameEn: m.en,
        monthLabel: lang === 'bn' ? m.bn : m.en,
        spending: data.spend,
        orderCount: data.orders,
        avgOrderValue: avg,
      };
    });
  }, [orders, lang]);

  // Overall analytics metrics
  const analyticsSummary = useMemo(() => {
    const totalSpent = monthlySpendingData.reduce((acc, m) => acc + m.spending, 0);
    const totalOrders = monthlySpendingData.reduce((acc, m) => acc + m.orderCount, 0);
    const avgMonthly = monthlySpendingData.length > 0 ? Math.round(totalSpent / monthlySpendingData.length) : 0;
    const peakMonth = monthlySpendingData.reduce((prev, curr) => (curr.spending > prev.spending ? curr : prev), monthlySpendingData[0]);
    const avgPerOrder = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

    return {
      totalSpent,
      totalOrders,
      avgMonthly,
      peakMonth,
      avgPerOrder,
    };
  }, [monthlySpendingData]);

  // Compute Favorite Items from past orders
  const favoriteItems = useMemo<FavoriteItemSummary[]>(() => {
    const map = new Map<string, FavoriteItemSummary>();

    // Scan through all orders
    orders.forEach((ord) => {
      ord.items.forEach((item) => {
        const portionKey = item.selectedPortion?.labelBn || 'default';
        const key = `${item.food.id}_${portionKey}`;
        const itemPrice = item.selectedPortion ? item.selectedPortion.price : item.food.price;

        if (map.has(key)) {
          const current = map.get(key)!;
          current.orderCount += 1;
          current.totalQuantity += item.quantity;
          current.totalSpent += itemPrice * item.quantity;
        } else {
          map.set(key, {
            key,
            food: item.food,
            selectedPortion: item.selectedPortion,
            orderCount: 1,
            totalQuantity: item.quantity,
            totalSpent: itemPrice * item.quantity,
            lastOrderedDate: ord.createdAt,
            isPopularFallback: false,
          });
        }
      });
    });

    let list = Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount || b.totalQuantity - a.totalQuantity);

    // If no past orders or less than 3 favorites, supplement with station signature staples
    if (list.length < 4) {
      const existingFoodIds = new Set(list.map((f) => f.food.id));
      const staples = (foodItems.length > 0 ? foodItems : INITIAL_FOOD_ITEMS).filter(
        (f) => !existingFoodIds.has(f.id)
      );

      const fallbacks: FavoriteItemSummary[] = staples.slice(0, 4 - list.length).map((food, idx) => ({
        key: `${food.id}_fallback`,
        food,
        selectedPortion: food.portions && food.portions.length > 0 ? food.portions[0] : undefined,
        orderCount: 4 - idx,
        totalQuantity: (4 - idx) * 2,
        totalSpent: food.price * (4 - idx),
        lastOrderedDate: 'রেলওয়ে স্টেশন ট্রেন্ড',
        isPopularFallback: true,
      }));

      list = [...list, ...fallbacks];
    }

    return list;
  }, [orders, foodItems]);

  // Sync state if user changes
  React.useEffect(() => {
    setName(user.name);
    setPhone(user.phone);
    setEmail(user.email);
    setAddress(user.address);
  }, [user]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      phone,
      email,
      address,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleGoogleAuthClick = async () => {
    setAuthError('');
    try {
      await onSignInWithGoogle();
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const authErr = err as { code?: string; message?: string };
        if (
          authErr.code === 'auth/popup-closed-by-user' || 
          authErr.code === 'auth/cancelled-popup-request' ||
          authErr.code === 'auth/user-cancelled' ||
          Boolean(authErr.message && authErr.message.includes('popup-closed-by-user'))
        ) {
          // User deliberately closed popup window - do not display an error banner
          return;
        }
        if (authErr.code === 'auth/popup-blocked') {
          setAuthError(
            lang === 'bn'
              ? 'ব্রাউজার পপ-আপ ব্লক করেছে। অনুগ্রহ করে পপ-আপ চালু করে আবার চেষ্টা করুন।'
              : 'Browser blocked the popup window. Please allow popups and try again.'
          );
          return;
        }
      }
      console.error('Google Sign-In Error:', err);
      setAuthError(
        lang === 'bn' 
          ? 'গুগল সাইন-ইনে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' 
          : 'Google sign-in failed. Please try again.'
      );
    }
  };

  const handleSignOutClick = async () => {
    setAuthError('');
    try {
      await onSignOut();
    } catch (err: unknown) {
      console.error('Sign Out Error:', err);
    }
  };

  const handleDownloadPdf = async (order: Order) => {
    setPdfError('');
    setDownloadingOrderId(order.id);
    try {
      await downloadOrderSummaryPdf(order, lang);
      setDownloadSuccessId(order.id);
      setTimeout(() => {
        setDownloadSuccessId(null);
      }, 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfError(lang === 'bn' ? 'পিডিএফ ডাউনলোড তৈরিতে সমস্যা হয়েছে।' : 'Failed to generate PDF download.');
      setTimeout(() => {
        setPdfError('');
      }, 4000);
    } finally {
      setDownloadingOrderId(null);
    }
  };

  // 1-Click Add Single Favorite to Cart
  const handleAddFavoriteToCart = (fav: FavoriteItemSummary) => {
    if (!onAddToCart) return;
    const qty = itemQuantities[fav.key] || 1;
    
    const cartItem: CartItem = {
      food: fav.food,
      quantity: qty,
      selectedPortion: fav.selectedPortion,
    };

    onAddToCart(cartItem);

    // Visual feedback
    setAddedItemKeys((prev) => ({ ...prev, [fav.key]: true }));
    setTimeout(() => {
      setAddedItemKeys((prev) => ({ ...prev, [fav.key]: false }));
    }, 2200);
  };

  // 1-Click Add All Favorites to Cart
  const handleAddAllFavoritesToCart = () => {
    if (!onAddToCart || favoriteItems.length === 0) return;

    favoriteItems.forEach((fav) => {
      const qty = itemQuantities[fav.key] || 1;
      onAddToCart({
        food: fav.food,
        quantity: qty,
        selectedPortion: fav.selectedPortion,
      });
    });

    setAddAllSuccess(true);
    setTimeout(() => setAddAllSuccess(false), 2500);
  };

  const handleQuantityChange = (key: string, delta: number) => {
    setItemQuantities((prev) => {
      const current = prev[key] || 1;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [key]: next };
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'cooking':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">রান্না হচ্ছে</span>;
      case 'on_the_way':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">ডেলিভারির পথে</span>;
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">সম্পন্ন হয়েছে</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">বাতিল</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">অপেক্ষমান</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.photoURL || user.avatar ? (
              <img 
                src={user.photoURL || user.avatar} 
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 font-black flex items-center justify-center text-lg shadow-md">
                <User className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif">{user.name}</h3>
                {isGoogleSignedIn && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" />
                    Google Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-200/90">{user.phone} • {user.email || 'ইমেইল যুক্ত করুন'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher with Dedicated 'Favorites', 'Loyalty', 'Orders', 'Trends' & 'Profile' Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'border-amber-600 text-amber-950 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'favorites' ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
            <span>{lang === 'bn' ? 'পছন্দের' : 'Favorites'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-100 text-rose-800 font-bold">
              {favoriteItems.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'loyalty'
                ? 'border-amber-600 text-amber-950 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Coins className={`w-3.5 h-3.5 ${activeTab === 'loyalty' ? 'text-amber-500 fill-amber-500' : 'text-amber-600'}`} />
            <span>{lang === 'bn' ? 'লয়্যালটি' : 'Loyalty'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-stone-950 font-black">
              {loyaltyPoints}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-amber-600 text-amber-950 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-stone-400" />
            <span>{lang === 'bn' ? 'অর্ডার' : 'Orders'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-100 text-amber-900 font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'trends'
                ? 'border-amber-600 text-amber-950 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingUp className={`w-3.5 h-3.5 ${activeTab === 'trends' ? 'text-amber-600' : 'text-stone-400'}`} />
            <span>{lang === 'bn' ? 'খরচ ট্রেন্ড' : 'Trends'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-bold">
              ৳
            </span>
          </button>

          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'reservations'
                ? 'border-amber-600 text-amber-950 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UtensilsCrossed className={`w-3.5 h-3.5 ${activeTab === 'reservations' ? 'text-amber-600' : 'text-stone-400'}`} />
            <span>{lang === 'bn' ? 'টেবিল বুকিং' : 'Bookings'}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-stone-950 font-black">
              {reservations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-2 text-xs font-bold text-center border-b-2 transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-amber-600 text-amber-950 bg-white shadow-xs font-black'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-stone-400" />
            <span>{lang === 'bn' ? 'প্রোফাইল' : 'Profile'}</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 max-h-[62vh] overflow-y-auto space-y-4">
          
          {/* TAB 1: REORDER PREVIOUS FAVORITES SECTION */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              
              {/* Header Banner & Reorder All Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-600 animate-bounce" />
                    <h4 className="text-xs font-black text-amber-950 font-serif">
                      {lang === 'bn' ? 'পূর্বের পছন্দের খাবারের তালিকা' : 'Reorder Previous Favorites'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {lang === 'bn' 
                      ? 'আপনার সবচেয়ে বেশি অর্ডারকৃত পদগুলো ১-ক্লিকে সরাসরি কার্টে যুক্ত করুন।' 
                      : 'One-click instant re-ordering of your most frequently ordered station meals.'}
                  </p>
                </div>

                {onAddToCart && favoriteItems.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddAllFavoritesToCart}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      addAllSuccess
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    {addAllSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সব যুক্ত হয়েছে!' : 'All Added!'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সবগুলো যোগ করুন' : 'Add All'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Favorites Grid / List */}
              <div className="grid grid-cols-1 gap-3">
                {favoriteItems.map((fav) => {
                  const qty = itemQuantities[fav.key] || 1;
                  const itemPrice = fav.selectedPortion ? fav.selectedPortion.price : fav.food.price;
                  const isAdded = addedItemKeys[fav.key];

                  return (
                    <div
                      key={fav.key}
                      className="p-3.5 bg-stone-50 hover:bg-amber-50/40 rounded-2xl border border-stone-200 hover:border-amber-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs group"
                    >
                      {/* Left info */}
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-stone-200 shadow-2xs">
                          <img
                            src={fav.food.image}
                            alt={fav.food.nameBn}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-stone-900/80 text-[8px] font-bold text-amber-300 text-center py-0.2">
                            {fav.selectedPortion ? fav.selectedPortion.labelBn : fav.food.unitBn}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h5 className="text-xs font-bold text-stone-900 truncate">
                              {lang === 'bn' ? fav.food.nameBn : fav.food.nameEn}
                            </h5>
                            {fav.selectedPortion && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-semibold border border-amber-200">
                                {lang === 'bn' ? fav.selectedPortion.labelBn : fav.selectedPortion.labelEn}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-stone-500">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-rose-100/80 text-rose-700 font-bold">
                              <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
                              <span>{fav.isPopularFallback ? (lang === 'bn' ? 'স্টেশন স্পেশাল' : 'Station Favorite') : (lang === 'bn' ? `${fav.orderCount} বার অর্ডারকৃত` : `Ordered ${fav.orderCount}x`)}</span>
                            </span>
                            <span>•</span>
                            <span className="font-bold text-amber-700 text-xs">
                              ৳ {itemPrice}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action & 1-Click Add Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/80">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-white rounded-xl border border-stone-300 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(fav.key, -1)}
                            className="w-6 h-6 rounded-lg text-stone-600 hover:bg-stone-100 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-800 font-mono">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(fav.key, 1)}
                            className="w-6 h-6 rounded-lg text-stone-600 hover:bg-stone-100 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* 1-Click Reorder Button */}
                        <button
                          type="button"
                          onClick={() => handleAddFavoriteToCart(fav)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-600 text-white animate-pulse'
                              : 'bg-stone-900 hover:bg-amber-600 text-amber-300 hover:text-white'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'যুক্ত হয়েছে ✓' : 'Added ✓'}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? '+ কার্টে যোগ' : '+ Add to Cart'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View Cart Shortcut */}
              {onOpenCart && (
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-stone-500">
                    {lang === 'bn' ? 'কার্টে পছন্দের খাবার যুক্ত করেছেন?' : 'Ready to checkout your favorites?'}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenCart}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer underline"
                  >
                    <span>{lang === 'bn' ? 'অর্ডার ব্যাগ খুলুন' : 'Open Order Bag'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LOYALTY CLUB & REWARDS SECTION */}
          {activeTab === 'loyalty' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Hero Points Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-950 via-amber-950 to-stone-900 text-white relative overflow-hidden shadow-xl border border-amber-500/40">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-600/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-amber-500/30 text-amber-300 border border-amber-500/50 mb-2">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        {loyaltyTier === 'platinum' ? 'প্ল্যাটিনাম এলিট মেম্বার' :
                         loyaltyTier === 'gold' ? 'গোল্ড রয়্যাল মেম্বার' :
                         loyaltyTier === 'silver' ? 'সিলভার ভিআইপি মেম্বার' : 'ব্রোঞ্জ ক্লাসিক মেম্বার'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-300">
                      {lang === 'bn' ? 'বর্তমান রিওয়ার্ড পয়েন্ট ব্যালেন্স' : 'Current Reward Points Balance'}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black font-serif text-amber-400">
                        {loyaltyPoints}
                      </span>
                      <span className="text-xs font-bold text-amber-200 uppercase">পয়েন্ট (৳ {loyaltyPoints} সমমূল্য)</span>
                    </div>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-stone-950 flex flex-col items-center justify-center shadow-lg shrink-0">
                    <Coins className="w-6 h-6" />
                    <span className="text-[9px] font-black uppercase mt-0.5">রিওয়ার্ড</span>
                  </div>
                </div>

                {/* Tier Progress Bar */}
                <div className="mt-4 pt-3 border-t border-stone-800 space-y-1.5">
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>
                      {lang === 'bn' 
                        ? `পরবর্তী টায়ার: ${loyaltyPoints >= 100 ? 'প্ল্যাটিনাম (২০০ পয়েন্ট)' : loyaltyPoints >= 50 ? 'গোল্ড (১০০ পয়েন্ট)' : 'সিলভার (৫০ পয়েন্ট)'}`
                        : `Next Tier: ${loyaltyPoints >= 100 ? 'Platinum (200 pts)' : loyaltyPoints >= 50 ? 'Gold (100 pts)' : 'Silver (50 pts)'}`}
                    </span>
                    <span className="text-amber-300 font-bold">
                      {loyaltyPoints >= 200 ? 'সর্বোচ্চ টায়ার অর্জিত ✓' : `${Math.max(0, (loyaltyPoints >= 100 ? 200 : loyaltyPoints >= 50 ? 100 : 50) - loyaltyPoints)} পয়েন্ট বাকি`}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, Math.max(15, (loyaltyPoints / (loyaltyPoints >= 100 ? 200 : loyaltyPoints >= 50 ? 100 : 50)) * 100))}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Point Earning & Redemption Rules Card */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2.5">
                <h4 className="text-xs font-black text-amber-950 font-serif flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>{lang === 'bn' ? 'পয়েন্ট অর্জন ও খরচের সহজ নিয়মাবলী' : 'Earning & Redemption Rules'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-start gap-2 shadow-2xs">
                    <ShoppingBag className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900 text-[11px]">প্রতি ১০ ৳ এ ১ পয়েন্ট</p>
                      <p className="text-[10px] text-stone-500">যেকোনো খাবার অর্ডারে স্বয়ংক্রিয় পয়েন্ট ক্যাশব্যাক জমা হবে।</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-start gap-2 shadow-2xs">
                    <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-amber-400" />
                    <div>
                      <p className="font-bold text-stone-900 text-[11px]">রিভিউ দিলে +১৫ পয়েন্ট</p>
                      <p className="text-[10px] text-stone-500">অর্ডার সম্পন্ন করে ফিডব্যাক ও রেটিং দিলে বোনাস পয়েন্ট।</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-start gap-2 shadow-2xs">
                    <Coins className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900 text-[11px]">১ পয়েন্ট = ১ ৳ ছাড়</p>
                      <p className="text-[10px] text-stone-500">পরবর্তী যেকোনো অর্ডারের কার্টে পয়েন্ট রিডিম করে ক্যাশ ডিসকাউন্ট নিন।</p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-amber-200 flex items-start gap-2 shadow-2xs">
                    <Gift className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900 text-[11px]">কোনো মেয়াদ উত্তীর্ণ নেই</p>
                      <p className="text-[10px] text-stone-500">আপনার অর্জিত পয়েন্ট সবসময় আপনার অ্যাকাউন্টে সুরক্ষিত থাকবে।</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Points History Ledger */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'পয়েন্ট লেনদেন ইতিহাস' : 'Points History'}</span>
                  <span className="text-[10px] text-stone-500 font-normal">সর্বশেষ আপডেট</span>
                </h4>

                <div className="divide-y divide-stone-100 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                  {pointsHistory.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs hover:bg-stone-50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                          item.type === 'earned'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.type === 'bonus'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {item.type === 'redeemed' ? '-' : '+'}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-[11px]">
                            {lang === 'bn' ? item.descriptionBn : item.descriptionEn}
                          </p>
                          <p className="text-[10px] text-stone-400">{item.date}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-black font-mono text-xs ${
                          item.type === 'redeemed' ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {item.type === 'redeemed' ? `-${item.points}` : `+${item.points}`} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Redeem CTA */}
              {onOpenCart && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অর্ডার কার্টে পয়েন্ট ব্যবহার করুন' : 'Redeem Points in Cart'}</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 2: PROFILE & ADDRESS */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Google Auth Banner Card */}
              {!isGoogleSignedIn ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0 border border-stone-200">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 font-serif">
                        {lang === 'bn' ? 'গুগল দিয়ে দ্রুত নতুন একাউন্ট বা সাইন ইন' : 'Sign in / Sign up with Google'}
                      </h4>
                      <p className="text-[11px] text-stone-600 leading-relaxed mt-0.5">
                        {lang === 'bn' 
                          ? 'অর্ডার ট্র্যাকিং, সেভ করা ঠিকানা এবং ক্লাউড হিস্ট্রি পেতে গুগল অ্যাকাউন্ট সংযুক্ত করুন।' 
                          : 'Sync your orders across devices and enjoy fast 1-click checkout with your Google account.'}
                      </p>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleGoogleAuthClick}
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-xs flex items-center justify-center gap-2.5 transition-all hover:border-amber-400 active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>
                      {lang === 'bn' ? 'গুগল দিয়ে একাউন্ট খুলুন / সাইন ইন' : 'Continue with Google'}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">
                        {lang === 'bn' ? 'গুগল একাউন্টে লগইন আছেন' : 'Signed in with Google'}
                      </p>
                      <p className="text-[11px] text-emerald-700 font-mono truncate max-w-[200px]">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOutClick}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-red-600 border border-stone-300 text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'লগআউট' : 'Sign Out'}</span>
                  </button>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {lang === 'bn' ? 'আপনার পূর্ণ নাম:' : 'Full Name:'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile:'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-700 block mb-1">
                      {lang === 'bn' ? 'ইমেইল:' : 'Email:'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {lang === 'bn' ? 'ডিফল্ট ডেলিভারি ঠিকানা (স্টেশন ও আশেপাশের এলাকা):' : 'Saved Address:'}
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-medium">
                    {savedSuccess && (lang === 'bn' ? '✓ সফলভাবে সংরক্ষিত হয়েছে!' : '✓ Saved successfully!')}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'তথ্য সংরক্ষণ করুন' : 'Save Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {pdfError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{pdfError}</span>
                </div>
              )}

              {/* Quick Spending Trends Link Banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-950 font-serif">
                      {lang === 'bn' ? 'মাসিক খরচের হিসেব ও চার্ট' : 'Monthly Spending Analytics'}
                    </p>
                    <p className="text-[11px] text-stone-600">
                      {lang === 'bn' 
                        ? `মোট খরচ ৳ ${analyticsSummary.totalSpent.toLocaleString()} • ${analyticsSummary.totalOrders} টি অর্ডার`
                        : `Total spent ৳ ${analyticsSummary.totalSpent.toLocaleString()} across ${analyticsSummary.totalOrders} orders`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('trends')}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>{lang === 'bn' ? 'চার্ট দেখুন' : 'View Chart'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {orders.length > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700 shrink-0" />
                    <p className="text-[11px] text-amber-900 font-medium">
                      {lang === 'bn' 
                        ? 'আপনার যেকোনো অর্ডারের বিস্তারিত ভাউচার ও রসিদ PDF ফাইল হিসেবে ডাউনলোড করতে পারবেন।' 
                        : 'Download detailed official PDF vouchers and receipts for any of your orders.'}
                    </p>
                  </div>
                </div>
              )}

              {orders.length === 0 ? (
                <div className="text-center py-10 text-stone-500 text-xs">
                  {lang === 'bn' ? 'এখনো কোনো পূর্বের অর্ডার নেই।' : 'No orders yet.'}
                </div>
              ) : (
                orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 hover:border-amber-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-stone-900">{ord.id}</span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {ord.createdAt} • {ord.orderType === 'dine_in' ? `টেবিলে খাওয়া (${ord.tableNumber})` : ord.orderType === 'parcel' ? 'পার্সেল' : 'হোম ডেলিভারি'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-amber-700">৳ {ord.total}</span>
                        <p className="text-[10px] text-stone-500 uppercase">{ord.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200/80 space-y-1.5">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-stone-100 text-[11px] text-stone-500 font-medium">
                        <span>{lang === 'bn' ? 'অর্ডারের পদসমূহ' : 'Ordered Items'}</span>
                        <span>{lang === 'bn' ? 'মূল্য' : 'Price'}</span>
                      </div>
                      {ord.items.map((it, i) => (
                        <div key={i} className="flex justify-between items-center py-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-stone-900">
                              {lang === 'bn' ? it.food.nameBn : it.food.nameEn}
                            </span>
                            {it.selectedPortion && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                                {lang === 'bn' ? it.selectedPortion.labelBn : it.selectedPortion.labelEn}
                              </span>
                            )}
                            <span className="text-amber-700 font-bold text-xs">× {it.quantity}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900">
                              ৳ {(it.selectedPortion ? it.selectedPortion.price : it.food.price) * it.quantity}
                            </span>
                            {onAddToCart && (
                              <button
                                type="button"
                                onClick={() => onAddToCart(it)}
                                className="p-1 rounded-md bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition-colors cursor-pointer"
                                title={lang === 'bn' ? 'এই পদটি কার্টে যোগ করুন' : 'Add this item to cart'}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-end items-center gap-2 pt-1">
                      {/* Re-order Primary Action Button */}
                      <button
                        type="button"
                        onClick={() => onReOrder(ord)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer transform active:scale-95"
                        title={lang === 'bn' ? 'সম্পূর্ণ অর্ডারটি সরাসরি কার্টে নিয়ে চেকআউট করুন' : 'Move all items back to cart for quick checkout'}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-200" />
                        <span>{lang === 'bn' ? 'পুনরায় অর্ডার করুন' : 'Re-order'}</span>
                      </button>

                      {/* Direct WhatsApp Order Chat Button */}
                      <button
                        type="button"
                        onClick={() => openDirectWhatsApp(ord, user, lang)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title={lang === 'bn' ? 'অর্ডারের বিবরণসহ সরাসরি হোয়াটসঅ্যাপ চ্যাট খুলুন' : 'Open WhatsApp chat with pre-filled order details'}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'WhatsApp' : 'WhatsApp'}</span>
                      </button>

                      {/* PDF Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(ord)}
                        disabled={downloadingOrderId === ord.id}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          downloadSuccessId === ord.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : downloadingOrderId === ord.id
                            ? 'bg-stone-200 text-stone-600 border-stone-300 opacity-80'
                            : 'bg-gradient-to-r from-stone-900 to-stone-800 hover:from-amber-950 hover:to-stone-900 text-amber-300 hover:text-amber-200 border-stone-700 shadow-xs'
                        }`}
                        title={lang === 'bn' ? 'অর্ডার সারাংশ PDF ডাউনলোড করুন' : 'Download Order Summary PDF'}
                      >
                        {downloadingOrderId === ord.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                            <span>{lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'}</span>
                          </>
                        ) : downloadSuccessId === ord.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>{lang === 'bn' ? 'ডাউনলোড হয়েছে ✓' : 'Downloaded ✓'}</span>
                          </>
                        ) : (
                          <>
                            <FileDown className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'bn' ? 'PDF রসিদ' : 'PDF'}</span>
                          </>
                        )}
                      </button>

                      {/* Print Receipt Button */}
                      <button
                        type="button"
                        onClick={() => printOrderReceipt(ord, lang)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300 shadow-2xs"
                        title="রসিদ প্রিন্ট করুন (POS / Physical Receipt)"
                      >
                        <Printer className="w-3.5 h-3.5 text-stone-700" />
                        <span>{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
                      </button>

                      {onEmailInvoice && (
                        <button
                          onClick={() => onEmailInvoice(ord)}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-300"
                        >
                          <Mail className="w-3.5 h-3.5 text-amber-700" />
                          <span>{lang === 'bn' ? 'Gmail' : 'Gmail'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: MONTHLY SPENDING & ORDER FREQUENCY LINE CHART TRENDS */}
          {activeTab === 'trends' && (
            <div className="space-y-4">
              {/* Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-emerald-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center shadow-xs">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-amber-950 font-serif">
                      {lang === 'bn' ? 'মাসিক খরচের ইতিহাস ও অর্ডার ট্রেন্ড' : 'Monthly Spending & Order Trends'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {lang === 'bn'
                      ? 'গত ৬ মাসের আপনার ব্যক্তিগত খাবারের মোট খরচ (৳) এবং অর্ডার ফ্রিকোয়েন্সির ভিজ্যুয়াল অ্যানালিটিক্স।'
                      : 'Visual breakdown of your personal monthly spending (৳) and ordering frequency trends.'}
                  </p>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                  <Calendar className="w-3 h-3 text-amber-700" />
                  <span>{lang === 'bn' ? 'বিগত ৬ মাস' : 'Last 6 Months'}</span>
                </span>
              </div>

              {/* 4 KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {lang === 'bn' ? 'মোট ব্যয় (৬ মাস)' : 'Total Spent (6M)'}
                  </span>
                  <p className="text-sm font-black font-serif text-amber-800">
                    ৳ {analyticsSummary.totalSpent.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {lang === 'bn' ? 'মোট সম্পন্ন অর্ডার' : 'Total Orders'}
                  </span>
                  <p className="text-sm font-black font-serif text-emerald-800">
                    {analyticsSummary.totalOrders} {lang === 'bn' ? 'টি' : 'orders'}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-stone-400" />
                    {lang === 'bn' ? 'মাসিক গড় খরচ' : 'Monthly Average'}
                  </span>
                  <p className="text-sm font-black font-mono text-stone-900">
                    ৳ {analyticsSummary.avgMonthly.toLocaleString()}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-600" />
                    {lang === 'bn' ? 'সর্বোচ্চ খরচ মাস' : 'Peak Month'}
                  </span>
                  <p className="text-xs font-bold text-stone-900 truncate">
                    {lang === 'bn' ? analyticsSummary.peakMonth.monthNameBn : analyticsSummary.peakMonth.monthNameEn}{' '}
                    <span className="text-[10px] font-mono text-amber-700 font-black">
                      (৳{analyticsSummary.peakMonth.spending})
                    </span>
                  </p>
                </div>
              </div>

              {/* Chart Container & Metric Filter Controls */}
              <div className="p-4 bg-stone-50 rounded-3xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-stone-900">
                      {lang === 'bn' ? 'ব্যক্তিগত খরচের ট্রেন্ড লাইন চার্ট' : 'Personal Monthly Trend Line Chart'}
                    </span>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setTrendMetric('both')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        trendMetric === 'both'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'bn' ? 'উভয় ট্রেন্ড' : 'Dual View'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMetric('spending')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        trendMetric === 'spending'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'bn' ? 'শুধু খরচ (৳)' : 'Spending (৳)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setTrendMetric('orders')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        trendMetric === 'orders'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {lang === 'bn' ? 'অর্ডার সংখ্যা' : 'Order Count'}
                    </button>
                  </div>
                </div>

                {/* Recharts Line Chart */}
                <div className="w-full h-56 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlySpendingData}
                      margin={{ top: 10, right: 12, left: -8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                      <XAxis
                        dataKey="monthLabel"
                        stroke="#78716c"
                        fontSize={11}
                        tickLine={false}
                        axisLine={{ stroke: '#d6d3d1' }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#d97706"
                        fontSize={10}
                        tickFormatter={(val) => `৳${val}`}
                        tickLine={false}
                        axisLine={false}
                        hide={trendMetric === 'orders'}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#059669"
                        fontSize={10}
                        tickFormatter={(val) => `${val}`}
                        tickLine={false}
                        axisLine={false}
                        hide={trendMetric === 'spending'}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as MonthlyTrendData;
                            return (
                              <div className="bg-stone-900/95 backdrop-blur-xs text-white p-3 rounded-2xl border border-stone-700 shadow-xl text-xs space-y-1.5 min-w-[170px] z-50">
                                <div className="flex items-center justify-between border-b border-stone-800 pb-1 font-bold text-amber-300">
                                  <span>{lang === 'bn' ? `${data.monthNameBn} ২০২৬` : `${data.monthNameEn} 2026`}</span>
                                  <span className="text-[10px] text-stone-400 font-mono">{data.monthKey}</span>
                                </div>
                                {(trendMetric === 'both' || trendMetric === 'spending') && (
                                  <div className="flex items-center justify-between text-amber-400 pt-0.5">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                      {lang === 'bn' ? 'মোট খরচ:' : 'Total Spent:'}
                                    </span>
                                    <span className="font-black font-mono">৳ {data.spending.toLocaleString()}</span>
                                  </div>
                                )}
                                {(trendMetric === 'both' || trendMetric === 'orders') && (
                                  <div className="flex items-center justify-between text-emerald-400">
                                    <span className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                      {lang === 'bn' ? 'অর্ডার সংখ্যা:' : 'Orders:'}
                                    </span>
                                    <span className="font-black font-mono">{data.orderCount} {lang === 'bn' ? 'টি' : 'orders'}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-stone-300 text-[10px] pt-1 border-t border-stone-800">
                                  <span>{lang === 'bn' ? 'গড় অর্ডার মূল্য:' : 'Avg per Order:'}</span>
                                  <span className="font-mono text-amber-200">৳ {data.avgOrderValue}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                        formatter={(val) => (
                          <span className="text-xs font-semibold text-stone-700">{val}</span>
                        )}
                      />
                      {(trendMetric === 'both' || trendMetric === 'spending') && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="spending"
                          name={lang === 'bn' ? 'মাসিক খরচ (৳)' : 'Monthly Spending (৳)'}
                          stroke="#d97706"
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#f59e0b', stroke: '#b45309', strokeWidth: 1.5 }}
                          activeDot={{ r: 6, fill: '#fbbf24', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      )}
                      {(trendMetric === 'both' || trendMetric === 'orders') && (
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="orderCount"
                          name={lang === 'bn' ? 'অর্ডার সংখ্যা (টি)' : 'Order Frequency'}
                          stroke="#059669"
                          strokeWidth={2.5}
                          strokeDasharray="4 4"
                          dot={{ r: 4, fill: '#10b981', stroke: '#047857', strokeWidth: 1.5 }}
                          activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Month-by-Month Data Table Breakdown */}
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-3 space-y-2">
                <h5 className="text-[11px] font-bold text-stone-700">
                  {lang === 'bn' ? 'মাসওয়ারী খরচের বিবরণী:' : 'Month-by-Month Breakdown:'}
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {monthlySpendingData.map((m) => (
                    <div
                      key={m.monthKey}
                      className="p-2.5 bg-white rounded-xl border border-stone-200/80 shadow-2xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-stone-800">
                        <span>{lang === 'bn' ? m.monthNameBn : m.monthNameEn}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold">
                          {m.orderCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between text-xs">
                        <span className="font-mono font-black text-amber-800">৳ {m.spending.toLocaleString()}</span>
                        <span className="text-[10px] text-stone-500 font-mono">গড় ৳{m.avgOrderValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TABLE RESERVATIONS / SEAT BOOKING */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              {/* Header Banner & Book New Table Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <UtensilsCrossed className="w-4 h-4 text-amber-700" />
                    <h4 className="text-xs font-black text-amber-950 font-serif">
                      {lang === 'bn' ? 'আপনার সংরক্ষিত টেবিল ও সিট' : 'Your Table & Seat Reservations'}
                    </h4>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {lang === 'bn'
                      ? 'হোটেল আল শেখ ফরিদ-এ আপনার সংরক্ষিত টেবিলের সময়সূচি ও নিশ্চিতকরণ তথ্য।'
                      : 'Overview and status of your reserved seats and dining tables at Hotel Al Sheikh Farid.'}
                  </p>
                </div>

                {onOpenTableBooking && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTableBooking();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'নতুন টেবিল বুক' : 'Book Table'}</span>
                  </button>
                )}
              </div>

              {/* Reservations Summary Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <UtensilsCrossed className="w-3 h-3 text-amber-600" />
                    {lang === 'bn' ? 'মোট বুকিং' : 'Total Bookings'}
                  </span>
                  <p className="text-sm font-black font-serif text-stone-900">
                    {reservations.length} {lang === 'bn' ? 'টি' : 'tables'}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {lang === 'bn' ? 'নিশ্চিত আসন' : 'Confirmed'}
                  </span>
                  <p className="text-sm font-black font-serif text-emerald-700">
                    {reservations.filter((r) => r.status === 'confirmed').length} {lang === 'bn' ? 'টি' : 'active'}
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs space-y-0.5">
                  <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-600" />
                    {lang === 'bn' ? 'মোট অতিথি' : 'Total Guests'}
                  </span>
                  <p className="text-sm font-black font-mono text-stone-900">
                    {reservations.reduce((acc, r) => acc + (r.status !== 'cancelled' ? r.guestCount : 0), 0)} {lang === 'bn' ? 'জন' : 'guests'}
                  </p>
                </div>
              </div>

              {/* Reservations List */}
              {reservations.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-3xl border border-stone-200/80 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                    <UtensilsCrossed className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-stone-900 font-serif">
                      {lang === 'bn' ? 'আপনার কোনো সক্রিয় টেবিল বুকিং নেই' : 'No Table Reservations Found'}
                    </h5>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      {lang === 'bn'
                        ? 'রেলওয়ে প্ল্যাটফর্ম ভিউ বা ফ্যামিলি এসি কেবিনে পরিবার ও বন্ধুদের নিয়ে সুস্বাদু খাবারের জন্য আগে থেকেই আসন নিশ্চিত করুন।'
                        : 'Book your table in advance for platform views or private family cabins.'}
                    </p>
                  </div>
                  {onOpenTableBooking && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTableBooking();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'এখনই টেবিল বুক করুন (ফ্রি)' : 'Reserve a Table Now'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((res) => {
                    const isConfirmed = res.status === 'confirmed';
                    const isPending = res.status === 'pending';
                    const isCancelled = res.status === 'cancelled';

                    const tableTypeLabel =
                      res.tableType === 'train_view'
                        ? (lang === 'bn' ? '🚂 ট্রেন ও প্ল্যাটফর্ম ভিউ' : '🚂 Station Train View')
                        : res.tableType === 'vip_ac'
                        ? (lang === 'bn' ? '❄️ ভিআইপি এসি কেবিন' : '❄️ VIP AC Cabin')
                        : res.tableType === 'family_cabin'
                        ? (lang === 'bn' ? '👨‍👩‍👧‍👦 ফ্যামিলি কেবিন' : '👨‍👩‍👧‍👦 Family Cabin')
                        : res.tableType === 'rooftop'
                        ? (lang === 'bn' ? '🌿 রুফটপ ভিউ' : '🌿 Rooftop Garden')
                        : (lang === 'bn' ? '🍽️ মেইন ডাইনিং হল' : '🍽️ Main Hall');

                    return (
                      <div
                        key={res.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCancelled
                            ? 'bg-stone-50 border-stone-200 opacity-60'
                            : 'bg-white border-amber-200 shadow-xs hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black font-serif text-stone-900">
                                {tableTypeLabel}
                              </span>
                              <span className="px-2 py-0.2 rounded-md bg-stone-100 text-[10px] font-mono font-bold text-stone-700">
                                {res.id}
                              </span>
                            </div>
                            <p className="text-[11px] font-medium text-amber-800">
                              {res.tableNumber || (lang === 'bn' ? 'টেবিল নং নির্ধারিত হচ্ছে' : 'Assigning table')}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              isConfirmed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isPending
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-stone-200 text-stone-700'
                            }`}
                          >
                            {isConfirmed ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{lang === 'bn' ? 'কনফার্মড' : 'Confirmed'}</span>
                              </>
                            ) : isPending ? (
                              <>
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{lang === 'bn' ? 'যাচাই চলছে' : 'Pending'}</span>
                              </>
                            ) : (
                              <span>{lang === 'bn' ? 'বাতিলকৃত' : 'Cancelled'}</span>
                            )}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2.5 text-xs text-stone-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <div>
                              <span className="text-[9px] text-stone-400 block">{lang === 'bn' ? 'তারিখ' : 'Date'}</span>
                              <span className="font-bold text-stone-800">{res.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <div>
                              <span className="text-[9px] text-stone-400 block">{lang === 'bn' ? 'সময়' : 'Time'}</span>
                              <span className="font-bold text-stone-800">{res.timeSlot}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <div>
                              <span className="text-[9px] text-stone-400 block">{lang === 'bn' ? 'সিট / অতিথি' : 'Seats'}</span>
                              <span className="font-bold text-stone-800">{res.guestCount} {lang === 'bn' ? 'জন' : 'Guests'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        {res.specialRequests && (
                          <div className="p-2 bg-amber-50/60 rounded-xl border border-amber-100 text-[11px] text-stone-700 mb-2.5">
                            <span className="font-bold text-amber-950 block text-[10px]">
                              {lang === 'bn' ? 'বিশেষ অনুরোধ:' : 'Special Request:'}
                            </span>
                            <p className="italic">"{res.specialRequests}"</p>
                          </div>
                        )}

                        {/* Card Footer Actions */}
                        {!isCancelled && (
                          <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-2">
                            {/* WhatsApp Helper */}
                            <button
                              type="button"
                              onClick={() => {
                                const msg = `*হোটেল আল শেখ ফরিদ - টেবিল বুকিং নিশ্চিতকরণ*\nরিজার্ভেশন আইডি: ${res.id}\nগ্রাহক: ${res.customerName}\nতারিখ: ${res.date}\nসময়: ${res.timeSlot}\nটেবিল: ${tableTypeLabel}\nঅতিথি: ${res.guestCount} জন`;
                                window.open(`https://wa.me/8801775339836?text=${encodeURIComponent(msg)}`, '_blank');
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3 text-emerald-600" />
                              <span>{lang === 'bn' ? 'ম্যানেজারকে হোয়াটসঅ্যাপ' : 'WhatsApp Manager'}</span>
                            </button>

                            {/* Cancel Reservation */}
                            {onCancelReservation && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(lang === 'bn' ? 'আপনি কি সত্যিই এই টেবিল রিজার্ভেশনটি বাতিল করতে চান?' : 'Are you sure you want to cancel this reservation?')) {
                                    onCancelReservation(res.id);
                                  }
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{lang === 'bn' ? 'বাতিল' : 'Cancel'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <span>হোটেল আল শেখ ফরিদ ডিজিটাল মেম্বারশিপ</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
