import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Store, 
  Phone, 
  Video, 
  Sparkles, 
  Play, 
  Pause, 
  CheckCheck,
  Clock,
  ShieldCheck,
  Mic,
  MessageSquare,
  User,
  Radio,
  Share2
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { ChatMessage, SUPER_ADMIN_EMAILS } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  isAdmin?: boolean;
  currentAdminEmail?: string;
  lang: 'bn' | 'en';
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'owner',
    senderName: 'মো: আব্দুল বারিক শেখ (মালিক - fs2217732@gmail.com)',
    textBn: 'আসসালামু আলাইকুম! হোটেল আল শেখ ফরিদ-এ স্বাগতম। স্টেশন এলাকায় যেকোনো খাবার অর্ডার বা তথ্যের জন্য মেসেজ দিন বা সরাসরি WebRTC অডিও/ভিডিও কল করুন।',
    textEn: 'Assalamu Alaikum! Welcome to Hotel Al Sheikh Farid. Message us or start a direct WebRTC audio/video call for any assistance.',
    timestamp: 'আজ সকাল ১০:০০',
  },
  {
    id: 'm2',
    sender: 'owner',
    senderName: 'রুবেল (ম্যানেজার - rubels1k994@gmail.com)',
    textBn: 'আমাদের গরম গরম জিলাপি (১৬০ ৳/কেজি), স্পেশাল ভুনা খিচুড়ি (৩০ ৳) ও কষা গরুর মাংস (৮০ ৳) এখন তাজা প্রস্তুত আছে!',
    textEn: 'Our hot crispy jilapi (৳160/kg), special bhuna khichuri (৳30) and beef curry (৳80) are freshly prepared!',
    timestamp: 'আজ সকাল ১০:০১',
  },
];

