import { playNotificationChime } from '../utils/notificationSound';
import { Order } from '../types';

export interface PushNotificationPayload {
  id: string;
  title: string;
  body: string;
  orderId?: string;
  order?: Order;
  timestamp: string;
  icon?: string;
  badge?: string;
  tag?: string;
  statusText?: string;
}

const STORAGE_KEY_NOTIFICATION_ENABLED = 'al_sheikh_farid_push_enabled';

export function getPushNotificationStatus(): 'granted' | 'denied' | 'default' | 'simulated_enabled' {
  if (typeof window === 'undefined') return 'default';
  
  const savedSimulated = localStorage.getItem(STORAGE_KEY_NOTIFICATION_ENABLED);
  if (savedSimulated === 'true') {
    return 'simulated_enabled';
  } else if (savedSimulated === 'false') {
    return 'denied';
  }

  if ('Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
  }

  return 'default';
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  let nativeGranted = false;
  if ('Notification' in window) {
    try {
      const permission = await Notification.requestPermission();
      nativeGranted = permission === 'granted';
    } catch {
      // In some iframe environments requestPermission might throw
    }
  }

  // Always enable simulated push notification state
  localStorage.setItem(STORAGE_KEY_NOTIFICATION_ENABLED, 'true');
  return nativeGranted || true;
}

export function sendSimulatedPushNotification(
  payload: PushNotificationPayload,
  onShowInAppToast?: (payload: PushNotificationPayload) => void
) {
  // 1. Play audio chime
  playNotificationChime();

  // 2. Vibration on mobile
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 150, 80, 250]);
    } catch {
      // ignore
    }
  }

  // 3. Native Browser Notification (if supported and granted)
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const nativeNotif = new Notification(payload.title, {
        body: payload.body,
        icon: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=192&q=80',
        badge: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=96&q=80',
        tag: payload.tag || payload.id,
      });

      nativeNotif.onclick = () => {
        window.focus();
      };
    } catch {
      // ignore iframe restriction
    }
  }

  // 4. In-App Simulated Push Notification Toast
  if (onShowInAppToast) {
    onShowInAppToast(payload);
  }
}
