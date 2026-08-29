import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  CheckCheck, 
  Maximize2, 
  Download, 
  Scan, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  X, 
  Loader2, 
  CheckCircle2, 
  Coins, 
  Sun,
  Award,
  Crown,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, LoyaltyTier } from '../types';

export interface LoyaltyQRCodeProps {
  user: UserProfile;
  lang: 'bn' | 'en';
  variant?: 'card' | 'compact' | 'full';
  showSimulation?: boolean;
  onPointsUpdate?: (newPoints: number, reasonBn: string, reasonEn: string) => void;
  className?: string;
}

export const LoyaltyQRCode: React.FC<LoyaltyQRCodeProps> = ({
  user,
  lang = 'bn',
  variant = 'card',
  showSimulation = true,
  onPointsUpdate,
  className = '',
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [copiedUid, setCopiedUid] = useState<boolean>(false);
  const [showCounterSimulator, setShowCounterSimulator] = useState<boolean>(false);
  const [pointUpdateFeedback, setPointUpdateFeedback] = useState<string | null>(null);
  const [brightnessMode, setBrightnessMode] = useState<boolean>(false);

  const userLoyaltyId = user.id ? `HASF-LOYALTY-${user.id.slice(-6).toUpperCase()}` : 'HASF-LOYALTY-98402';
  const loyaltyTier: LoyaltyTier = user.loyaltyTier || 'bronze';
  const userPoints = user.loyaltyPoints || 0;

  // Generate QR Code data URL
  useEffect(() => {
    const qrPayload = JSON.stringify({
      brand: 'Hotel Al Sheikh Farid',
      loyaltyId: userLoyaltyId,
      userId: user.id || 'guest',
      name: user.name || 'Member',
      phone: user.phone || '01700-000000',
      tier: loyaltyTier,
      points: userPoints,
      issuedAt: new Date().toISOString(),
      type: 'COUNTER_SCAN_PASS',
    });

    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Error generating loyalty QR Code:', err));
  }, [user.id, user.name, user.phone, loyaltyTier, userPoints, userLoyaltyId]);

  const handleCopyUid = () => {
    navigator.clipboard.writeText(userLoyaltyId);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `HASF-Loyalty-Pass-${user.name?.replace(/\s+/g, '_') || 'Customer'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateCounterPointAdd = (pointsToAdd: number, reasonBn: string, reasonEn: string) => {
    const newTotal = userPoints + pointsToAdd;
    if (onPointsUpdate) {
      onPointsUpdate(newTotal, reasonBn, reasonEn);
    }
    
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#10b981', '#fbbf24', '#fef08a'],
      });
    } catch {
      // ignore
    }

    setPointUpdateFeedback(
      lang === 'bn' 
        ? `✅ ক্যাশ কাউন্টার স্ক্যান সম্পন্ন! +${pointsToAdd} পয়েন্ট যোগ হয়েছে। (নতুন ব্যালেন্স: ${newTotal})` 
        : `✅ Counter Scan verified! +${pointsToAdd} points added. (New Balance: ${newTotal})`
    );

    setTimeout(() => setPointUpdateFeedback(null), 4000);
  };

  const getTierBadge = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'platinum':
        return {
          label: 'Platinum VIP',
          color: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
          icon: <Crown className="w-3 h-3 text-purple-400" />,
        };
      case 'gold':
        return {
          label: 'Gold Member',
          color: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
          icon: <Crown className="w-3 h-3 text-amber-400" />,
        };
      case 'silver':
        return {
          label: 'Silver Member',
          color: 'bg-slate-900/90 text-slate-300 border-slate-400/50',
          icon: <Award className="w-3 h-3 text-slate-300" />,
        };
      case 'bronze':
      default:
        return {
          label: 'Bronze Member',
          color: 'bg-orange-950/80 text-orange-300 border-orange-600/50',
          icon: <Award className="w-3 h-3 text-orange-400" />,
        };
    }
  };

  const tierInfo = getTierBadge(loyaltyTier);

  // Compact Variant (e.g. for widgets or small dropdowns)
  if (variant === 'compact') {
    return (
      <div className={`p-3 rounded-2xl bg-stone-900 border border-amber-500/30 text-white flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div 
            onClick={() => setIsQrModalOpen(true)}
            className="w-12 h-12 bg-white p-1 rounded-xl shadow-xs border border-amber-500/50 shrink-0 cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
          >
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="Loyalty QR Code" className="w-full h-full object-contain" />
            ) : (
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white font-serif">{user.name || 'Member'}</span>
              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${tierInfo.color}`}>
                {tierInfo.label}
              </span>
            </div>
            <p className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">{userLoyaltyId}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-black flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
        >
          <Maximize2 className="w-3 h-3" />
          <span>{lang === 'bn' ? 'স্ক্যান পাস' : 'Show Pass'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Member Unique QR Code & Counter Scan Pass Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 text-white shadow-xl space-y-4 relative overflow-hidden">
        {/* Decorative Golden Glow */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <QrCode className="w-4 h-4" />
              </span>
              <h4 className="text-sm font-bold text-amber-200 font-serif">
                {lang === 'bn' ? 'ডিজিটাল মেম্বার কিউআর কোড (কাউন্টার স্ক্যান পাস)' : 'Digital Membership QR Pass'}
              </h4>
            </div>
            <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
              {lang === 'bn' 
                ? 'হোটেল কাউন্টার বা ক্যাশ ডেস্কে এই কিউআর কোড স্ক্যান করে দ্রুত পয়েন্ট যোগ ও ছাড় গ্রহণ করুন।' 
                : 'Present this QR code at hotel checkout / cashier counter to quickly add or redeem points.'}
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{lang === 'bn' ? 'সক্রিয় আইডি' : 'Active ID'}</span>
          </span>
        </div>

        {/* QR Code and Member Details Block */}
        <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row items-center gap-4 relative z-10">
          {/* QR Code Frame with Scanner Target Reticle */}
          <div 
            className="relative group cursor-pointer shrink-0" 
            onClick={() => setIsQrModalOpen(true)}
            title={lang === 'bn' ? 'বড় করে দেখতে ক্লিক করুন' : 'Click to enlarge for counter scan'}
          >
            <div className="w-36 h-36 bg-white p-2 rounded-2xl shadow-md border-2 border-amber-500/60 flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-105">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Customer Member QR Code" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
              )}
              {/* Corner Target Markers for authentic cashier scanning feeling */}
              <div className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
              <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
              <div className="absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
              <div className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-600 pointer-events-none" />
            </div>
            
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center transition-opacity text-white text-[10px] font-bold gap-1 backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বড় করুন' : 'Enlarge'}</span>
            </div>
          </div>

          {/* Customer Information & Quick Action Buttons */}
          <div className="flex-1 w-full space-y-2.5 text-center sm:text-left">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <p className="text-sm font-bold text-white font-serif">{user.name || 'সম্মানিত মেম্বার'}</p>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 ${tierInfo.color}`}>
                  {tierInfo.icon}
                  <span>{tierInfo.label}</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">{user.phone || '01700-112233'}</p>
            </div>

            {/* Member Loyalty ID Badge with Copy */}
            <div className="p-2 rounded-xl bg-stone-950/90 border border-stone-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-[10px] text-stone-400 font-semibold uppercase">Loyalty ID:</span>
                <span className="text-[11px] text-amber-300 font-mono font-bold truncate">
                  {userLoyaltyId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUid}
                className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer border border-stone-700"
                title={lang === 'bn' ? 'আইডি কপি করুন' : 'Copy Member ID'}
              >
                {copiedUid ? (
                  <>
                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'কপি' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Points Snapshot */}
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="text-stone-400">{lang === 'bn' ? 'ব্যালেন্স:' : 'Balance:'}</span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold font-mono flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>{userPoints} pts</span>
              </span>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Maximize2 className="w-3 h-3" />
                <span>{lang === 'bn' ? 'বড় করে দেখুন' : 'View Pass'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
              >
                <Download className="w-3 h-3" />
                <span>{lang === 'bn' ? 'কিউআর ডাউনলোড' : 'Save QR'}</span>
              </button>

              {showSimulation && (
                <button
                  type="button"
                  onClick={() => setShowCounterSimulator((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-600/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-98"
                >
                  <Scan className="w-3 h-3" />
                  <span>{lang === 'bn' ? 'কাউন্টার স্ক্যান টেস্ট' : 'Scan Test'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Point Update Feedback Banner */}
        {pointUpdateFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{pointUpdateFeedback}</span>
          </div>
        )}

        {/* Interactive Counter Point Update Simulator Box */}
        {showCounterSimulator && showSimulation && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-amber-950/40 border border-amber-500/30 space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <h5 className="text-xs font-bold text-amber-200">
                  {lang === 'bn' ? 'কাউন্টার স্ক্যান সিমুলেটর (পয়েন্ট ইনস্ট্যান্ট ক্রেডিট)' : 'Counter Scanner Simulator (Instant Point Credit)'}
                </h5>
              </div>
              <button
                type="button"
                onClick={() => setShowCounterSimulator(false)}
                className="text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                {lang === 'bn' ? 'লুকান' : 'Hide'}
              </button>
            </div>

            <p className="text-[11px] text-stone-400">
              {lang === 'bn' 
                ? 'রেস্টুরেন্টে যেকোনো খাবার গ্রহণের পর ক্যাশিয়ার কিউআর কোড স্ক্যান করলে সরাসরি পয়েন্ট ব্যালেন্সে যুক্ত হয়।'
                : 'Simulate the cashier scanning your QR code to instantly update loyalty points for physical purchases.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateCounterPointAdd(10, 'কাউন্টার স্ক্যান: ১০০ ৳ নাশতা বা চা ক্রয়', 'Counter Scan: BDT 100 Snacks Purchase')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-amber-600/30 border border-stone-700 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300">+১০ পয়েন্ট</p>
                <p className="text-[9px] text-stone-400">৳১০০ নাশতা/চা</p>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateCounterPointAdd(25, 'কাউন্টার স্ক্যান: ২৫০ ৳ দুপুর/রাতের খাবার', 'Counter Scan: BDT 250 Lunch/Dinner')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-amber-600/30 border border-stone-700 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300">+২৫ পয়েন্ট</p>
                <p className="text-[9px] text-stone-400">৳২৫০ লাঞ্চ/ডিনার</p>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateCounterPointAdd(50, 'কাউন্টার স্ক্যান: ৫০০ ৳ ফ্যামিলি ডাইনিং', 'Counter Scan: BDT 500 Family Dining')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-amber-600/30 border border-stone-700 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300">+৫০ পয়েন্ট</p>
                <p className="text-[9px] text-stone-400">৳৫০০ ফ্যামিলি মিল</p>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateCounterPointAdd(100, 'কাউন্টার স্ক্যান: ১০০০ ৳ ভিআইপি স্পেশাল ব্যাঙ্কোয়েট', 'Counter Scan: BDT 1000 VIP Banquet')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-amber-600/30 border border-stone-700 hover:border-amber-500/50 text-left transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-amber-400 group-hover:text-amber-300">+১০০ পয়েন্ট</p>
                <p className="text-[9px] text-stone-400">৳১০০০ ভিআইপি ডাইন</p>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FULLSCREEN / ENLARGED QR MODAL */}
      {isQrModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div 
            className={`w-full max-w-sm rounded-3xl p-6 shadow-2xl border transition-all relative text-center space-y-4 ${
              brightnessMode 
                ? 'bg-white text-stone-900 border-white' 
                : 'bg-stone-950 text-white border-amber-500/50'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
                brightnessMode 
                  ? 'bg-stone-200 hover:bg-stone-300 text-stone-800' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Brand */}
            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-500">
                  <Crown className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold font-serif">
                  {lang === 'bn' ? 'হোটেল আল শেখ ফরিদ' : 'Hotel Al Sheikh Farid'}
                </h3>
              </div>
              <p className={`text-xs mt-0.5 font-medium ${brightnessMode ? 'text-stone-600' : 'text-stone-400'}`}>
                {lang === 'bn' ? 'ডিজিটাল মেম্বারশিপ পাস' : 'Digital Member Pass'}
              </p>
            </div>

            {/* High-Contrast Crisp QR Container */}
            <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-amber-500/40 inline-block mx-auto relative">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Enlarged Loyalty QR Code" 
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                </div>
              )}
              {/* Corner Reticles */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-600" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-600" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-600" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-600" />
            </div>

            {/* Member Details */}
            <div className="space-y-1">
              <p className="text-sm font-bold font-serif">{user.name || 'Member'}</p>
              <p className="text-xs font-mono font-bold text-amber-500">{userLoyaltyId}</p>
              <div className="flex items-center justify-center gap-2 pt-1 text-xs">
                <span className={`px-2 py-0.5 rounded-full font-bold border ${tierInfo.color}`}>
                  {tierInfo.label}
                </span>
                <span className="font-bold flex items-center gap-1 text-amber-500">
                  <Coins className="w-3.5 h-3.5" /> {userPoints} Points
                </span>
              </div>
            </div>

            {/* Brightness Booster Toggle for quick Scanner Detection */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBrightnessMode(!brightnessMode)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  brightnessMode
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-stone-800 text-amber-300 hover:bg-stone-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{brightnessMode ? (lang === 'bn' ? 'ডার্ক মোড' : 'Dark View') : (lang === 'bn' ? 'হাই ব্রাইটনেস মোড' : 'High Contrast')}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQr}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ডাউনলোড' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
