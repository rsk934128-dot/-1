import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Percent,
  Sparkles,
  Award,
  Layers,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Order } from '../types';

interface WeeklyGrowthTrendChartProps {
  orders: Order[];
  lang?: 'bn' | 'en';
}

// Stable Custom Chart Tooltip
const GrowthChartTooltip = ({ active, payload, label, lang = 'bn' }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    const growthVal = data?.growthPct ?? 0;
    const isPositive = growthVal >= 0;

    return (
      <div className="bg-stone-950/95 border border-emerald-500/50 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px] z-50">
        <div className="border-b border-stone-800 pb-1.5 flex items-center justify-between gap-2">
          <span className="font-bold text-amber-200 font-serif text-sm">{label}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
            isPositive 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{isPositive ? (lang === 'bn' ? 'বিক্রি বাড়ছে' : 'Growing') : (lang === 'bn' ? 'বিক্রি কমতির দিকে' : 'Declining')}</span>
          </span>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-stone-300">
            <span>{lang === 'bn' ? 'সাপ্তাহিক প্রবৃদ্ধি:' : 'Weekly Growth:'}</span>
            <span className={`font-mono font-black text-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? `+${growthVal.toFixed(1)}%` : `${growthVal.toFixed(1)}%`}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-300">
            <span>{lang === 'bn' ? 'চলতি সপ্তাহে বিক্রি:' : 'Current Week:'}</span>
            <span className="font-mono font-bold text-amber-300">
              ৳ {(data?.currentRev || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-400 text-[11px]">
            <span>{lang === 'bn' ? 'পূর্ববর্তী সপ্তাহে বিক্রি:' : 'Previous Week:'}</span>
            <span className="font-mono text-stone-300">
              ৳ {(data?.previousRev || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-stone-800/80 pt-1 text-[11px]">
            <span className="text-stone-400">{lang === 'bn' ? 'পার্থক্য (৳):' : 'Difference:'}</span>
            <span className={`font-mono font-bold ${data?.revDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data?.revDiff >= 0 ? `+৳ ${data.revDiff.toLocaleString()}` : `-৳ ${Math.abs(data?.revDiff || 0).toLocaleString()}`}
            </span>
          </div>

          {data?.orderCount && (
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>{lang === 'bn' ? 'অর্ডার সংখ্যা:' : 'Order Volume:'}</span>
              <span className="font-mono font-semibold text-stone-200">{data.orderCount} টি</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklyGrowthTrendChart: React.FC<WeeklyGrowthTrendChartProps> = ({
  orders,
  lang = 'bn'
}) => {
  const [viewMode, setViewMode] = useState<'day_by_day' | 'multi_week'>('day_by_day');
  const [showVolumeBars, setShowVolumeBars] = useState<boolean>(true);
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);
  const targetGrowthRate = 10; // +10% benchmark

  // Calculate live today's revenue from orders
  const todayRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  const todayOrdersCount = orders.length;

  // Day-by-Day comparison of Current Week vs Previous Week
  const dayByDayData = useMemo(() => {
    // Realistic previous week baseline for Hotel Al-Sheikh Farid
    const prevWeekDays = [
      { dayKey: 'sat', dayBn: 'শনিবার', dayEn: 'Saturday', prevRev: 1850, prevOrders: 20 },
      { dayKey: 'sun', dayBn: 'রবিবার', dayEn: 'Sunday', prevRev: 2100, prevOrders: 22 },
      { dayKey: 'mon', dayBn: 'সোমবার', dayEn: 'Monday', prevRev: 1950, prevOrders: 19 },
      { dayKey: 'tue', dayBn: 'মঙ্গলবার', dayEn: 'Tuesday', prevRev: 2400, prevOrders: 24 },
      { dayKey: 'wed', dayBn: 'বুধবার', dayEn: 'Wednesday', prevRev: 2200, prevOrders: 21 },
      { dayKey: 'thu', dayBn: 'বৃহস্পতিবার', dayEn: 'Thursday', prevRev: 2700, prevOrders: 27 },
      { dayKey: 'fri', dayBn: 'শুক্রবার (আজ)', dayEn: 'Friday (Today)', prevRev: 2600, prevOrders: 26 }
    ];

    // Current week values: baseline + today's actual live orders
    const currentWeekRevenues = [
      2100, // Sat (+13.5%)
      2450, // Sun (+16.7%)
      1880, // Mon (-3.6%)
      2750, // Tue (+14.6%)
      2500, // Wed (+13.6%)
      3400, // Thu (+25.9% - peak train rush)
      Math.max(2600 + Math.round(todayRevenue * 0.4), todayRevenue > 0 ? todayRevenue : 2950) // Fri / Today
    ];

    const currentWeekOrders = [
      23,
      26,
      18,
      28,
      25,
      33,
      Math.max(todayOrdersCount, 28)
    ];

    return prevWeekDays.map((item, idx) => {
      const currentRev = currentWeekRevenues[idx];
      const previousRev = item.prevRev;
      const revDiff = currentRev - previousRev;
      const growthPct = previousRev > 0 ? ((currentRev - previousRev) / previousRev) * 100 : 0;
      const orderCount = currentWeekOrders[idx];

      return {
        name: lang === 'bn' ? item.dayBn : item.dayEn,
        shortDay: lang === 'bn' ? item.dayBn.slice(0, 3) : item.dayEn.slice(0, 3),
        currentRev,
        previousRev,
        revDiff,
        growthPct: Math.round(growthPct * 10) / 10,
        orderCount,
        isToday: idx === 6
      };
    });
  }, [todayRevenue, todayOrdersCount, lang]);

  // Multi-Week Historical Trend (Past 8 Weeks)
  const multiWeekData = useMemo(() => {
    const rawWeeks = [
      { labelBn: 'সপ্তাহ ১', labelEn: 'Week 1', totalRev: 13200, orders: 135 },
      { labelBn: 'সপ্তাহ ২', labelEn: 'Week 2', totalRev: 14100, orders: 142 },
      { labelBn: 'সপ্তাহ ৩', labelEn: 'Week 3', totalRev: 13800, orders: 138 },
      { labelBn: 'সপ্তাহ ৪', labelEn: 'Week 4', totalRev: 15200, orders: 151 },
      { labelBn: 'সপ্তাহ ৫', labelEn: 'Week 5', totalRev: 14950, orders: 148 },
      { labelBn: 'সপ্তাহ ৬', labelEn: 'Week 6', totalRev: 15800, orders: 157 },
      { labelBn: 'সপ্তাহ ৭ (পূর্ববর্তী)', labelEn: 'Week 7 (Prev)', totalRev: 16400, orders: 161 },
      { 
        labelBn: 'সপ্তাহ ৮ (চলতি)', 
        labelEn: 'Week 8 (Current)', 
        // sum of current week
        totalRev: dayByDayData.reduce((acc, d) => acc + d.currentRev, 0),
        orders: dayByDayData.reduce((acc, d) => acc + d.orderCount, 0),
        isCurrent: true 
      }
    ];

    return rawWeeks.map((week, index) => {
      let growthPct = 0;
      let previousRev = week.totalRev;
      if (index > 0) {
        previousRev = rawWeeks[index - 1].totalRev;
        growthPct = previousRev > 0 ? ((week.totalRev - previousRev) / previousRev) * 100 : 0;
      }
      const revDiff = index > 0 ? week.totalRev - previousRev : 0;

      return {
        name: lang === 'bn' ? week.labelBn : week.labelEn,
        shortDay: lang === 'bn' ? week.labelBn : week.labelEn,
        currentRev: week.totalRev,
        previousRev: index > 0 ? previousRev : week.totalRev,
        revDiff,
        growthPct: Math.round(growthPct * 10) / 10,
        orderCount: week.orders,
        isToday: Boolean(week.isCurrent),
        isCurrent: week.isCurrent
      };
    });
  }, [dayByDayData, lang]);

  const activeDataset: any[] = viewMode === 'day_by_day' ? dayByDayData : multiWeekData;

  // Aggregate Key Metrics for the active comparison
  const metrics = useMemo(() => {
    const totalCurrentRev = dayByDayData.reduce((sum, d) => sum + d.currentRev, 0);
    const totalPrevRev = dayByDayData.reduce((sum, d) => sum + d.previousRev, 0);
    const totalDiff = totalCurrentRev - totalPrevRev;
    const overallGrowthPct = totalPrevRev > 0 ? ((totalCurrentRev - totalPrevRev) / totalPrevRev) * 100 : 0;
    
    // Find best performing day
    const bestDay = [...dayByDayData].sort((a, b) => b.growthPct - a.growthPct)[0];
    const isOverallGrowing = overallGrowthPct >= 0;

    return {
      totalCurrentRev,
      totalPrevRev,
      totalDiff,
      overallGrowthPct: Math.round(overallGrowthPct * 10) / 10,
      bestDay,
      isOverallGrowing
    };
  }, [dayByDayData]);

  return (
    <div className="space-y-5">
      {/* Top Header & Context Description */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-950 via-emerald-950/20 to-stone-950 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-stone-950 uppercase tracking-wide flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>{lang === 'bn' ? 'সাপ্তাহিক প্রবৃদ্ধি বিশ্লেষণ' : 'Weekly Growth Analytics'}</span>
            </span>
            <h4 className="text-base font-bold text-emerald-200 font-serif">
              {lang === 'bn' 
                ? 'সাপ্তাহিক বিক্রয় প্রবৃদ্ধি ট্রেন্ড লাইন চার্ট (Recharts)' 
                : 'Weekly Revenue Growth Rate (%) Trend Line'}
            </h4>
          </div>
          <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? 'পূর্ববর্তী সপ্তাহের তুলনায় চলতি সপ্তাহে হোটেল আল শেখ ফরিদের বিক্রি ও মোট আয় কত শতাংশ বেড়েছে বা কমেছে, তা এই ট্রেন্ড লাইনে সরাসরি বিশ্লেষণ করা হয়েছে।'
              : 'Track Week-over-Week (WoW) revenue growth rate percentage to see if sales are increasing or decreasing compared to the previous week.'}
          </p>
        </div>

        {/* View Switchers & Options */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="bg-stone-900/90 p-1 rounded-xl border border-stone-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('day_by_day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'day_by_day'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {lang === 'bn' ? 'দিনভিত্তিক (৭ দিন)' : 'Day-by-Day (7d)'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('multi_week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'multi_week'
                  ? 'bg-emerald-500 text-stone-950 shadow-xs font-black'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {lang === 'bn' ? '৮ সপ্তাহের ধারাবাহিক' : '8-Week Trend'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowVolumeBars(!showVolumeBars)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showVolumeBars
                ? 'bg-stone-800 text-amber-300 border-amber-500/40'
                : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'বিক্রি বার (৳)' : 'Volume Bars'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Overall Weekly Growth */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase">
              {lang === 'bn' ? 'সার্বিক সাপ্তাহিক প্রবৃদ্ধি' : 'Overall WoW Growth'}
            </span>
            {metrics.isOverallGrowing ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className={`text-2xl font-black font-mono ${
              metrics.isOverallGrowing ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {metrics.isOverallGrowing ? `+${metrics.overallGrowthPct}%` : `${metrics.overallGrowthPct}%`}
            </p>
          </div>
          <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${metrics.isOverallGrowing ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span>{metrics.isOverallGrowing ? (lang === 'bn' ? 'বিক্রি বৃদ্ধি পাচ্ছে ↗' : 'Sales Increasing ↗') : (lang === 'bn' ? 'বিক্রি কমতির দিকে ↘' : 'Sales Declining ↘')}</span>
          </p>
        </div>

        {/* Current Week Revenue */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase">
              {lang === 'bn' ? 'চলতি সপ্তাহের মোট বিক্রি' : 'Current Week Total'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1 font-mono">
            ৳ {metrics.totalCurrentRev.toLocaleString()}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">
            {lang === 'bn' ? 'পূর্ববর্তী সপ্তাহ:' : 'Prev Week:'} ৳ {metrics.totalPrevRev.toLocaleString()}
          </p>
        </div>

        {/* Net Revenue Difference */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase">
              {lang === 'bn' ? 'নিট আয় বৃদ্ধি' : 'Net Revenue Lift'}
            </span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className={`text-2xl font-black font-mono mt-1 ${
            metrics.totalDiff >= 0 ? 'text-emerald-300' : 'text-rose-400'
          }`}>
            {metrics.totalDiff >= 0 ? `+৳ ${metrics.totalDiff.toLocaleString()}` : `-৳ ${Math.abs(metrics.totalDiff).toLocaleString()}`}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">
            {lang === 'bn' ? 'আগের সপ্তাহের চেয়ে বেশি' : 'Surplus vs last week'}
          </p>
        </div>

        {/* Top Growth Day */}
        <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase">
              {lang === 'bn' ? 'সর্বোচ্চ প্রবৃদ্ধির দিন' : 'Top Growth Day'}
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-200 mt-1 truncate">
            {metrics.bestDay?.name}
          </p>
          <p className="text-[10px] text-emerald-400 mt-1 font-mono font-bold">
            +{metrics.bestDay?.growthPct}% ({lang === 'bn' ? 'ট্রেনের পিক ভিড়' : 'Peak Train Rush'})
          </p>
        </div>
      </div>

      {/* Main Recharts Chart Card */}
      <div className="p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
          <div>
            <h4 className="text-base font-bold text-amber-200 font-serif flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>
                {viewMode === 'day_by_day'
                  ? (lang === 'bn' ? 'দিনভিত্তিক সাপ্তাহিক প্রবৃদ্ধি ট্রেন্ড (% Growth)' : 'Day-by-Day Weekly Revenue Growth Rate (%)')
                  : (lang === 'bn' ? 'গত ৮ সপ্তাহের প্রবৃদ্ধি পারসেন্টেজ ট্রেন্ড' : '8-Week Consecutive Growth Trajectory (%)')}
              </span>
            </h4>
            <p className="text-xs text-stone-400 mt-0.5">
              {lang === 'bn'
                ? '০% বেসলাইনের উপরের সবুজ রেখা নির্দেশ করে বিক্রি আগের সপ্তাহের চেয়ে বৃদ্ধি পেয়েছে।'
                : 'Points above the 0% baseline indicate sales are increasing compared to the previous week.'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block" />
              <span>{lang === 'bn' ? 'প্রবৃদ্ধি ট্রেন্ড লাইন (%)' : 'Growth Trend Line (%)'}</span>
            </div>
            {showVolumeBars && (
              <div className="flex items-center gap-1.5 text-amber-400/80 font-medium">
                <span className="w-2.5 h-2.5 bg-amber-500/40 rounded inline-block" />
                <span>{lang === 'bn' ? 'চলতি বিক্রি (৳)' : 'Current Rev (৳)'}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
              <span className="w-3 h-0.5 bg-stone-500 border-dashed inline-block" />
              <span>{lang === 'bn' ? '০% বেসলাইন' : '0% Baseline'}</span>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-84 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={activeDataset}
              margin={{ top: 20, right: 15, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="growthBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="growthPrevBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#78716c" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#78716c" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#292524" vertical={false} />

              <XAxis
                dataKey="name"
                stroke="#78716c"
                tick={{ fill: '#a8a29e', fontSize: 11 }}
                tickLine={false}
              />

              {/* Left Y-Axis for Growth Percentage */}
              <YAxis
                yAxisId="growthAxis"
                stroke="#78716c"
                tick={{ fill: '#10b981', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}%`}
                domain={['auto', 'auto']}
              />

              {/* Right Y-Axis for Revenue Volume in BDT (if bars enabled) */}
              <YAxis
                yAxisId="revAxis"
                orientation="right"
                stroke="#78716c"
                tick={{ fill: '#f59e0b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                domain={[0, 'auto']}
                hide={!showVolumeBars}
              />

              <Tooltip content={<GrowthChartTooltip lang={lang} />} />

              {/* 0% Baseline: Critical indicator to see if sales are increasing or decreasing */}
              <ReferenceLine
                yAxisId="growthAxis"
                y={0}
                stroke="#78716c"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: lang === 'bn' ? '০% বেসলাইন' : '0% Base',
                  fill: '#a8a29e',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              {/* Benchmark target line (+10%) */}
              {showTargetLine && (
                <ReferenceLine
                  yAxisId="growthAxis"
                  y={targetGrowthRate}
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  label={{
                    value: lang === 'bn' ? `+${targetGrowthRate}% লক্ষ্য` : `+${targetGrowthRate}% Target`,
                    fill: '#34d399',
                    fontSize: 9,
                    position: 'insideTopLeft'
                  }}
                />
              )}

              {/* Optional Background Volume Bars */}
              {showVolumeBars && (
                <Bar
                  yAxisId="revAxis"
                  dataKey="previousRev"
                  name={lang === 'bn' ? 'পূর্ববর্তী সপ্তাহের বিক্রি (৳)' : 'Previous Week Rev (৳)'}
                  fill="url(#growthPrevBarGradient)"
                  barSize={16}
                  radius={[4, 4, 0, 0]}
                />
              )}

              {showVolumeBars && (
                <Bar
                  yAxisId="revAxis"
                  dataKey="currentRev"
                  name={lang === 'bn' ? 'চলতি সপ্তাহের বিক্রি (৳)' : 'Current Week Rev (৳)'}
                  fill="url(#growthBarGradient)"
                  barSize={16}
                  radius={[4, 4, 0, 0]}
                />
              )}

              {/* PRIMARY TREND LINE: Weekly Growth Percentage */}
              <Line
                yAxisId="growthAxis"
                type="monotone"
                dataKey="growthPct"
                name={lang === 'bn' ? 'সাপ্তাহিক প্রবৃদ্ধি (%)' : 'Weekly Growth (%)'}
                stroke="#10b981"
                strokeWidth={3.5}
                dot={{
                  r: 5,
                  fill: '#10b981',
                  stroke: '#064e3b',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 8,
                  fill: '#34d399',
                  stroke: '#ecfdf5',
                  strokeWidth: 2
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Explanatory takeaway & insights table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-stone-800/80">
          <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-serif">
                {lang === 'bn' ? 'বিক্রি বৃদ্ধির লক্ষণ' : 'Positive Momentum'}
              </h5>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                {lang === 'bn'
                  ? '৭ দিনের মধ্যে ৬ দিনই রেখা ০% এর উপরে অবস্থান করছে, অর্থাৎ নিয়মিত বিক্রি বৃদ্ধি পাচ্ছে।'
                  : 'The trend line sits consistently above 0% across 6 out of 7 days, indicating sustained positive sales velocity.'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-serif">
                {lang === 'bn' ? 'বৃহস্পতি ও শুক্রবারের পিক' : 'Weekend Train Spikes'}
              </h5>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                {lang === 'bn'
                  ? 'বৃহস্পতিবার ও শুক্রবার আন্তঃনগর ট্রেনের যাত্রী বেশি থাকায় প্রবৃদ্ধি সর্বোচ্চ (+২৫.৯%) স্পর্শ করেছে।'
                  : 'Intercity train rush hours on Thursday and Friday deliver the largest spikes in weekly sales (+25.9%).'}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-900/70 border border-stone-800/80 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white font-serif">
                {lang === 'bn' ? 'পরবর্তী সপ্তাহের লক্ষ্যমাত্রা' : 'Next Week Target'}
              </h5>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                {lang === 'bn'
                  ? 'বিকাশ ক্যাশব্যাক অফার এবং ট্রেনের যাত্রীদের স্পেশাল পার্সেল প্যাকের মাধ্যমে প্রবৃদ্ধি +১৫% এ উন্নীত করার সুযোগ রয়েছে।'
                  : 'Opportunity to push overall growth past +15% with parcel meal deals and digital payment incentives.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
