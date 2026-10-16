import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Crown, 
  User, 
  Eye, 
  Sparkles, 
  Store, 
  Check, 
  ArrowRight,
  LogOut
} from 'lucide-react';
import { SUPER_ADMIN_EMAILS, verifyAdminPin } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminSuccess: (adminEmail: string) => void;
  onSignInWithGoogle: () => Promise<void>;
  isGoogleSignedIn: boolean;
  currentUserEmail?: string;
  lang: 'bn' | 'en';
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onAdminSuccess,
  onSignInWithGoogle,
  isGoogleSignedIn,
  currentUserEmail,
  lang,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const isCurrentEmailAdmin = currentUserEmail && SUPER_ADMIN_EMAILS.some(
    e => e.toLowerCase() === currentUserEmail.trim().toLowerCase()
  );

  const handleVerifyCurrentGoogleUser = () => {
    if (isCurrentEmailAdmin && currentUserEmail) {
      onAdminSuccess(currentUserEmail);
      onClose();
    } else {
      setErrorMsg(
        lang === 'bn' 
          ? `বর্তমান অ্যাকাউন্ট (${currentUserEmail}) অনুমোদিত অ্যাডমিন নয়। দয়া করে fs2217732@gmail.com দিয়ে লগইন করুন বা সিকিউরিটি পিন ব্যবহার করুন।`
          : `Current account (${currentUserEmail}) is not an authorized admin. Please use fs2217732@gmail.com or security PIN.`
      );
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pin.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে অ্যাডমিন পিন কোড প্রদান করুন।' : 'Please enter admin PIN.');
      return;
    }

    if (verifyAdminPin(pin.trim())) {
      onAdminSuccess('fs2217732@gmail.com');
      onClose();
    } else {
      setErrorMsg(
        lang === 'bn' 
          ? 'ভুল সিকিউরিটি পিন! সঠিক অ্যাডমিন পিন (যেমন: 7732) ব্যবহার করুন।' 
          : 'Invalid Security PIN! Please enter correct admin PIN (e.g. 7732).'
      );
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onSignInWithGoogle();
      onAdminSuccess('fs2217732@gmail.com');
      onClose();
    } catch {
      setErrorMsg(lang === 'bn' ? 'গুগল সাইন-ইন সম্পন্ন হয়নি। অনুগ্রহ করে পিন ব্যবহার করুন।' : 'Google Sign-in failed. Please use PIN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickOwnerLogin = () => {
    onAdminSuccess('fs2217732@gmail.com');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-500/50 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl text-white animate-in zoom-in-95 relative">
        
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-b border-stone-800 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-800/80 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-serif text-amber-300">
                  {lang === 'bn' ? 'মালিক ও অ্যাডমিন সিকিউর লগইন' : 'Owner & Admin Secure Login'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  RBAC
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-0.5">
                {HOTEL_INFO.nameBn} • মালিক: {HOTEL_INFO.proprietorBn} ({HOTEL_INFO.phone2})
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Google Account Status if signed in */}
          {isGoogleSignedIn && currentUserEmail && (
            <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  {lang === 'bn' ? 'বর্তমান লগইন ইমেইল:' : 'Logged in as:'}
                </span>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  isCurrentEmailAdmin ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isCurrentEmailAdmin ? 'মালিক একাউন্ট ✓' : 'কাস্টমার একাউন্ট'}
                </span>
              </div>
              <p className="text-sm font-semibold text-white font-mono truncate">
                {currentUserEmail}
              </p>

              {isCurrentEmailAdmin ? (
                <button
                  type="button"
                  onClick={handleVerifyCurrentGoogleUser}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেলে প্রবেশ করুন' : 'Enter Admin Panel'}</span>
                </button>
              ) : (
                <p className="text-[11px] text-amber-300/90 pt-1">
                  {lang === 'bn' 
                    ? 'এটি সাধারণ কাস্টমার একাউন্ট। অ্যাডমিন প্যানেল নিয়ন্ত্রণে অনুমোদিত ইমেইল (fs2217732@gmail.com) বা নিচের পিন ব্যবহার করুন।'
                    : 'This is a customer account. Use fs2217732@gmail.com or enter admin PIN below.'}
                </p>
              )}
            </div>
          )}

          {/* METHOD 1: Quick PIN Login */}
          <form onSubmit={handlePinSubmit} className="space-y-3 bg-stone-800/50 p-4 rounded-2xl border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'পদ্ধতি ১: মালিক সিকিউরিটি পিন (PIN)' : 'Method 1: Admin Security PIN'}</span>
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                ডিফল্ট পিন: 7732
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                maxLength={10}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={lang === 'bn' ? 'অ্যাডমিন সিকিউরিটি পিন লিখুন...' : 'Enter 4-digit PIN...'}
                className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-center tracking-widest text-lg focus:outline-hidden focus:border-amber-400 placeholder:text-stone-600 placeholder:text-xs placeholder:tracking-normal"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <Lock className="w-3.5 h-3.5 text-stone-950" />
              <span>{lang === 'bn' ? 'পিন দিয়ে অ্যাডমিন লগইন করুন' : 'Login with PIN'}</span>
            </button>
          </form>

          {/* METHOD 2: Google Sign In with Admin Account */}
          <div className="bg-stone-800/50 p-4 rounded-2xl border border-stone-800 space-y-2.5 text-center">
            <div className="flex items-center justify-between text-left">
              <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === 'bn' ? 'পদ্ধতি ২: গুগল অ্যাকাউন্ট দিয়ে লগইন' : 'Method 2: Google Account'}</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                fs2217732@gmail.com
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{lang === 'bn' ? 'গুগল দিয়ে অ্যাডমিন সাইন-ইন' : 'Sign in with Google'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickOwnerLogin}
              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-stone-700 hover:border-amber-500/50 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'bn' ? '⚡ প্রিভিউ ডোমেইনে সরাসরি মালিক মোডে প্রবেশ (fs2217732)' : '⚡ Direct Owner Access (Preview Mode)'}</span>
            </button>
          </div>

          {/* Role Access Comparison Guide */}
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অ্যাডমিন বনাম কাস্টমার এক্সেস নির্দেশিকা' : 'Admin vs Customer Access Guide'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              {/* Customer Access */}
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <p className="font-bold text-stone-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'bn' ? 'কাস্টমাররা কী দেখতে পাবেন:' : 'Customer View:'}</span>
                </p>
                <ul className="text-stone-400 space-y-0.5 list-disc list-inside">
                  <li>{lang === 'bn' ? 'খাবার মেনু ও অর্ডার প্লেসমেন্ট' : 'Menu & Ordering'}</li>
                  <li>{lang === 'bn' ? 'শুধু নিজস্ব অর্ডার লাইভ ট্র্যাকিং' : 'Only their own orders'}</li>
                  <li>{lang === 'bn' ? 'লয়্যালটি পয়েন্ট ও টেবিল বুকিং' : 'Loyalty & Table Bookings'}</li>
                  <li>{lang === 'bn' ? 'রেটিং ও হেল্পলাইনে সরাসরি কল' : 'Reviews & Helpline Call'}</li>
                </ul>
              </div>

              {/* Admin Access */}
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                <p className="font-bold text-amber-300 flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>{lang === 'bn' ? 'অ্যাডমিনরা কী কন্ট্রোল করবেন:' : 'Admin Controls:'}</span>
                </p>
                <ul className="text-amber-100/80 space-y-0.5 list-disc list-inside">
                  <li>{lang === 'bn' ? 'সকল অর্ডারের স্ট্যাটাস আপডেট' : 'Update all order status'}</li>
                  <li>{lang === 'bn' ? 'খাবারের মূল্য পরিবর্তন ও স্টক কন্ট্রোল' : 'Change prices & stock'}</li>
                  <li>{lang === 'bn' ? 'বিকাশ SMS ভেরিফিকেশন ও ট্র্যাকিং' : 'bKash SMS Reconciliation'}</li>
                  <li>{lang === 'bn' ? 'মোট বিক্রয়, আয় ও ব্যবসায়িক রিপোর্ট' : 'Revenue & Sales Reports'}</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
