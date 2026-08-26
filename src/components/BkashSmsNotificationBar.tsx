import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Smartphone,
  Copy,
  Check,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { BkashSmsLetter } from '../services/bkashSmsService';
import { Order } from '../types';
import { SoundNotificationService } from '../services/soundNotificationService';

interface BkashSmsNotificationBarProps {
  sms: BkashSmsLetter | null;
  matchedOrder: Order | null;
  onConfirmOrderWithSms: (orderId: string, trxId?: string) => void;
  onOpenFullLetter: (sms: BkashSmsLetter) => void;
  onDismiss: () => void;
  lang: 'bn' | 'en';
}

export const BkashSmsNotificationBar: React.FC<BkashSmsNotificationBarProps> = ({
  sms,
  matchedOrder,
  onConfirmOrderWithSms,
  onOpenFullLetter,
  onDismiss,
  lang,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (sms) {
      setIsVisible(true);
      SoundNotificationService.playNotificationChime();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {
          // safe ignore
        }
      }
    } else {
      setIsVisible(false);
    }
  }, [sms]);

  if (!sms || !isVisible) return null;

  const handleCopyTrx = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sms.trxId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (matchedOrder) {
      SoundNotificationService.playBkashVerificationSuccess();
      onConfirmOrderWithSms(matchedOrder.id, sms.trxId);
      setIsVisible(false);
    } else {
      onOpenFullLetter(sms);
    }
  };

  return (
    <aside 
      aria-label="bKash Incoming SMS Notification"
      className="fixed top-2.5 inset-x-2 sm:inset-x-auto sm:right-4 sm:max-w-md z-50 animate-in slide-in-from-top duration-300 pointer-events-auto"
    >
      <div 
        onClick={() => onOpenFullLetter(sms)}
        className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl border-2 border-pink-500/70 shadow-2xl overflow-hidden cursor-pointer hover:border-pink-400 transition-all group"
      >
        {/* Top Status Bar simulation */}
        <div className="bg-gradient-to-r from-pink-700 via-rose-700 to-pink-800 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-pink-100 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Smartphone className="w-3.5 h-3.5 text-white" />
            <span className="font-bold text-white tracking-wide">মোবাইল এসএমএস নোটিফিকেশন</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-mono">০১৭৬১৮৬৯৯২১ (পার্সোনাল)</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                onDismiss();
              }}
              className="p-0.5 rounded hover:bg-black/30 text-pink-200 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notification Body */}
        <div className="p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {/* bKash Icon Badge */}
              <div className="w-8 h-8 rounded-xl bg-pink-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0 border border-pink-400">
                bK
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white font-serif">
                    {sms.sender} • পেমেন্ট জমা
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">{sms.timestamp}</span>
                </div>
                <p className="text-xs text-pink-300 font-bold">
                  টাকা জমা: ৳ {sms.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* TrxID Badge */}
            <button
              onClick={handleCopyTrx}
              className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-mono font-bold text-amber-300 border border-stone-700 flex items-center gap-1 shrink-0 transition-colors"
              title="TrxID কপি করুন"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
              <span>{sms.trxId}</span>
            </button>
          </div>

          {/* SMS snippet text */}
          <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800 text-[11px] font-mono text-stone-300 leading-relaxed line-clamp-2">
            "{sms.rawText}"
          </div>

          {/* Matching Order indicator */}
          {matchedOrder ? (
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate max-w-[200px]">
                  অর্ডার #{matchedOrder.id} ({matchedOrder.customerName} - ৳ {matchedOrder.total})
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                মিল পাওয়া গেছে
              </span>
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>এসএমএস লেটার ওপেন করে অর্ডার বাছাই বা কনফার্ম করুন।</span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {matchedOrder ? (
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-emerald-400/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'এসএমএস ভেরিফাই ও অর্ডার কনফার্ম' : 'Verify SMS & Confirm'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenFullLetter(sms)}
                className="flex-1 py-2 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4" />
                <span>{lang === 'bn' ? 'অর্ডারের সাথে ম্যাচ করুন' : 'Match With Order'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onOpenFullLetter(sms)}
              className="py-2 px-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 border border-stone-700 transition-colors"
            >
              <span>{lang === 'bn' ? 'লেটার ভিউ' : 'Letter'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
