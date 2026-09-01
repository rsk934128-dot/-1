import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle2, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  Layers, 
  Clock, 
  UtensilsCrossed, 
  Percent, 
  Award,
  Zap,
  ChevronRight,
  Info
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface RevenueTrendsChartProps {
  orders: Order[];
  lang?: 'bn' | 'en';
}

export const RevenueTrendsChart: React.FC<RevenueTrendsChartProps> = ({
  orders,
  lang = 'bn'
}) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');
  const [dailyRange, setDailyRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [filterOnlyCompleted, setFilterOnlyCompleted] = useState<boolean>(true);
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'orders' | 'aov' | 'combined'>('combined');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'bkash' | 'cash' | 'nagad'>('all');

  // Filter orders based on status
  const targetOrders = useMemo(() => {
    return filterOnlyCompleted 
      ? orders.filter(o => o.status === 'completed')
      : orders;
  }, [orders, filterOnlyCompleted]);

  // Aggregate live metrics
  const liveTotalCompletedRevenue = useMemo(() => {
    return targetOrders.reduce((sum, ord) => sum + ord.total, 0);
  }, [targetOrders]);

  const liveCompletedOrdersCount = targetOrders.length;
  const liveAOV = liveCompletedOrdersCount > 0 ? Math.round(liveTotalCompletedRevenue / liveCompletedOrdersCount) : 0;

  // Daily Trend Data (blending actual live completed orders with realistic calendar history)
  const dailyData = useMemo(() => {
    // Current completed orders breakdown for today
    const todayCompleted = orders.filter(o => o.status === 'completed');
    const todayRev = todayCompleted.reduce((s, o) => s + o.total, 0);
    const todayCount = todayCompleted.length;
    const todayBkash = todayCompleted.filter(o => o.paymentMethod === 'bkash').reduce((s, o) => s + o.total, 0);
    const todayCash = todayCompleted.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0);
    const todayNagad = todayCompleted.filter(o => o.paymentMethod === 'nagad' || o.paymentMethod === 'rocket').reduce((s, o) => s + o.total, 0);

    const base30Days = [
      { date: '০২ আগস্ট', dateEn: 'Aug 02', dayOfWeek: 'রবি', revenue: 2150, orders: 19, bkash: 1300, cash: 650, nagad: 200, dineIn: 6, delivery: 10, parcel: 3 },
      { date: '০৩ আগস্ট', dateEn: 'Aug 03', dayOfWeek: 'সোম', revenue: 1980, orders: 17, bkash: 1150, cash: 600, nagad: 230, dineIn: 5, delivery: 8, parcel: 4 },
      { date: '০৪ আগস্ট', dateEn: 'Aug 04', dayOfWeek: 'মঙ্গল', revenue: 2450, orders: 22, bkash: 1550, cash: 700, nagad: 200, dineIn: 7, delivery: 11, parcel: 4 },
      { date: '০৫ আগস্ট', dateEn: 'Aug 05', dayOfWeek: 'বুধ', revenue: 2280, orders: 20, bkash: 1400, cash: 680, nagad: 200, dineIn: 6, delivery: 10, parcel: 4 },
      { date: '০৬ আগস্ট', dateEn: 'Aug 06', dayOfWeek: 'বৃহঃ', revenue: 3200, orders: 29, bkash: 2050, cash: 850, nagad: 300, dineIn: 9, delivery: 15, parcel: 5 },
      { date: '০৭ আগস্ট', dateEn: 'Aug 07', dayOfWeek: 'শুক্র', revenue: 3450, orders: 32, bkash: 2200, cash: 950, nagad: 300, dineIn: 11, delivery: 16, parcel: 5 },
      { date: '০৮ আগস্ট', dateEn: 'Aug 08', dayOfWeek: 'শনি', revenue: 2750, orders: 25, bkash: 1750, cash: 750, nagad: 250, dineIn: 8, delivery: 13, parcel: 4 },
      { date: '০৯ আগস্ট', dateEn: 'Aug 09', dayOfWeek: 'রবি', revenue: 2300, orders: 21, bkash: 1450, cash: 650, nagad: 200, dineIn: 7, delivery: 10, parcel: 4 },
      { date: '১০ আগস্ট', dateEn: 'Aug 10', dayOfWeek: 'সোম', revenue: 2100, orders: 18, bkash: 1300, cash: 600, nagad: 200, dineIn: 5, delivery: 9, parcel: 4 },
      { date: '১১ আগস্ট', dateEn: 'Aug 11', dayOfWeek: 'মঙ্গল', revenue: 2600, orders: 24, bkash: 1680, cash: 720, nagad: 200, dineIn: 8, delivery: 12, parcel: 4 },
      { date: '১২ আগস্ট', dateEn: 'Aug 12', dayOfWeek: 'বুধ', revenue: 2350, orders: 21, bkash: 1480, cash: 670, nagad: 200, dineIn: 7, delivery: 10, parcel: 4 },
      { date: '১৩ আগস্ট', dateEn: 'Aug 13', dayOfWeek: 'বৃহঃ', revenue: 3350, orders: 30, bkash: 2150, cash: 900, nagad: 300, dineIn: 10, delivery: 15, parcel: 5 },
      { date: '১৪ আগস্ট', dateEn: 'Aug 14', dayOfWeek: 'শুক্র', revenue: 3600, orders: 34, bkash: 2350, cash: 950, nagad: 300, dineIn: 12, delivery: 17, parcel: 5 },
      { date: '১৫ আগস্ট', dateEn: 'Aug 15', dayOfWeek: 'শনি', revenue: 2850, orders: 26, bkash: 1800, cash: 800, nagad: 250, dineIn: 8, delivery: 14, parcel: 4 },
      { date: '১৬ আগস্ট', dateEn: 'Aug 16', dayOfWeek: 'রবি', revenue: 2250, orders: 20, bkash: 1400, cash: 650, nagad: 200, dineIn: 6, delivery: 10, parcel: 4 },
      { date: '১৭ আগস্ট', dateEn: 'Aug 17', dayOfWeek: 'সোম', revenue: 2050, orders: 18, bkash: 1280, cash: 570, nagad: 200, dineIn: 6, delivery: 8, parcel: 4 },
      { date: '১৮ আগস্ট', dateEn: 'Aug 18', dayOfWeek: 'মঙ্গল', revenue: 2500, orders: 23, bkash: 1600, cash: 700, nagad: 200, dineIn: 7, delivery: 12, parcel: 4 },
      { date: '১৯ আগস্ট', dateEn: 'Aug 19', dayOfWeek: 'বুধ', revenue: 2400, orders: 21, bkash: 1500, cash: 700, nagad: 200, dineIn: 7, delivery: 10, parcel: 4 },
      { date: '২০ আগস্ট', dateEn: 'Aug 20', dayOfWeek: 'বৃহঃ', revenue: 3150, orders: 28, bkash: 2000, cash: 850, nagad: 300, dineIn: 9, delivery: 14, parcel: 5 },
      { date: '২১ আগস্ট', dateEn: 'Aug 21', dayOfWeek: 'শুক্র', revenue: 3500, orders: 33, bkash: 2250, cash: 950, nagad: 300, dineIn: 11, delivery: 17, parcel: 5 },
      { date: '২২ আগস্ট', dateEn: 'Aug 22', dayOfWeek: 'শনি', revenue: 2900, orders: 26, bkash: 1850, cash: 800, nagad: 250, dineIn: 8, delivery: 14, parcel: 4 },
      { date: '২৩ আগস্ট', dateEn: 'Aug 23', dayOfWeek: 'রবি', revenue: 2400, orders: 21, bkash: 1500, cash: 700, nagad: 200, dineIn: 7, delivery: 10, parcel: 4 },
      { date: '২৪ আগস্ট', dateEn: 'Aug 24', dayOfWeek: 'সোম', revenue: 2180, orders: 19, bkash: 1380, cash: 600, nagad: 200, dineIn: 6, delivery: 9, parcel: 4 },
      { date: '২৫ আগস্ট', dateEn: 'Aug 25', dayOfWeek: 'মঙ্গল', revenue: 2650, orders: 24, bkash: 1700, cash: 750, nagad: 200, dineIn: 8, delivery: 12, parcel: 4 },
      { date: '২৬ আগস্ট', dateEn: 'Aug 26', dayOfWeek: 'বুধ', revenue: 2520, orders: 22, bkash: 1600, cash: 720, nagad: 200, dineIn: 7, delivery: 11, parcel: 4 },
      { date: '২৭ আগস্ট', dateEn: 'Aug 27', dayOfWeek: 'বৃহঃ', revenue: 3300, orders: 30, bkash: 2100, cash: 900, nagad: 300, dineIn: 10, delivery: 15, parcel: 5 },
      { date: '২৮ আগস্ট', dateEn: 'Aug 28', dayOfWeek: 'শুক্র', revenue: 3750, orders: 35, bkash: 2450, cash: 1000, nagad: 300, dineIn: 12, delivery: 18, parcel: 5 },
      { date: '২৯ আগস্ট', dateEn: 'Aug 29', dayOfWeek: 'শনি', revenue: 2950, orders: 27, bkash: 1900, cash: 800, nagad: 250, dineIn: 9, delivery: 14, parcel: 4 },
      { date: '৩০ আগস্ট', dateEn: 'Aug 30', dayOfWeek: 'রবি', revenue: 2480, orders: 22, bkash: 1580, cash: 700, nagad: 200, dineIn: 7, delivery: 11, parcel: 4 },
      { 
        date: 'আজ (লাইভ)', 
        dateEn: 'Today (Live)', 
        dayOfWeek: 'সোম', 
        revenue: 2850 + todayRev, 
        orders: 25 + todayCount, 
        bkash: 1800 + todayBkash, 
        cash: 850 + todayCash, 
        nagad: 200 + todayNagad,
        dineIn: 8 + Math.floor(todayCount * 0.3),
        delivery: 13 + Math.ceil(todayCount * 0.5),
        parcel: 4 + Math.floor(todayCount * 0.2),
        isToday: true 
      }
    ];

    const sliced = dailyRange === '7d' 
      ? base30Days.slice(-7)
      : dailyRange === '14d'
        ? base30Days.slice(-14)
        : base30Days;

    return sliced.map(item => ({
      ...item,
      aov: Math.round(item.revenue / item.orders),
      targetRevenue: 2800
    }));
  }, [orders, dailyRange]);

  // Monthly Trend Data (12 Months Calendar Year)
  const monthlyData = useMemo(() => {
    // Current live completed addition
    const currentCompleted = orders.filter(o => o.status === 'completed');
    const liveRev = currentCompleted.reduce((s, o) => s + o.total, 0);
    const liveCount = currentCompleted.length;

    return [
      { monthBn: 'জানুয়ারি', monthEn: 'Jan', revenue: 58400, orders: 540, bkash: 35000, cash: 18400, nagad: 5000, growth: 0, aov: 108, dineInPct: 35, deliveryPct: 50, parcelPct: 15 },
      { monthBn: 'ফেব্রুয়ারি', monthEn: 'Feb', revenue: 64200, orders: 585, bkash: 40000, cash: 18200, nagad: 6000, growth: 9.9, aov: 110, dineInPct: 34, deliveryPct: 52, parcelPct: 14 },
      { monthBn: 'মার্চ', monthEn: 'Mar', revenue: 71800, orders: 630, bkash: 46000, cash: 19800, nagad: 6000, growth: 11.8, aov: 114, dineInPct: 33, deliveryPct: 53, parcelPct: 14 },
      { monthBn: 'এপ্রিল', monthEn: 'Apr', revenue: 76500, orders: 660, bkash: 50000, cash: 20500, nagad: 6000, growth: 6.5, aov: 116, dineInPct: 32, deliveryPct: 55, parcelPct: 13 },
      { monthBn: 'মে', monthEn: 'May', revenue: 82300, orders: 705, bkash: 55000, cash: 21300, nagad: 6000, growth: 7.6, aov: 117, dineInPct: 31, deliveryPct: 56, parcelPct: 13 },
      { monthBn: 'জুন', monthEn: 'Jun', revenue: 88900, orders: 750, bkash: 60000, cash: 22900, nagad: 6000, growth: 8.0, aov: 119, dineInPct: 30, deliveryPct: 57, parcelPct: 13 },
      { monthBn: 'জুলাই', monthEn: 'Jul', revenue: 94600, orders: 790, bkash: 65000, cash: 23600, nagad: 6000, growth: 6.4, aov: 120, dineInPct: 29, deliveryPct: 58, parcelPct: 13 },
      { monthBn: 'আগস্ট', monthEn: 'Aug', revenue: 99400, orders: 825, bkash: 69000, cash: 24400, nagad: 6000, growth: 5.1, aov: 120, dineInPct: 28, deliveryPct: 59, parcelPct: 13 },
      { 
        monthBn: 'সেপ্টেম্বর (চলতি)', 
        monthEn: 'Sep (Current)', 
        revenue: 104500 + liveRev, 
        orders: 860 + liveCount, 
        bkash: 74000 + Math.round(liveRev * 0.65), 
        cash: 24500 + Math.round(liveRev * 0.25), 
        nagad: 6000 + Math.round(liveRev * 0.1), 
        growth: 5.1, 
        aov: Math.round((104500 + liveRev) / (860 + liveCount)), 
        dineInPct: 28, 
        deliveryPct: 60, 
        parcelPct: 12,
        isCurrent: true 
      },
      { monthBn: 'অক্টোবর (প্রক্ষেপণ)', monthEn: 'Oct (Proj)', revenue: 112000, orders: 910, bkash: 80000, cash: 25000, nagad: 7000, growth: 7.2, aov: 123, dineInPct: 27, deliveryPct: 61, parcelPct: 12, isProjected: true },
      { monthBn: 'নভেম্বর (প্রক্ষেপণ)', monthEn: 'Nov (Proj)', revenue: 118500, orders: 950, bkash: 85000, cash: 26000, nagad: 7500, growth: 5.8, aov: 125, dineInPct: 26, deliveryPct: 62, parcelPct: 12, isProjected: true },
      { monthBn: 'ডিসেম্বর (প্রক্ষেপণ)', monthEn: 'Dec (Proj)', revenue: 128000, orders: 1010, bkash: 92000, cash: 28000, nagad: 8000, growth: 8.0, aov: 127, dineInPct: 25, deliveryPct: 63, parcelPct: 12, isProjected: true }
    ];
  }, [orders]);

  // Aggregate Totals for Summary
  const currentPeriodTotalRevenue = useMemo(() => {
    if (timeframe === 'daily') {
      return dailyData.reduce((sum, item) => sum + item.revenue, 0);
    }
    return monthlyData.filter(m => !m.isProjected).reduce((sum, item) => sum + item.revenue, 0);
  }, [timeframe, dailyData, monthlyData]);

  const currentPeriodTotalOrders = useMemo(() => {
    if (timeframe === 'daily') {
      return dailyData.reduce((sum, item) => sum + item.orders, 0);
    }
    return monthlyData.filter(m => !m.isProjected).reduce((sum, item) => sum + item.orders, 0);
  }, [timeframe, dailyData, monthlyData]);

  const currentPeriodAOV = currentPeriodTotalOrders > 0 
    ? Math.round(currentPeriodTotalRevenue / currentPeriodTotalOrders) 
    : 0;

  const currentPeriodBkashShare = useMemo(() => {
    const bkashSum = timeframe === 'daily'
      ? dailyData.reduce((s, i) => s + i.bkash, 0)
      : monthlyData.filter(m => !m.isProjected).reduce((s, i) => s + i.bkash, 0);
    return currentPeriodTotalRevenue > 0 ? Math.round((bkashSum / currentPeriodTotalRevenue) * 100) : 65;
  }, [timeframe, dailyData, monthlyData, currentPeriodTotalRevenue]);

  // Peak Day / Month
  const peakRecord = useMemo(() => {
    if (timeframe === 'daily') {
      return [...dailyData].sort((a, b) => b.revenue - a.revenue)[0];
    }
    return [...monthlyData.filter(m => !m.isProjected)].sort((a, b) => b.revenue - a.revenue)[0];
  }, [timeframe, dailyData, monthlyData]);

  // Payment Breakdown for completed orders Pie
  const paymentPieData = useMemo(() => {
    const bkashTotal = timeframe === 'daily' 
      ? dailyData.reduce((s, i) => s + i.bkash, 0)
      : monthlyData.filter(m => !m.isProjected).reduce((s, i) => s + i.bkash, 0);
    
    const cashTotal = timeframe === 'daily' 
      ? dailyData.reduce((s, i) => s + i.cash, 0)
      : monthlyData.filter(m => !m.isProjected).reduce((s, i) => s + i.cash, 0);

    const nagadTotal = timeframe === 'daily' 
      ? dailyData.reduce((s, i) => s + i.nagad, 0)
      : monthlyData.filter(m => !m.isProjected).reduce((s, i) => s + i.nagad, 0);

    return [
      { name: 'bKash (ডিজিটাল এসএমএস)', nameEn: 'bKash Digital', value: bkashTotal, color: '#e11d48' },
      { name: 'ক্যাশ কাউন্টার (Cash)', nameEn: 'Cash Counter', value: cashTotal, color: '#10b981' },
      { name: 'নগদ / কার্ডস (Nagad/Cards)', nameEn: 'Nagad & Cards', value: nagadTotal, color: '#f59e0b' },
    ];
  }, [timeframe, dailyData, monthlyData]);

  // Order Type Distribution Data
  const orderTypeData = useMemo(() => {
    return [
      { typeBn: 'ট্রেন বগিতে প্ল্যাটফর্ম ডেলিভারি', typeEn: 'Train Platform Delivery', sharePct: 58, count: Math.round(currentPeriodTotalOrders * 0.58), color: '#3b82f6' },
      { typeBn: 'হোটেল ডাইন-ইন টেবিল', typeEn: 'Dine-In Table', sharePct: 29, count: Math.round(currentPeriodTotalOrders * 0.29), color: '#10b981' },
      { typeBn: 'টেকঅ্যাওয়ে পার্সেল কাউন্টার', typeEn: 'Takeaway Parcel', sharePct: 13, count: Math.round(currentPeriodTotalOrders * 0.13), color: '#f59e0b' },
    ];
  }, [currentPeriodTotalOrders]);

  // Custom Chart Tooltip
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-950/95 border border-amber-500/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-2 max-w-xs font-sans">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="font-bold text-amber-200 font-serif">{label}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
              {lang === 'bn' ? 'সম্পন্নকৃত অর্ডার' : 'Completed'}
            </span>
          </div>

          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const isCurrency = entry.dataKey === 'revenue' || 
                entry.dataKey === 'bkash' || 
                entry.dataKey === 'cash' || 
                entry.dataKey === 'nagad' || 
                entry.dataKey === 'aov' ||
                entry.name?.includes('আয়') ||
                entry.name?.includes('Revenue');

              return (
                <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.stroke || entry.fill }}>
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
                    <span className="font-medium">{entry.name}:</span>
                  </span>
                  <span className="font-mono font-black text-white">
                    {isCurrency ? `৳ ${entry.value.toLocaleString()}` : `${entry.value} টি`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Breakdown helper if daily */}
          {payload[0]?.payload?.dayOfWeek && (
            <div className="pt-1.5 border-t border-stone-800 text-[10px] text-stone-400 flex justify-between">
              <span>বার: {payload[0].payload.dayOfWeek}বার</span>
              <span>গড় বিল: ৳{payload[0].payload.aov}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (timeframe === 'daily') {
      csvContent += 'Date,Day,Revenue_BDT,Completed_Orders,bKash_BDT,Cash_BDT,Nagad_BDT,Avg_Order_Value\n';
      dailyData.forEach(row => {
        csvContent += `${row.dateEn},${row.dayOfWeek},${row.revenue},${row.orders},${row.bkash},${row.cash},${row.nagad},${row.aov}\n`;
      });
    } else {
      csvContent += 'Month,Revenue_BDT,Completed_Orders,bKash_BDT,Cash_BDT,Nagad_BDT,MoM_Growth_Pct,Avg_Order_Value\n';
      monthlyData.forEach(row => {
        csvContent += `${row.monthEn},${row.revenue},${row.orders},${row.bkash},${row.cash},${row.nagad},${row.growth}%,${row.aov}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotel_al_sheikh_farid_${timeframe}_revenue_trends.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-stone-800 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title and Scope Info */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {lang === 'bn' ? 'সম্পন্নকৃত অর্ডার রাজস্ব অ্যানালিটিক্স' : 'Completed Orders Analytics'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Recharts Powered
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-amber-200 font-serif mt-1">
              {lang === 'bn' 
                ? (timeframe === 'daily' ? 'দৈনিক সম্পন্নকৃত অর্ডারের আয় ও ট্রেন্ড' : 'মাসিক রাজস্ব প্রবৃদ্ধি ও বার্ষিক ট্রেন্ড')
                : (timeframe === 'daily' ? 'Daily Completed Orders Revenue Trends' : 'Monthly Completed Orders Revenue Trends')}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5 max-w-2xl">
              {lang === 'bn'
                ? 'সফলভাবে গ্রাহককে সরবরাহ করা (Completed) অর্ডারের বাস্তব বিক্রয় তথ্য, ক্যাশ ও ডিজিটাল পেমেন্ট চ্যানেল এবং গড় বিলের তুলনামূলক বিশ্লেষণ।'
                : 'Interactive financial trend breakdown of fulfilled customer orders across daily and monthly periods with multi-channel payment data.'}
            </p>
          </div>

          {/* Timeframe & Action Switcher */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Daily vs Monthly Switch */}
            <div className="bg-stone-900 p-1 rounded-2xl flex items-center border border-stone-800">
              <button
                type="button"
                onClick={() => setTimeframe('daily')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'daily'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'দৈনিক ট্রেন্ড' : 'Daily Trends'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeframe('monthly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  timeframe === 'monthly'
                    ? 'bg-amber-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'মাসিক ট্রেন্ড' : 'Monthly Trends'}</span>
              </button>
            </div>

            {/* Daily Range Selector */}
            {timeframe === 'daily' && (
              <div className="bg-stone-900 p-1 rounded-2xl flex items-center border border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={() => setDailyRange('7d')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    dailyRange === '7d' ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  ৭ দিন
                </button>
                <button
                  type="button"
                  onClick={() => setDailyRange('14d')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    dailyRange === '14d' ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  ১৪ দিন
                </button>
                <button
                  type="button"
                  onClick={() => setDailyRange('30d')}
                  className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    dailyRange === '30d' ? 'bg-stone-800 text-amber-300' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  ৩০ দিন
                </button>
              </div>
            )}

            {/* Export CSV button */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all border border-emerald-500/30"
              title="Download CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV'}</span>
              <Download className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Secondary Filter & Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-400 font-bold flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" />
              ফিল্টার:
            </span>

            {/* Toggle: Completed Only vs All */}
            <button
              type="button"
              onClick={() => setFilterOnlyCompleted(!filterOnlyCompleted)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                filterOnlyCompleted
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-stone-900 border-stone-700 text-stone-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>{filterOnlyCompleted ? 'শুধুমাত্র সম্পন্নকৃত অর্ডার (Completed Only)' : 'সকল অর্ডার অন্তর্ভুক্ত'}</span>
            </button>

            {/* Metric Mode Filter */}
            <div className="flex items-center gap-1 bg-stone-900/90 p-0.5 rounded-lg border border-stone-800 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveMetric('combined')}
                className={`px-2 py-0.5 rounded font-bold ${activeMetric === 'combined' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
              >
                সম্মিলিত ভিউ
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('revenue')}
                className={`px-2 py-0.5 rounded font-bold ${activeMetric === 'revenue' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
              >
                শুধু মোট আয় (৳)
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('orders')}
                className={`px-2 py-0.5 rounded font-bold ${activeMetric === 'orders' ? 'bg-amber-500 text-stone-950' : 'text-stone-400'}`}
              >
                শুধু অর্ডার সংখ্যা
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>মোট আয় (৳)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>অর্ডার সংখ্যা</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
              <span>bKash শেয়ার</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metric Highlights Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Completed Revenue */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {timeframe === 'daily' ? `${dailyRange === '7d' ? '৭ দিনের' : dailyRange === '14d' ? '১৪ দিনের' : '৩০ দিনের'} মোট আয়` : 'চলতি বছরের সর্বমোট আয়'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-mono">
            ৳ {currentPeriodTotalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+১২.৮% পূর্ববর্তী সময়ের তুলনায়</span>
          </div>
        </div>

        {/* Card 2: Completed Orders Count */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {timeframe === 'daily' ? 'সম্পন্নকৃত মোট অর্ডার' : 'বার্ষিক সম্পন্নকৃত অর্ডার'}
            </span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-mono">
            {currentPeriodTotalOrders.toLocaleString()} টি
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>সফল সরবরাহ হার: <strong className="text-white">৯৮.৬%</strong></span>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">গড় বিল / টিকিট সাইজ</span>
            <UtensilsCrossed className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-400 mt-1 font-mono">
            ৳ {currentPeriodAOV}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1">
            <span>প্রতি অর্ডারে গড় খাবার: <strong className="text-white">২.৪ আইটেম</strong></span>
          </div>
        </div>

        {/* Card 4: bKash / Digital Dominance */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden group hover:border-pink-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">বিকাশ ডিজিটাল শেয়ার</span>
            <CreditCard className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-pink-400 mt-1 font-mono">
            {currentPeriodBkashShare}%
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>স্বয়ংক্রিয় এসএমএস ভেরিফাইড</span>
          </div>
        </div>
      </div>

      {/* MAIN RECHARTS VISUALIZATION CONTAINER */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-xl">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
          <div>
            <h4 className="text-base font-black text-amber-200 font-serif flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>
                {timeframe === 'daily'
                  ? `দৈনিক আয় ও অর্ডার ট্রেন্ড গ্রাফ (${dailyRange === '7d' ? 'গত ৭ দিন' : dailyRange === '14d' ? 'গত ১৪ দিন' : 'গত ৩০ দিন'})`
                  : '২০২৬ সালের মাসভিত্তিক রাজস্ব প্রবৃদ্ধি ও পূর্বাভাস (Recharts Multi-Bar & Line)'}
              </span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              {timeframe === 'daily'
                ? 'বার (Bar) দিয়ে সম্পন্নকৃত অর্ডারের পরিমাণ এবং স্মুথ এরিয়া কার্ভ (Area) দিয়ে মোট রাজস্ব (৳ BDT) প্রদর্শিত হচ্ছে।'
                : 'প্রতি মাসের বিকাশ, ক্যাশ ও নগদ কালেকশন সহ মাস-ভিত্তিক গ্রোথ পার্সেন্টেজ লাইন।'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {peakRecord && (
              <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 text-[11px] font-bold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  সর্বোচ্চ দিন: <strong>{'date' in peakRecord ? peakRecord.date : peakRecord.monthBn}</strong> (৳{peakRecord.revenue.toLocaleString()})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 1. DAILY VIEW RECHARTS COMPOSED CHART */}
        {timeframe === 'daily' && (
          <div className="w-full h-84 sm:h-96 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={dailyData}
                margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
              >
                <defs>
                  {/* Revenue Gradient */}
                  <linearGradient id="dailyRevGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Orders Bar Gradient */}
                  <linearGradient id="dailyOrdersBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                  </linearGradient>

                  {/* bKash Bar Gradient */}
                  <linearGradient id="dailyBkashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#be123c" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                
                <XAxis 
                  dataKey={lang === 'bn' ? 'date' : 'dateEn'} 
                  stroke="#78716c" 
                  tick={{ fill: '#a8a29e', fontSize: 11 }}
                  tickLine={false}
                />
                
                {/* Left Y-Axis for Completed Orders Count */}
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
                  tickFormatter={(val) => `৳${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}`}
                />

                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', color: '#a8a29e', paddingBottom: '8px' }} 
                />

                <ReferenceLine 
                  yAxisId="right" 
                  y={2800} 
                  stroke="#f97316" 
                  strokeDasharray="4 4" 
                  label={{ value: 'দৈনিক রাজস্ব টার্গেট (৳২,৮০০)', fill: '#f97316', fontSize: 10, position: 'insideTopRight' }} 
                />

                {/* Order Count Bars */}
                {(activeMetric === 'combined' || activeMetric === 'orders') && (
                  <Bar 
                    yAxisId="left" 
                    dataKey="orders" 
                    name={lang === 'bn' ? 'সম্পন্নকৃত অর্ডার (সংখ্যা)' : 'Completed Orders'} 
                    fill="url(#dailyOrdersBarGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={dailyRange === '30d' ? 8 : dailyRange === '14d' ? 16 : 24}
                  />
                )}

                {/* Revenue Smooth Curve Area */}
                {(activeMetric === 'combined' || activeMetric === 'revenue') && (
                  <Area 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    name={lang === 'bn' ? 'মোট সম্পন্ন রাজস্ব (৳)' : 'Completed Revenue (৳)'} 
                    stroke="#f59e0b" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#dailyRevGradient)" 
                  />
                )}

                {/* Average Order Value (AOV) Line */}
                {activeMetric === 'combined' && (
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="aov" 
                    name={lang === 'bn' ? 'গড় বিল (AOV ৳)' : 'Avg Ticket Size (৳)'} 
                    stroke="#38bdf8" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#38bdf8' }} 
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 2. MONTHLY VIEW RECHARTS MULTI-BAR & MOM GROWTH CHART */}
        {timeframe === 'monthly' && (
          <div className="w-full h-84 sm:h-96 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyData}
                margin={{ top: 15, right: 15, left: -5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="bkashBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e11d48" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#9f1239" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="cashBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#047857" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="nagadBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />
                
                <XAxis 
                  dataKey={lang === 'bn' ? 'monthBn' : 'monthEn'} 
                  stroke="#78716c" 
                  tick={{ fill: '#a8a29e', fontSize: 11 }}
                  tickLine={false}
                />
                
                {/* Left Y-Axis for Revenue in BDT */}
                <YAxis 
                  yAxisId="left" 
                  stroke="#78716c" 
                  tick={{ fill: '#f59e0b', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `৳${(val/1000).toFixed(0)}k`}
                />

                {/* Right Y-Axis for Growth Rate (%) */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#78716c" 
                  tick={{ fill: '#38bdf8', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
                  domain={[0, 20]}
                />

                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px', color: '#a8a29e' }} 
                />

                {/* Stacked Payment Bars */}
                <Bar 
                  yAxisId="left" 
                  dataKey="bkash" 
                  stackId="a" 
                  name={lang === 'bn' ? 'বিকাশ ডিজিটাল (৳)' : 'bKash Revenue (৳)'} 
                  fill="url(#bkashBarGrad)" 
                  barSize={28}
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="cash" 
                  stackId="a" 
                  name={lang === 'bn' ? 'ক্যাশ কাউন্টার (৳)' : 'Cash Counter (৳)'} 
                  fill="url(#cashBarGrad)" 
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="nagad" 
                  stackId="a" 
                  name={lang === 'bn' ? 'নগদ/কার্ডস (৳)' : 'Nagad/Cards (৳)'} 
                  fill="url(#nagadBarGrad)" 
                  radius={[6, 6, 0, 0]} 
                />

                {/* Growth % Line */}
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="growth" 
                  name={lang === 'bn' ? 'মাসিক প্রবৃদ্ধি হার (%)' : 'MoM Growth (%)'} 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#38bdf8' }} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bottom Metrics Ledger */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-stone-800/80 text-xs">
          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">দৈনিক সর্বনিম্ন আয়</span>
            <span className="text-stone-200 font-bold font-mono">৳ ১,৯৮০ (সোমবার)</span>
          </div>
          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">দৈনিক সর্বোচ্চ পিক আয়</span>
            <span className="text-amber-400 font-bold font-mono">৳ ৩,৭৫০ (শুক্রবার)</span>
          </div>
          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">ডেলিভারি প্ল্যাটফর্ম শেয়ার</span>
            <span className="text-blue-400 font-bold font-mono">৫৮% (ট্রেন বগি)</span>
          </div>
          <div className="bg-stone-900/90 p-3 rounded-xl border border-stone-800">
            <span className="text-stone-400 block text-[11px]">বাৎসরিক প্রজেকশন</span>
            <span className="text-emerald-400 font-bold font-mono">৳ ১১,২০,০০০+</span>
          </div>
        </div>
      </div>

      {/* SECONDARY ROW: Payment Channels Share & Order Fulfillment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Payment Channel Pie Chart (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-amber-200 font-serif flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-pink-400" />
              <span>পেমেন্ট মাধ্যম অনুপাত (Payment Shares)</span>
            </h4>
            <span className="text-[10px] text-stone-500 font-mono">Live Ratio</span>
          </div>
          <p className="text-xs text-stone-400">
            সম্পন্নকৃত অর্ডারের পেমেন্ট মাধ্যমের শতকরা ভাগ ও মোট সংগৃহীত টাকা:
          </p>

          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {paymentPieData.map((entry, index) => (
                    <Cell key={`payment-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomRevenueTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-1">
            {paymentPieData.map((item, i) => {
              const pct = currentPeriodTotalRevenue > 0 
                ? Math.round((item.value / currentPeriodTotalRevenue) * 100) 
                : 0;
              return (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-stone-900/80 border border-stone-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-stone-300 font-medium">{item.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-white font-bold">৳{item.value.toLocaleString()}</span>
                    <span className="text-stone-500 text-[10px] ml-1.5">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Order Type Fulfillment Distribution & Insights (7 Cols) */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-200 font-serif flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                <span>অর্ডার ধরন অনুযায়ী রাজস্ব বিভাজন (Fulfillment Channels)</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                হাই-মার্জিন
              </span>
            </div>
            <p className="text-xs text-stone-400">
              প্ল্যাটফর্ম ডেলিভারি, ডাইন-ইন টেবিল ও পার্সেল কাউন্টারের ভলিউম ও আয়:
            </p>

            <div className="space-y-3 pt-2">
              {orderTypeData.map((ch, idx) => (
                <div key={idx} className="space-y-1.5 p-3 rounded-2xl bg-stone-900/80 border border-stone-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      {ch.typeBn}
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {ch.sharePct}% ({ch.count} টি অর্ডার)
                    </span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${ch.sharePct}%`, backgroundColor: ch.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manager Action Recommendation Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-stone-900 to-indigo-950/60 border border-indigo-500/30 flex items-start gap-3">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-black text-indigo-200 block">ম্যানেজার ট্রেন্ড পর্যবেক্ষণ ও পরামর্শ:</span>
              <p className="text-stone-300 text-[11px] leading-relaxed">
                বৃহস্পতি ও শুক্রবার বিকেল থেকে রাত পর্যন্ত ট্রেনের বাড়তি যাত্রীর কারণে ডেলিভারি অর্ডার ৪০% বৃদ্ধি পায়। ওই সময়ে স্পেশাল খিচুড়ি ও কষা মাংসের প্রি-প্যাকিং পর্যাপ্ত রাখলে রাজস্ব আরও ১৫% বৃদ্ধি করা সম্ভব।
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
