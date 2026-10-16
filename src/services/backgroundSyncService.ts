import { SoundNotificationService } from './soundNotificationService';
import { PushNotificationPayload } from './notificationService';
import { safeStorage } from '../utils/safeStorage';

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: string; // '4g', '3g', '2g', 'wifi'
  downlink?: number; // Mbps
  rtt?: number; // ms
  lastChecked: number;
}

export type LowPowerPreference = 'auto' | 'enabled' | 'disabled';

export interface BackgroundServiceState {
  isSupported: boolean;
  swRegistered: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  isWakeLockActive: boolean;
  isWakeLockSupported: boolean;
  isOnline: boolean;
  isAppMinimized: boolean;
  lastHeartbeat: number;
  // Low Power Mode properties
  isLowPowerMode: boolean;
  lowPowerModePreference: LowPowerPreference;
  batteryLevel: number | null; // 0.0 to 1.0 (e.g. 0.18 = 18%)
  isCharging: boolean | null;
  isBatterySupported: boolean;
  syncIntervalMs: number; // 5000ms normal, 30000ms low power
}

type StateListener = (state: BackgroundServiceState) => void;

class BackgroundSyncServiceClass {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private wakeLockSentinel: any = null;
  private wakeLockRequested: boolean = false;
  private heartbeatWorker: Worker | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isMinimized: boolean = false;
  private listeners: Set<StateListener> = new Set();
  private lastHeartbeat: number = Date.now();
  private toastCallback: ((payload: PushNotificationPayload) => void) | null = null;

  // Low Power Mode internals
  private isLowPowerMode: boolean = false;
  private lowPowerPreference: LowPowerPreference = 'auto';
  private batteryLevel: number | null = null;
  private isCharging: boolean | null = null;
  private isBatterySupported: boolean = false;
  private simulatedBatteryLevel: number | null = null;
  private simulatedCharging: boolean | null = null;
  private syncIntervalMs: number = 5000;
  private fallbackIntervalId: any = null;
  private batteryManager: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isMinimized = document.visibilityState === 'hidden';
      this.wakeLockRequested = safeStorage.getItem('al_sheikh_wake_lock_enabled') === 'true';

      const savedPref = safeStorage.getItem('al_sheikh_low_power_pref') as LowPowerPreference;
      if (savedPref && ['auto', 'enabled', 'disabled'].includes(savedPref)) {
        this.lowPowerPreference = savedPref;
      }

      // 1. Register Service Worker for PWA & Background Push
      this.initServiceWorker();

      // 2. Setup Visibility Listeners (detecting minimized state)
      document.addEventListener('visibilitychange', () => {
        const wasMinimized = this.isMinimized;
        this.isMinimized = document.visibilityState === 'hidden';
        
        // If coming back from minimized and wakeLock was enabled and not in critical low power, re-acquire
        if (wasMinimized && !this.isMinimized && this.wakeLockRequested && !this.isLowPowerMode) {
          this.requestWakeLock();
        }

        this.notifyState();
      });

