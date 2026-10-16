import { CallType } from '../types';
import { safeStorage } from '../utils/safeStorage';
import { db, sanitizeForFirestore } from './firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface CallHistoryRecord {
  id: string;
  callType: CallType;
  callerName: string;
  callerPhone: string;
  callerEmail?: string;
  callerRole: 'customer' | 'admin';
  receiverName: string;
  receiverPhone?: string;
  receiverEmail: string; // The hotel owner admin Gmail (e.g. fs2217732@gmail.com)
  receiverRole: 'customer' | 'admin';
  status: 'completed' | 'missed' | 'declined';
  durationSeconds: number;
  startedAt: number;
  endedAt: number;
  orderId?: string;
  tableNumber?: string;
  note?: string;
}

const STORAGE_KEY_CALL_HISTORY = 'al_sheikh_farid_call_history';

// Pre-seeded initial realistic call history between customers and Hotel Owner (fs2217732@gmail.com)
const INITIAL_CALL_HISTORY: CallHistoryRecord[] = [
  {
    id: 'CALL-HIST-101',
    callType: 'audio',
    callerName: 'মো: তানভীর আহমেদ',
    callerPhone: '01712-445566',
    callerEmail: 'tanvir.train@gmail.com',
    callerRole: 'customer',
    receiverName: 'আলহাজ্ব মো: ফরিদ শেখ (মালিক)',
    receiverPhone: '01761869921',
    receiverEmail: 'fs2217732@gmail.com',
    receiverRole: 'admin',
    status: 'completed',
    durationSeconds: 142, // 2m 22s
    startedAt: Date.now() - 45 * 60 * 1000,
    endedAt: Date.now() - 42 * 60 * 1000,
    orderId: 'ORD-9842',
    tableNumber: 'বগি নং "খ", সিট ১২',
    note: 'সুন্দরবন এক্সপ্রেসের সিটে গরম কাচ্চি ডেলিভারির নির্দেশ',
  },
  {
    id: 'CALL-HIST-102',
    callType: 'video',
    callerName: 'আলহাজ্ব মো: ফরিদ শেখ (মালিক)',
    callerPhone: '01761869921',
    callerEmail: 'fs2217732@gmail.com',
    callerRole: 'admin',
    receiverName: 'ফারহানা ইয়াসমিন',
    receiverPhone: '01833-998877',
    receiverEmail: 'farhana.y@gmail.com',
    receiverRole: 'customer',
    status: 'completed',
    durationSeconds: 215, // 3m 35s
    startedAt: Date.now() - 3 * 3600 * 1000,
    endedAt: Date.now() - (3 * 3600 * 1000 - 215 * 1000),
    orderId: 'ORD-9810',
    tableNumber: 'VIP কেবিন ২',
    note: 'লাইভ কিচেনের তাজা ইলিশ মাছ দেখানো হয়েছে',
  },
  {
    id: 'CALL-HIST-103',
    callType: 'audio',
    callerName: 'ডা: রফিকুল ইসলাম',
    callerPhone: '01911-332211',
    callerEmail: 'dr.rafiqul@gmail.com',
    callerRole: 'customer',
    receiverName: 'আলহাজ্ব মো: ফরিদ শেখ (মালিক)',
    receiverPhone: '01761869921',
    receiverEmail: 'fs2217732@gmail.com',
    receiverRole: 'admin',
    status: 'missed',
    durationSeconds: 0,
    startedAt: Date.now() - 5 * 3600 * 1000,
    endedAt: Date.now() - 5 * 3600 * 1000,
    note: 'ব্যস্ততার কারণে কল মিসড হয়েছিল',
  },
  {
    id: 'CALL-HIST-104',
    callType: 'video',
    callerName: 'সাকিব আল হাসান (গ্রাহক)',
    callerPhone: '01677-554433',
    callerEmail: 'sakib.ishwardi@gmail.com',
    callerRole: 'customer',
    receiverName: 'আলহাজ্ব মো: ফরিদ শেখ (মালিক)',
    receiverPhone: '01761869921',
    receiverEmail: 'fs2217732@gmail.com',
    receiverRole: 'admin',
    status: 'completed',
    durationSeconds: 85,
    startedAt: Date.now() - 24 * 3600 * 1000,
    endedAt: Date.now() - (24 * 3600 * 1000 - 85 * 1000),
    orderId: 'ORD-9755',
    tableNumber: 'টেবিল ৪',
    note: 'গরম রসমালাই এর প্যাকেজিং সম্পর্কে আলোচনা',
  }
];

class CallHistoryService {
  private history: CallHistoryRecord[] = [];
  private listeners: Set<(history: CallHistoryRecord[]) => void> = new Set();

  constructor() {
    this.history = this.loadHistory();
  }

  private loadHistory(): CallHistoryRecord[] {
    const saved = safeStorage.getJSON<CallHistoryRecord[]>(STORAGE_KEY_CALL_HISTORY);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return INITIAL_CALL_HISTORY;
  }

  private saveHistory(): void {
    safeStorage.setJSON(STORAGE_KEY_CALL_HISTORY, this.history);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.history]);
      } catch (err) {
        console.warn('CallHistory listener error:', err);
      }
    });
  }

  public subscribe(listener: (history: CallHistoryRecord[]) => void): () => void {
    this.listeners.add(listener);
    // Initial call
    listener([...this.history]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getHistory(): CallHistoryRecord[] {
    return [...this.history];
  }

  public addRecord(record: Omit<CallHistoryRecord, 'id'> & { id?: string }): CallHistoryRecord {
    const fullRecord: CallHistoryRecord = {
      ...record,
      id: record.id || `CALL-HIST-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    // Prepend to list
    this.history = [fullRecord, ...this.history];
    this.saveHistory();

    // Sync to Firestore if available
    if (db) {
      try {
        const docRef = doc(db, 'call_history', fullRecord.id);
        setDoc(docRef, sanitizeForFirestore(fullRecord)).catch((e) => {
          console.warn('Firestore call history save notice:', e);
        });
      } catch {}
    }

    return fullRecord;
  }

  public deleteRecord(id: string): void {
    this.history = this.history.filter((r) => r.id !== id);
    this.saveHistory();

    if (db) {
      try {
        const docRef = doc(db, 'call_history', id);
        deleteDoc(docRef).catch(() => {});
      } catch {}
    }
  }

  public clearAll(): void {
    this.history = [];
    this.saveHistory();
  }
}

export const callHistoryService = new CallHistoryService();
