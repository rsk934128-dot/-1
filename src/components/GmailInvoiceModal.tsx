import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Eye, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { Order, UserProfile } from '../types';
import { HOTEL_INFO } from '../data/initialData';
import { sendEmailViaGmail, generateOrderInvoiceHtml } from '../services/gmailService';
import { getCachedAccessToken } from '../services/firebase';

interface GmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  user: UserProfile;
  isGoogleSignedIn: boolean;
  onSignInWithGoogle: () => Promise<void>;
  lang: 'bn' | 'en';
}

export const GmailInvoiceModal: React.FC<GmailInvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  user,
  isGoogleSignedIn,
  onSignInWithGoogle,
  lang,
}) => {
  const [recipientEmail, setRecipientEmail] = useState<string>(
    order?.customerEmail || user.email || ''
  );
  const [customNote, setCustomNote] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  React.useEffect(() => {
    if (order) {
      setRecipientEmail(order.customerEmail || user.email || '');
      setSendSuccess(false);
      setErrorMessage('');
      setShowConfirmation(false);
    }
  }, [order, user]);

  if (!isOpen || !order) return null;

  const htmlContent = generateOrderInvoiceHtml(order, HOTEL_INFO);

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setErrorMessage(
        lang === 'bn' 
          ? 'অনুগ্রহ করে সঠিক ইমেইল এড্রেস প্রদান করুন।' 
          : 'Please provide a valid email address.'
      );
      return;
    }
    setErrorMessage('');
    // Open mandatory confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmation(false);
    setSending(true);
    setErrorMessage('');

    try {
      const subject = `[হোটেল আল শেখ ফরিদ] অর্ডার ক্যাশ মেমো ও ইনভয়েস - #${order.id}`;
      await sendEmailViaGmail({
        to: recipientEmail,
        subject,
        bodyHtml: htmlContent,
        fromName: 'হোটেল আল শেখ ফরিদ',
      });

      setSendSuccess(true);
    } catch (err: unknown) {
      console.error('Gmail send error:', err);
      const msg = err instanceof Error ? err.message : 'ইমেইল পাঠাতে সমস্যা হয়েছে।';
      setErrorMessage(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200 my-6">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-serif">
                  {lang === 'bn' ? 'Gmail ইনভয়েস ও মেমো সার্ভিস' : 'Gmail Order Invoicing'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Google Workspace
                </span>
              </div>
              <p className="text-xs text-amber-200/90">
                {lang === 'bn' ? `অর্ডার নং: ${order.id} • সর্বমোট: ৳ ${order.total}` : `Order #${order.id} • Total: ৳ ${order.total}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">

          {/* If not authenticated with Google or no access token */}
          {!isGoogleSignedIn || !getCachedAccessToken() ? (
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900 font-serif">
                  {lang === 'bn' ? 'Gmail দিয়ে ইনভয়েস পাঠাতে সাইন-ইন করুন' : 'Sign in with Google to send via Gmail'}
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                  {lang === 'bn' 
                    ? 'আপনার গুগল অ্যাকাউন্ট অনুমোদনের মাধ্যমে কাস্টমার অথবা নিজের ইনবক্সে সরাসরি ডিজিটাল ক্যাশ মেমো পাঠানো যাবে।' 
                    : 'Authenticate your Google account to send official itemized food receipts directly via Gmail.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onSignInWithGoogle}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold border border-stone-300 shadow-xs flex items-center justify-center gap-2.5 transition-all hover:border-amber-400 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{lang === 'bn' ? 'গুগল দিয়ে সাইন-ইন করে ইনভয়েস সক্রিয় করুন' : 'Authorize Gmail & Continue'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Status Alert */}
              {sendSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold font-serif">
                      {lang === 'bn' ? 'Gmail এর মাধ্যমে সফলভাবে ইনভয়েস পাঠানো হয়েছে!' : 'Invoice email sent successfully via Gmail!'}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {lang === 'bn'
                      ? `প্রাপক ইমেইল: ${recipientEmail} - এ ডিজিটাল ক্যাশ মেমো পৌঁছে গেছে।`
                      : `Sent to ${recipientEmail} with complete order and item breakdown.`}
                  </p>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              ) : null}

              {/* Form */}
              <form onSubmit={handleInitiateSend} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {lang === 'bn' ? 'প্রাপকের ইমেইল এড্রেস (Customer Email):' : 'Recipient Email:'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="customer@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Quick Details Preview */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                  <div className="flex justify-between items-center text-stone-600 font-medium">
                    <span>হোটেল: <strong>{HOTEL_INFO.nameBn}</strong></span>
                    <span>আইটেম সংখ্যা: <strong>{order.items.length} টি</strong></span>
                  </div>
                  <div className="flex justify-between items-center text-stone-900 font-bold border-t border-stone-200/70 pt-2">
                    <span>মোট বিল:</span>
                    <span className="text-amber-800 text-sm">৳ {order.total}</span>
                  </div>
                </div>

                {/* Preview Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{previewMode ? (lang === 'bn' ? 'প্রিভিউ বন্ধ করুন' : 'Hide Preview') : (lang === 'bn' ? 'ইনভয়েস প্রিভিউ দেখুন' : 'View Invoice HTML Preview')}</span>
                  </button>
                  <span className="text-[10px] text-stone-400">Gmail Send API v1</span>
                </div>

                {/* Preview Window */}
                {previewMode && (
                  <div className="p-3 rounded-2xl bg-stone-100 border border-stone-300 max-h-48 overflow-y-auto">
                    <div 
                      dangerouslySetInnerHTML={{ __html: htmlContent }} 
                      className="bg-white p-3 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                )}

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>
                    {sending 
                      ? (lang === 'bn' ? 'Gmail দিয়ে পাঠানো হচ্ছে...' : 'Sending via Gmail...') 
                      : (lang === 'bn' ? 'Gmail দিয়ে ইনভয়েস ইমেইল পাঠান' : 'Send Invoice via Gmail')}
                  </span>
                </button>
              </form>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs text-stone-500">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-600">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Workspace OAuth 2.0 Certified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold cursor-pointer"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>

      {/* Confirmation Dialog (Mandatory per Workspace Integration Skill) */}
      {showConfirmation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-stone-300 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-stone-900 font-serif">
                {lang === 'bn' ? 'ইমেইল প্রেরণের নিশ্চিতকরণ' : 'Confirm Email Sending'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {lang === 'bn' 
                  ? `আপনি কি নিশ্চিত যে অর্ডার #${order.id} এর ইনভয়েসটি ${recipientEmail} ঠিকানায় পাঠাতে চান?`
                  : `Are you sure you want to send the invoice for Order #${order.id} to ${recipientEmail}?`}
              </p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between text-stone-600">
                <span>প্রাপক:</span>
                <span className="font-mono font-semibold text-stone-900 truncate max-w-[170px]">{recipientEmail}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>মোট আইটেম:</span>
                <span className="font-semibold text-stone-900">{order.items.length} টি (৳ {order.total})</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'হ্যাঁ, পাঠান' : 'Yes, Send'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
