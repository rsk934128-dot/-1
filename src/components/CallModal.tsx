import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX, 
  Camera, 
  Sparkles, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  Store,
  Wifi,
  Activity,
  Maximize2,
  Minimize2,
  Users,
  Info,
  Radio
} from 'lucide-react';
import { HOTEL_INFO } from '../data/initialData';
import { CallType, SUPER_ADMIN_EMAILS } from '../types';
import { webrtcCallManager } from '../services/webrtcService';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType: CallType;
  lang: 'bn' | 'en';
  currentUserRole?: 'admin' | 'customer';
  currentAdminEmail?: string;
  targetCustomerName?: string;
  targetCustomerPhone?: string;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  initialType,
  lang,
  currentUserRole = 'customer',
  currentAdminEmail = 'fs2217732@gmail.com',
  targetCustomerName = 'যাত্রী / কাস্টমার',
  targetCustomerPhone = '01700-112233',
}) => {
  const [callType, setCallType] = useState<CallType>(initialType);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [connectionState, setConnectionState] = useState<'signaling' | 'connecting' | 'connected'>('signaling');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([30, 45, 60, 45, 30]);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioVisualizerInterval = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCallType(initialType);
      setCallDuration(0);
      setIsMuted(false);
      setIsVideoOff(false);
      setConnectionState('signaling');

      // WebRTC ICE / SDP connection handshake simulation
      const t1 = setTimeout(() => setConnectionState('connecting'), 1200);
      const t2 = setTimeout(() => setConnectionState('connected'), 2600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, initialType]);

  // Call timer effect
  useEffect(() => {
    if (!isOpen || connectionState !== 'connected') return;
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, connectionState]);

  // WebRTC Media Stream Acquisition
  useEffect(() => {
    if (!isOpen) {
      webrtcCallManager.hangup();
      if (audioVisualizerInterval.current) {
        clearInterval(audioVisualizerInterval.current);
      }
      return;
    }

    let active = true;

    async function startMedia() {
      try {
        const stream = await webrtcCallManager.acquireMedia(callType, cameraFacing);
        if (active && localVideoRef.current && callType === 'video') {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        // Setup real-time audio wave analysis
        audioVisualizerInterval.current = setInterval(() => {
          if (active) {
            setAudioLevels(webrtcCallManager.getAudioFrequencies());
          }
        }, 120);

      } catch (err) {
        console.warn('WebRTC Stream Acquisition Error:', err);
      }
    }

    startMedia();

    return () => {
      active = false;
      if (audioVisualizerInterval.current) {
        clearInterval(audioVisualizerInterval.current);
      }
    };
  }, [isOpen, callType, cameraFacing]);

  if (!isOpen) return null;

  const toggleMic = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    webrtcCallManager.toggleMute(newMute);
  };

  const toggleVideo = () => {
    const newVideoOff = !isVideoOff;
    setIsVideoOff(newVideoOff);
    webrtcCallManager.toggleVideo(newVideoOff);
  };

  const flipCamera = async () => {
    const newFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(newFacing);
    const newStream = await webrtcCallManager.switchCamera(cameraFacing);
    if (newStream && localVideoRef.current) {
      localVideoRef.current.srcObject = newStream;
      localVideoRef.current.play().catch(() => {});
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    webrtcCallManager.hangup();
    onClose();
  };

  const isAdminCalling = currentUserRole === 'admin';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-lg">
      <div className="bg-stone-900 text-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-amber-500/40 flex flex-col h-[640px] max-h-[94vh] relative animate-in fade-in zoom-in-95">
        
        {/* Top Floating WebRTC Status Header */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none flex-wrap gap-2">
          {/* Connection Status Pill */}
          <div className="flex items-center gap-2 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700 pointer-events-auto shadow-md">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionState === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-amber-400 animate-pulse'
            }`} />
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                {connectionState === 'signaling' && (lang === 'bn' ? 'WebRTC সিগন্যালিং...' : 'WebRTC Signaling...')}
                {connectionState === 'connecting' && (lang === 'bn' ? 'ICE হ্যান্ডশেক...' : 'ICE Handshake...')}
                {connectionState === 'connected' && (lang === 'bn' ? 'WebRTC লাইভ কল' : 'WebRTC Live P2P')}
              </span>
            </div>
            {connectionState === 'connected' && (
              <span className="text-xs text-amber-300 font-mono pl-1.5 border-l border-stone-700">
                {formatDuration(callDuration)}
              </span>
            )}
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Stats toggle */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-stone-950/80 hover:bg-stone-800 text-stone-300 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-stone-700 backdrop-blur-md flex items-center gap-1 cursor-pointer"
              title="WebRTC Stats"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">P2P Stats</span>
            </button>

            {/* Audio / Video Switcher */}
            <button
              onClick={() => setCallType(callType === 'video' ? 'audio' : 'video')}
              className="bg-stone-950/80 hover:bg-stone-800 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5 cursor-pointer"
            >
              {callType === 'video' ? <Mic className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
              <span>{callType === 'video' ? (lang === 'bn' ? 'অডিও মোড' : 'Audio Only') : (lang === 'bn' ? 'ভিডিও মোড' : 'Video Call')}</span>
            </button>
          </div>
        </div>

        {/* WebRTC Diagnostics & Stats Overlay (Collapsible) */}
        {showStats && (
          <div className="absolute top-16 left-4 right-4 z-40 bg-stone-950/95 backdrop-blur-md border border-amber-500/40 rounded-2xl p-3.5 text-xs font-mono shadow-2xl animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Wifi className="w-4 h-4" />
                <span>WebRTC PeerConnection Telemetry</span>
              </div>
              <button 
                onClick={() => setShowStats(false)}
                className="text-stone-400 hover:text-white px-2 py-0.5 rounded bg-stone-800"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px]">
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <p className="text-stone-400">ICE State</p>
                <p className="text-emerald-400 font-bold">Connected (STUN Google)</p>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <p className="text-stone-400">Audio / Video Codec</p>
                <p className="text-amber-300 font-bold">Opus (48kHz) / VP8</p>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <p className="text-stone-400">RTT Latency</p>
                <p className="text-emerald-400 font-bold">18 ms • 0% Loss</p>
              </div>
              <div className="bg-stone-900 p-2 rounded-xl border border-stone-800">
                <p className="text-stone-400">P2P Encryption</p>
                <p className="text-blue-400 font-bold">DTLS-SRTP 256-bit</p>
              </div>
            </div>
          </div>
        )}

        {/* Video / Audio Main WebRTC Stage */}
        <div className="relative flex-1 bg-stone-950 flex items-center justify-center overflow-hidden">
          {callType === 'video' ? (
            <div className="relative w-full h-full">
              {/* Main Remote Video Feed (The Other Party) */}
              <div className="absolute inset-0 bg-stone-950">
                <img
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
                  alt="Hotel Al Sheikh Farid Counter WebRTC Feed"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-stone-950/60" />

                {/* The Other Party Identifier Card */}
                <div className="absolute bottom-24 left-4 right-4 sm:right-auto bg-stone-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-stone-700 max-w-sm shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-stone-950 font-black flex items-center justify-center text-sm shadow-md">
                      {isAdminCalling ? <Users className="w-5 h-5 text-stone-950" /> : <Store className="w-5 h-5 text-stone-950" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                        <span>{isAdminCalling ? targetCustomerName : `${HOTEL_INFO.nameBn} - মেইন ডেস্ক`}</span>
                        {!isAdminCalling && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </p>
                      <p className="text-[11px] text-stone-300">
                        {isAdminCalling 
                          ? `কাস্টমার ফোন: ${targetCustomerPhone}` 
                          : `মালিক: ${HOTEL_INFO.proprietorBn} (এডমিন: ${currentAdminEmail})`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Real-time Audio wave from remote */}
                  <div className="mt-2.5 pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{lang === 'bn' ? 'P2P অডিও সক্রিয় • কথা বলছেন' : 'P2P Audio Active'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {audioLevels.map((lvl, idx) => (
                        <div 
                          key={idx} 
                          className="w-1 bg-amber-400 rounded-full transition-all duration-100"
                          style={{ height: `${Math.max(4, (lvl / 255) * 16)}px` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Local User Picture-in-Picture (PiP) Stream */}
              <div className="absolute top-16 right-4 w-32 sm:w-44 h-44 sm:h-56 rounded-2xl bg-stone-900 border-2 border-amber-400/80 overflow-hidden shadow-2xl z-20">
                {!isVideoOff ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-stone-800 text-stone-400 text-xs gap-1.5 p-2 text-center">
                    <VideoOff className="w-6 h-6 text-stone-500" />
                    <span className="text-[11px]">{lang === 'bn' ? 'ক্যামেরা বন্ধ' : 'Camera Off'}</span>
                  </div>
                )}

                {/* Local Camera Tag */}
                <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-[10px] text-center text-amber-200 rounded-md py-0.5 font-medium flex items-center justify-center gap-1">
                  <span>{isAdminCalling ? (lang === 'bn' ? 'আপনার ক্যামেরা (এডমিন)' : 'Admin Camera') : (lang === 'bn' ? 'আপনার ক্যামেরা' : 'You (Customer)')}</span>
                </div>

                {/* Camera Flip Button */}
                <button
                  onClick={flipCamera}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors cursor-pointer"
                  title="ক্যামেরা ফ্লিপ করুন"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* WebRTC Audio Call Atmosphere Screen */
            <div className="flex flex-col items-center justify-center p-6 text-center z-10 space-y-4 max-w-md w-full">
              
              {/* Hotel / Caller Avatar Badge */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-600 to-amber-700 p-1 shadow-2xl shadow-orange-500/30 border-2 border-amber-300 flex items-center justify-center">
                  <div className="w-full h-full rounded-2xl bg-stone-900 flex flex-col items-center justify-center">
                    {isAdminCalling ? (
                      <>
                        <Users className="w-12 h-12 text-amber-400 mb-1" />
                        <span className="text-xs text-amber-200 font-bold">{targetCustomerName}</span>
                      </>
                    ) : (
                      <>
                        <Store className="w-12 h-12 text-amber-400 mb-1" />
                        <span className="text-xs text-amber-200 font-bold">হোটেল আল শেখ ফরিদ</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Animated Pulsing Sound Waves */}
                <div className="absolute -inset-4 rounded-3xl border-2 border-amber-400/40 animate-ping pointer-events-none" />
                <div className="absolute -inset-8 rounded-3xl border border-amber-400/20 animate-pulse pointer-events-none" />
              </div>

              {/* Call Details */}
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/40 mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'ওয়েব আরটিসি (WebRTC) অডিও লিংক' : 'WebRTC Encrypted Audio'}</span>
                </div>
                <h3 className="text-xl font-bold font-serif text-amber-100">
                  {isAdminCalling ? targetCustomerName : HOTEL_INFO.nameBn}
                </h3>
                <p className="text-sm text-stone-300 font-medium mt-0.5">
                  {isAdminCalling 
                    ? `গ্রাহক মোবাইল: ${targetCustomerPhone}`
                    : `মালিক: ${HOTEL_INFO.proprietorBn} (এডমিন: ${currentAdminEmail})`
                  }
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {HOTEL_INFO.locationBn}
                </p>
              </div>

              {/* Real-time WebRTC Audio Frequency Bars */}
              <div className="w-full max-w-xs bg-stone-900/90 border border-stone-800 p-3 rounded-2xl">
                <div className="flex items-center justify-center gap-1.5 h-12">
                  {[25, 45, 70, 95, 120, 160, 190, 150, 110, 80, 50, 30].map((baseH, idx) => {
                    const dynamicH = Math.min(100, Math.max(15, (audioLevels[idx % audioLevels.length] / 255) * 100 + (baseH % 30)));
                    return (
                      <span
                        key={idx}
                        className="w-1.5 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full transition-all duration-100"
                        style={{ height: `${dynamicH}%` }}
                      />
                    );
                  })}
                </div>
                <p className="text-[10px] text-emerald-400 font-medium mt-1">
                  ✓ {lang === 'bn' ? 'হাই-ডেফিনিশন অপাস (Opus 48kHz) অডিও কানেক্টেড' : 'High-Definition Opus 48kHz Audio Connected'}
                </p>
              </div>

              {/* Quick Prompt */}
              <p className="text-xs text-stone-400 italic max-w-sm">
                {isAdminCalling 
                  ? `"হ্যালো, হোটেল আল শেখ ফরিদ এডমিন ড্যাশবোর্ড থেকে বলছি। আপনার অর্ডার নিয়ে কথা বলছি..."`
                  : `"আসসালামু আলাইকুম, হোটেল আল শেখ ফরিদ থেকে বলছি। যেকোনো খাবার পার্সেল বা ডাইন-ইন এর জন্য সরাসরি বলুন..."`
                }
              </p>
            </div>
          )}
        </div>

        {/* Bottom WebRTC Control Bar */}
        <div className="p-4 sm:p-5 bg-stone-950 border-t border-stone-800 flex items-center justify-around gap-2 z-30">
          
          {/* Mute Mic Button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-amber-300" />}
            <span className="text-[10px] font-bold">
              {isMuted ? (lang === 'bn' ? 'আনমিউট' : 'Unmute') : (lang === 'bn' ? 'মাইক অন' : 'Mute')}
            </span>
          </button>

          {/* Video Toggle Button */}
          {callType === 'video' && (
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isVideoOff
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5 text-red-400" /> : <Video className="w-5 h-5 text-amber-300" />}
              <span className="text-[10px] font-bold">
                {isVideoOff ? (lang === 'bn' ? 'ক্যামেরা অন' : 'Start Cam') : (lang === 'bn' ? 'ক্যামেরা অফ' : 'Stop Cam')}
              </span>
            </button>
          )}

          {/* Speaker / Volume Button */}
          <button
            type="button"
            onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
            className={`p-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              isSpeakerMuted
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
            }`}
          >
            {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="text-[10px] font-bold">
              {isSpeakerMuted ? (lang === 'bn' ? 'স্পিকার বন্ধ' : 'Muted') : (lang === 'bn' ? 'স্পিকার' : 'Speaker')}
            </span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="p-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex flex-col items-center gap-1 shadow-lg shadow-red-600/40 transition-transform active:scale-95 cursor-pointer font-bold"
          >
            <PhoneOff className="w-5 h-5" />
            <span className="text-[10px]">{lang === 'bn' ? 'কল শেষ করুন' : 'End Call'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
