import React, { useState, useEffect, useMemo } from 'react';
import { 
  Phone, 
  Video, 
  PhoneCall, 
  PhoneIncoming, 
  PhoneOutgoing, 
  PhoneMissed, 
  Clock, 
  Calendar, 
  User, 
  Mail, 
  ShieldCheck, 
  Search, 
  Trash2, 
  X, 
  RefreshCw, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { CallHistoryRecord, callHistoryService } from '../services/callHistoryService';
import { CallType } from '../types';
import { HOTEL_INFO } from '../data/initialData';

interface CallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
  onRedialCall: (type: CallType, name: string, phone: string, email?: string) => void;
  isAdmin: boolean;
  currentAdminEmail?: string;
}

export const CallHistoryModal: React.FC<CallHistoryModalProps> = ({
  isOpen,
  onClose,
  lang,
  onRedialCall,
  isAdmin,
  currentAdminEmail = 'fs2217732@gmail.com',
}) => {
  const [history, setHistory] = useState<CallHistoryRecord[]>(() => callHistoryService.getHistory());
  const [filterType, setFilterType] = useState<'all' | 'audio' | 'video' | 'missed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const unsub = callHistoryService.subscribe((records) => {
      setHistory(records);
    });
    return () => unsub();
  }, [isOpen]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Filter tab
      if (filterType === 'audio' && item.callType !== 'audio') return false;
      if (filterType === 'video' && item.callType !== 'video') return false;
      if (filterType === 'missed' && item.status !== 'missed') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.callerName.toLowerCase().includes(q) ||
        item.callerPhone.toLowerCase().includes(q) ||
        (item.callerEmail && item.callerEmail.toLowerCase().includes(q)) ||
        item.receiverName.toLowerCase().includes(q) ||
        item.receiverEmail.toLowerCase().includes(q) ||
        (item.orderId && item.orderId.toLowerCase().includes(q)) ||
        (item.tableNumber && item.tableNumber.toLowerCase().includes(q))
      );
    });
  }, [history, filterType, searchQuery]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '০ সে.';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} সে.`;
    return `${mins} মি. ${secs} সে.`;
  };

  const formatTime = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) + 
        ', ' + date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' });
    } catch {
      return 'সম্প্রতি';
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    callHistoryService.deleteRecord(id);
  };

  const handleClearAll = () => {
    if (window.confirm(lang === 'bn' ? 'আপনি কি সব কল হিস্ট্রি মুছে ফেলতে চান?' : 'Clear all call history?')) {
      callHistoryService.clearAll();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-500/40 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/40 text-stone-950">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-serif text-white tracking-tight">
                  {lang === 'bn' ? 'কল হিস্ট্রি ও যোগাযোগ লগ' : 'Call History & Communications'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                  {history.length} {lang === 'bn' ? 'টি কল' : 'Calls'}
                </span>
              </div>
              <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'হোটেল মালিক এডমিন জিমেইল:' : 'Owner Admin Gmail:'}</span>
                <span className="font-mono text-amber-300 font-bold">{currentAdminEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-red-950/60 text-stone-300 hover:text-red-300 border border-stone-700 hover:border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                title={lang === 'bn' ? 'সকল কল হিস্ট্রি মুছুন' : 'Clear All'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'হিস্ট্রি মুছুন' : 'Clear'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 bg-stone-950/50 border-b border-stone-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
              }`}
            >
              {lang === 'bn' ? 'সব কল' : 'All'} ({history.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterType('audio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'audio'
                  ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Phone className="w-3 h-3" />
              <span>{lang === 'bn' ? 'অডিও কল' : 'Audio'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('video')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'video'
                  ? 'bg-blue-500 text-stone-950 shadow-md font-black'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>{lang === 'bn' ? 'ভিডিও কল' : 'Video'}</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterType('missed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                filterType === 'missed'
                  ? 'bg-red-500 text-white shadow-md font-black'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-800'
              }`}
            >
              <PhoneMissed className="w-3 h-3 text-red-400" />
              <span>{lang === 'bn' ? 'মিসড কল' : 'Missed'}</span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'bn' ? 'নাম, ফোন বা জিমেইল দিয়ে খুঁজুন...' : 'Search by name, phone or email...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Call History List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 divide-y divide-stone-800/40">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-800/80 mx-auto flex items-center justify-center text-stone-600">
                <PhoneCall className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-stone-300">
                {lang === 'bn' ? 'কোনো কল হিস্ট্রি পাওয়া যায়নি' : 'No call history found'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {lang === 'bn' 
                  ? 'গ্রাহক বা হোটেল মালিকের সাথে অডিও ও ভিডিও কলে কথা বললে স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।' 
                  : 'Audio and video calls between customer accounts and hotel owner will be recorded here automatically.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isVideo = item.callType === 'video';
              const isCompleted = item.status === 'completed';
              const isMissed = item.status === 'missed';
              const isCustomerCaller = item.callerRole === 'customer';

              return (
                <div 
                  key={item.id}
                  className="pt-3 first:pt-0 bg-stone-850/40 hover:bg-stone-800/60 p-4 rounded-2xl border border-stone-800/80 transition-all hover:border-amber-500/30 group"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                    
                    {/* Left Icon & Call Type */}
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        isVideo 
                          ? 'bg-blue-900/60 text-blue-300 border border-blue-500/40' 
                          : isMissed 
                          ? 'bg-red-950/60 text-red-400 border border-red-500/40' 
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isVideo ? (
                          <Video className="w-5 h-5 animate-pulse" />
                        ) : isMissed ? (
                          <PhoneMissed className="w-5 h-5" />
                        ) : isCustomerCaller ? (
                          <PhoneIncoming className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <PhoneOutgoing className="w-5 h-5 text-teal-300" />
                        )}
                      </div>

                      {/* Main Contact Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm sm:text-base">
                            {item.callerName}
                          </span>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.callerRole === 'admin'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-stone-800 text-stone-300 border border-stone-700'
                          }`}>
                            {item.callerRole === 'admin' 
                              ? (lang === 'bn' ? 'মালিক / এডমিন' : 'Admin') 
                              : (lang === 'bn' ? 'গ্রাহক' : 'Customer')}
                          </span>

                          <ArrowRight className="w-3 h-3 text-stone-500" />

                          <span className="text-xs text-stone-300 font-medium">
                            {item.receiverName}
                          </span>
                        </div>

                        {/* Phones & Emails */}
                        <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap">
                          <a 
                            href={`tel:${item.callerPhone}`}
                            className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{item.callerPhone}</span>
                          </a>

                          {item.callerEmail && (
                            <span className="text-stone-400 flex items-center gap-1 font-mono text-[11px]">
                              <Mail className="w-3 h-3 text-stone-500" />
                              <span>{item.callerEmail}</span>
                            </span>
                          )}

                          <span className="text-[11px] text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded font-mono border border-amber-900/40">
                            এডমিন: {item.receiverEmail}
                          </span>
                        </div>

                        {/* Order or Table tags */}
                        {(item.orderId || item.tableNumber || item.note) && (
                          <div className="flex items-center gap-2 text-xs text-stone-300 pt-1 flex-wrap">
                            {item.orderId && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-400 font-mono text-[11px] border border-stone-700">
                                অর্ডার #{item.orderId}
                              </span>
                            )}
                            {item.tableNumber && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-emerald-300 text-[11px] border border-stone-700">
                                {item.tableNumber}
                              </span>
                            )}
                            {item.note && (
                              <span className="text-[11px] text-stone-400 italic">
                                &ldquo;{item.note}&rdquo;
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side Status, Duration & Redial Call Actions */}
                    <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : isMissed
                            ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}>
                          {isCompleted 
                            ? (lang === 'bn' ? `✓ কথা হয়েছে (${formatDuration(item.durationSeconds)})` : `✓ Connected (${formatDuration(item.durationSeconds)})`)
                            : isMissed
                            ? (lang === 'bn' ? '⚠️ মিসড কল' : 'Missed Call')
                            : (lang === 'bn' ? 'বাতিল' : 'Declined')}
                        </span>

                        <span className="text-xs text-stone-500 font-mono">
                          {formatTime(item.startedAt)}
                        </span>
                      </div>

                      {/* Callback Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onRedialCall('audio', item.callerName, item.callerPhone, item.callerEmail)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                          title="পুনরায় অডিও কল করুন"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'অডিও কল' : 'Audio Call'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRedialCall('video', item.callerName, item.callerPhone, item.callerEmail)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                          title="পুনরায় ভিডিও কল করুন"
                        >
                          <Video className="w-3 h-3" />
                          <span>{lang === 'bn' ? 'ভিডিও কল' : 'Video Call'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3 text-xs text-stone-400 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{lang === 'bn' ? 'WebRTC লাইভ সিগন্যালিং ও হিস্ট্রি ক্লাউড সিঙ্ক সক্রিয়' : 'Live WebRTC Signaling & History Cloud Sync Active'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold transition-all cursor-pointer"
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
