// Body by Rings Service Worker
// Provides offline functionality for workout logging and core features

const CACHE_NAME = 'body-by-rings-v1.0.0'
const OFFLINE_URL = '/offline'

// Files to cache for offline functionality
const urlsToCache = [
  '/',
  '/dashboard',
  '/workout/start',
  '/profile',
  '/exercises',
  '/analytics',
  '/offline',
  // Core assets
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
]

// Install event - cache core resources
self.addEventListener('install', event => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core resources')
        return cache.addAll(urlsToCache.filter(url => !url.includes('_next')))
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with offline support
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip cross-origin requests and chrome-extension requests
  if (url.origin !== location.origin || url.protocol === 'chrome-extension:') {
    return
  }
  
  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }
  
  // Handle API requests to Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(handleApiRequest(request))
    return
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request))
})

// Handle page navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try to fetch from network first
    const response = await fetch(request)
    if (response.ok) {
      return response
    }
  } catch (error) {
    console.log('[SW] Network failed for navigation, serving from cache or offline page')
  }
  
  // Try to serve from cache
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Serve offline page for uncached routes
  return caches.match(OFFLINE_URL) || new Response(
    '<html><body><h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p></body></html>',
    { headers: { 'Content-Type': 'text/html' } }
  )
}

// Handle API requests with offline storage
async function handleApiRequest(request) {
  try {
    const response = await fetch(request)
    
    // If successful, update cache for GET requests
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] API request failed, checking cache:', request.url)
    
    // For GET requests, try to serve from cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    // For POST/PUT requests (like workout logging), store in IndexedDB for later sync
    if (request.method === 'POST' || request.method === 'PUT') {
      try {
        const requestData = await request.clone().json()
        await storeOfflineAction(requestData, request.method, request.url)
        
        return new Response(JSON.stringify({ 
          success: true, 
          offline: true,
          message: 'Data saved offline. Will sync when connection is restored.' 
        }), {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        })
      } catch (parseError) {
        console.error('[SW] Failed to parse offline request:', parseError)
      }
    }
    
    throw error
  }
}

// Handle static asset requests
async function handleStaticRequest(request) {
  try {
    // Try cache first for static assets
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fetch from network and cache
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[SW] Static request failed:', request.url)
    throw error
  }
}

// Store offline actions in IndexedDB for later synchronization
async function storeOfflineAction(data, method, url) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BodyByRingsOffline', 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      
      const actionData = {
        id: Date.now() + Math.random(),
        method,
        url,
        data,
        timestamp: new Date().toISOString()
      }
      
      store.add(actionData)
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    }
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      const store = db.createObjectStore('pendingActions', { keyPath: 'id' })
      store.createIndex('timestamp', 'timestamp')
    }
  })
}

// Listen for messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
    syncOfflineData()
  }
})

// Sync offline data when connection is restored
async function syncOfflineData() {
  console.log('[SW] Syncing offline data...')
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BodyByRingsOffline', 1)
    
    request.onsuccess = async () => {
      const db = request.result
      const transaction = db.transaction(['pendingActions'], 'readwrite')
      const store = transaction.objectStore('pendingActions')
      const getAllRequest = store.getAll()
      
      getAllRequest.onsuccess = async () => {
        const pendingActions = getAllRequest.result
        console.log(`[SW] Found ${pendingActions.length} pending actions to sync`)
        
        for (const action of pendingActions) {
          try {
            const response = await fetch(action.url, {
              method: action.method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action.data)
            })
            
            if (response.ok) {
              // Remove successfully synced action
              store.delete(action.id)
              console.log('[SW] Synced action:', action.id)
            }
          } catch (error) {
            console.error('[SW] Failed to sync action:', action.id, error)
          }
        }
        
        resolve()
      }
    }
    
    request.onerror = () => reject(request.error)
  })
}

console.log('[SW] Service worker loaded successfully')