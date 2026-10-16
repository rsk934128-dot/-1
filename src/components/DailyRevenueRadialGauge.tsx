import React, { useMemo } from 'react';
import { 
  Target, 
  Trophy, 
  Sparkles, 
  ArrowUpRight, 
  Edit3, 
  TrendingUp,
  CheckCircle2,
  Zap
} from 'lucide-react';

export interface DailyRevenueRadialGaugeProps {
  currentRevenue: number;
  targetGoal: number;
  lang?: 'bn' | 'en';
  onEditGoal?: () => void;
  className?: string;
  isCompact?: boolean;
}

export const DailyRevenueRadialGauge: React.FC<DailyRevenueRadialGaugeProps> = ({
  currentRevenue,
  targetGoal,
  lang = 'bn',
  onEditGoal,
  className = '',
  isCompact = false
}) => {
  // Goal & progress calculations
  const {
    progressPercent,
    clampedPercent,
    isGoalAchieved,
    remainingAmount,
    surplusAmount,
    statusColor,
    statusLabelBn,
    statusLabelEn
  } = useMemo(() => {
    const rawPct = targetGoal > 0 ? (currentRevenue / targetGoal) * 100 : 0;
    const roundedPct = Math.round(rawPct * 10) / 10;
    const clamped = Math.min(Math.max(roundedPct, 0), 100);
    const achieved = currentRevenue >= targetGoal;
    const remaining = Math.max(targetGoal - currentRevenue, 0);
    const surplus = Math.max(currentRevenue - targetGoal, 0);

    let color = '#f59e0b'; // amber-500 default
    let labelBn = 'শুরু হয়েছে';
    let labelEn = 'In Progress';

    if (achieved) {
      color = '#10b981'; // emerald-500
      labelBn = 'লক্ষ্যমাত্রা অর্জিত! 🏆';
      labelEn = 'Target Achieved! 🏆';
    } else if (roundedPct >= 80) {
      color = '#06b6d4'; // cyan-500
      labelBn = 'লক্ষ্যের খুব কাছে ⚡';
      labelEn = 'Near Target ⚡';
    } else if (roundedPct >= 50) {
      color = '#eab308'; // yellow-500
      labelBn = 'অর্ধেক সম্পন্ন';
      labelEn = 'Halfway There';
    } else if (roundedPct > 0) {
      color = '#f97316'; // orange-500
      labelBn = 'চলমান অগ্রগতি';
      labelEn = 'Pacing Up';
    }

    return {
      progressPercent: roundedPct,
      clampedPercent: clamped,
      isGoalAchieved: achieved,
      remainingAmount: remaining,
      surplusAmount: surplus,
      statusColor: color,
      statusLabelBn: labelBn,
      statusLabelEn: labelEn
    };
  }, [currentRevenue, targetGoal]);

  // SVG Geometry for a 180-degree semi-circular gauge
  const cx = 150;
  const cy = 130;
  const radius = 95;
  const strokeWidth = 14;

  // Arc length of a 180-degree semi-circle: pi * r
  const arcLength = Math.PI * radius; // ~298.45
  const strokeDashoffset = arcLength * (1 - clampedPercent / 100);

  // Needle pointer math (from 0% left to 100% right)
  // At 0%: angle = 0 rad, needle points left (cx - r, cy)
  // At 50%: angle = pi/2 rad, needle points up (cx, cy - r)
  // At 100%: angle = pi rad, needle points right (cx + r, cy)
  const needleAngleRad = (clampedPercent / 100) * Math.PI;
  const needleLength = radius - 16;
  const needleTipX = cx - needleLength * Math.cos(needleAngleRad);
  const needleTipY = cy - needleLength * Math.sin(needleAngleRad);

  // Base needle width for tapered needle polygon
  const baseOffset = 5;
  const needleBaseLeftX = cx - baseOffset * Math.sin(needleAngleRad);
  const needleBaseLeftY = cy + baseOffset * Math.cos(needleAngleRad);
  const needleBaseRightX = cx + baseOffset * Math.sin(needleAngleRad);
  const needleBaseRightY = cy - baseOffset * Math.cos(needleAngleRad);

  // Milestone ticks data (0%, 25%, 50%, 75%, 100%)
  const milestones = useMemo(() => {
    return [
      { pct: 0, label: '০%', labelEn: '0%', val: 0 },
      { pct: 25, label: '২৫%', labelEn: '25%', val: Math.round(targetGoal * 0.25) },
      { pct: 50, label: '৫০%', labelEn: '50%', val: Math.round(targetGoal * 0.5) },
      { pct: 75, label: '৭৫%', labelEn: '75%', val: Math.round(targetGoal * 0.75) },
      { pct: 100, label: '১০০%', labelEn: '100%', val: targetGoal }
    ];
  }, [targetGoal]);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Gauge SVG Container */}
      <div className="relative w-full max-w-[300px] flex items-center justify-center">
        <svg
          viewBox="0 0 300 170"
          className="w-full h-auto drop-shadow-md overflow-visible"
          aria-label={`Daily Revenue Goal Progress: ${progressPercent}%`}
        >
          <defs>
            {/* Ambient track filter */}
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4" />
            </filter>

            {/* Glowing active arc filter */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow 
                dx="0" 
                dy="0" 
                stdDeviation="4" 
                floodColor={isGoalAchieved ? '#10b981' : '#f59e0b'} 
                floodOpacity="0.5" 
              />
            </filter>

            {/* Gradient for progress arc: Amber to Gold to Emerald */}
            <linearGradient id="gaugeProgressGradient" x1="0%" y1="100%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="45%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>

            {/* Needle gradient */}
            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={isGoalAchieved ? '#10b981' : '#f59e0b'} />
            </linearGradient>
          </defs>

          {/* Background Semi-Circle Track */}
          {/* Path: M 55 130 A 95 95 0 0 1 245 130 */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#292524"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all"
          />

          {/* Inner decorative groove line */}
          <path
            d={`M ${cx - radius + 14} ${cy} A ${radius - 14} ${radius - 14} 0 0 1 ${cx + radius - 14} ${cy}`}
            fill="none"
            stroke="#1c1917"
            strokeWidth="2"
            strokeDasharray="3 4"
            opacity="0.7"
          />

          {/* Milestone Tick Lines on Arc */}
          {milestones.map((m) => {
            const rad = (m.pct / 100) * Math.PI;
            const innerR = radius - 12;
            const outerR = radius + 6;
            const x1 = cx - innerR * Math.cos(rad);
            const y1 = cy - innerR * Math.sin(rad);
            const x2 = cx - outerR * Math.cos(rad);
            const y2 = cy - outerR * Math.sin(rad);

            const isCurrentMilestone = clampedPercent >= m.pct;

            return (
              <g key={`tick-${m.pct}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCurrentMilestone ? (isGoalAchieved ? '#10b981' : '#f59e0b') : '#57534e'}
                  strokeWidth={m.pct === 0 || m.pct === 50 || m.pct === 100 ? '2.5' : '1.5'}
                  opacity={isCurrentMilestone ? 1 : 0.6}
                />
              </g>
            );
          })}

          {/* Active Progress Semi-Circle Arc */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#gaugeProgressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            filter="url(#arcGlow)"
            className="transition-all duration-700 ease-out"
          />

          {/* Target 100% Goal Marker Bead */}
          <circle
            cx={cx + radius}
            cy={cy}
            r={isGoalAchieved ? 5 : 3.5}
            fill={isGoalAchieved ? '#10b981' : '#78716c'}
            stroke="#0c0a09"
            strokeWidth="2"
          />

          {/* Needle Pointer Polygon */}
          <polygon
            points={`${needleBaseLeftX},${needleBaseLeftY} ${needleTipX},${needleTipY} ${needleBaseRightX},${needleBaseRightY}`}
            fill="url(#needleGradient)"
            filter="url(#gaugeShadow)"
            className="transition-all duration-700 ease-out"
          />

          {/* Needle Center Pivot Hub */}
          <circle
            cx={cx}
            cy={cy}
            r="11"
            fill="#1c1917"
            stroke={isGoalAchieved ? '#10b981' : '#f59e0b'}
            strokeWidth="2.5"
            filter="url(#gaugeShadow)"
          />
          <circle
            cx={cx}
            cy={cy}
            r="4.5"
            fill={isGoalAchieved ? '#34d399' : '#fbbf24'}
          />

          {/* Radial Needle Tip Indicator Bead */}
          <circle
            cx={needleTipX}
            cy={needleTipY}
            r="3"
            fill="#ffffff"
            className="animate-pulse"
          />

          {/* Milestone Min/Mid/Max Labels in SVG */}
          <text
            x={cx - radius - 2}
            y={cy + 18}
            textAnchor="middle"
            fill="#78716c"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {lang === 'bn' ? '০%' : '0%'}
          </text>
          <text
            x={cx}
            y={cy - radius - 10}
            textAnchor="middle"
            fill="#a8a29e"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {lang === 'bn' ? '৫০%' : '50%'}
          </text>
          <text
            x={cx + radius + 4}
            y={cy + 18}
            textAnchor="middle"
            fill={isGoalAchieved ? '#34d399' : '#a8a29e'}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {lang === 'bn' ? '১০০%' : '100%'}
          </text>
        </svg>

        {/* Central Readout inside the Semi-circle Arc */}
        <div className="absolute top-[68px] flex flex-col items-center text-center pointer-events-none">
          {/* Percentage Value */}
          <div className="flex items-baseline gap-0.5">
            <span 
              className="text-3xl sm:text-4xl font-black font-mono tracking-tight leading-none drop-shadow-md"
              style={{ color: statusColor }}
            >
              {progressPercent}%
            </span>
            {isGoalAchieved && (
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
            )}
          </div>

          {/* Status Badge */}
          <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 mt-1 rounded-full border flex items-center gap-1 ${
            isGoalAchieved 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs shadow-emerald-500/20' 
              : 'bg-stone-900/90 text-amber-300 border-amber-500/40'
          }`}>
            {isGoalAchieved ? (
              <Trophy className="w-2.5 h-2.5 shrink-0" />
            ) : (
              <Target className="w-2.5 h-2.5 shrink-0" />
            )}
            <span>{lang === 'bn' ? statusLabelBn : statusLabelEn}</span>
          </span>
        </div>
      </div>

      {/* Revenue Progress Breakdown Text */}
      <div className="w-full mt-1 px-2 flex flex-col items-center">
        {/* Live Amount vs Goal */}
        <div className="flex items-center justify-between w-full max-w-[260px] text-xs font-mono">
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-sans text-stone-400">
              {lang === 'bn' ? 'আজকের বিক্রয়' : 'Current Sales'}
            </span>
            <span className="font-bold text-amber-400 text-sm">
              ৳ {currentRevenue.toLocaleString()}
            </span>
          </div>

          <div className="h-6 w-[1px] bg-stone-800" />

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-sans text-stone-400">
              {lang === 'bn' ? 'দৈনিক লক্ষ্যমাত্রা' : 'Daily Goal'}
            </span>
            <span className="font-bold text-stone-200 text-sm">
              ৳ {targetGoal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Remaining or Surplus Status Pill */}
        <div className="mt-2.5 w-full max-w-[260px]">
          {isGoalAchieved ? (
            <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'অতিরিক্ত উদ্বৃত্ত:' : 'Goal Surplus:'}</span>
              </span>
              <span className="font-bold font-mono text-emerald-300">
                +৳ {surplusAmount.toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-stone-900/80 border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-medium flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'লক্ষ্য ছুঁতে বাকি:' : 'Needed to Target:'}</span>
              </span>
              <span className="font-bold font-mono text-amber-400">
                ৳ {remainingAmount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Milestone Quick Steps (25%, 50%, 75%, 100%) */}
        {!isCompact && (
          <div className="grid grid-cols-4 gap-1.5 w-full max-w-[260px] mt-2.5">
            {milestones.slice(1).map((m) => {
              const reached = currentRevenue >= m.val;
              return (
                <div
                  key={`step-${m.pct}`}
                  className={`px-1.5 py-1 rounded-lg border text-center transition-all ${
                    reached 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' 
                      : 'bg-stone-900/40 border-stone-800 text-stone-500 font-normal'
                  }`}
                  title={`Milestone ${m.pct}% = ৳${m.val.toLocaleString()}`}
                >
                  <p className="text-[10px] font-mono leading-none">{m.pct}%</p>
                  <p className="text-[9px] font-mono mt-0.5 text-stone-400 truncate">
                    ৳{m.val >= 1000 ? `${(m.val / 1000).toFixed(1)}k` : m.val}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Edit Goal Button if passed */}
        {onEditGoal && (
          <button
            type="button"
            onClick={onEditGoal}
            className="mt-3 text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold hover:underline cursor-pointer transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>{lang === 'bn' ? 'লক্ষ্যমাত্রা পরিবর্তন করুন' : 'Change Target Goal'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
