import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Crown, 
  Medal, 
  Award, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Star, 
  Zap, 
  ShieldCheck, 
  Gift, 
  Utensils, 
  ChevronRight, 
  X, 
  Share2, 
  ArrowUpRight, 
  CheckCircle2, 
  Info,
  Calendar,
  Sparkle,
  QrCode,
  ShoppingBag,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaderboardCustomer, UserProfile, LoyaltyTier } from '../types';
import { INITIAL_LEADERBOARD_CUSTOMERS } from '../data/initialData';

interface LoyaltyLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  lang: 'bn' | 'en';
  onOrderNowClick?: () => void;
  onOpenAccountPass?: () => void;
}

export const LoyaltyLeaderboardModal: React.FC<LoyaltyLeaderboardModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
  onOrderNowClick,
  onOpenAccountPass,
}) => {
  const [activeTab, setActiveTab] = useState<'top5' | 'rewards' | 'howToEarn'>('top5');
  const [copiedShare, setCopiedShare] = useState(false);

  // Compute merged leaderboard with current logged-in user dynamically
  const { top5Customers, currentUserRank, nextCustomerAhead, pointsToNextRank } = useMemo(() => {
    // Current user's points
    const userPoints = user?.loyaltyPoints || 0;
    const userOrders = user?.totalOrdersCount || 0;

    // Create copy of initial leaderboard customers
    const baseList: LeaderboardCustomer[] = INITIAL_LEADERBOARD_CUSTOMERS.map((c) => ({ ...c }));

    // Check if user is already one of the names or we should insert user
    const existingIndex = baseList.findIndex(
      (c) => c.phoneMasked === user.phone || c.id === user.id || c.name.toLowerCase() === user.name.toLowerCase()
    );

    let mergedList: LeaderboardCustomer[] = [];

    if (existingIndex >= 0) {
      baseList[existingIndex] = {
        ...baseList[existingIndex],
        name: user.name,
        points: Math.max(baseList[existingIndex].points, userPoints),
        ordersCount: Math.max(baseList[existingIndex].ordersCount, userOrders),
        tier: user.loyaltyTier || baseList[existingIndex].tier,
        avatar: user.photoURL || user.avatar || baseList[existingIndex].avatar,
        isCurrentUser: true,
      };
      mergedList = baseList;
    } else {
      // Create user entry
      const userEntry: LeaderboardCustomer = {
        id: user.id || 'current-user',
        rank: 99,
        name: user.name || (lang === 'bn' ? 'আপনি (বর্তমান ব্যবহারকারী)' : 'You'),
        phoneMasked: user.phone ? `${user.phone.slice(0, 5)}-***${user.phone.slice(-3)}` : '017**-***000',
        avatar: user.photoURL || user.avatar,
        points: userPoints,
        ordersCount: userOrders,
        tier: user.loyaltyTier || 'bronze',
        favoriteFoodBn: 'স্পেশাল ভুনা খিচুড়ি ও গরম জিলাপি',
        favoriteFoodEn: 'Special Khichuri & Hot Jilapi',
        badgeBn: '🌟 এক্টিভ ক্লায়েন্ট',
        badgeEn: 'Active Member',
        rewardBn: 'পরবর্তী অর্ডারে ১০% পয়েন্ট ব্যাক',
        rewardEn: '10% Cashback Points on next order',
        streakDays: Math.min(userOrders, 5),
        isCurrentUser: true,
      };
      mergedList = [...baseList, userEntry];
    }

    // Sort descending by points, then by ordersCount
    mergedList.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.ordersCount - a.ordersCount;
    });

    // Re-assign ranks 1..N
    mergedList = mergedList.map((c, idx) => ({
      ...c,
      rank: idx + 1,
    }));

    // Find current user's computed rank
    const myIndex = mergedList.findIndex((c) => c.isCurrentUser);
    const myRank = myIndex >= 0 ? mergedList[myIndex].rank : 6;
    const ahead = myIndex > 0 ? mergedList[myIndex - 1] : null;
    const diff = ahead ? Math.max(ahead.points - userPoints + 1, 5) : 0;

    // Take top 5
    const top5 = mergedList.slice(0, 5);

    return {
      top5Customers: top5,
      currentUserRank: myRank,
      nextCustomerAhead: ahead,
      pointsToNextRank: diff,
    };
  }, [user, lang]);

  if (!isOpen) return null;

  const handleConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#fbbf24', '#fef08a', '#10b981'],
      });
    } catch {
      // ignore
    }
  };

  const handleShare = () => {
    const text = `🏆 হোটেল আল শেখ ফরিদ লয়ালটি লিডারবোর্ড! শীর্ষ কাস্টমারদের মধ্যে সেরা খাবার অর্ডার করে পয়েন্ট জিতুন। আমার অবস্থান: #${currentUserRank} (${user?.loyaltyPoints || 0} পয়েন্ট)। এখনই খাবার অর্ডার করুন: https://al-sheikh-farid.web.app`;
    if (navigator.share) {
      navigator.share({
        title: 'হোটেল আল শেখ ফরিদ লয়ালটি লিডারবোর্ড',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          icon: <Trophy className="w-5 h-5 text-amber-300" />,
          title: lang === 'bn' ? '১ম স্থান' : '1st Place',
          color: 'from-amber-400 via-yellow-500 to-amber-600',
          textColor: 'text-amber-300',
          bgBorder: 'border-amber-400/80 shadow-amber-500/30',
          podiumHeight: 'h-36 sm:h-44',
          label: 'Champion',
          order: 'order-2', // Center in podium
        };
      case 2:
        return {
          icon: <Medal className="w-4 h-4 text-slate-200" />,
          title: lang === 'bn' ? '২য় স্থান' : '2nd Place',
          color: 'from-slate-300 via-slate-400 to-slate-500',
          textColor: 'text-slate-200',
          bgBorder: 'border-slate-300/80 shadow-slate-400/20',
          podiumHeight: 'h-28 sm:h-36',
          label: '2nd Rank',
          order: 'order-1', // Left in podium
        };
      case 3:
        return {
          icon: <Medal className="w-4 h-4 text-amber-600" />,
          title: lang === 'bn' ? '৩য় স্থান' : '3rd Place',
          color: 'from-amber-700 via-amber-800 to-orange-900',
          textColor: 'text-amber-400',
          bgBorder: 'border-amber-700/80 shadow-amber-700/20',
          podiumHeight: 'h-24 sm:h-32',
          label: '3rd Rank',
          order: 'order-3', // Right in podium
        };
      default:
        return {
          icon: <Star className="w-4 h-4 text-amber-400" />,
          title: `${rank}th`,
          color: 'from-stone-700 to-stone-800',
          textColor: 'text-stone-300',
          bgBorder: 'border-stone-700 shadow-none',
          podiumHeight: 'h-16',
          label: 'Top 5',
          order: '',
        };
    }
  };

  const getTierColor = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'platinum':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/50';
      case 'gold':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      case 'silver':
        return 'bg-slate-900/90 text-slate-300 border-slate-400/50';
      case 'bronze':
      default:
        return 'bg-orange-950/80 text-orange-300 border-orange-600/50';
    }
  };

  // Podium top 3 items
  const firstCustomer = top5Customers[0];
  const secondCustomer = top5Customers[1];
  const thirdCustomer = top5Customers[2];
  const restCustomers = top5Customers.slice(3);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-stone-950 rounded-3xl border border-amber-500/40 text-stone-100 shadow-2xl overflow-hidden relative flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Header Banner */}
        <div className="relative bg-gradient-to-r from-stone-900 via-amber-950/70 to-stone-900 p-5 sm:p-6 border-b border-amber-500/30">
          <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-serif text-white tracking-wide">
                    {lang === 'bn' ? 'লয়ালটি লিডারবোর্ড' : 'Loyalty Leaderboard'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> TOP 5
                  </span>
                </div>
                <p className="text-xs text-stone-300">
                  {lang === 'bn' 
                    ? 'হোটেল আল শেখ ফরিদের শীর্ষ ৫ নিয়মিত ও সম্মানিত কাস্টমার' 
                    : 'Top 5 Most Loyal Customers of Hotel Al Sheikh Farid'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 border border-stone-700 transition-colors"
                title={lang === 'bn' ? 'লিডারবোর্ড শেয়ার করুন' : 'Share Leaderboard'}
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('top5')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'top5'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'শীর্ষ ৫ র‍্যাঙ্কিং' : 'Top 5 Rank'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rewards')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'rewards'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পুরস্কার ও ভাউচার' : 'Prizes & Perks'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('howToEarn')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'howToEarn'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'bg-stone-900/90 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পয়েন্ট অর্জন নিয়ম' : 'How to Earn'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
          {copiedShare && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'লিডারবোর্ড লিংক ক্লিপবোর্ডে কপি করা হয়েছে!' : 'Leaderboard link copied to clipboard!'}</span>
            </div>
          )}

          {/* TAB 1: TOP 5 RANKINGS & PODIUM */}
          {activeTab === 'top5' && (
            <>
              {/* CURRENT USER STATUS CALLOUT */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0 bg-stone-900 flex items-center justify-center">
                    {user?.photoURL || user?.avatar ? (
                      <img src={user.photoURL || user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-amber-300 text-sm">{user?.name?.slice(0, 2).toUpperCase() || 'ইউ'}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-serif">{user?.name || 'গ্রাহক'}</h4>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {lang === 'bn' ? `আপনার র‍্যাঙ্ক: #${currentUserRank}` : `Your Rank: #${currentUserRank}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Coins className="w-3.5 h-3.5 text-amber-400" /> {user?.loyaltyPoints || 0} পয়েন্টস
                      </span>
                      <span>•</span>
                      <span>{user?.totalOrdersCount || 0} টি অর্ডার</span>
                    </div>
                  </div>
                </div>

                {nextCustomerAhead && (
                  <div className="w-full sm:w-auto text-left sm:text-right bg-stone-950/60 sm:bg-transparent p-2 sm:p-0 rounded-xl border border-stone-800 sm:border-none">
                    <p className="text-[11px] text-amber-200 font-medium">
                      🔥 {lang === 'bn' ? `আর মাত্র ${pointsToNextRank} পয়েন্ট হলে র‍্যাঙ্ক #${nextCustomerAhead.rank} এ পৌঁছাবেন!` : `Only ${pointsToNextRank} more pts to reach Rank #${nextCustomerAhead.rank}!`}
                    </p>
                    <p className="text-[10px] text-stone-400">
                      {lang === 'bn' ? 'একটি সুস্বাদু খাবার অর্ডার করলেই পয়েন্ট যোগ হবে' : 'Order a meal to instantly level up'}
                    </p>
                  </div>
                )}
              </div>

              {/* TOP 3 PODIUM DISPLAY */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    {lang === 'bn' ? 'শীর্ষ ৩ চ্যাম্পিয়ন পডিয়াম' : 'Top 3 Champions Podium'}
                  </h3>
                  <span className="text-[10px] text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" /> {lang === 'bn' ? 'লাইভ রিফ্রেশ' : 'Live Updated'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-6 pb-2">
                  {/* 2nd Place (Silver) */}
                  {secondCustomer && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2 flex flex-col items-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-slate-300 overflow-hidden shadow-lg bg-stone-800">
                          <img src={secondCustomer.avatar} alt={secondCustomer.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 bg-gradient-to-r from-slate-300 to-slate-400 text-stone-950 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md">
                          #2
                        </div>
                      </div>
                      
                      <div className="text-center w-full">
                        <p className="text-xs font-bold text-white truncate max-w-[100px] mx-auto">{secondCustomer.name.split(' ')[0]}</p>
                        <p className="text-[11px] font-black text-amber-300">{secondCustomer.points} pts</p>
                      </div>

                      {/* Podium Stand */}
                      <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-b from-slate-700/80 to-stone-900 border-t-2 border-x-2 border-slate-400/70 p-2 flex flex-col items-center justify-start mt-2 shadow-inner">
                        <Medal className="w-4 h-4 text-slate-300 mt-1" />
                        <span className="text-[10px] font-bold text-slate-200 uppercase mt-0.5">Silver</span>
                        <span className="text-[9px] text-stone-400 mt-1">{secondCustomer.ordersCount} orders</span>
                      </div>
                    </div>
                  )}

                  {/* 1st Place (Gold Champion) */}
                  {firstCustomer && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2 flex flex-col items-center">
                        <Crown className="w-6 h-6 text-amber-300 animate-pulse -mb-1" />
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 border-amber-400 overflow-hidden shadow-xl shadow-amber-500/30 bg-stone-800 ring-4 ring-amber-500/20">
                          <img src={firstCustomer.avatar} alt={firstCustomer.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-600 text-stone-950 font-black text-xs px-2.5 py-0.5 rounded-full shadow-lg">
                          #1 👑
                        </div>
                      </div>

                      <div className="text-center w-full">
                        <p className="text-xs sm:text-sm font-bold text-amber-200 truncate max-w-[120px] mx-auto">{firstCustomer.name.split(' ')[0]}</p>
                        <p className="text-xs sm:text-sm font-black text-amber-400">{firstCustomer.points} pts</p>
                      </div>

                      {/* Podium Stand */}
                      <div className="w-full h-32 sm:h-36 rounded-t-2xl bg-gradient-to-b from-amber-600/90 via-amber-700/60 to-stone-900 border-t-2 border-x-2 border-amber-400 p-2 flex flex-col items-center justify-start mt-2 shadow-2xl shadow-amber-500/30">
                        <Trophy className="w-5 h-5 text-amber-200 mt-1 animate-bounce" />
                        <span className="text-[10px] font-black text-amber-100 uppercase tracking-wider mt-0.5">Champion</span>
                        <span className="text-[9px] text-amber-200 mt-1">{firstCustomer.ordersCount} orders</span>
                        <span className="text-[8px] bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 mt-1">৳৫০০ ভাউচার</span>
                      </div>
                    </div>
                  )}

                  {/* 3rd Place (Bronze) */}
                  {thirdCustomer && (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-2 flex flex-col items-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 border-amber-700 overflow-hidden shadow-lg bg-stone-800">
                          <img src={thirdCustomer.avatar} alt={thirdCustomer.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-100 font-black text-[10px] sm:text-xs px-2 py-0.5 rounded-full shadow-md">
                          #3
                        </div>
                      </div>

                      <div className="text-center w-full">
                        <p className="text-xs font-bold text-white truncate max-w-[100px] mx-auto">{thirdCustomer.name.split(' ')[0]}</p>
                        <p className="text-[11px] font-black text-amber-300">{thirdCustomer.points} pts</p>
                      </div>

                      {/* Podium Stand */}
                      <div className="w-full h-20 sm:h-24 rounded-t-2xl bg-gradient-to-b from-stone-800 to-stone-950 border-t-2 border-x-2 border-amber-800/80 p-2 flex flex-col items-center justify-start mt-2 shadow-inner">
                        <Medal className="w-4 h-4 text-amber-600 mt-1" />
                        <span className="text-[10px] font-bold text-amber-400 uppercase mt-0.5">Bronze</span>
                        <span className="text-[9px] text-stone-400 mt-1">{thirdCustomer.ordersCount} orders</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* DETAILED CARDS FOR ALL TOP 5 CUSTOMERS */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  {lang === 'bn' ? 'শীর্ষ ৫ কাস্টমার তালিকা ও পছন্দের খাবার' : 'Top 5 Customer Profiles & Fav Food'}
                </h4>

                {top5Customers.map((cust) => {
                  const rankInfo = getRankBadge(cust.rank);
                  const isCurrent = cust.isCurrentUser;

                  return (
                    <div
                      key={cust.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-950/50 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                          : 'bg-stone-900/80 border-stone-800 hover:border-amber-500/40 hover:bg-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Rank Badge Indicator */}
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${rankInfo.color} text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md`}>
                          #{cust.rank}
                        </div>

                        {/* Customer Avatar */}
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-stone-700 bg-stone-800 shrink-0">
                          {cust.avatar ? (
                            <img src={cust.avatar} alt={cust.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-amber-300 text-xs">
                              {cust.name.slice(0, 2)}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white font-serif">
                              {cust.name}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-stone-950">
                                {lang === 'bn' ? 'আপনি' : 'YOU'}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getTierColor(cust.tier)} capitalize`}>
                              {cust.tier}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                            <span className="text-stone-300 font-medium">📞 {cust.phoneMasked}</span>
                            <span>•</span>
                            <span className="text-amber-300 font-bold">{cust.ordersCount} টি অর্ডার</span>
                          </div>
                        </div>
                      </div>

                      {/* Favorite Food and Points Stats */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] text-stone-300 flex items-center gap-1">
                            <Utensils className="w-3 h-3 text-amber-400" />
                            <span className="line-clamp-1">{cust.favoriteFoodBn}</span>
                          </p>
                          <p className="text-[10px] text-emerald-400 font-medium">{cust.rewardBn}</p>
                        </div>

                        <div className="bg-stone-950 px-3 py-1.5 rounded-xl border border-amber-500/30 text-center shrink-0">
                          <div className="flex items-center gap-1 text-amber-400 font-black text-sm">
                            <Coins className="w-3.5 h-3.5 text-amber-400" />
                            <span>{cust.points}</span>
                          </div>
                          <span className="text-[9px] text-stone-400 uppercase font-semibold">Points</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* TAB 2: PRIZES & MONTHLY REWARDS */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-900/40 via-stone-900 to-amber-900/40 border border-amber-500/40 text-center space-y-1.5">
                <Crown className="w-7 h-7 text-amber-400 mx-auto" />
                <h3 className="text-base font-bold text-white font-serif">
                  {lang === 'bn' ? 'চলতি মাসের লয়ালটি লিডারবোর্ড পুরস্কার পুল' : 'Monthly Leaderboard Prize Pool'}
                </h3>
                <p className="text-xs text-stone-300 max-w-md mx-auto">
                  {lang === 'bn'
                    ? 'প্রতি মাসের শেষ দিনে শীর্ষ ৫ লয়াল কাস্টমারদের জন্য থাকছে আকর্ষণীয় ফ্রি ভাউচার ও স্পেশাল রেস্টুরেন্ট প্রিভিলেজ।'
                    : 'At the end of every month, top 5 customers unlock free food vouchers and exclusive restaurant privileges.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1st Prize */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/60 to-stone-900 border-2 border-amber-400/80 shadow-lg shadow-amber-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-stone-950">
                      🏆 ১ম স্থান পুরস্কার
                    </span>
                    <span className="text-sm font-black text-amber-300">৳৫০০ ভাউচার</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">গ্র্যান্ড চ্যাম্পিয়ন ডিনার প্যাকেজ</h4>
                  <ul className="text-xs text-stone-300 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>৳৫০০ সমমূল্যের যেকোনো খাবার সম্পূর্ণ ফ্রি</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>প্ল্যাটফর্ম ট্রেন ভিউ বা ভিআইপি এসি কেবিনে রিজার্ভেশন অগ্রাধিকার</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>প্লাটিনাম মেম্বারশিপ ডিজিটাল গোল্ড ব্যাজ</span>
                    </li>
                  </ul>
                </div>

                {/* 2nd Prize */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-slate-300/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-300 text-stone-950">
                      🥈 ২য় স্থান পুরস্কার
                    </span>
                    <span className="text-sm font-black text-slate-200">৳৩০০ ভাউচার</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">স্পেশাল গোরমেট রিওয়ার্ড</h4>
                  <ul className="text-xs text-stone-300 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                      <span>৳৩০০ সমমূল্যের খাবার অথবা স্পেশাল ১ কেজি জিলাপি ফ্রি</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-300" />
                      <span>পরবর্তী সকল অর্ডারে ১০% অতিরিক্ত পয়েন্ট ক্যাশব্যাক</span>
                    </li>
                  </ul>
                </div>

                {/* 3rd Prize */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-amber-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-700 text-amber-100">
                      🥉 ৩য় স্থান পুরস্কার
                    </span>
                    <span className="text-sm font-black text-amber-400">৳১৫০ ভাউচার</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">ফুডি হিরো রিওয়ার্ড</h4>
                  <ul className="text-xs text-stone-300 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>৳১৫০ টাকার জিলাপি / খিচুড়ি কম্বো ফ্রি</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>গোল্ডেন মেম্বারশিপ এক্সেস</span>
                    </li>
                  </ul>
                </div>

                {/* 4th & 5th Prize */}
                <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-800 text-stone-300">
                      ⭐ ৪র্থ ও ৫ম স্থান
                    </span>
                    <span className="text-sm font-bold text-amber-300">৫০ বোনাস pts</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">স্টার প্যাট্রন রিওয়ার্ড</h4>
                  <ul className="text-xs text-stone-300 space-y-1.5">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>৫০ বোনাস লয়ালটি পয়েন্ট সরাসরি অ্যাকাউন্টে</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>৳৫০ টাকার ইনস্ট্যান্ট ক্যাশ ডিসকাউন্ট ভাউচার</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO EARN POINTS & CLIMB */}
          {activeTab === 'howToEarn' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-900 border border-amber-500/30 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {lang === 'bn' ? 'কীভাবে দ্রুত পয়েন্ট অর্জন করে শীর্ষে উঠবেন?' : 'How to Earn Points & Climb Fast'}
                </h4>
                
                <div className="space-y-2.5 text-xs text-stone-300">
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-white">প্রতিটি অর্ডারে ১০% পয়েন্ট ক্যাশব্যাক</p>
                      <p className="text-stone-400 text-[11px]">প্রতি ১০০ টাকার অনলাইন ডেলিভারি, পার্সেল বা কাউন্টার ডাইন-ইন অর্ডারে ১০ লয়ালটি পয়েন্ট পাবেন।</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-white">অর্ডার স্ট্রিক ধারাবাহিকতা বোনাস</p>
                      <p className="text-stone-400 text-[11px]">টানা ৩ দিন যেকোনো খাবার অর্ডার করলে অতিরিক্ত ২৫ বোনাস পয়েন্ট এবং টানা ৭ দিনে ৫০ বোনাস পয়েন্ট।</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-white">ডিজিটাল মেম্বারশিপ কিউআর কাউন্টারে স্ক্যান</p>
                      <p className="text-stone-400 text-[11px]">হোটেল আল শেখ ফরিদের ক্যাশ কাউন্টারে খাবার পেমেন্টের সময় আপনার পার্সোনাল কিউআর কোড স্ক্যান করিয়ে ইনস্ট্যান্ট পয়েন্ট যোগ করুন।</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Point Value Note */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-2.5">
                <Coins className="w-5 h-5 text-amber-400 shrink-0" />
                <p>
                  <span className="font-bold text-white">পয়েন্ট ব্যবহারের সুবিধা:</span> অর্জিত পয়েন্ট দিয়ে পরবর্তী যেকোনো অর্ডারে ক্যাশ ডিসকাউন্ট নেওয়া যাবে (১ পয়েন্ট = ১ টাকা সমতুল্য ডিসকাউন্ট রিডিম)।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-5 bg-stone-900 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onOpenAccountPass && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAccountPass();
                }}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? 'আমার পাস ও কিউআর কোড' : 'My Pass & QR'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleConfetti}
              className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 cursor-pointer"
              title="চিয়ার্স করুন"
            >
              🎉
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOrderNowClick();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-stone-950" />
            <span>{lang === 'bn' ? 'এখনই অর্ডার করুন ও পয়েন্ট বাড়ান' : 'Order Now & Boost Points'}</span>
            <ChevronRight className="w-4 h-4 text-stone-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
