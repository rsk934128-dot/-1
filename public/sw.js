// Service Worker for Hotel Al Sheikh Farid PWA
// Provides offline caching, background connectivity, and real-time push notifications even when minimized.

const CACHE_NAME = 'al-sheikh-farid-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png'
];

// Install Event: Precaches essential app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Precache failed for some assets, continuing:', err);
      });
    })
  );
});

// Activate Event: Clean up old caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch Event: Cache first for static assets, network first for APIs/pages
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET and cross-origin analytics
  if (request.method !== 'GET') return;

  // For navigation requests: Network first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/index.html'));
        })
    );
    return;
  }

  // For static assets: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Native Push Event: Handles incoming Web Push messages
self.addEventListener('push', (event) => {
  let data = {
    title: 'হোটেল আল শেখ ফরিদ',
    body: 'আপনার অর্ডারের নতুন আপডেট এসেছে!',
    icon: '/icon-192.png',
    badge: '/favicon-32x32.png',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/favicon-32x32.png',
    vibrate: [200, 100, 200, 100, 300],
    tag: data.tag || 'al-sheikh-update-' + Date.now(),
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: 'অর্ডার দেখুন (View)' },
      { action: 'dismiss', title: 'বন্ধ করুন (Dismiss)' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler: Focus or open the restaurant web app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Client Message Listener: Allows the web app (even when minimized) to command the service worker
self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data || !data.type) return;

  if (data.type === 'SHOW_NOTIFICATION') {
    const payload = data.payload || {};
    const title = payload.title || 'হোটেল আল শেখ ফরিদ';
    const options = {
      body: payload.body || 'রিয়েল-টাইম কিচেন আপডেট',
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/favicon-32x32.png',
      vibrate: [200, 100, 200, 100, 300],
      tag: payload.tag || 'al-sheikh-' + Date.now(),
      renotify: true,
      requireInteraction: true,
      data: {
        url: payload.url || '/',
        orderId: payload.orderId,
        timestamp: Date.now()
      },
      actions: [
        { action: 'open_app', title: 'অ্যাপ খুলুন (Open)' },
        { action: 'dismiss', title: 'ঠিক আছে (OK)' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const delay = data.delay || 3000;
    const payload = data.payload || {};

    setTimeout(() => {
      const title = payload.title || 'হোটেল আল শেখ ফরিদ - ব্যাকগ্রাউন্ড অ্যালার্ট';
      const options = {
        body: payload.body || 'অ্যাপ মিনিমাইজ থাকলেও আমাদের রিয়েল-টাইম কানেকশন চালু আছে!',
        icon: payload.icon || '/icon-192.png',
        badge: payload.badge || '/favicon-32x32.png',
        vibrate: [300, 150, 300, 150, 400],
        tag: 'al-sheikh-scheduled-' + Date.now(),
        renotify: true,
        data: { url: payload.url || '/' },
        actions: [
          { action: 'open_app', title: 'অ্যাপ দেখুন' }
        ]
      };

      self.registration.showNotification(title, options);
    }, delay);
  }

  if (data.type === 'PING') {
    if (event.source) {
      event.source.postMessage({
        type: 'PONG',
        timestamp: Date.now(),
        status: 'active'
      });
    }
  }
});
