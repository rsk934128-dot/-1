import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Clock, 
  DollarSign, 
  Train, 
  Flame, 
  MessageSquare,
  Bot
} from 'lucide-react';
import { askChefAIAssistant } from '../services/geminiService';
import { HOTEL_INFO } from '../data/initialData';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

interface QA {
  sender: 'user' | 'ai';
  text: string;
}

const PRESET_PROMPTS = [
  { bn: 'আমার বাজেট ৫০ টাকা, পেট ভরে খাওয়ার মতো কি আছে?', en: 'My budget is ৳50, what can I eat?' },
  { bn: 'ট্রেন ছাড়তে ১৫ মিনিট বাকি, দ্রুত পার্সেল কি নেওয়া যাবে?', en: 'Train leaves in 15 mins, what can I parcel fast?' },
  { bn: '১০০ টাকায় দুপুরের সেরা কম্বো খাবার কি কি?', en: 'Best ৳100 lunch combo meal?' },
  { bn: 'আপনাদের স্পেশাল জিলাপি ও গরুর মাংস সম্পর্কে বলুন', en: 'Tell me about your special Jilapi and Beef Curry' },
];

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [chatHistory, setChatHistory] = useState<QA[]>([
    {
      sender: 'ai',
      text: lang === 'bn' 
        ? `আসসালামু আলাইকুম! আমি শেফ বারিক এআই সহকারী (হোটেল আল শেখ ফরিদ)। আপনার বাজেট বা ট্রেনের সময় অনুযায়ী সেরা খাবারের তালিকা জানতে যেকোনো প্রশ্ন করুন!`
        : `Hello! I am Chef Barik AI Assistant (Hotel Al Sheikh Farid). Ask me anything about menu combinations, budget meals, or fast train parcel options!`,
    },
  ]);
  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAsk = async (query?: string) => {
    const q = query || inputVal;
    if (!q.trim() || loading) return;

    const userMessage: QA = { sender: 'user', text: q };
    setChatHistory((prev) => [...prev, userMessage]);
    if (!query) setInputVal('');

    setLoading(true);
    try {
      const response = await askChefAIAssistant(q, lang);
      setChatHistory((prev) => [...prev, { sender: 'ai', text: response }]);
    } catch (e) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: lang === 'bn' 
            ? 'আমাদের গরম জিলাপি (১৬০ ৳/কেজি), স্পেশাল খিচুড়ি (৩০ ৳), কষা গরুর মাংস (৮০ ৳) ও তাজা মাছের পদ সর্বদা প্রস্তুত!'
            : 'Our hot jilapi (৳160/kg), special khichuri (৳30) and beef curry (৳80) are ready!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-amber-300 animate-in fade-in zoom-in-95 duration-200 my-6 flex flex-col h-[550px] max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-100 shadow-xs">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                {lang === 'bn' ? 'শেফ বারিক এআই সহকারী' : 'Chef Barik AI Advisor'}
              </h3>
              <p className="text-[11px] text-amber-100">
                {HOTEL_INFO.nameBn} • বাজেট ও খাবার পরামর্শক
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Buttons */}
        <div className="p-2.5 bg-amber-50 border-b border-amber-200 overflow-x-auto flex gap-1.5 no-scrollbar">
          {PRESET_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleAsk(lang === 'bn' ? p.bn : p.en)}
              className="px-3 py-1 rounded-full bg-white hover:bg-amber-100 border border-amber-300 text-[11px] font-semibold text-stone-800 shrink-0 shadow-2xs transition-colors"
            >
              {lang === 'bn' ? p.bn : p.en}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-white text-stone-800 rounded-tl-xs border border-stone-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-80 font-bold">
                  {msg.sender === 'user' ? (
                    <span>{lang === 'bn' ? 'আপনি' : 'You'}</span>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{lang === 'bn' ? 'শেফ বারিক এআই' : 'Chef Barik AI'}</span>
                    </>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-white rounded-2xl w-fit border border-stone-200 text-xs text-stone-500">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{lang === 'bn' ? 'শেফ বারিক ভাবছেন...' : 'Thinking...'}</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-stone-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={lang === 'bn' ? 'বাজেট বা খাবার সম্পর্কিত প্রশ্ন লিখুন...' : 'Ask about budget or meals...'}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || loading}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
