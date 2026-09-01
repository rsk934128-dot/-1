import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Store, 
  DollarSign, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Flame, 
  Edit3, 
  Plus, 
  Check, 
  Phone, 
  AlertCircle,
  Mail,
  Video,
  MessageSquare,
  Users,
  Radio,
  Wifi,
  Sparkles,
  UserCheck,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Layers,
  ArrowUpRight,
  CreditCard,
  UtensilsCrossed,
  Package,
  Printer,
  FileSpreadsheet,
  Download,
  Bell,
  Volume2,
  VolumeX,
  Volume1,
  Crown,
  Globe,
  Key,
  Laptop,
  X,
  ChefHat,
  Timer,
  CheckSquare,
  Square,
  CheckCheck,
  Zap,
  BellRing
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { FoodItem, Order, OrderStatus, SUPER_ADMIN_EMAILS } from '../types';
import { HOTEL_INFO } from '../data/initialData';
import { INITIAL_SAAS_TENANTS, SaaSTenant, SAAS_PLANS, SaaSOrderRequest } from '../data/saasPlans';
import { openDirectCustomWhatsApp } from '../utils/whatsappHelper';
import { CategoryOrderDistributionD3Chart } from './CategoryOrderDistributionD3Chart';
import { RevenueTrendsChart } from './RevenueTrendsChart';
import { printOrderReceipt } from '../utils/printReceiptHelper';
import { PrintableOrderReceipt } from './PrintableOrderReceipt';
import { exportWeeklySummaryCsv } from '../utils/csvExporter';
import { SoundNotificationService } from '../services/soundNotificationService';

