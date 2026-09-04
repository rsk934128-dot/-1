import { playNotificationChime } from '../utils/notificationSound';
import { Order } from '../types';
import { BackgroundSyncService } from './backgroundSyncService';

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
  
  if ('Notification' in window) {
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
  }

  const savedSimulated = localStorage.getItem(STORAGE_KEY_NOTIFICATION_ENABLED);
  if (savedSimulated === 'true') {
    return 'simulated_enabled';
  } else if (savedSimulated === 'false') {
    return 'denied';
  }

  return 'default';
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  let nativeGranted = false;
  if ('Notification' in window) {
    try {
      const permission = await BackgroundSyncService.requestNotificationPermission();
      nativeGranted = permission === 'granted';
    } catch {
      // In some iframe environments requestPermission might throw
    }
  }

  // Always enable simulated push notification state in local storage
  localStorage.setItem(STORAGE_KEY_NOTIFICATION_ENABLED, 'true');
  return nativeGranted || true;
}

export function sendSimulatedPushNotification(
  payload: PushNotificationPayload,
  onShowInAppToast?: (payload: PushNotificationPayload) => void
) {
  // Delegate to BackgroundSyncService which handles:
  // - Real native Service Worker lock-screen notifications (when app is minimized)
  // - Audio chime & brass bell
  // - Mobile vibration
  // - In-app toasts
  if (onShowInAppToast) {
    BackgroundSyncService.setInAppToastHandler(onShowInAppToast);
  }
  BackgroundSyncService.sendRealTimeNotification(payload);
}

