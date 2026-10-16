import { CallType, WebRtcCallSession, SUPER_ADMIN_EMAILS } from '../types';

export interface WebRtcStats {
  iceState: RTCIceConnectionState | string;
  connectionState: RTCPeerConnectionState | string;
  signalingState: RTCSignalingState | string;
  audioCodec: string;
  videoCodec: string;
  bitrateKbps: number;
  rttMs: number;
  packetsLost: number;
  fps: number;
  resolution: string;
}

export class WebRtcCallManager {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;

  // ICE Servers (STUN servers for real WebRTC NAT traversal)
  private iceServers: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun.services.mozilla.com' },
    ],
  };

  /**
   * Request user media stream (Camera & Microphone)
   */
  async acquireMedia(type: CallType, facingMode: 'user' | 'environment' = 'user'): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: type === 'video' ? {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
      } : false,
    };

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localStream = stream;
        this.initAudioAnalyser(stream);
        return stream;
      } else {
        throw new Error('getUserMedia is not supported on this browser');
      }
    } catch (err: any) {
      console.warn('WebRTC getUserMedia fallback to synthetic stream:', err);
      // Fallback: Create a silent/synthetic media stream if permissions blocked
      const syntheticStream = this.createSyntheticStream(type);
      this.localStream = syntheticStream;
      return syntheticStream;
    }
  }

  /**
   * Setup Web Audio API Analyser for real-time audio visualization
   */
  private initAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        this.audioSource = this.audioContext.createMediaStreamSource(stream);
        this.audioSource.connect(this.analyser);
      }
    } catch (err) {
      console.warn('Could not initialize Web Audio Analyser:', err);
    }
  }

  /**
   * Get audio frequency levels array for visualization (0 - 255)
   */
  getAudioFrequencies(): number[] {
    if (!this.analyser) {
      // Simulate pulsating frequency bars if real mic not capturing
      return [
        Math.floor(Math.random() * 80) + 20,
        Math.floor(Math.random() * 140) + 40,
        Math.floor(Math.random() * 200) + 50,
        Math.floor(Math.random() * 160) + 40,
        Math.floor(Math.random() * 90) + 20,
      ];
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Pick 5-7 sample bands
    const step = Math.max(1, Math.floor(dataArray.length / 5));
    const result: number[] = [];
    for (let i = 0; i < 5; i++) {
      result.push(dataArray[i * step] || 0);
    }
    return result;
  }

  /**
   * Initialize RTCPeerConnection
   */
  async createPeerConnection(
    onRemoteTrack?: (stream: MediaStream) => void,
    onIceStateChange?: (state: string) => void
  ): Promise<RTCPeerConnection> {
    if (typeof RTCPeerConnection === 'undefined') {
      console.warn('RTCPeerConnection not supported in this environment');
      return {} as RTCPeerConnection;
    }

    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        if (onRemoteTrack) {
          onRemoteTrack(event.streams[0]);
        }
      }
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState || 'new';
      if (onIceStateChange) {
        onIceStateChange(state);
      }
    };

    return this.peerConnection;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Toggle Audio Mute
   */
  toggleMute(mute: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = !mute;
      });
    }
  }

  /**
   * Toggle Video On/Off
   */
  toggleVideo(videoOff: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = !videoOff;
      });
    }
  }

  /**
   * Switch Camera (Front <-> Back)
   */
  async switchCamera(currentFacing: 'user' | 'environment'): Promise<MediaStream | null> {
    const newFacing = currentFacing === 'user' ? 'environment' : 'user';
    // Stop existing video track
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: true,
      });

      // Replace tracks in peer connection
      if (this.peerConnection && newStream.getVideoTracks().length > 0) {
        const videoTrack = newStream.getVideoTracks()[0];
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      }

      this.localStream = newStream;
      return newStream;
    } catch (err) {
      console.warn('Could not switch camera:', err);
      return null;
    }
  }

  /**
   * Cleanup all resources and close peer connection
   */
  hangup() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    if (this.audioSource) {
      try {
        this.audioSource.disconnect();
      } catch {}
      this.audioSource = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  /**
   * Creates a synthetic Canvas/Audio stream if browser environment or camera hardware is blocked
   */
  private createSyntheticStream(type: CallType): MediaStream {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('হোটেল আল শেখ ফরিদ WebRTC', 150, 240);
    }

    const stream = (canvas as any).captureStream ? (canvas as any).captureStream(15) : new MediaStream();
    return stream;
  }
}

export const webrtcCallManager = new WebRtcCallManager();
