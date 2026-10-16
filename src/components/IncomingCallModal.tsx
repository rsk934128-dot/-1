import React, { useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  Volume2, 
  VolumeX, 
  User, 
  ShieldCheck, 
  Radio, 
  Sparkles 
} from 'lucide-react';
import { CallSession } from '../services/callSignalingService';
import { HOTEL_INFO } from '../data/initialData';

interface IncomingCallModalProps {
  session: CallSession | null;
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  lang: 'bn' | 'en';
  isRingtoneMuted: boolean;
  onToggleMuteRingtone: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  session,
  isOpen,
  onAccept,
  onDecline,
  lang,
  isRingtoneMuted,
  onToggleMuteRingtone,
}) => {
  if (!isOpen || !session) return null;

  const isVideo = session.type === 'video';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Soundwave background pulses */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[320px] h-[320px] rounded-full border border-emerald-500/20 animate-ping opacity-60" />
        <div className="w-[450px] h-[450px] rounded-full border border-amber-500/15 animate-pulse opacity-40" />
        <div className="w-[600px] h-[600px] rounded-full border border-teal-500/10 animate-ping opacity-20" />
      </div>

      <div className="relative bg-stone-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl text-white overflow-hidden shadow-emerald-950/80 animate-in zoom-in-95">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Radio className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'ইনকামিং লাইভ কল' : 'Incoming Live Call'}</span>
          </div>

          <button
            type="button"
            onClick={onToggleMuteRingtone}
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isRingtoneMuted 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
            }`}
            title={isRingtoneMuted ? 'রিংটোন আনমিউট করুন' : 'রিংটোন মিউট করুন'}
          >
            {isRingtoneMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRingtoneMuted ? (lang === 'bn' ? 'রিংটোন বন্ধ' : 'Muted') : (lang === 'bn' ? 'রিংটোন বাজছে' : 'Ringing')}</span>
          </button>
        </div>

        {/* Caller Avatar with Animated Waves */}
        <div className="relative mx-auto w-28 h-28 mb-5">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 opacity-40 blur-md animate-pulse" />
          
          <div className="relative w-full h-full rounded-full bg-stone-800 border-4 border-emerald-400 flex items-center justify-center shadow-xl overflow-hidden">
            {isVideo ? (
              <Video className="w-12 h-12 text-emerald-300 animate-bounce" />
            ) : (
              <Phone className="w-12 h-12 text-emerald-300 animate-bounce" />
            )}
          </div>

          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-stone-950 shadow-md">
            {isVideo ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </div>
        </div>

        {/* Caller Details */}
        <div className="space-y-1.5 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/40">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'মালিকের এডমিন জিমেইল:' : 'Owner Gmail:'}</span>
            <span className="font-mono text-white">{session.targetEmail || 'fs2217732@gmail.com'}</span>
          </div>

          <h2 className="text-2xl font-black font-serif text-white tracking-tight mt-1">
            {session.callerName || (lang === 'bn' ? 'অনলাইন গ্রাহক' : 'Online Customer')}
          </h2>

          <div className="flex items-center justify-center gap-3 text-xs text-stone-300 font-mono">
            <span className="text-emerald-300 font-bold">📞 {session.callerPhone}</span>
            {session.callerEmail && (
              <span className="text-stone-400">✉️ {session.callerEmail}</span>
            )}
          </div>

          {(session.orderId || session.tableNumber) && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30 my-1">
              {session.orderId && <span>অর্ডার #{session.orderId}</span>}
              {session.tableNumber && <span>টেবিল #{session.tableNumber}</span>}
            </div>
          )}

          <p className="text-xs text-stone-400">
            {isVideo 
              ? (lang === 'bn' ? '📹 লাইভ ভিডিও কলের অনুরোধ জানাচ্ছেন (রিংটোন বাজছে)' : 'Requesting live video call (Ringing)') 
              : (lang === 'bn' ? '📞 অডিও কলে কথা বলতে চাচ্ছেন (রিংটোন বাজছে)' : 'Requesting audio conversation (Ringing)')}
          </p>
        </div>

        {/* Ringtone wave animation indicator */}
        <div className="flex items-center justify-center gap-1 mb-8 h-8">
          {[40, 70, 100, 60, 90, 100, 70, 40].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-emerald-600 to-emerald-300 rounded-full animate-pulse"
              style={{
                height: `${h}%`,
                animationDelay: `${i * 120}ms`,
                animationDuration: '800ms'
              }}
            />
          ))}
        </div>

        {/* Action Buttons: Accept & Decline */}
        <div className="grid grid-cols-2 gap-4">
          {/* Decline Button */}
          <button
            type="button"
            onClick={onDecline}
            className="w-full py-3.5 px-4 rounded-2xl bg-stone-800 hover:bg-red-600/90 text-stone-200 hover:text-white font-bold text-sm transition-all border border-stone-700 hover:border-red-500 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
          >
            <PhoneOff className="w-4 h-4 text-red-400 group-hover:text-white" />
            <span>{lang === 'bn' ? 'কেটে দিন' : 'Decline'}</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={onAccept}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-stone-950 font-black text-sm transition-all shadow-lg shadow-emerald-600/40 flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-emerald-300 animate-pulse"
          >
            {isVideo ? <Video className="w-5 h-5 text-stone-950" /> : <Phone className="w-5 h-5 text-stone-950" />}
            <span className="text-white drop-shadow-sm">{lang === 'bn' ? 'কল রিসিভ করুন' : 'Receive Call'}</span>
          </button>
        </div>

        {/* Bottom subtle note */}
        <p className="text-[11px] text-stone-400 mt-5">
          {lang === 'bn' 
            ? 'রিসিভ করার সাথে সাথে আপনার ক্যামেরা ও মাইক্রোফোন চালু হয়ে সরাসরি কথা শুরু হবে।'
            : 'Upon answering, microphone and camera will open for direct live talk.'}
        </p>
      </div>
    </div>
  );
};
