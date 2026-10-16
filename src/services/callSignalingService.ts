import { CallType } from '../types';
import { db, sanitizeForFirestore } from './firebase';
import { safeStorage } from '../utils/safeStorage';
import { callHistoryService } from './callHistoryService';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';

export interface CallSession {
  id: string;
  type: CallType;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
  callerRole: 'customer' | 'admin';
  targetRole: 'admin' | 'customer';
  targetName?: string;
  targetEmail?: string;
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  startedAt: number;
  acceptedAt?: number;
  endedAt?: number;
  durationSeconds?: number;
  initiatorClientId?: string;
  orderId?: string;
  tableNumber?: string;
}

export type CallSignalAction = 
  | { action: 'initiate'; session: CallSession; fromClientId?: string }
  | { action: 'accept'; callId: string; fromClientId?: string }
  | { action: 'decline'; callId: string; fromClientId?: string }
  | { action: 'end'; callId: string; durationSeconds?: number; fromClientId?: string };

type CallListener = (signal: CallSignalAction) => void;

class CallSignalingService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<CallListener> = new Set();
  private currentSession: CallSession | null = null;
  public readonly clientId: string;
  private firestoreUnsubscribe: (() => void) | null = null;

  constructor() {
    this.clientId = typeof window !== 'undefined'
      ? `client-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`
      : 'server';

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('hotel_sheikh_farid_call_sync');
        this.channel.onmessage = (event) => {
          if (event.data) {
            this.handleIncomingSignal(event.data, false);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available, using storage event fallback');
      }
    }

    // Storage event fallback for cross-tab synchronization
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'al_sheikh_farid_call_signal' && e.newValue) {
          try {
            const signal: CallSignalAction = JSON.parse(e.newValue);
            this.handleIncomingSignal(signal, false);
          } catch {}
        }
      });
    }

    // Initialize Firestore Cross-Device Real-Time Call Listener
    this.initFirestoreListener();
  }

  private initFirestoreListener() {
    if (typeof window === 'undefined' || !db) return;

    try {
      const callsCol = collection(db, 'calls');
      // Listen to recently active calls (within last 3 minutes)
      const recentTimestamp = Date.now() - 3 * 60 * 1000;
      const q = query(callsCol, where('startedAt', '>=', recentTimestamp));

      this.firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const callData = change.doc.data() as CallSession;
          if (!callData) return;

          // Skip if this client is the one that initiated the call
          if (callData.initiatorClientId === this.clientId) {
            if (change.type === 'modified') {
              if (callData.status === 'accepted') {
                this.handleIncomingSignal({ action: 'accept', callId: callData.id, fromClientId: 'remote' }, false);
              } else if (callData.status === 'declined') {
                this.handleIncomingSignal({ action: 'decline', callId: callData.id, fromClientId: 'remote' }, false);
              } else if (callData.status === 'ended') {
                this.handleIncomingSignal({ action: 'end', callId: callData.id, fromClientId: 'remote' }, false);
              }
            }
            return;
          }

          // Incoming from a different device / browser
          if (change.type === 'added' && callData.status === 'ringing') {
            this.handleIncomingSignal({ action: 'initiate', session: callData, fromClientId: 'remote' }, false);
          } else if (change.type === 'modified') {
            if (callData.status === 'accepted') {
              this.handleIncomingSignal({ action: 'accept', callId: callData.id, fromClientId: 'remote' }, false);
            } else if (callData.status === 'declined') {
              this.handleIncomingSignal({ action: 'decline', callId: callData.id, fromClientId: 'remote' }, false);
            } else if (callData.status === 'ended') {
              this.handleIncomingSignal({ action: 'end', callId: callData.id, fromClientId: 'remote' }, false);
            }
          }
        });
      }, (err) => {
        console.warn('Firestore call signaling listener notice:', err);
      });
    } catch (err) {
      console.warn('Could not initialize Firestore call signaling:', err);
    }
  }

  private broadcast(signal: CallSignalAction) {
    if (this.channel) {
      try {
        this.channel.postMessage(signal);
      } catch {}
    }
    safeStorage.setItem('al_sheikh_farid_call_signal', JSON.stringify({ ...signal, _t: Date.now() }));
    // Also notify local listeners in the current tab
    this.notifyListeners(signal);
  }

  private handleIncomingSignal(signal: CallSignalAction, fromSelf: boolean = false) {
    if (signal.action === 'initiate') {
      this.currentSession = signal.session;
    } else if (signal.action === 'accept' && this.currentSession) {
      this.currentSession.status = 'accepted';
    } else if (signal.action === 'decline' && this.currentSession) {
      this.currentSession.status = 'declined';
    } else if (signal.action === 'end') {
      this.currentSession = null;
    }
    this.notifyListeners(signal);
  }

  private notifyListeners(signal: CallSignalAction) {
    this.listeners.forEach((listener) => {
      try {
        listener(signal);
      } catch (err) {
        console.error('Call listener error:', err);
      }
    });
  }

  subscribe(listener: CallListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  initiateCall(
    type: CallType, 
    callerName: string, 
    callerPhone: string, 
    callerRole: 'customer' | 'admin' = 'customer',
    callerEmail?: string,
    targetEmail: string = 'fs2217732@gmail.com',
    targetName: string = 'আলহাজ্ব মো: ফরিদ শেখ (হোটেল মালিক)',
    orderId?: string,
    tableNumber?: string
  ): CallSession {
    const session: CallSession = {
      id: `CALL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      callerName: callerName.trim() || (callerRole === 'customer' ? 'অনলাইন কাস্টমার' : 'হোটেল এডমিন'),
      callerPhone: callerPhone.trim() || '01761869921',
      callerEmail: callerEmail || (callerRole === 'admin' ? targetEmail : 'customer@guest.com'),
      callerRole,
      targetRole: callerRole === 'customer' ? 'admin' : 'customer',
      targetName,
      targetEmail,
      status: 'ringing',
      startedAt: Date.now(),
      initiatorClientId: this.clientId,
      orderId,
      tableNumber,
    };

    this.currentSession = session;
    this.broadcast({ action: 'initiate', session, fromClientId: this.clientId });

    // Sync to Firestore for real cross-device ringing across all devices
    if (db) {
      try {
        const callDocRef = doc(db, 'calls', session.id);
        setDoc(callDocRef, sanitizeForFirestore(session)).catch((e) => {
          console.warn('Could not sync call to Firestore:', e);
        });
      } catch {}
    }

    return session;
  }

  acceptCall(callId: string) {
    if (this.currentSession && this.currentSession.id === callId) {
      this.currentSession.status = 'accepted';
      this.currentSession.acceptedAt = Date.now();
    }
    this.broadcast({ action: 'accept', callId, fromClientId: this.clientId });

    // Sync to Firestore
    if (db) {
      try {
        const callDocRef = doc(db, 'calls', callId);
        updateDoc(callDocRef, {
          status: 'accepted',
          acceptedAt: Date.now(),
        }).catch(() => {});
      } catch {}
    }
  }

  declineCall(callId: string) {
    const session = this.currentSession;
    if (session && session.id === callId) {
      session.status = 'declined';
      session.endedAt = Date.now();

      // Record declined call in history
      callHistoryService.addRecord({
        id: session.id,
        callType: session.type,
        callerName: session.callerName,
        callerPhone: session.callerPhone,
        callerEmail: session.callerEmail,
        callerRole: session.callerRole,
        receiverName: session.targetName || 'হোটেল মালিক (এডমিন)',
        receiverEmail: session.targetEmail || 'fs2217732@gmail.com',
        receiverRole: session.targetRole,
        status: 'declined',
        durationSeconds: 0,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        orderId: session.orderId,
        tableNumber: session.tableNumber,
      });
    }
    this.broadcast({ action: 'decline', callId, fromClientId: this.clientId });

    // Sync to Firestore
    if (db) {
      try {
        const callDocRef = doc(db, 'calls', callId);
        updateDoc(callDocRef, {
          status: 'declined',
          declinedAt: Date.now(),
        }).catch(() => {});
      } catch {}
    }
  }

  endCall(callId: string, durationSeconds: number = 0) {
    const session = this.currentSession;
    const now = Date.now();

    if (session && session.id === callId) {
      session.status = 'ended';
      session.endedAt = now;
      session.durationSeconds = durationSeconds;

      // Automatically add to Call History!
      callHistoryService.addRecord({
        id: session.id,
        callType: session.type,
        callerName: session.callerName,
        callerPhone: session.callerPhone,
        callerEmail: session.callerEmail,
        callerRole: session.callerRole,
        receiverName: session.targetName || 'আলহাজ্ব মো: ফরিদ শেখ (মালিক)',
        receiverEmail: session.targetEmail || 'fs2217732@gmail.com',
        receiverRole: session.targetRole,
        status: durationSeconds > 0 ? 'completed' : 'missed',
        durationSeconds,
        startedAt: session.startedAt,
        endedAt: now,
        orderId: session.orderId,
        tableNumber: session.tableNumber,
      });
    }

    this.currentSession = null;
    this.broadcast({ action: 'end', callId, durationSeconds, fromClientId: this.clientId });

    // Sync to Firestore
    if (db) {
      try {
        const callDocRef = doc(db, 'calls', callId);
        updateDoc(callDocRef, {
          status: 'ended',
          endedAt: now,
          durationSeconds,
        }).catch(() => {});
      } catch {}
    }
  }

  getCurrentSession(): CallSession | null {
    return this.currentSession;
  }
}

export const callSignalingService = new CallSignalingService();
