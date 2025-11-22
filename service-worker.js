// service-worker.js - PWA Service Worker for Shadow Alchemy Lab
const CACHE_NAME = 'shadow-alchemy-lab-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  
  // Core JS files
  '/js/controller.js',
  '/js/utils.js',
  '/js/dashboardRenderer.js',
  '/js/eventListeners.js',
  
  // Core modules
  '/js/core/modal.js',
  '/js/core/state.js',
  '/js/core/auth.js',
  
  // Features
  '/js/features/triggerRelease.js',
  '/js/features/shadowDialogue.js',
  '/js/features/shadowGuidedProcess.js',
  '/js/features/shadowGuidedProcessViewer.js',
  '/js/features/subShadowsLab.js',
  '/js/features/subShadowJourney.js',
  '/js/features/archetypeStudio.js',
  
  // Engines and data
  '/js/engines/archetypesEngine.js',
  '/js/engines/dailyJourneyEngine.js',
  '/js/engines/archetypes_data.json',
  
  // PWA assets
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-96x96.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Service Worker: Cache failed', err))
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - cache first, then network
self.addEventListener('fetch', event => {
  // Skip external resources and fonts
  if (event.request.url.includes('googleapis.com') || 
      event.request.url.includes('gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Clone response for cache
            const responseClone = response.clone();
            
            // Update cache with new version
            if (event.request.method === 'GET') {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
            }
            
            return response;
          })
          .catch(() => {
            // Network failed, return offline page if HTML request
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
          });
      })
  );
});
