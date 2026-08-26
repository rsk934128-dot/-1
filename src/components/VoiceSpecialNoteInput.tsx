import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  X, 
  Check, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface VoiceSpecialNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  lang?: 'bn' | 'en';
  placeholder?: string;
  label?: string;
  className?: string;
  compact?: boolean;
}

// Popular quick speech templates for Hotel Al Sheikh Farid orders
const QUICK_PROMPTS_BN = [
  'ঝাল কম দিবেন',
  'বেশি করে লেবু ও কাঁচামরিচ দিবেন',
  'গরম গরম ও তাড়াতাড়ি পাঠাবেন',
  'ঝোল একটু বেশি দিয়েন',
  'প্যাকেট শক্ত করে করবেন',
  'তেল ও মসলা কম দিবেন',
];

const QUICK_PROMPTS_EN = [
  'Less spicy please',
  'Extra lemon & green chili',
  'Serve piping hot & fast',
  'Extra gravy please',
  'Pack securely for travel',
  'Low oil & spices',
];

// Extend window for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

export const VoiceSpecialNoteInput: React.FC<VoiceSpecialNoteInputProps> = ({
  value,
  onChange,
  lang = 'bn',
  placeholder,
  label,
  className = '',
  compact = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechLanguage, setSpeechLanguage] = useState<'bn-BD' | 'en-US'>(lang === 'bn' ? 'bn-BD' : 'en-US');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [showQuickPills, setShowQuickPills] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check speech recognition support on mount
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Update speech language if parent lang changes
  useEffect(() => {
    setSpeechLanguage(lang === 'bn' ? 'bn-BD' : 'en-US');
  }, [lang]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Simulate audio level pulse when listening
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 60) + 40);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isListening]);

  const startListening = () => {
    setErrorMessage('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setErrorMessage(
        lang === 'bn'
          ? 'আপনার ব্রাউজারে সরাসরি ভয়েস রিকগনিশন সুবিধা নেই। কিবোর্ড দিয়ে লিখুন।'
          : 'Speech recognition is not supported in this browser. Please type manually.'
      );
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLanguage;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setRecordingSeconds(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript + ' ';
          } else {
            interimTrans += item[0].transcript;
          }
        }

        const newText = (finalTrans || interimTrans).trim();
        if (newText) {
          setTranscript(newText);
          // Append or set to parent value
          if (value && !value.endsWith(' ')) {
            onChange(`${value}, ${newText}`);
          } else if (value) {
            onChange(`${value}${newText}`);
          } else {
            onChange(newText);
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMessage(
            lang === 'bn'
              ? 'মাইক্রোফোনের অনুমতি প্রদান করুন অথবা ব্রাউজার সেটিংসে অনুমতি দিন।'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else if (event.error === 'no-speech') {
          // No speech detected, silently keep or retry
        } else {
          setErrorMessage(
            lang === 'bn'
              ? `ভয়েস রেকর্ডিং ত্রুটি (${event.error})। আবার চেষ্টা করুন।`
              : `Voice error (${event.error}). Please try again.`
          );
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMessage(
        lang === 'bn'
          ? 'মাইক্রোফোন চালু করা যায়নি। অনুগ্রহ করে কিবোর্ডে লিখুন।'
          : 'Could not activate microphone. Please type manually.'
      );
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleAppendPrompt = (promptText: string) => {
    if (!value.trim()) {
      onChange(promptText);
    } else if (value.includes(promptText)) {
      // Already includes, do nothing
    } else {
      onChange(`${value.trim()}, ${promptText}`);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const quickPrompts = lang === 'bn' ? QUICK_PROMPTS_BN : QUICK_PROMPTS_EN;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label and Voice Status Indicator */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
          <span>{label || (lang === 'bn' ? 'অতিরিক্ত কোনো বার্তা বা বিশেষ অনুরোধ:' : 'Special Instructions / Requests:')}</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 text-[10px] font-bold">
            <Mic className="w-3 h-3 text-amber-700" />
            <span>{lang === 'bn' ? 'ভয়েস সাপোর্ট' : 'Voice'}</span>
          </span>
        </label>

        <div className="flex items-center gap-2">
          {/* Language switcher for speech */}
          <button
            type="button"
            onClick={() => setSpeechLanguage((prev) => (prev === 'bn-BD' ? 'en-US' : 'bn-BD'))}
            className="text-[10px] font-bold text-stone-500 hover:text-amber-800 transition-colors px-1.5 py-0.5 rounded bg-stone-100 border border-stone-200"
            title="স্পিচ রিকগনিশন ভাষা পরিবর্তন"
          >
            {speechLanguage === 'bn-BD' ? 'বাংলা (BN)' : 'English (EN)'}
          </button>

          <button
            type="button"
            onClick={() => setShowQuickPills(!showQuickPills)}
            className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 underline decoration-amber-400"
          >
            {showQuickPills 
              ? (lang === 'bn' ? 'পরামর্শ লুকান' : 'Hide Suggestions') 
              : (lang === 'bn' ? '⚡ দ্রুত নির্দেশাবলী' : '⚡ Quick Presets')}
          </button>
        </div>
      </div>

      {/* Input container with Mic button */}
      <div className="relative">
        <div className={`relative flex items-center rounded-2xl border transition-all ${
          isListening 
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20' 
            : 'border-stone-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 bg-white'
        }`}>
          <textarea
            rows={compact ? 2 : 2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              placeholder || 
              (lang === 'bn' 
                ? 'মুখে বলুন বা লিখুন (যেমন: ঝাল কম দিবেন, বেশি লেবু দিবেন, গরম গরম তাড়াতাড়ি পাঠাবেন)' 
                : 'Speak or type (e.g. less spicy, extra gravy, pack hot & fresh)')
            }
            className="w-full pl-3.5 pr-24 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 bg-transparent resize-none focus:outline-none"
          />

          {/* Right Action Controls Inside Input */}
          <div className="absolute right-2 top-2.5 flex items-center gap-1.5">
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                title={lang === 'bn' ? 'মুছে ফেলুন' : 'Clear text'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/30'
                  : 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-105 active:scale-95'
              }`}
              title={
                isListening
                  ? (lang === 'bn' ? 'ভয়েস রেকর্ড বন্ধ করুন' : 'Stop voice recording')
                  : (lang === 'bn' ? 'মুখে বলে নোট দিন (Voice to Text)' : 'Click to dictate special note')
              }
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-mono font-bold pr-0.5">{formatSeconds(recordingSeconds)}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold hidden sm:inline">
                    {lang === 'bn' ? 'ভয়েস' : 'Speak'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer / Status Bar when recording */}
        {isListening && (
          <div className="mt-1.5 p-2 bg-gradient-to-r from-red-500/10 via-amber-500/10 to-red-500/10 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-900 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
              </span>
              <span className="font-bold text-[11px]">
                {lang === 'bn' ? 'শুনছি... আপনার নির্দেশ বলুন' : 'Listening... speak your instructions'}
              </span>
              {transcript && (
                <span className="italic text-stone-600 text-[11px] truncate max-w-[160px] bg-white/70 px-1.5 py-0.5 rounded border border-red-200">
                  "{transcript}"
                </span>
              )}
            </div>

            {/* Audio Wave Simulation */}
            <div className="flex items-center gap-0.5 h-4 px-1">
              {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.3].map((heightFactor, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full transition-all duration-150"
                  style={{
                    height: `${Math.max(4, Math.min(16, (audioLevel * heightFactor * 0.25)))}px`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-1.5 p-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage('')}
              className="text-red-500 hover:text-red-800 text-[10px] font-bold underline"
            >
              ঠিক আছে
            </button>
          </div>
        )}

        {/* Browser Fallback warning if not supported */}
        {!speechSupported && (
          <div className="mt-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>
              {lang === 'bn' 
                ? 'ব্রাউজারে ভয়েস এপিআই বন্ধ থাকলে সরাসরি টেক্সট বক্সে লিখুন।' 
                : 'Voice recognition not active in this browser. Please type directly.'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Dictation Presets (Pills) */}
      {(showQuickPills || !value) && (
        <div className="pt-1">
          <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{lang === 'bn' ? 'এক ক্লিকে বিশেষ অনুরোধ যোগ করুন:' : 'Quick Pre-sets:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => {
              const isSelected = value.includes(p);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAppendPrompt(p)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-xs'
                      : 'bg-stone-50 hover:bg-amber-50 border-stone-200 hover:border-amber-300 text-stone-700 hover:text-amber-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-amber-700" />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