      // 3. Setup Online / Offline Network Monitoring
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.handleNetworkReconnected();
        this.notifyState();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.handleNetworkDisconnected();
        this.notifyState();
      });

      // 4. Start Heartbeat Web Worker (Unthrottled background timer)
      this.initHeartbeatWorker();

      // 5. Restore WakeLock if previously enabled and not in low power mode
      if (this.wakeLockRequested && !this.isLowPowerMode) {
        setTimeout(() => this.requestWakeLock(), 1000);
      }

      // 6. Initialize Battery Monitoring & Low Power Mode
      this.initBatteryMonitoring();
    }
  }

  public setInAppToastHandler(handler: (payload: PushNotificationPayload) => void) {
    this.toastCallback = handler;
  }

  /**
   * Initializes Battery Status API monitoring
   */
  private async initBatteryMonitoring() {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      try {
        const bm = await (navigator as any).getBattery();
        this.batteryManager = bm;
        this.isBatterySupported = true;
        this.batteryLevel = typeof bm.level === 'number' ? bm.level : null;
        this.isCharging = typeof bm.charging === 'boolean' ? bm.charging : null;

        const handleBatteryChange = () => {
          this.batteryLevel = typeof bm.level === 'number' ? bm.level : null;
          this.isCharging = typeof bm.charging === 'boolean' ? bm.charging : null;
          this.evaluateLowPowerMode();
        };

        bm.addEventListener('levelchange', handleBatteryChange);
        bm.addEventListener('chargingchange', handleBatteryChange);

        this.evaluateLowPowerMode();
      } catch (err) {
        console.warn('[BackgroundSync] Battery API access error:', err);
        this.isBatterySupported = false;
        this.evaluateLowPowerMode();
      }
    } else {
      this.isBatterySupported = false;
      this.evaluateLowPowerMode();
    }
  }

  /**
   * Evaluates whether Low Power Mode should be engaged.
   * Auto mode criteria: Battery <= 20% (0.20) and not charging.
   */
  public evaluateLowPowerMode(): boolean {
    const effLevel = this.simulatedBatteryLevel !== null ? this.simulatedBatteryLevel : this.batteryLevel;
    const effCharging = this.simulatedCharging !== null ? this.simulatedCharging : this.isCharging;

    let shouldBeActive = false;
    if (this.lowPowerPreference === 'enabled') {
      shouldBeActive = true;
    } else if (this.lowPowerPreference === 'disabled') {
      shouldBeActive = false;
    } else {
      // 'auto' mode
      if (effLevel !== null && effLevel <= 0.20 && effCharging === false) {
        shouldBeActive = true;
      } else {
        shouldBeActive = false;
      }
    }

    if (shouldBeActive !== this.isLowPowerMode) {
      const prevActive = this.isLowPowerMode;
      this.isLowPowerMode = shouldBeActive;
      this.applyLowPowerModeState(shouldBeActive, prevActive);
    } else {
      this.notifyState();
    }

    return this.isLowPowerMode;
  }

  /**
   * Applies the Low Power Mode side effects:
   * 1. Dimming UI & Disabling non-essential animations via HTML class
   * 2. Reducing background sync frequency (heartbeat worker 5s -> 30s)
   * 3. Releasing WakeLock to prevent rapid battery depletion
   * 4. Displaying notification/toast to the user
   */
  private applyLowPowerModeState(isActive: boolean, wasActive: boolean) {
    if (typeof document !== 'undefined') {
      if (isActive) {
        document.documentElement.classList.add('low-power-mode');
      } else {
        document.documentElement.classList.remove('low-power-mode');
      }
    }

    // Sync frequency: 30,000ms (30s) during low power mode, 5,000ms (5s) in standard mode
    const targetInterval = isActive ? 30000 : 5000;
    this.setHeartbeatInterval(targetInterval);

    // Release WakeLock if low power is enabled to avoid depleting the phone
    if (isActive && this.isWakeLockActive()) {
      this.releaseWakeLock();
    }

    // In-app alert
    if (isActive && !wasActive) {
      const effLevel = this.simulatedBatteryLevel !== null ? this.simulatedBatteryLevel : this.batteryLevel;
      const pct = effLevel !== null ? Math.round(effLevel * 100) : 20;
      if (this.toastCallback) {
        this.toastCallback({
          id: `low-power-${Date.now()}`,
          title: '🪫 লো পাওয়ার মোড সক্রিয় (Low Power Mode)',
          body: `ব্যাটারি কম (${pct}%)। ব্যাটারি সাশ্রয়ে স্ক্রিন ডিম, অ্যানিমেশন বন্ধ ও ব্যাকগ্রাউন্ড সিঙ্ক ৩০ সেকেন্ডে সীমিত করা হয়েছে।`,
          timestamp: 'এখনই',
          statusText: 'ব্যাটারি সেভার'
        });
      }
    } else if (!isActive && wasActive) {
      if (this.toastCallback) {
        this.toastCallback({
          id: `normal-power-${Date.now()}`,
          title: '⚡ স্বাভাবিক পাওয়ার মোড ফিরে এসেছে',
          body: 'পূর্ণ স্ক্রিন ব্রাইটনেস, মসৃণ অ্যানিমেশন ও ৫ সেকেন্ডের রিয়েল-টাইম ব্যাকগ্রাউন্ড সিঙ্ক চালু হয়েছে।',
          timestamp: 'এখনই',
          statusText: 'স্বাভাবিক'
        });
      }
    }

    this.notifyState();
  }

  /**
   * Adjusts the Heartbeat Worker interval
   */
  private setHeartbeatInterval(intervalMs: number) {
    this.syncIntervalMs = intervalMs;
    if (this.heartbeatWorker) {
      this.heartbeatWorker.postMessage({ type: 'set_interval', interval: intervalMs });
    } else {
      if (this.fallbackIntervalId) {
        clearInterval(this.fallbackIntervalId);
      }
      this.fallbackIntervalId = setInterval(() => {
        this.lastHeartbeat = Date.now();
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'PING' });
        }
        this.notifyState();
      }, intervalMs);
    }
  }

  /**
   * Set user preference for Low Power Mode: 'auto' | 'enabled' | 'disabled'
   */
  public setLowPowerModePreference(pref: LowPowerPreference): void {
    this.lowPowerPreference = pref;
    safeStorage.setItem('al_sheikh_low_power_pref', pref);
    this.evaluateLowPowerMode();
  }

  /**
   * Toggle Low Power Mode manually
   */
  public toggleLowPowerMode(): boolean {
    if (this.isLowPowerMode) {
      this.setLowPowerModePreference('disabled');
      return false;
    } else {
      this.setLowPowerModePreference('enabled');
      return true;
    }
  }

  /**
   * Simulate a battery level for testing/demonstration across any browser
   */
  public simulateBattery(level: number, charging: boolean = false): void {
    this.simulatedBatteryLevel = Math.max(0, Math.min(1, level));
    this.simulatedCharging = charging;
    this.evaluateLowPowerMode();
  }

  /**
   * Reset battery simulation to real hardware status
   */
  public resetBatterySimulation(): void {
    this.simulatedBatteryLevel = null;
    this.simulatedCharging = null;
    this.evaluateLowPowerMode();
  }

  /**
   * Initializes Service Worker for background caching & notifications
   */
  private async initServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      this.swRegistration = reg;

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[BackgroundSync] New service worker ready');
            }
          });
        }
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PONG') {
          this.lastHeartbeat = Date.now();
          this.notifyState();
        }
      });

      this.notifyState();
    } catch (err) {
      console.warn('[BackgroundSync] Service Worker registration failed:', err);
    }
  }

  /**
   * Spawns a background timer with Web Worker or reliable interval fallback.
   * Catches worker errors gracefully to prevent cross-origin "Script error." in iframes.
   */
  private initHeartbeatWorker() {
    if (typeof window === 'undefined') return;

    const startFallbackTimer = () => {
      if (this.fallbackIntervalId) clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = setInterval(() => {
        this.lastHeartbeat = Date.now();
        if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller) {
          try {
            navigator.serviceWorker.controller.postMessage({ type: 'PING' });
          } catch {}
        }
        this.notifyState();
      }, this.syncIntervalMs);
    };

    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;
    if (isInsideIframe) {
      // In sandboxed iframes (e.g. AI Studio preview), Blob Web Workers can trigger CSP "Script error."
      // Use rock-solid interval fallback directly.
      startFallbackTimer();
      return;
    }

    if (typeof Worker !== 'undefined' && typeof Blob !== 'undefined') {
      try {
        const workerCode = `
          let intervalId = null;
          self.onmessage = function(e) {
            if (e.data && (e.data.type === 'start' || e.data.type === 'set_interval')) {
              if (intervalId) clearInterval(intervalId);
              intervalId = setInterval(function() {
                self.postMessage({ type: 'TICK', timestamp: Date.now() });
              }, e.data.interval || 5000);
            } else if (e.data === 'stop') {
              if (intervalId) clearInterval(intervalId);
            }
          };
        `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        const worker = new Worker(blobUrl);

        worker.onerror = (e) => {
          if (e && typeof e.preventDefault === 'function') {
            e.preventDefault();
          }
          console.warn('[BackgroundSync] Worker error caught, switching to fallback timer');
          if (this.heartbeatWorker) {
            try { this.heartbeatWorker.terminate(); } catch {}
            this.heartbeatWorker = null;
          }
          startFallbackTimer();
        };

        worker.onmessage = (e) => {
          if (e.data && e.data.type === 'TICK') {
            this.lastHeartbeat = e.data.timestamp;
            if (navigator.serviceWorker && navigator.serviceWorker.controller) {
              try {
                navigator.serviceWorker.controller.postMessage({ type: 'PING' });
              } catch {}
            }
          }
        };

        this.heartbeatWorker = worker;
        worker.postMessage({ type: 'start', interval: this.syncIntervalMs });
        URL.revokeObjectURL(blobUrl);
        return;
      } catch (err) {
        console.warn('[BackgroundSync] Worker instantiation skipped, using safe interval timer:', err);
      }
    }

    startFallbackTimer();
  }

  /**
   * Request Notification Permission
   */
  public async requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      this.notifyState();
      return permission;
    } catch (err) {
      console.warn('[BackgroundSync] Notification permission error:', err);
      return 'unsupported';
    }
  }

  /**
   * Request Screen WakeLock (prevents phone screen from dimming/sleeping)
   */
  public async requestWakeLock(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    // Do not acquire wakeLock if currently in low power mode to protect battery
    if (this.isLowPowerMode) {
      return false;
    }

    try {
      this.wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      this.wakeLockRequested = true;
      safeStorage.setItem('al_sheikh_wake_lock_enabled', 'true');

      this.wakeLockSentinel.addEventListener('release', () => {
        this.wakeLockSentinel = null;
        this.notifyState();
      });

      this.notifyState();
      return true;
    } catch {
      this.wakeLockSentinel = null;
      this.notifyState();
      return false;
    }
  }

  /**
   * Release Screen WakeLock
   */
  public async releaseWakeLock(): Promise<void> {
    this.wakeLockRequested = false;
    safeStorage.setItem('al_sheikh_wake_lock_enabled', 'false');

    if (this.wakeLockSentinel) {
      try {
        await this.wakeLockSentinel.release();
      } catch {}
      this.wakeLockSentinel = null;
    }
    this.notifyState();
  }

  public toggleWakeLock(): Promise<boolean> {
    if (this.isWakeLockActive()) {
      this.releaseWakeLock();
      return Promise.resolve(false);
    } else {
      return this.requestWakeLock();
    }
  }

  public isWakeLockActive(): boolean {
    return !!this.wakeLockSentinel && !this.wakeLockSentinel.released;
  }

  /**
   * Dispatches a real-time notification that works in foreground AND when minimized
   */
  public async sendRealTimeNotification(payload: PushNotificationPayload) {
    const isMinimized = typeof document !== 'undefined' && document.visibilityState === 'hidden';

    // 1. Audio chime & Kitchen bell
    SoundNotificationService.playNotificationChime();

    // 2. Hardware vibration on mobile (shorter pulse in Low Power Mode)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const pattern = this.isLowPowerMode ? [100] : [200, 100, 200, 100, 300];
        navigator.vibrate(pattern);
      } catch {}
    }

    // 3. Show System / Lock-screen notification via Service Worker
    let nativeShown = false;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const vibratePattern = this.isLowPowerMode ? [100] : [200, 100, 200, 100, 300];
        if (this.swRegistration) {
          await this.swRegistration.showNotification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icon-192.png',
            badge: payload.badge || '/favicon-32x32.png',
            vibrate: vibratePattern,
            tag: payload.tag || payload.id || 'al-sheikh-' + Date.now(),
            renotify: true,
            requireInteraction: !this.isLowPowerMode,
            data: {
              url: '/',
              orderId: payload.orderId,
              timestamp: Date.now()
            }
          } as any);
          nativeShown = true;
        } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            payload
          });
          nativeShown = true;
        } else if (!isMinimized) {
          new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || '/icon-192.png',
            badge: payload.badge || '/favicon-32x32.png',
            tag: payload.tag || payload.id
          });
          nativeShown = true;
        }
      } catch (e) {
        console.warn('[BackgroundSync] Native notification dispatch error:', e);
      }
    }

    // 4. In-App Toast notification
    if (this.toastCallback) {
      this.toastCallback(payload);
    }

    return nativeShown;
  }

  /**
   * Schedules a test notification so user can minimize their app and see it appear on mobile lock screen!
   */
  public scheduleTestPush(delaySeconds = 4, lang: 'bn' | 'en' = 'bn'): boolean {
    const title = lang === 'bn' 
      ? '🔔 হোটেল আল শেখ ফরিদ - ব্যাকগ্রাউন্ড নোটিফিকেশন সফল!' 
      : '🔔 Hotel Al Sheikh Farid - Background Push Verified!';
    const body = lang === 'bn'
      ? 'আপনার মোবাইল ডিভাইস মিনিমাইজ থাকলেও আমাদের রিয়েল-টাইম অর্ডার ও কিচেন আপডেট সক্রিয় রয়েছে।'
      : 'Your mobile device stays active in background with live kitchen & order alerts.';

    // Send to Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        delay: delaySeconds * 1000,
        payload: {
          title,
          body,
          icon: '/icon-192.png',
          badge: '/favicon-32x32.png',
          url: '/'
        }
      });
      return true;
    } else if (this.swRegistration) {
      setTimeout(() => {
        this.sendRealTimeNotification({
          id: `test-push-${Date.now()}`,
          title,
          body,
          timestamp: 'এখনই'
        });
      }, delaySeconds * 1000);
      return true;
    }
    return false;
  }

  /**
   * Reconnected to internet
   */
  private handleNetworkReconnected() {
    SoundNotificationService.playNotificationChime();
    const payload: PushNotificationPayload = {
      id: `reconnect-${Date.now()}`,
      title: '🌐 ইন্টারনেট সংযুক্ত হয়েছে!',
      body: 'হোটেল আল শেখ ফরিদ এখন সক্রিয় ও রিয়েল টাইমে সংযুক্ত। সমস্ত অর্ডার লাইভ সিঙ্ক হচ্ছে।',
      timestamp: 'এখনই',
      statusText: 'অনলাইন ✓'
    };

    if (this.isMinimized && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      this.sendRealTimeNotification(payload);
    } else if (this.toastCallback) {
      this.toastCallback(payload);
    }
  }

  /**
   * Disconnected from internet
   */
  private handleNetworkDisconnected() {
    const payload: PushNotificationPayload = {
      id: `offline-${Date.now()}`,
      title: '⚠️ ইন্টারনেট সংযোগ বিচ্ছিন্ন!',
      body: 'আপনি অফলাইনে আছেন। ক্যাশড মেনু প্রদর্শিত হচ্ছে। ইন্টারনেট ফিরলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।',
      timestamp: 'এখনই',
      statusText: 'অফলাইন'
    };

    if (this.toastCallback) {
      this.toastCallback(payload);
    }
  }

  /**
   * Get Current State
   */
  public getState(): BackgroundServiceState {
    const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator;
    const notificationPermission = typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported';
    const isWakeLockSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;
    const effLevel = this.simulatedBatteryLevel !== null ? this.simulatedBatteryLevel : this.batteryLevel;
    const effCharging = this.simulatedCharging !== null ? this.simulatedCharging : this.isCharging;

    return {
      isSupported,
      swRegistered: !!this.swRegistration,
      notificationPermission,
      isWakeLockActive: this.isWakeLockActive(),
      isWakeLockSupported,
      isOnline: this.isOnline,
      isAppMinimized: this.isMinimized,
      lastHeartbeat: this.lastHeartbeat,
      isLowPowerMode: this.isLowPowerMode,
      lowPowerModePreference: this.lowPowerPreference,
      batteryLevel: effLevel,
      isCharging: effCharging,
      isBatterySupported: this.isBatterySupported,
      syncIntervalMs: this.syncIntervalMs
    };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyState() {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch {}
    });
  }
}

export const BackgroundSyncService = new BackgroundSyncServiceClass();
export default BackgroundSyncService;