interface AdminDashboardProps {
  orders: Order[];
  foodItems: FoodItem[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateFoodPrice: (foodId: string, newPrice: number) => void;
  onToggleFoodStock: (foodId: string) => void;
  onEmailInvoice?: (order: Order) => void;
  onOpenBkashSms?: (order?: Order) => void;
  onStartCallWithCustomer?: (customerName: string, customerPhone: string, type: 'audio' | 'video') => void;
  onOpenChat?: () => void;
  currentAdminEmail?: string;
  onSelectAdminEmail?: (email: string) => void;
  onCloseAdmin: () => void;
  isStaffMode?: boolean;
  onToggleStaffMode?: () => void;
  lang: 'bn' | 'en';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  foodItems,
  onUpdateOrderStatus,
  onUpdateFoodPrice,
  onToggleFoodStock,
  onEmailInvoice,
  onOpenBkashSms,
  onStartCallWithCustomer,
  onOpenChat,
  currentAdminEmail = 'fs2217732@gmail.com',
  onSelectAdminEmail,
  onCloseAdmin,
  isStaffMode = false,
  onToggleStaffMode,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'webrtc' | 'menu' | 'stats' | 'saas'>('orders');
  const [chartView, setChartView] = useState<'revenue_trends' | 'weekly' | 'category_stock' | 'hourly' | 'payment'>('revenue_trends');
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(SoundNotificationService.isMuted());
  const [soundVolume, setSoundVolume] = useState<number>(SoundNotificationService.getVolume());
  const [lastTestedSound, setLastTestedSound] = useState<string | null>(null);

  // Kitchen Staff Mode State (Item Checklists, Urgent Flags, Flash Cooked Confirmation, Order Filter)
  const [checkedKitchenItems, setCheckedKitchenItems] = useState<Record<string, boolean>>({});
  const [urgentOrderIds, setUrgentOrderIds] = useState<Record<string, boolean>>({});
  const [lastCookedOrderId, setLastCookedOrderId] = useState<string | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending_cooking' | 'cooked'>('all');

  // Calculate elapsed minutes since order creation
  const getElapsedPrepMinutes = (createdAt: string): number => {
    try {
      const createdTime = new Date(createdAt).getTime();
      if (isNaN(createdTime)) return 0;
      const diffMs = Date.now() - createdTime;
      return Math.max(0, Math.floor(diffMs / 60000));
    } catch {
      return 0;
    }
  };

  // Format timer in Bengali or English
  const formatCookingTimer = (minutes: number, currentLang: 'bn' | 'en') => {
    if (currentLang === 'bn') {
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      const bnStr = String(minutes).split('').map(d => bnDigits[parseInt(d, 10)] || d).join('');
      return `${bnStr} মিনিট`;
    }
    return `${minutes} min`;
  };

  // Toggle individual item in kitchen prep checklist
  const handleToggleKitchenItemCheck = (orderId: string, itemIdx: number) => {
    const key = `${orderId}-${itemIdx}`;
    setCheckedKitchenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle urgent priority flag on order card
  const handleToggleUrgentPriority = (orderId: string) => {
    setUrgentOrderIds(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Quick Mark as Cooked Handler
  const handleQuickMarkCooked = (ord: Order) => {
    SoundNotificationService.playKitchenBell();
    setLastCookedOrderId(ord.id);
    setTimeout(() => setLastCookedOrderId(null), 4000);

    // Check off all item boxes for this order
    const updated = { ...checkedKitchenItems };
    ord.items.forEach((_, idx) => {
      updated[`${ord.id}-${idx}`] = true;
    });
    setCheckedKitchenItems(updated);

    // Update order status
    const targetStatus: OrderStatus = ord.status === 'on_the_way' || ord.orderType === 'dine_in' ? 'completed' : 'on_the_way';
    onUpdateOrderStatus(ord.id, targetStatus);
  };

  // Alert Server/Waiter Call Chime
  const handleCallWaiterAlert = (ord: Order) => {
    SoundNotificationService.playKitchenBell();
    setLastTestedSound(`ওয়েটার অ্যালার্ট: ${ord.id}`);
    setTimeout(() => setLastTestedSound(null), 2500);
  };

  // SaaS Tenants & Leads State
  const [saasTenants, setSaasTenants] = useState<SaaSTenant[]>(() => {
    try {
      const saved = localStorage.getItem('hotel_saas_tenants_admin');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SAAS_TENANTS;
  });

  const [leadRequests, setLeadRequests] = useState<SaaSOrderRequest[]>(() => {
    try {
      const saved = localStorage.getItem('hotel_saas_lead_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [newTenantForm, setNewTenantForm] = useState({
    restaurantName: '',
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    planId: 'pro' as 'starter' | 'pro' | 'enterprise',
    billingCycle: 'yearly' as 'monthly' | 'quarterly' | 'yearly' | 'lifetime',
    domainUrl: '',
    brandColor: '#d97706'
  });
  const [showAddTenantModal, setShowAddTenantModal] = useState<boolean>(false);

  const handleAddNewTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantForm.restaurantName || !newTenantForm.ownerName || !newTenantForm.phone) {
      alert(lang === 'bn' ? 'অনুগ্রহ করে আবশ্যকীয় তথ্য পূরণ করুন' : 'Please fill required fields');
      return;
    }

    const randomId = `ALSK-${newTenantForm.planId.toUpperCase().slice(0, 3)}-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTenant: SaaSTenant = {
      id: `tenant-${Date.now()}`,
      restaurantName: newTenantForm.restaurantName,
      ownerName: newTenantForm.ownerName,
      phone: newTenantForm.phone,
      email: newTenantForm.email,
      location: newTenantForm.location || 'বাংলাদেশ',
      planId: newTenantForm.planId,
      status: 'active',
      billingCycle: newTenantForm.billingCycle,
      licenseKey: randomId,
      domainUrl: newTenantForm.domainUrl || `https://${newTenantForm.restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ordernow.live`,
      totalOrdersProcessed: 0,
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      brandColor: newTenantForm.brandColor
    };

    const updated = [newTenant, ...saasTenants];
    setSaasTenants(updated);
    try {
      localStorage.setItem('hotel_saas_tenants_admin', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    setShowAddTenantModal(false);
    setNewTenantForm({
      restaurantName: '',
      ownerName: '',
      phone: '',
      email: '',
      location: '',
      planId: 'pro',
      billingCycle: 'yearly',
      domainUrl: '',
      brandColor: '#d97706'
    });
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    const updated = saasTenants.map(t => {
      if (t.id === tenantId) {
        const nextStatus: 'active' | 'trial' | 'pending' | 'expired' = 
          t.status === 'active' ? 'expired' : 'active';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setSaasTenants(updated);
    try {
      localStorage.setItem('hotel_saas_tenants_admin', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    const unsub = SoundNotificationService.subscribe(({ volume, muted }) => {
      setSoundVolume(volume);
      setSoundMuted(muted);
    });
    return unsub;
  }, []);

  const handleTestBell = () => {
    SoundNotificationService.testSound('new_order');
    setLastTestedSound('order');
    setTimeout(() => setLastTestedSound(null), 1200);
  };

  const handleTestBkashSound = () => {
    SoundNotificationService.testSound('bkash_verified');
    setLastTestedSound('bkash');
    setTimeout(() => setLastTestedSound(null), 1200);
  };

  const handleToggleMute = () => {
    const newMuted = SoundNotificationService.toggleMute();
    setSoundMuted(newMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    SoundNotificationService.setVolume(newVol);
    setSoundVolume(newVol);
  };

  const handlePrintOrder = (order: Order) => {
    setActivePrintOrder(order);
    printOrderReceipt(order, lang);
  };

  const totalRevenue = useMemo(() => orders.reduce((sum, ord) => sum + ord.total, 0), [orders]);
  const cookingOrdersCount = orders.filter((o) => o.status === 'cooking' || o.status === 'pending').length;
  const completedOrdersCount = orders.filter((o) => o.status === 'completed').length;
  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // 7-day trend data combining historical baseline with today's live orders
  const weeklyTrendData = useMemo(() => {
    const todayOrdersCount = orders.length;
    const todayRev = totalRevenue;

    return [
      { dayBn: 'শনিবার', dayEn: 'Sat', orders: 18, revenue: 1650, bkash: 950, cash: 700 },
      { dayBn: 'রবিবার', dayEn: 'Sun', orders: 24, revenue: 2320, bkash: 1400, cash: 920 },
      { dayBn: 'সোমবার', dayEn: 'Mon', orders: 20, revenue: 1980, bkash: 1100, cash: 880 },
      { dayBn: 'মঙ্গলবার', dayEn: 'Tue', orders: 27, revenue: 2640, bkash: 1650, cash: 990 },
      { dayBn: 'বুধবার', dayEn: 'Wed', orders: 22, revenue: 2150, bkash: 1300, cash: 850 },
      { dayBn: 'বৃহস্পতিবার', dayEn: 'Thu', orders: 31, revenue: 3100, bkash: 1900, cash: 1200 },
      { 
        dayBn: 'আজ (লাইভ)', 
        dayEn: 'Today (Live)', 
        orders: Math.max(todayOrdersCount, 15), 
        revenue: Math.max(todayRev, 1450) + todayRev, 
        bkash: Math.round((Math.max(todayRev, 1450) + todayRev) * 0.65), 
        cash: Math.round((Math.max(todayRev, 1450) + todayRev) * 0.35),
        isToday: true
      },
    ];
  }, [orders, totalRevenue]);

  const handleExportCsv = () => {
    setIsExportingCsv(true);
    try {
      exportWeeklySummaryCsv(orders, weeklyTrendData, foodItems, currentAdminEmail, lang);
    } catch (e) {
      console.error('Failed to export CSV summary:', e);
    } finally {
      setTimeout(() => setIsExportingCsv(false), 600);
    }
  };

  // Hourly station rush trend data
  const hourlyRushData = useMemo(() => {
    return [
      { hour: '৬ AM', hourEn: '6 AM', rush: 'ভোরের ট্রেন', orders: 4, revenue: 280, topItem: 'পরোটা ও ডাল' },
      { hour: '৮ AM', hourEn: '8 AM', rush: 'সকালের ট্রেনের চাপ', orders: 12, revenue: 1140, topItem: 'স্পেশাল খিচুড়ি' },
      { hour: '১০ AM', hourEn: '10 AM', rush: 'জিলাপি ভাজা শুরু', orders: 8, revenue: 760, topItem: 'গরম জিলাপি' },
      { hour: '১২ PM', hourEn: '12 PM', rush: 'দুপুরের প্রস্তুতি', orders: 9, revenue: 890, topItem: 'ভাত ও ডাল' },
      { hour: '২ PM', hourEn: '2 PM', rush: 'দুপুরের ট্রেন ভিড়', orders: 19, revenue: 2450, topItem: 'কষা গরুর মাংস' },
      { hour: '৪ PM', hourEn: '4 PM', rush: 'বিকেলের নাশতা', orders: 7, revenue: 580, topItem: 'মুগলাই ও চা' },
      { hour: '৬ PM', hourEn: '6 PM', rush: 'সন্ধ্যার জিলাপি ধামাকা', orders: 16, revenue: 1840, topItem: 'গরম জিলাপি' },
      { hour: '৮ PM', hourEn: '8 PM', rush: 'রাতের ট্রেন যাত্রী', orders: 18, revenue: 2260, topItem: 'স্পেশাল খিচুড়ি' },
      { hour: '১০ PM', hourEn: '10 PM', rush: 'শেষ ট্রেন ক্লিয়ারেন্স', orders: 6, revenue: 620, topItem: 'ডিম ভুনা' },
    ];
  }, []);

  // Payment Breakdown
  const paymentBreakdownData = useMemo(() => {
    const bkashSum = orders.filter(o => o.paymentMethod === 'bkash').reduce((s, o) => s + o.total, 0);
    const cashSum = orders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
    const nagadSum = orders.filter(o => o.paymentMethod === 'nagad').reduce((s, o) => s + o.total, 0);

    const effectiveBkash = bkashSum || 1850;
    const effectiveCash = cashSum || 1200;
    const effectiveNagad = nagadSum || 450;

    return [
      { nameBn: 'বিকাশ (bKash)', nameEn: 'bKash', value: effectiveBkash, color: '#e11d48' },
      { nameBn: 'ক্যাশ কাউন্টার (Cash)', nameEn: 'Cash', value: effectiveCash, color: '#10b981' },
      { nameBn: 'নগদ / ডিজিটাল (Nagad)', nameEn: 'Nagad', value: effectiveNagad, color: '#f97316' },
    ];
  }, [orders]);

  // Top selling items
  const topSellingItemsData = useMemo(() => {
    return [
      { name: 'গরম জিলাপি', nameEn: 'Hot Jilapi', orders: 42, revenue: 3800 },
      { name: 'স্পেশাল খিচুড়ি', nameEn: 'Bhuna Khichuri', orders: 36, revenue: 1080 },
      { name: 'কষা গরুর মাংস', nameEn: 'Beef Curry', orders: 28, revenue: 2240 },
      { name: 'ডিম ভুনা', nameEn: 'Egg Curry', orders: 22, revenue: 440 },
      { name: 'সাদা ভাত ও ডাল', nameEn: 'Rice & Dal', orders: 19, revenue: 570 },
    ];
  }, []);

  const handleStartEdit = (food: FoodItem) => {
    setEditingFoodId(food.id);
    setEditPriceVal(food.price);
  };

  const handleSaveEdit = (foodId: string) => {
    onUpdateFoodPrice(foodId, editPriceVal);
    setEditingFoodId(null);
  };

  // Custom Chart Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-950/95 border border-amber-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-1">
          <p className="font-bold text-amber-200 font-serif border-b border-stone-800 pb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.stroke || entry.fill }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-black text-white">
                {entry.dataKey === 'revenue' || entry.dataKey === 'bkash' || entry.dataKey === 'cash' || entry.name.includes('আয়') || entry.name.includes('Revenue')
                  ? `৳ ${entry.value.toLocaleString()}`
                  : `${entry.value} টি`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-stone-900 text-stone-100 rounded-3xl mx-4 sm:mx-6 lg:mx-8 my-6 p-6 sm:p-8 shadow-2xl border border-amber-500/30">
      
      {/* Top Super Admin Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 font-black flex items-center justify-center text-xl shadow-lg">
            <ShieldCheck className="w-6 h-6 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-amber-50">
                {lang === 'bn' ? 'সুপার এডমিন ও ম্যানেজমেন্ট কন্ট্রোল প্যানেল' : 'Super Admin & Management Panel'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-stone-950 shadow-xs">
                SUPER ADMIN
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5 flex-wrap">
              <span>{HOTEL_INFO.nameBn} • স্টেশন রোড</span>
              <span className="text-amber-400 font-mono">
                কর্তৃত্ব: {currentAdminEmail}
              </span>
            </div>
          </div>
        </div>

        {/* Super Admin Switcher & Header Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Admin Email Selector */}
          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 text-xs">
            <span className="text-[10px] text-stone-400 px-1 font-semibold">এডমিন:</span>
            {SUPER_ADMIN_EMAILS.map((email) => (
              <button
                key={email}
                type="button"
                onClick={() => onSelectAdminEmail && onSelectAdminEmail(email)}
                className={`px-2 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  currentAdminEmail.toLowerCase() === email.toLowerCase()
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {email.split('@')[0]}
              </button>
            ))}
          </div>

          {/* bKash SMS Inbox Button */}
          {onOpenBkashSms && (
            <button
              onClick={() => onOpenBkashSms()}
              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs border border-pink-400 cursor-pointer"
              title="বিকাশ এসএমএস লেটার ও পেমেন্ট ভেরিফিকেশন"
            >
              <div className="w-4 h-4 rounded bg-white text-pink-700 text-[10px] font-black flex items-center justify-center">
                bK
              </div>
              <span>{lang === 'bn' ? 'বিকাশ SMS ভেরিফাই' : 'bKash SMS'}</span>
            </button>
          )}

          {/* Export Weekly CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={isExportingCsv}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs border border-emerald-400 cursor-pointer transition-all disabled:opacity-50"
            title="চলতি সপ্তাহের অর্ডার ও মোট আয়ের হিসাব CSV (Excel) ফাইলে ডাউনলোড করুন"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>
              {isExportingCsv 
                ? (lang === 'bn' ? 'এক্সপোর্ট হচ্ছে...' : 'Exporting...') 
                : (lang === 'bn' ? 'সাপ্তাহিক CSV' : 'Export CSV')}
            </span>
            <Download className="w-3 h-3 text-emerald-200" />
          </button>

          {/* Tab Navigation */}
          <div className="bg-stone-800 p-1 rounded-xl flex gap-1 border border-stone-700 flex-wrap">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'orders' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              {lang === 'bn' ? `লাইভ অর্ডার (${orders.length})` : `Live Orders (${orders.length})`}
            </button>

            <button
              onClick={() => setActiveTab('webrtc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'webrtc' ? 'bg-emerald-500 text-stone-950 shadow-xs font-black' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'WebRTC কল ও মেসেজ' : 'WebRTC Calls'}</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'menu' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'মেনু ও দাম' : 'Menu & Prices'}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stats' ? 'bg-amber-500 text-stone-950 shadow-xs' : 'text-stone-300 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'বিক্রি ও হিসাব' : 'Sales Stats'}
            </button>

            <button
              onClick={() => setActiveTab('saas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'saas' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 shadow-xs font-black' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>{lang === 'bn' ? `SaaS টেন্যান্ট ও লাইসেন্স (${saasTenants.length})` : `SaaS Tenants (${saasTenants.length})`}</span>
            </button>
          </div>

          <button
            onClick={onCloseAdmin}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold border border-stone-700 cursor-pointer"
          >
            {lang === 'bn' ? 'গ্রাহক ভিউতে ফিরে যান' : 'Exit Admin View'}
          </button>
        </div>
      </div>

      {/* Kitchen Sound & Service Bell Audio Notification Center */}
      <div className="mt-4 p-3.5 rounded-2xl bg-stone-950 border border-amber-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            soundMuted ? 'bg-stone-800 text-stone-500' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Bell className={`w-4 h-4 ${lastTestedSound ? 'animate-bounce text-amber-300' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-100 font-serif">
                {lang === 'bn' ? '🔔 কিচেন সাউন্ড নোটিফিকেশন সিস্টেম' : '🔔 Kitchen Sound Notification Service'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                soundMuted ? 'bg-red-950 text-red-300 border border-red-800/60' : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
              }`}>
                {soundMuted 
                  ? (lang === 'bn' ? 'মিউট করা' : 'Muted') 
                  : (lang === 'bn' ? 'সাউন্ড সক্রিয় (লাইভ)' : 'Sound Active (Live)')}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {lang === 'bn' 
                ? 'নতুন অর্ডার আসা বা বিকাশ ভেরিফিকেশন সফল হলে রান্নাঘরের জন্য স্পষ্ট বেল বাজবে।' 
                : 'Plays loud & clear brass bells for new orders & bKash SMS verification in busy kitchens.'}
            </p>
          </div>
        </div>

        {/* Action Controls: Test Sound & Volume Adjust */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bell Test Button */}
          <button
            type="button"
            onClick={handleTestBell}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs border cursor-pointer transition-all ${
              lastTestedSound === 'order'
                ? 'bg-amber-500 text-stone-950 border-amber-400 scale-105'
                : 'bg-stone-900 hover:bg-stone-800 text-amber-300 border-amber-500/40'
            }`}
            title="নতুন অর্ডারের কিচেন সার্ভিস বেল শুনুন (Ding-Ding)"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'bn' ? 'অর্ডার বেল টেস্ট' : 'Test Order Bell'}</span>
          </button>

          {/* bKash Verified Chime Test Button */}
          <button
            type="button"
            onClick={handleTestBkashSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs border cursor-pointer transition-all ${
              lastTestedSound === 'bkash'
                ? 'bg-pink-600 text-white border-pink-400 scale-105'
                : 'bg-stone-900 hover:bg-stone-800 text-pink-300 border-pink-500/40'
            }`}
            title="বিকাশ এসএমএস সফল ভেরিফিকেশন সাউন্ড শুনুন"
          >
            <div className="w-3.5 h-3.5 rounded bg-pink-600 text-white text-[8px] font-black flex items-center justify-center">
              bK
            </div>
            <span>{lang === 'bn' ? 'বিকাশ সাউন্ড টেস্ট' : 'Test bKash Sound'}</span>
          </button>

          {/* Volume Slider & Mute Toggle */}
          <div className="flex items-center gap-2 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-stone-300 hover:text-white transition-colors cursor-pointer p-0.5"
              title={soundMuted ? 'আনমিউট করুন' : 'মিউট করুন'}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : soundVolume > 0.5 ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <Volume1 className="w-4 h-4 text-amber-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundMuted ? 0 : soundVolume}
              onChange={(e) => {
                if (soundMuted) setSoundMuted(false);
                handleVolumeChange(parseFloat(e.target.value));
              }}
              className="w-16 accent-amber-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
              title={`সাউন্ড ভলিউম: ${Math.round((soundMuted ? 0 : soundVolume) * 100)}%`}
            />
            <span className="text-[10px] font-mono text-stone-400 min-w-[26px]">
              {soundMuted ? '0%' : `${Math.round(soundVolume * 100)}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 my-6">
        <div 
          onClick={() => { setActiveTab('stats'); setChartView('weekly'); }}
          className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-400 uppercase">{lang === 'bn' ? 'আজকের মোট বিক্রি' : 'Total Revenue'}</p>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">৳ {totalRevenue}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>লাইভ ট্রেন্ড চার্ট দেখুন</span>
          </span>
        </div>

        <div 
          onClick={() => { setActiveTab('stats'); setChartView('category_stock'); }}
          className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-emerald-400 uppercase">{lang === 'bn' ? 'স্টক পূর্বাভাস (D3)' : 'Stock Forecast'}</p>
            <Package className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">৫ ক্যাটাগরি</p>
          <span className="text-[10px] text-emerald-300 flex items-center gap-0.5 mt-1 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>D3.js বার চার্ট ও বাজার ফর্দ</span>
          </span>
        </div>

        <div 
          onClick={() => { setActiveTab('stats'); setChartView('weekly'); }}
          className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-400 uppercase">{lang === 'bn' ? 'চলমান অর্ডার' : 'Active Orders'}</p>
            <BarChart3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">{cookingOrdersCount}</p>
          <span className="text-[10px] text-stone-400 mt-1 block font-medium">
            মোট অর্ডার: {orders.length} টি
          </span>
        </div>

        <div 
          onClick={() => { setActiveTab('stats'); setChartView('payment'); }}
          className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-stone-400 uppercase">{lang === 'bn' ? 'সম্পন্ন ডেলিভারি' : 'Completed'}</p>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">{completedOrdersCount}</p>
          <span className="text-[10px] text-emerald-400/90 mt-1 block font-medium">
            গড় বিল: ৳{averageOrderValue}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800">
          <p className="text-[11px] font-bold text-stone-400 uppercase">{lang === 'bn' ? 'WebRTC চ্যানেল' : 'WebRTC Status'}</p>
          <p className="text-sm font-black text-emerald-400 mt-2 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>P2P লাইভ সক্রিয়</span>
          </p>
          <span className="text-[10px] text-stone-400 mt-1 block font-mono">
            DTLS-SRTP এনক্রিপ্ট
          </span>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Staff Mode Dedicated Kitchen Toolbar Banner */}
          {isStaffMode && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-950 to-orange-950/60 border-2 border-amber-500/60 shadow-xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-stone-950 shadow-md">
                    <ChefHat className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-amber-300 font-serif">
                        {lang === 'bn' ? '👨‍🍳 কিচেন ও স্টাফ ম্যানেজমেন্ট মোড সক্রিয়' : '👨‍🍳 Kitchen Staff & Chef Operations Mode'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-stone-950 uppercase animate-pulse">
                        LIVE
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5">
                      {lang === 'bn'
                        ? '১-ক্লিকে "ঝটপট রান্না প্রস্তুত" করুন, ডিশ চেকলিস্ট টিক দিন এবং রান্নার টাইমার ট্র্যাক করুন।'
                        : 'Quickly mark orders as cooked with 1 click, check off individual dishes, and track cooking prep timers.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onToggleStaffMode && (
                    <button
                      onClick={onToggleStaffMode}
                      className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold border border-stone-700 cursor-pointer transition-colors"
                    >
                      {lang === 'bn' ? 'স্টাফ মোড বন্ধ করুন' : 'Exit Staff Mode'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      SoundNotificationService.playKitchenBell();
                      setLastTestedSound('কিচেন বেল ড্রিং!');
                      setTimeout(() => setLastTestedSound(null), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-all active:scale-95"
                    title="কিচেন সার্ভিস বেল বাজান"
                  >
                    <BellRing className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? '🔔 টেস্ট কিচেন বেল' : '🔔 Test Kitchen Bell'}</span>
                  </button>
                </div>
              </div>

              {/* Kitchen Filters & Live Counts */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-amber-500/20">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-stone-400 mr-1">
                    {lang === 'bn' ? 'রান্নাঘর ফিল্টার:' : 'Filter:'}
                  </span>
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      orderFilter === 'all'
                        ? 'bg-amber-500 text-stone-950 font-black shadow-xs'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    {lang === 'bn' ? `সকল অর্ডার (${orders.length})` : `All (${orders.length})`}
                  </button>
                  <button
                    onClick={() => setOrderFilter('pending_cooking')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      orderFilter === 'pending_cooking'
                        ? 'bg-orange-500 text-white font-black shadow-xs'
                        : 'bg-stone-900 text-orange-400 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? `🍳 রান্না বাকি (${cookingOrdersCount})` : `🍳 Cooking Pending (${cookingOrdersCount})`}</span>
                  </button>
                  <button
                    onClick={() => setOrderFilter('cooked')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      orderFilter === 'cooked'
                        ? 'bg-emerald-600 text-white font-black shadow-xs'
                        : 'bg-stone-900 text-emerald-400 hover:bg-stone-800 border border-stone-800'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? `✅ প্রস্তুত / সম্পন্ন (${completedOrdersCount})` : `✅ Cooked / Ready (${completedOrdersCount})`}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-amber-300/90">
                  <span>⚡ কুইক মোড: সক্রিয়</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-stone-950 border border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-amber-200 font-serif">
                  {lang === 'bn' ? 'গ্রাহকদের লাইভ অর্ডার ও যোগাযোগ তালিকা' : 'Live Incoming Customer Orders & Contact'}
                </h3>
                {!isStaffMode && onToggleStaffMode && (
                  <button
                    onClick={onToggleStaffMode}
                    className="px-2.5 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                    title="কিচেন স্টাফ মোড চালু করুন"
                  >
                    <ChefHat className="w-3 h-3 text-amber-300" />
                    <span>{lang === 'bn' ? '👨‍🍳 স্টাফ মোড চালু করুন' : '👨‍🍳 Enable Staff Mode'}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {lang === 'bn' 
                  ? 'গ্রাহকদের সাথে WebRTC যোগাযোগ, রসিদ প্রিন্ট এবং অর্ডার প্রসেসিং।' 
                  : 'Customer live WebRTC communication, POS receipt printing and status tracking.'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold flex items-center gap-2 border border-emerald-500/40 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
              title="বর্তমান সকল অর্ডার ও আয় CSV ফাইলে এক্সপোর্ট করুন"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'সাপ্তাহিক লেজার CSV' : 'Export Orders CSV'}</span>
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {orders
              .filter(ord => {
                if (orderFilter === 'pending_cooking') {
                  return ord.status === 'cooking' || ord.status === 'pending';
                }
                if (orderFilter === 'cooked') {
                  return ord.status === 'on_the_way' || ord.status === 'completed';
                }
                return true;
              })
              .map((ord) => {
                const elapsedMins = getElapsedPrepMinutes(ord.createdAt);
                const isUrgent = !!urgentOrderIds[ord.id];
                const isRecentlyCooked = lastCookedOrderId === ord.id;

                return (
                  <div
                    key={ord.id}
                    className={`p-5 rounded-2xl bg-stone-950 transition-all space-y-3 ${
                      isUrgent
                        ? 'border-2 border-red-500/90 shadow-lg shadow-red-950/40 ring-1 ring-red-500'
                        : isRecentlyCooked
                        ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-950/40'
                        : 'border border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-sm font-black text-amber-400">{ord.id}</span>
                        <span className="text-xs text-stone-300 font-semibold">
                          {ord.customerName} ({ord.customerPhone})
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/60 text-amber-200 border border-amber-700/50">
                          {ord.orderType === 'dine_in' ? `টেবিল: ${ord.tableNumber}` : ord.orderType === 'parcel' ? 'পার্সেল' : 'ডেলিভারি'}
                        </span>

                        {/* Kitchen Prep Elapsed Live Timer */}
                        {isStaffMode && (
                          <div
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              elapsedMins >= 20
                                ? 'bg-red-950/80 text-red-300 border-red-500 animate-pulse'
                                : elapsedMins >= 10
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                            }`}
                            title="রান্নাঘরের অর্ডার ওয়েটিং সময়"
                          >
                            <Timer className="w-3 h-3" />
                            <span>{formatCookingTimer(elapsedMins, lang)}</span>
                            {elapsedMins >= 20 && <span className="text-[9px] text-red-400 font-black">🔥 জরুরি</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Kitchen Staff Quick Tools (Urgent Flag & Waiter Call) */}
                        {isStaffMode && (
                          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                            <button
                              onClick={() => handleToggleUrgentPriority(ord.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                isUrgent
                                  ? 'bg-red-600 text-white shadow-xs font-black'
                                  : 'bg-stone-800 hover:bg-red-950/50 text-stone-300 hover:text-red-300 border border-stone-700'
                              }`}
                              title="রান্নাঘরের জন্য জরুরি অগ্রাধিকার হিসেবে মার্ক করুন"
                            >
                              <Flame className={`w-3.5 h-3.5 ${isUrgent ? 'text-white fill-current' : 'text-red-400'}`} />
                              <span>{isUrgent ? (lang === 'bn' ? 'জরুরি' : 'Urgent') : (lang === 'bn' ? 'অগ্রাধিকার' : 'Priority')}</span>
                            </button>

                            <button
                              onClick={() => handleCallWaiterAlert(ord)}
                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                              title="ওয়েটার বা ফ্লোর বয়কে ডিশ পিকআপের জন্য ডাকুন"
                            >
                              <BellRing className="w-3.5 h-3.5 text-amber-300" />
                              <span className="hidden sm:inline">{lang === 'bn' ? 'ওয়েটার' : 'Waiter'}</span>
                            </button>
                          </div>
                        )}
                        
                        {/* WebRTC Direct Call Buttons to Customer */}
                        {onStartCallWithCustomer && (
                          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
                            <button
                              onClick={() => onStartCallWithCustomer(ord.customerName, ord.customerPhone, 'audio')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/40 cursor-pointer"
                              title="গ্রাহককে WebRTC অডিও কল দিন"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>কল</span>
                            </button>
                            <button
                              onClick={() => onStartCallWithCustomer(ord.customerName, ord.customerPhone, 'video')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-bold flex items-center gap-1 border border-blue-500/40 cursor-pointer"
                              title="গ্রাহককে WebRTC ভিডিও কল দিন"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>ভিডিও</span>
                            </button>
                          </div>
                        )}

                        {onOpenBkashSms && ord.paymentMethod === 'bkash' && (
                          <button
                            onClick={() => onOpenBkashSms(ord)}
                            className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-semibold flex items-center gap-1 border border-pink-500/40 cursor-pointer"
                            title="এই অর্ডারের বিকাশ এসএমএস লেটার দেখুন ও ভেরিফাই করুন"
                          >
                            <div className="w-3.5 h-3.5 rounded bg-pink-600 text-white text-[8px] font-black flex items-center justify-center">
                              bK
                            </div>
                            <span>{lang === 'bn' ? 'SMS ভেরিফাই' : 'SMS Verify'}</span>
                          </button>
                        )}

                        {onEmailInvoice && (
                          <button
                            onClick={() => onEmailInvoice(ord)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-amber-500/40 cursor-pointer"
                            title="Gmail দিয়ে ইনভয়েস পাঠান"
                          >
                            <Mail className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'bn' ? 'Gmail' : 'Gmail'}</span>
                          </button>
                        )}

                        {/* Print Receipt Button */}
                        <button
                          onClick={() => handlePrintOrder(ord)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1 border border-stone-700 cursor-pointer transition-colors shadow-2xs"
                          title="অর্ডার রসিদ / কিচেন টোকেন প্রিন্ট করুন"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-400" />
                          <span>{lang === 'bn' ? 'রসিদ' : 'Print'}</span>
                        </button>

                        <span className="text-sm font-black text-white">৳ {ord.total}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 uppercase">
                          {ord.paymentMethod} {ord.paymentStatus === 'verified' || ord.paymentStatus === 'paid' ? '✓ পেইড' : 'ক্যাশ বাকি'}
                        </span>
                      </div>
                    </div>

                    {/* Recently Cooked Notification Toast on Card */}
                    {isRecentlyCooked && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-stone-900 to-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-bold flex items-center justify-between gap-2 shadow-md animate-bounce">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            {lang === 'bn'
                              ? '✅ রান্না প্রস্তুত! খাবার পরিবেশন বা ডেলিভারির জন্য প্রস্তুত।'
                              : '✅ Dish Marked Cooked! Ready for table serving or rider handover.'}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-stone-950 font-black">
                          READY
                        </span>
                      </div>
                    )}

                    {/* Items & Kitchen Prep Checklist */}
                    <div className="text-xs text-stone-300 space-y-1.5">
                      {isStaffMode && (
                        <p className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">
                          {lang === 'bn' ? '👨‍🍳 ডিশ প্রিপারেশন চেকলিস্ট (ক্লিক করে প্রস্তুত মার্ক করুন):' : '👨‍🍳 Dish Prep Checklist (Click to check off):'}
                        </p>
                      )}
                      
                      {ord.items.map((it, idx) => {
                        const isItemChecked = !!checkedKitchenItems[`${ord.id}-${idx}`];
                        return (
                          <div
                            key={idx}
                            onClick={() => isStaffMode && handleToggleKitchenItemCheck(ord.id, idx)}
                            className={`flex items-center justify-between p-1.5 rounded-xl transition-all ${
                              isStaffMode ? 'cursor-pointer hover:bg-stone-900/90 active:scale-[0.99]' : ''
                            } ${
                              isItemChecked
                                ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40'
                                : 'bg-stone-900/40 border border-stone-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isStaffMode && (
                                <button
                                  type="button"
                                  className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                                  title="ডিশ প্রস্তুত হলে টিক দিন"
                                >
                                  {isItemChecked ? (
                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-500" />
                                  )}
                                </button>
                              )}
                              <span className={isItemChecked ? 'line-through text-stone-400 font-medium' : 'font-semibold text-stone-200'}>
                                • {it.food.nameBn} {it.selectedPortion ? `(${it.selectedPortion.labelBn})` : ''} x {it.quantity}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {isItemChecked && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/70 text-emerald-300 border border-emerald-600/40 font-bold">
                                  ✓ প্লেটে প্রস্তুত
                                </span>
                              )}
                              <span className="font-semibold text-stone-400">
                                ৳ {(it.selectedPortion ? it.selectedPortion.price : it.food.price) * it.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {ord.specialNote && (
                        <p className="text-[11px] text-amber-300 italic pt-1 flex items-center gap-1">
                          <span className="font-bold not-italic">বিশেষ নোট:</span> "{ord.specialNote}"
                        </p>
                      )}
                      {ord.deliveryAddress && (
                        <p className="text-[11px] text-stone-400">
                          ঠিকানা: {ord.deliveryAddress}
                        </p>
                      )}
                    </div>

                    {/* Status Action Buttons */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800/80">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-stone-400">বর্তমান স্ট্যাটাস:</span>
                        <span className={`font-bold capitalize px-2 py-0.5 rounded text-[11px] ${
                          ord.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                            : ord.status === 'on_the_way'
                            ? 'bg-blue-950 text-blue-300 border border-blue-700/50'
                            : ord.status === 'cooking'
                            ? 'bg-amber-950 text-amber-300 border border-amber-700/50'
                            : 'bg-stone-900 text-stone-300 border border-stone-700'
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      <div className="flex gap-1.5 flex-wrap items-center">
                        {/* Quick Mark as Cooked Button (Highlighted when Staff Mode is enabled) */}
                        {isStaffMode && (
                          <button
                            id={`quick-cooked-btn-${ord.id}`}
                            onClick={() => handleQuickMarkCooked(ord)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 ${
                              ord.status === 'on_the_way' || ord.status === 'completed'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50 shadow-emerald-950/50'
                                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 ring-2 ring-amber-300 animate-pulse'
                            }`}
                            title="১ ক্লিকে রান্না সম্পন্ন মার্ক করুন এবং কিচেন বেল বাজান"
                          >
                            <ChefHat className="w-4 h-4 text-stone-950" />
                            <Zap className="w-3.5 h-3.5 text-stone-950" />
                            <span>
                              {ord.status === 'completed' || ord.status === 'on_the_way'
                                ? (lang === 'bn' ? '✓ রান্না প্রস্তুত' : '✓ Cooked & Ready')
                                : (lang === 'bn' ? '⚡ ঝটপট রান্না প্রস্তুত' : '⚡ Quick Mark as Cooked')}
                            </span>
                          </button>
                        )}

                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'cooking')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            ord.status === 'cooking'
                              ? 'bg-amber-500 text-stone-950 font-black'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5" />
                          <span>রান্না হচ্ছে</span>
                        </button>

                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'on_the_way')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            ord.status === 'on_the_way'
                              ? 'bg-blue-500 text-white font-black'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>ডেলিভারির পথে</span>
                        </button>

                        <button
                          onClick={() => onUpdateOrderStatus(ord.id, 'completed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            ord.status === 'completed'
                              ? 'bg-emerald-600 text-white font-black ring-2 ring-emerald-400/40 shadow-xs'
                              : 'bg-stone-800 hover:bg-emerald-950/70 hover:text-emerald-300 text-stone-200 border border-stone-700'
                          }`}
                          title="ডেলিভারি সম্পন্ন ও গ্রাহককে পুশ নোটিফিকেশন অ্যালার্ট পাঠান"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{lang === 'bn' ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* WebRTC Live Communication Center Tab */}
      {activeTab === 'webrtc' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-emerald-950/30 to-stone-950 border border-emerald-500/30">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-lg font-bold text-emerald-200 font-serif">
                  {lang === 'bn' ? 'WebRTC লাইভ কল সেন্টার ও মেসেজিং হাব' : 'WebRTC Live Communication Hub'}
                </h3>
              </div>
              <p className="text-xs text-stone-300 mt-1 max-w-xl">
                সকল ইউজার/কাস্টমার অ্যাডমিনের সাথে WebRTC-র মাধ্যমে সরাসরি অডিও কল, ফুল-এইচডি ভিডিও কল এবং রিয়েল-টাইম চ্যাট করতে পারে। অ্যাডমিন ড্যাশবোর্ড থেকে গ্রাহকদের সাথে সরাসরি লাইভ সংযোগ করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onOpenChat && (
                <button
                  onClick={onOpenChat}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'লাইভ চ্যাট উইন্ডো খুলুন' : 'Open Live Chat'}</span>
                </button>
              )}
            </div>
          </div>

          {/* WebRTC P2P Direct Dialer to Customers */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'সরাসরি গ্রাহকদের WebRTC কল দিন' : 'Direct WebRTC Call to Customers'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-100 truncate">
                      {ord.customerName}
                    </p>
                    <p className="text-[11px] text-stone-400 font-mono">
                      ফোন: {ord.customerPhone}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-amber-400 font-mono font-bold">
                        অর্ডার: {ord.id}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        • বিল ৳{ord.total} ({ord.status})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onStartCallWithCustomer && (
                      <>
                        <button
                          onClick={() => onStartCallWithCustomer(ord.customerName, ord.customerPhone, 'audio')}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="WebRTC অডিও কল"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>অডিও কল</span>
                        </button>
                        <button
                          onClick={() => onStartCallWithCustomer(ord.customerName, ord.customerPhone, 'video')}
                          className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="WebRTC ভিডিও কল"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>ভিডিও কল</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WebRTC Infrastructure Status */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-2">
            <h5 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>WebRTC স্ট্যাটাস ও প্রোটোকল কনফিগারেশন</span>
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-300 text-[11px] font-mono">
              <div className="bg-stone-900 p-2 rounded-xl">
                <span className="text-stone-400 block">STUN সার্ভার</span>
                <span className="text-emerald-400 font-bold">Google STUN:19302</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl">
                <span className="text-stone-400 block">অডিও ফরম্যাট</span>
                <span className="text-amber-300 font-bold">Opus Fullband 48kHz</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl">
                <span className="text-stone-400 block">ভিডিও রেজোলিউশন</span>
                <span className="text-blue-300 font-bold">720p HD @30fps VP8</span>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl">
                <span className="text-stone-400 block">এনক্রিপশন</span>
                <span className="text-emerald-400 font-bold">DTLS-SRTP P2P Secure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-amber-200 font-serif">
            {lang === 'bn' ? 'খাবারের তালিকা, দাম ও স্টক পরিবর্তন' : 'Menu Management & Prices'}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {foodItems.map((food) => {
              const isEditing = editingFoodId === food.id;
              return (
                <div
                  key={food.id}
                  className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between gap-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={food.image}
                      alt={food.nameBn}
                      className="w-16 h-16 rounded-xl object-cover border border-stone-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-stone-100 truncate">{food.nameBn}</h4>
                      <p className="text-xs text-stone-400">{food.nameEn}</p>
                      
                      {isEditing ? (
                        <div className="flex items-center gap-1 mt-2">
                          <input
                            type="number"
                            value={editPriceVal}
                            onChange={(e) => setEditPriceVal(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded bg-stone-900 border border-amber-500 text-xs font-bold text-white font-mono"
                          />
                          <button
                            onClick={() => handleSaveEdit(food.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-base font-black text-amber-400">৳ {food.price}</span>
                          <span className="text-[11px] text-stone-400">/{food.unitBn}</span>
                          <button
                            onClick={() => handleStartEdit(food)}
                            className="p-1 text-stone-400 hover:text-amber-400 rounded cursor-pointer"
                            title="দাম পরিবর্তন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                    <span className={`text-[11px] font-bold ${food.inStock ? 'text-emerald-400' : 'text-red-400'}`}>
                      {food.inStock ? '● স্টকে আছে' : '○ স্টক শেষ'}
                    </span>
                    <button
                      onClick={() => onToggleFoodStock(food.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        food.inStock
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                      }`}
                    >
                      {food.inStock ? 'স্টক বন্ধ করুন' : 'স্টক চালু করুন'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sales Stats & Analytics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Header & Sub-Tab Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-stone-950 border border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-amber-200 font-serif">
                  {lang === 'bn' ? 'অ্যানালিটিক্স ড্যাশবোর্ড ও বিক্রয় ট্রেন্ড চার্ট' : 'Analytics Dashboard & Revenue Trends'}
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-1">
                {lang === 'bn' 
                  ? 'দৈনিক অর্ডার ভলিউম, মোট আয়, ট্রেনের পিক আওয়ার ও পেমেন্ট মেথডের লাইভ চার্ট অ্যানালাইসিস।' 
                  : 'Live visualization of daily order volume, total revenue trends, peak rush hours and payment distribution.'}
              </p>
            </div>

            {/* Chart View Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 bg-stone-900 p-1.5 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setChartView('revenue_trends')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartView === 'revenue_trends' 
                    ? 'bg-amber-500 text-stone-950 shadow-xs font-black' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'দৈনিক ও মাসিক আয় ট্রেন্ড (Recharts)' : 'Revenue Trends (Daily & Monthly)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChartView('weekly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartView === 'weekly' 
                    ? 'bg-amber-500 text-stone-950 shadow-xs font-black' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সাপ্তাহিক সামারি (৭ দিন)' : 'Weekly Summary'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChartView('category_stock')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartView === 'category_stock' 
                    ? 'bg-emerald-500 text-stone-950 shadow-xs font-black' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ক্যাটাগরি ও স্টক ফোরকাস্ট (D3.js)' : 'Category & Stock Forecast (D3.js)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChartView('hourly')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartView === 'hourly' 
                    ? 'bg-amber-500 text-stone-950 shadow-xs font-black' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ঘণ্টাভিত্তিক রাশ' : 'Hourly Rush'}</span>
              </button>

              <button
                type="button"
                onClick={() => setChartView('payment')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  chartView === 'payment' 
                    ? 'bg-amber-500 text-stone-950 shadow-xs font-black' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পেমেন্ট ও আইটেম' : 'Payment & Items'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase">{lang === 'bn' ? 'সর্বমোট আয়' : 'Total Revenue'}</span>
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">৳ {totalRevenue}</p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-medium">লাইভ অর্ডার থেকে আপডেটেড</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase">{lang === 'bn' ? 'মোট অর্ডার' : 'Order Volume'}</span>
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">{orders.length} টি</p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-medium">গড় বিল ৳{averageOrderValue}</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase">{lang === 'bn' ? 'ডিজিটাল বিকাশ' : 'bKash / Digital'}</span>
                <CreditCard className="w-3.5 h-3.5 text-pink-400" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-pink-400 mt-1">
                ৳ {orders.filter(o => o.paymentMethod !== 'cash').reduce((s, o) => s + o.total, 0)}
              </p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-medium">এসএমএস ভেরিফাইড পেমেন্ট</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-[11px] font-bold uppercase">{lang === 'bn' ? 'পিক ট্রেনের সময়' : 'Peak Rush Hour'}</span>
                <Flame className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-base sm:text-lg font-black text-orange-400 mt-1">২:০০ PM & ৮:০০ PM</p>
              <p className="text-[10px] text-stone-500 mt-0.5 font-medium">আন্তঃনগর ট্রেন শিডিউল রাশ</p>
            </div>
          </div>

          {/* MAIN RECHARTS COMPONENT: Daily & Monthly Revenue Trends from Completed Orders */}
          {chartView === 'revenue_trends' && (
            <RevenueTrendsChart
              orders={orders}
              lang={lang}
            />
          )}

          {/* MAIN CHART 1: 7-Day Daily Orders & Total Revenue Trends */}
          {chartView === 'weekly' && (
            <div className="space-y-4">
              {/* Weekly Bookkeeping Overview & CSV Action Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-emerald-950/20 to-stone-950 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-stone-950 uppercase tracking-wide">
                      হিসাব ও বুককিপিং
                    </span>
                    <h4 className="text-base font-bold text-emerald-200 font-serif">
                      {lang === 'bn' ? 'চলতি সপ্তাহের সার্বিক বিক্রি ও আয়ের সামারি' : 'Current Week Order & Revenue Summary'}
                    </h4>
                  </div>
                  <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                    {lang === 'bn'
                      ? 'ব্যবসায়িক বুককিপিং ও অডিটের জন্য চলতি ৭ দিনের দৈনিক আয়, বিকাশ ও ক্যাশ লেনদেন, কাস্টমার লেজার এবং মেনুর বর্তমান স্টক তালিকা এক ক্লিকে CSV (Excel/Sheets) ফাইলে এক্সপোর্ট করুন।'
                      : 'Export weekly day-wise revenue, bKash & cash receipts, live customer ledger and menu stock into standard CSV format for business bookkeeping.'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1 flex-wrap">
                    <span>• ৭ দিনের মোট আয়: <strong className="text-amber-400 font-mono">৳{weeklyTrendData.reduce((s, i) => s + i.revenue, 0).toLocaleString()}</strong></span>
                    <span>• মোট অর্ডার: <strong className="text-emerald-400 font-mono">{weeklyTrendData.reduce((s, i) => s + i.orders, 0)} টি</strong></span>
                    <span>• বিকাশ/ডিজিটাল: <strong className="text-pink-400 font-mono">৳{weeklyTrendData.reduce((s, i) => s + i.bkash, 0).toLocaleString()}</strong></span>
                    <span>• ক্যাশ কাউন্টার: <strong className="text-stone-200 font-mono">৳{weeklyTrendData.reduce((s, i) => s + i.cash, 0).toLocaleString()}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    disabled={isExportingCsv}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all border border-emerald-400 disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-white" />
                    <span>
                      {isExportingCsv 
                        ? (lang === 'bn' ? 'CSV তৈরি হচ্ছে...' : 'Generating CSV...') 
                        : (lang === 'bn' ? 'সাপ্তাহিক হিসাব CSV ডাউনলোড' : 'Download Weekly CSV')}
                    </span>
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>{lang === 'bn' ? 'দৈনিক অর্ডার ভলিউম ও সর্বমোট আয়ের ট্রেন্ড (Recharts)' : 'Daily Order Volume & Total Revenue Trends'}</span>
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">
                      বার (Bar) দিয়ে দৈনিক অর্ডার সংখ্যা এবং স্মুথ এরিয়া (Area) দিয়ে মোট রাজস্ব (৳) প্রদর্শিত হচ্ছে।
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                      <span>মোট আয় (৳ Revenue)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                      <span>অর্ডার সংখ্যা (Orders)</span>
                    </span>
                  </div>
                </div>

              {/* Recharts Composed Chart Container */}
              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={weeklyTrendData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="orderBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    
                    <XAxis 
                      dataKey={lang === 'bn' ? 'dayBn' : 'dayEn'} 
                      stroke="#78716c" 
                      tick={{ fill: '#a8a29e', fontSize: 11 }}
                      tickLine={false}
                    />
                    
                    {/* Left Y-Axis for Orders */}
                    <YAxis 
                      yAxisId="left" 
                      stroke="#78716c" 
                      tick={{ fill: '#10b981', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'auto']}
                    />

                    {/* Right Y-Axis for Revenue in BDT */}
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      stroke="#78716c" 
                      tick={{ fill: '#f59e0b', fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `৳${val}`}
                    />

                    <Tooltip content={<CustomChartTooltip />} />

                    {/* Order Count Bars */}
                    <Bar 
                      yAxisId="left" 
                      dataKey="orders" 
                      name={lang === 'bn' ? 'অর্ডার সংখ্যা' : 'Order Count'} 
                      fill="url(#orderBarGradient)" 
                      radius={[6, 6, 0, 0]} 
                      barSize={24}
                    />

                    {/* Revenue Area Curve */}
                    <Area 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="revenue" 
                      name={lang === 'bn' ? 'মোট আয় (৳)' : 'Revenue (৳)'} 
                      stroke="#f59e0b" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#revenueGradient)" 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Data Table / Notes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-800/80 text-xs">
                <div className="bg-stone-900 p-2.5 rounded-xl">
                  <span className="text-stone-400 block text-[11px]">৭ দিনের সর্বোচ্চ আয়</span>
                  <span className="text-amber-400 font-bold font-mono">৳ ৩,১০০ (বৃহস্পতিবার)</span>
                </div>
                <div className="bg-stone-900 p-2.5 rounded-xl">
                  <span className="text-stone-400 block text-[11px]">দৈনিক গড় অর্ডার</span>
                  <span className="text-emerald-400 font-bold font-mono">২৩ টি / দিন</span>
                </div>
                <div className="bg-stone-900 p-2.5 rounded-xl">
                  <span className="text-stone-400 block text-[11px]">বিকাশ ডিজিটাল শেয়ার</span>
                  <span className="text-pink-400 font-bold font-mono">৬২% শেয়ার</span>
                </div>
                <div className="bg-stone-900 p-2.5 rounded-xl">
                  <span className="text-stone-400 block text-[11px]">আজকের লাইভ প্রবৃদ্ধি</span>
                  <span className="text-emerald-400 font-bold font-mono">+১৪.৫% ট্রাফিক</span>
                </div>
              </div>
            </div>
          </div>
        )}

          {/* D3.js INTERACTIVE CATEGORY ORDER DISTRIBUTION & STOCK FORECASTING CHART */}
          {chartView === 'category_stock' && (
            <CategoryOrderDistributionD3Chart
              orders={orders}
              foodItems={foodItems}
              lang={lang}
            />
          )}

          {/* MAIN CHART 2: Hourly Station Train Rush & Order Spikes */}
          {chartView === 'hourly' && (
            <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span>{lang === 'bn' ? 'স্টেশনের ট্রেন অনুযায়ী ঘণ্টাভিত্তিক অর্ডার ও ভিড় চার্ট' : 'Hourly Station Train Rush & Order Spikes'}</span>
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    রেলওয়ে স্টেশনের ট্রেন পৌঁছানো ও ছাড়ার শিডিউল অনুযায়ী কোন সময়ে কত অর্ডার ও বিক্রি হয়।
                  </p>
                </div>
              </div>

              {/* Area Chart for Hourly Rush */}
              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={hourlyRushData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="hourlyRevGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                    <XAxis 
                      dataKey={lang === 'bn' ? 'hour' : 'hourEn'} 
                      stroke="#78716c" 
                      tick={{ fill: '#a8a29e', fontSize: 11 }}
                    />
                    <YAxis 
                      stroke="#78716c" 
                      tick={{ fill: '#f97316', fontSize: 11 }}
                      tickFormatter={(val) => `৳${val}`}
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name={lang === 'bn' ? 'ঘণ্টার আয় (৳)' : 'Hourly Revenue (৳)'} 
                      stroke="#ea580c" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#hourlyRevGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Hourly Peak Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-800/80">
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="text-[11px] text-amber-400 font-bold block">সকালের ট্রেন (৮ AM - ৯ AM)</span>
                  <p className="text-xs text-stone-300 mt-1">
                    স্পেশাল খিচুড়ি (৩০ ৳), ডিম ভুনা (২০ ৳) ও পরোটা-ভাজির সর্বোচ্চ অর্ডার।
                  </p>
                </div>
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="text-[11px] text-orange-400 font-bold block">দুপুর ও বিকেলের ট্রেন (২ PM - ৬ PM)</span>
                  <p className="text-xs text-stone-300 mt-1">
                    কষা গরুর মাংস (৮০ ৳) ও কড়াই থেকে নামানো গরম মচমচে জিলাপি (১৬০ ৳/কেজি)।
                  </p>
                </div>
                <div className="p-3 bg-stone-900 rounded-xl border border-stone-800">
                  <span className="text-[11px] text-emerald-400 font-bold block">রাতের শেষ এক্সপ্রেস (৮ PM - ১০ PM)</span>
                  <p className="text-xs text-stone-300 mt-1">
                    পার্সেল খিচুড়ি ও মাংস, দ্রুত প্যাকিং মাত্র ৩ মিনিটে প্ল্যাটফর্ম ডেলিভারি।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MAIN CHART 3: Payment Distribution & Top Food Analytics */}
          {chartView === 'payment' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Payment Pie Chart */}
              <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-pink-400" />
                  <span>{lang === 'bn' ? 'পেমেন্ট চ্যানেল বিশ্লেষণ (bKash vs Cash)' : 'Payment Method Share'}</span>
                </h4>
                <p className="text-xs text-stone-400">
                  বিকাশ এসএমএস স্বয়ংক্রিয় ভেরিফিকেশন ও ক্যাশ কাউন্টার সংগ্রহের রেশিও।
                </p>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        nameKey={lang === 'bn' ? 'nameBn' : 'nameEn'}
                      >
                        {paymentBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap items-center justify-around gap-2 text-xs pt-2 border-t border-stone-800">
                  {paymentBreakdownData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-stone-300">{lang === 'bn' ? item.nameBn : item.nameEn}:</span>
                      <span className="font-bold font-mono text-white">৳{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Selling Items Bar Chart */}
              <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
                <h4 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'bn' ? 'সর্বাধিক বিক্রীত খাবারের তালিকা' : 'Top Selling Food Items'}</span>
                </h4>
                <p className="text-xs text-stone-400">
                  হোটেলের সবচেয়ে জনপ্রিয় মেনু আইটেমসমূহের মোট বিক্রয় ও পরিমাণ।
                </p>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSellingItemsData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" horizontal={false} />
                      <XAxis type="number" stroke="#78716c" tick={{ fill: '#a8a29e', fontSize: 11 }} />
                      <YAxis 
                        type="category" 
                        dataKey={lang === 'bn' ? 'name' : 'nameEn'} 
                        stroke="#78716c" 
                        tick={{ fill: '#f59e0b', fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar 
                        dataKey="orders" 
                        name={lang === 'bn' ? 'অর্ডার সংখ্যা' : 'Orders'} 
                        fill="#f59e0b" 
                        radius={[0, 6, 6, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-xs text-stone-400 text-center pt-2 border-t border-stone-800">
                  গরম মচমচে জিলাপি (১৬০ ৳/কেজি) এবং স্পেশাল ভুনা খিচুড়ি (৩০ ৳) শীর্ষে রয়েছে।
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-400 flex flex-wrap items-center justify-between gap-2">
            <span>
              তথ্যসূত্র: হোটেল আল শেখ ফরিদ রিয়েল-টাইম POS ও WebRTC লাইভ অর্ডার ডাটাবেস।
            </span>
            <span className="font-mono text-amber-400">
              মালিক: মো: আব্দুল বারিক শেখ • {currentAdminEmail}
            </span>
          </div>
        </div>
      )}

      {/* TAB 5: SAAS TENANTS & COMMERCIAL LICENSES */}
      {activeTab === 'saas' && (
        <div className="space-y-6 animate-fade-in">
          {/* SaaS Header Summary */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-stone-950 via-emerald-950/70 to-stone-900 border border-emerald-500/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  SaaS Master License Controller
                </span>
                <span className="text-xs text-stone-400">
                  মোট অ্যাক্টিভ ক্লায়েন্ট: {saasTenants.filter(t => t.status === 'active').length} টি
                </span>
              </div>
              <h3 className="text-2xl font-black font-serif text-white mt-1">
                হোয়াইট-লেবেল রেস্তোরাঁ ক্লায়েন্ট ও সাবস্ক্রিপশন ব্যবস্থাপনা
              </h3>
              <p className="text-xs text-stone-300 max-w-2xl mt-1">
                এই প্ল্যাটফর্মটি অন্যান্য রেস্তোরাঁ ও হোটেলের কাছে SaaS সাবস্ক্রিপশন হিসেবে বিক্রি করুন। নতুন লাইসেন্স ইস্যু, ডোমেইন কনফিগারেশন ও ক্লায়েন্ট রিনিউয়াল কন্ট্রোল করুন।
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => setShowAddTenantModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-black text-xs flex items-center gap-2 hover:from-emerald-400 hover:to-teal-400 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ক্লায়েন্ট / টেন্যান্ট যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* Incoming Online Leads & Bookings Section */}
          {leadRequests.length > 0 && (
            <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>নতুন অনলাইন বুকিং রিকুয়েস্ট ({leadRequests.length} টি)</span>
                </h4>
                <span className="text-xs text-amber-300">ওয়েবসাইট থেকে আসা ক্রেতার আবেদন</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {leadRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-xl bg-stone-900 border border-amber-500/30 text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white text-sm">{req.restaurantName}</div>
                        <div className="text-stone-400">মালিক: {req.ownerName} • {req.district}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500 text-stone-950 font-black text-[10px]">
                        {req.planId.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between text-stone-300 font-mono text-[11px] pt-1 border-t border-stone-800">
                      <span>টাকা: ৳{req.priceBDT.toLocaleString()} ({req.paymentMethod.toUpperCase()})</span>
                      <span>Trx: {req.transactionId}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => openDirectCustomWhatsApp(req.phone, `আসসালামু আলাইকুম ${req.ownerName} সাহেব, আপনার ${req.restaurantName} রেস্তোরাঁর জন্য SaaS সফটওয়্যার বুকিং (${req.id}) গৃহিত হয়েছে।`)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Tenants List */}
          <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-400" />
                  <span>লাইভ সাবস্ক্রাইবার ও টেন্যান্ট তালিকা</span>
                </h4>
                <p className="text-xs text-stone-400">সিস্টেমে চালু থাকা রেস্তোরাঁ ও তাদের লাইসেন্স ভ্যালিডিটি।</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300 border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-3">রেস্তোরাঁ ও মালিক</th>
                    <th className="py-3 px-3">প্যাকেজ ও বিলিং</th>
                    <th className="py-3 px-3">লাইসেন্স কি (License Key)</th>
                    <th className="py-3 px-3">ডোমেইন / লিঙ্ক</th>
                    <th className="py-3 px-3">মোট অর্ডার</th>
                    <th className="py-3 px-3">স্ট্যাটাস</th>
                    <th className="py-3 px-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60 font-sans">
                  {saasTenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white text-sm">{tenant.restaurantName}</div>
                        <div className="text-stone-400 text-[11px]">
                          {tenant.ownerName} • <span className="font-mono text-amber-400">{tenant.phone}</span>
                        </div>
                        <div className="text-stone-500 text-[10px]">{tenant.location}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {tenant.planId}
                        </span>
                        <div className="text-[10px] text-stone-400 mt-1 capitalize">
                          সাইকেল: {tenant.billingCycle}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          মেয়াদ: {tenant.expiryDate}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-emerald-400">
                        <div className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 inline-block font-bold">
                          {tenant.licenseKey}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <a 
                          href={tenant.domainUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{tenant.domainUrl.replace('https://', '')}</span>
                        </a>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-white">
                        {tenant.totalOrdersProcessed.toLocaleString()} টি
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tenant.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : 'bg-red-500/20 text-red-300 border border-red-400/40'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openDirectCustomWhatsApp(tenant.phone, `আসসালামু আলাইকুম ${tenant.ownerName} সাহেব, আপনার ${tenant.restaurantName} এর জন্য সিস্টেম আপডেট সম্পন্ন হয়েছে।`)}
                            className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white transition-all"
                            title="হোয়াটসঅ্যাপ মেসেজ"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleTenantStatus(tenant.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              tenant.status === 'active'
                                ? 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700'
                                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700'
                            }`}
                          >
                            {tenant.status === 'active' ? 'সাসপেন্ড' : 'অ্যাক্টিভেট'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal for Adding New Tenant */}
          {showAddTenantModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
              <div className="bg-stone-900 border border-stone-700 text-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                  <h4 className="text-base font-black text-amber-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>নতুন SaaS ক্লায়েন্ট অনবোর্ড করুন</span>
                  </h4>
                  <button onClick={() => setShowAddTenantModal(false)} className="text-stone-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddNewTenant} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-300 font-bold mb-1">রেস্তোরাঁর নাম *</label>
                    <input
                      type="text"
                      required
                      value={newTenantForm.restaurantName}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, restaurantName: e.target.value })}
                      placeholder="যেমন: কাচ্চি ডাইন"
                      className="w-full px-3 py-2 bg-stone-950 rounded-xl border border-stone-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">মালিকের নাম *</label>
                      <input
                        type="text"
                        required
                        value={newTenantForm.ownerName}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, ownerName: e.target.value })}
                        placeholder="মালিকের নাম"
                        className="w-full px-3 py-2 bg-stone-950 rounded-xl border border-stone-700 text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">মোবাইল নম্বর *</label>
                      <input
                        type="tel"
                        required
                        value={newTenantForm.phone}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, phone: e.target.value })}
                        placeholder="017XXXXXXXX"
                        className="w-full px-3 py-2 bg-stone-950 rounded-xl border border-stone-700 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-stone-300 font-bold mb-1">প্যাকেজ</label>
                      <select
                        value={newTenantForm.planId}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, planId: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-950 rounded-xl border border-stone-700 text-white focus:outline-none"
                      >
                        <option value="starter">Starter Cloud (৳১,৯৯৯/ম)</option>
                        <option value="pro">Pro Suite (৳৪,৯৯৯/ম)</option>
                        <option value="enterprise">Enterprise (৳১২,৯৯৯/ম)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-300 font-bold mb-1">বিলিং সাইকেল</label>
                      <select
                        value={newTenantForm.billingCycle}
                        onChange={(e) => setNewTenantForm({ ...newTenantForm, billingCycle: e.target.value as any })}
                        className="w-full px-3 py-2 bg-stone-950 rounded-xl border border-stone-700 text-white focus:outline-none"
                      >
                        <option value="monthly">মাসিক (Monthly)</option>
                        <option value="quarterly">ত্রৈমাসিক (Quarterly - ৩ মাস)</option>
                        <option value="yearly">বাৎসরিক (Yearly)</option>
                        <option value="lifetime">লাইফটাইম (Lifetime)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-300 font-bold mb-1">অবস্থান / জেলা</label>
                    <input
                      type="text"
                      value={newTenantForm.location}
                      onChange={(e) => setNewTenantForm({ ...newTenantForm, location: e.target.value })}
                      placeholder="যেমন: ঈশ্বরদী, পাবনা"
                      className="w-full px-3 py-2 bg-stone-950 rounded-xl border border-stone-700 text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setShowAddTenantModal(false)}
                      className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>লাইসেন্স ইস্যু ও সেভ করুন</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden container formatted specifically for POS / Thermal printing */}
      <PrintableOrderReceipt order={activePrintOrder} lang={lang} />
    </div>
  );
};