const QUICK_QUESTIONS = [
  { bn: '📞 WebRTC ভিডিও কলে কথা বলতে চাই', en: 'Want to start WebRTC Video Call', isCall: true, type: 'video' },
  { bn: '🎙️ WebRTC অডিও কলে কথা বলতে চাই', en: 'Want to start WebRTC Audio Call', isCall: true, type: 'audio' },
  { bn: 'এখন গরম জিলাপি পাওয়া যাবে?', en: 'Is hot Jilapi available now?' },
  { bn: 'ট্রেন ছাড়তে ১৫ মিনিট বাকি, দ্রুত কি পার্সেল পাব?', en: 'Train leaving in 15 mins, what can I get quickly?' },
  { bn: 'আজকের স্পেশাল মাছ ও মাংসের কি মেনু আছে?', en: 'What is today’s special fish and meat?' },
  { bn: 'বিকাশ পেমেন্ট করে কীভাবে নিশ্চিত হব?', en: 'How to confirm bKash payment?' },
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  onStartCall,
  isAdmin = false,
  currentAdminEmail = 'fs2217732@gmail.com',
  lang,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [sendAsRole, setSendAsRole] = useState<'customer' | 'admin'>(isAdmin ? 'admin' : 'customer');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setSendAsRole(isAdmin ? 'admin' : 'customer');
    }
  }, [isOpen, messages, isTyping, isAdmin]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const isSendingAsAdmin = sendAsRole === 'admin';
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: isSendingAsAdmin ? 'owner' : 'user',
      senderName: isSendingAsAdmin 
        ? `এডমিন (${currentAdminEmail})` 
        : 'আপনি (গ্রাহক)',
      textBn: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');

    // If sent as customer, auto-generate hotel owner/admin response
    if (!isSendingAsAdmin) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let replyBn = 'ধন্যবাদ আপনার বার্তার জন্য! আমাদের হোটেল ম্যানেজার ও মালিক অর্ডারটি প্রসেস করছেন। যেকোনো সময় সরাসরি WebRTC অডিও/ভিডিও কল দিতে পারেন।';
        let replyEn = 'Thank you for your message! Hotel management is processing your request. Feel free to start a WebRTC call anytime.';

        const lower = text.toLowerCase();
        if (lower.includes('ভিডিও কল') || lower.includes('video call') || lower.includes('ভিডিও')) {
          replyBn = 'জি, উপরের ভিডিও আইকনে ক্লিক করলেই সরাসরি আমাদের মেইন কাউন্টারের সাথে WebRTC ভিডিও কল শুরু হবে!';
          replyEn = 'Click the Video icon above to start a direct WebRTC video call with our main counter!';
        } else if (lower.includes('অডিও কল') || lower.includes('audio call') || lower.includes('অডিও')) {
          replyBn = 'জি, উপরের অডিও কল আইকনে ক্লিক করলেই আমাদের সাথে ক্রিস্টাল ক্লিয়ার WebRTC ভয়েস কলে কথা বলতে পারবেন!';
          replyEn = 'Click the Audio Call icon above to start crystal clear WebRTC voice calling!';
        } else if (lower.includes('জিলাপি') || lower.includes('jilapi')) {
          replyBn = 'জি হ্যাঁ! কড়াই থেকে নামানো একদম গরম মচমচে জিলাপি প্রস্তুত আছে (১৬০ ৳/কেজি)। কতটুকু পার্সেল করব বলুন?';
          replyEn = 'Yes! Freshly fried hot crispy Jilapi is ready (৳160/kg). How much should we pack for you?';
        } else if (lower.includes('ট্রেন') || lower.includes('দ্রুত') || lower.includes('fast') || lower.includes('train')) {
          replyBn = 'অবশ্যই! ট্রেনের যাত্রীদের জন্য মাত্র ৩ মিনিটে গরম খিচুড়ি (৩০ ৳), ডিম ভুনা (২০ ৳) বা গরম সিঙ্গারা পার্সেল করে দিচ্ছি!';
          replyEn = 'Sure! We can pack hot Khichuri (৳30), Egg curry (৳20) or Shingara in just 3 minutes for train passengers!';
        } else if (lower.includes('বিকাশ') || lower.includes('bkash')) {
          replyBn = 'আমাদের বিকাশ পার্সোনাল নম্বর 01761869921। পেমেন্ট করার সাথে সাথে আমাদের স্বয়ংক্রিয় এসএমএস ভেরিফায়ারে আপনার অর্ডার কনফার্ম হয়ে যাবে!';
          replyEn = 'Our bKash personal number is 01761869921. Orders are instantly confirmed via automated SMS verification!';
        }

        const hotelReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'owner',
          senderName: 'মো: আব্দুল বারিক শেখ (মালিক - fs2217732@gmail.com)',
          textBn: replyBn,
          textEn: replyEn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, hotelReply]);
      }, 1100);
    }
  };

  const handleVoiceToggle = (id: string) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      setTimeout(() => {
        setPlayingVoiceId(null);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-stone-50 shadow-2xl flex flex-col h-full border-l border-stone-300">
          
          {/* Top Admin & Hotel Header */}
          <div className="p-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 flex items-center justify-center font-black shadow-md">
                  <Store className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-stone-900 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-serif leading-tight text-amber-100 flex items-center gap-1.5">
                  <span>{HOTEL_INFO.nameBn}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </h3>
                <p className="text-[10px] text-stone-300">
                  এডমিন: <span className="text-amber-300 font-mono">fs2217732@gmail.com</span>
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-0.5 font-semibold">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>WebRTC P2P অডিও/ভিডিও রেডি</span>
                </div>
              </div>
            </div>

            {/* WebRTC Quick Call Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onStartCall('audio')}
                className="p-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                title="WebRTC অডিও কল শুরু করুন"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartCall('video')}
                className="p-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 transition-colors cursor-pointer"
                title="WebRTC ভিডিও কল শুরু করুন"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Admin Mode Switcher Banner (if admin) */}
          {isAdmin && (
            <div className="bg-amber-500/15 border-b border-amber-500/30 p-2.5 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>ম্যানেজমেন্ট মোড: {currentAdminEmail}</span>
              </div>
              <div className="flex gap-1 bg-white p-0.5 rounded-lg border border-amber-300">
                <button
                  type="button"
                  onClick={() => setSendAsRole('admin')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sendAsRole === 'admin' ? 'bg-amber-600 text-white' : 'text-stone-600'
                  }`}
                >
                  এডমিন
                </button>
                <button
                  type="button"
                  onClick={() => setSendAsRole('customer')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sendAsRole === 'customer' ? 'bg-stone-700 text-white' : 'text-stone-600'
                  }`}
                >
                  কাস্টমার
                </button>
              </div>
            </div>
          )}

          {/* Quick Questions & Call Chips */}
          <div className="p-2.5 bg-amber-50/90 border-b border-amber-200 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {QUICK_QUESTIONS.map((q: any, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (q.isCall) {
                    onStartCall(q.type);
                  } else {
                    handleSend(lang === 'bn' ? q.bn : q.en);
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 shadow-2xs transition-colors flex items-center gap-1 ${
                  q.isCall 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white border border-amber-500 cursor-pointer' 
                    : 'bg-white hover:bg-amber-100 border border-amber-300 text-stone-800'
                }`}
              >
                <span>{lang === 'bn' ? q.bn : q.en}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-stone-100 min-h-0">
            {messages.map((msg) => {
              const isOwner = msg.sender === 'owner';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwner ? 'items-start' : 'items-end'}`}
                >
                  <span className="text-[10px] text-stone-500 font-semibold mb-1 px-1 flex items-center gap-1">
                    {isOwner && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                    <span>{msg.senderName} • {msg.timestamp}</span>
                  </span>
                  
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isOwner
                        ? 'bg-white text-stone-900 rounded-tl-xs border border-stone-200 shadow-xs'
                        : 'bg-amber-600 text-white rounded-tr-xs shadow-xs font-medium'
                    }`}
                  >
                    <p>{lang === 'bn' ? msg.textBn : (msg.textEn || msg.textBn)}</p>

                    {/* Audio Note Attachment Demo */}
                    {msg.isAudio && (
                      <div className="mt-2 pt-2 border-t border-stone-200/50 flex items-center gap-2">
                        <button
                          onClick={() => handleVoiceToggle(msg.id)}
                          className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center cursor-pointer"
                        >
                          {playingVoiceId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                        <span className="text-[10px] text-stone-600">
                          {playingVoiceId === msg.id ? 'বাজছে...' : `ভয়েস বার্তা (${msg.audioDuration})`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-stone-500 bg-white p-2.5 rounded-2xl w-fit border border-stone-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] font-medium text-stone-600">
                  {lang === 'bn' ? 'এডমিন লিখছেন...' : 'Admin is typing...'}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-stone-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  sendAsRole === 'admin' 
                    ? `এডমিন হিসেবে উত্তর দিন (${currentAdminEmail})...` 
                    : (lang === 'bn' ? 'হোটেল এডমিনকে মেসেজ লিখুন...' : 'Type message to admin...')
                }
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
