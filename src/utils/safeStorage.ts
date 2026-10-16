/**
 * Safe LocalStorage wrapper with in-memory fallback.
 * Prevents "SecurityError: Access is denied for this document" and JSON parse exceptions
 * in sandboxed iframes, private browsing mode, or storage-restricted environments.
 */

const memoryStore = new Map<string, string>();

let isLocalStorageAvailable: boolean | null = null;

function testLocalStorage(): boolean {
  if (isLocalStorageAvailable !== null) return isLocalStorageAvailable;
  if (typeof window === 'undefined') {
    isLocalStorageAvailable = false;
    return false;
  }
  try {
    const testKey = '__hotel_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
    return true;
  } catch {
    isLocalStorageAvailable = false;
    return false;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    if (testLocalStorage()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fall back to memoryStore
      }
    }
    return memoryStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    if (testLocalStorage()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fall back to memoryStore
      }
    }
    memoryStore.set(key, value);
  },

  removeItem(key: string): void {
    if (testLocalStorage()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fall back to memoryStore
      }
    }
    memoryStore.delete(key);
  },

  getJSON<T>(key: string, fallback: T | null = null): T | null {
    try {
      const raw = this.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed !== undefined && parsed !== null ? parsed : fallback;
    } catch {
      return fallback;
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore serialization or storage limit errors
    }
  },
};

export default safeStorage;
