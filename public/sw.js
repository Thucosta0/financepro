// FinancePRO Service Worker - Cache Ultra Otimizado
const CACHE_NAME = 'financepro-v1.3.0'
const STATIC_CACHE = 'financepro-static-v1.3.0'
const DYNAMIC_CACHE = 'financepro-dynamic-v1.3.0'
const DATA_CACHE = 'financepro-data-v1.3.0'
const IMAGE_CACHE = 'financepro-images-v1.3.0'

// Recursos críticos para cache imediato
const CRITICAL_RESOURCES = [
  '/',
  '/dashboard',
  '/transacoes',
  '/cartoes',
  '/categorias',
  '/orcamento',
  '/perfil',
  '/login',
  '/cadastro',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon.png',
  '/apple-touch-icon.png'
]

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/_next/static/css/',
  '/_next/static/js/',
  '/_next/static/chunks/',
  '/icons/',
  '/fonts/'
]

// URLs da API Supabase para cache inteligente
const API_PATTERNS = [
  /supabase\.co\/rest\/v1\//,
  /supabase\.co\/auth\/v1\//,
  /supabase\.co\/storage\/v1\//
]

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing FinancePRO Service Worker...')
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE).then(cache => {
        console.log('[SW] Caching critical resources...')
        return cache.addAll(CRITICAL_RESOURCES.map(url => 
          new Request(url, { cache: 'reload' })
        ))
      }),
      
      // Pre-cache recursos do Next.js
      cacheNextJSResources(),
      
      // Configurar cache de imagens
      setupImageCache()
    ]).then(() => {
      console.log('[SW] Installation complete!')
      return self.skipWaiting()
    }).catch(error => {
      console.error('[SW] Installation failed:', error)
    })
  )
})

// Ativar Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating FinancePRO Service Worker...')
  
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      cleanOldCaches(),
      
      // Claim todos os clientes
      self.clients.claim(),
      
      // Pre-fetch dados essenciais
      prefetchEssentialData()
    ]).then(() => {
      console.log('[SW] Activation complete!')
    })
  )
})

// Interceptar requests
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requests para outras origens (exceto Supabase)
  if (!isRelevantRequest(request)) return
  
  // Estratégias de cache baseadas no tipo de request
  if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request))
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request))
  } else if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request))
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request))
  } else {
    event.respondWith(handleGenericRequest(request))
  }
})

// Estratégia: Cache First com fallback para API
async function handleAPIRequest(request) {
  const cacheKey = createCacheKey(request)
  
  try {
    // Verificar cache primeiro (dados podem estar frescos)
    const cachedResponse = await getCachedResponse(DATA_CACHE, cacheKey)
    
    if (cachedResponse && isCacheValid(cachedResponse)) {
      console.log('[SW] Serving from API cache:', request.url)
      
      // Atualizar cache em background se necessário
      updateCacheInBackground(request, cacheKey)
      
      return cachedResponse
    }
    
    // Buscar da rede
    const networkResponse = await fetchWithTimeout(request, 8000)
    
    // Cache apenas responses válidas
    if (networkResponse.ok) {
      await cacheResponse(DATA_CACHE, cacheKey, networkResponse.clone())
      console.log('[SW] Cached API response:', request.url)
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error)
    
    // Fallback para cache mesmo que expirado
    const staleCache = await getCachedResponse(DATA_CACHE, cacheKey)
    if (staleCache) {
      console.log('[SW] Serving stale cache:', request.url)
      return staleCache
    }
    
    // Último recurso: response de erro offline
    return createOfflineResponse(request)
  }
}

// Estratégia: Cache First para imagens
async function handleImageRequest(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: IMAGE_CACHE })
    
    if (cachedResponse) {
      console.log('[SW] Serving image from cache:', request.url)
      return cachedResponse
    }
    
    const networkResponse = await fetchWithTimeout(request, 10000)
    
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE)
      await cache.put(request, networkResponse.clone())
      console.log('[SW] Cached image:', request.url)
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Image request failed:', error)
    return createPlaceholderImage()
  }
}

// Estratégia: Cache First para recursos estáticos
async function handleStaticResource(request) {
  try {
    const cachedResponse = await caches.match(request, { cacheName: STATIC_CACHE })
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetchWithTimeout(request, 5000)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // Para recursos estáticos, cache é crítico
    const fallbackCache = await caches.match(request)
    return fallbackCache || createOfflineResponse(request)
  }
}

// Estratégia: Network First com cache de fallback para páginas
async function handlePageRequest(request) {
  try {
    const networkResponse = await fetchWithTimeout(request, 3000)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('[SW] Page network failed, trying cache')
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fallback para página offline personalizada
    return createOfflinePage()
  }
}

// Estratégia genérica
async function handleGenericRequest(request) {
  try {
    return await fetchWithTimeout(request, 5000)
  } catch (error) {
    const cachedResponse = await caches.match(request)
    return cachedResponse || createOfflineResponse(request)
  }
}

// === Funções Auxiliares ===

function isRelevantRequest(request) {
  const url = new URL(request.url)
  return url.origin === self.location.origin || 
         url.hostname.includes('supabase.co') ||
         url.hostname.includes('openai.com')
}

function isAPIRequest(request) {
  const url = request.url
  return API_PATTERNS.some(pattern => pattern.test(url)) ||
         url.includes('/api/') ||
         url.includes('/rest/v1/') ||
         url.includes('/auth/v1/')
}

function isImageRequest(request) {
  const url = request.url
  return request.destination === 'image' ||
         /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url)
}

function isStaticResource(request) {
  const url = request.url
  return STATIC_RESOURCES.some(pattern => url.includes(pattern)) ||
         url.includes('/_next/') ||
         url.includes('/static/') ||
         /\.(css|js|woff|woff2|ttf|eot)(\?.*)?$/i.test(url)
}

function isPageRequest(request) {
  return request.destination === 'document' ||
         request.headers.get('accept')?.includes('text/html')
}

function createCacheKey(request) {
  const url = new URL(request.url)
  const key = `${request.method}:${url.pathname}${url.search}`
  return key
}

async function getCachedResponse(cacheName, key) {
  const cache = await caches.open(cacheName)
  return await cache.match(key)
}

async function cacheResponse(cacheName, key, response) {
  const cache = await caches.open(cacheName)
  const responseToCache = response.clone()
  
  // Adicionar timestamp para controle de TTL
  const headers = new Headers(responseToCache.headers)
  headers.set('sw-cached-at', Date.now().toString())
  
  const cachedResponse = new Response(responseToCache.body, {
    status: responseToCache.status,
    statusText: responseToCache.statusText,
    headers: headers
  })
  
  await cache.put(key, cachedResponse)
}

function isCacheValid(response) {
  const cachedAt = response.headers.get('sw-cached-at')
  if (!cachedAt) return false
  
  const age = Date.now() - parseInt(cachedAt)
  const maxAge = 5 * 60 * 1000 // 5 minutos para dados financeiros
  
  return age < maxAge
}

async function updateCacheInBackground(request, key) {
  try {
    const response = await fetch(request.clone())
    if (response.ok) {
      await cacheResponse(DATA_CACHE, key, response)
    }
  } catch (error) {
    console.log('[SW] Background update failed:', error)
  }
}

async function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}

async function cacheNextJSResources() {
  try {
    const cache = await caches.open(STATIC_CACHE)
    
    // Cache recursos do Next.js que são descobertos dinamicamente
    const nextJSUrls = [
      '/_next/static/css/app/layout.css',
      '/_next/static/chunks/main.js',
      '/_next/static/chunks/pages/_app.js',
      '/_next/static/chunks/webpack.js'
    ]
    
    for (const url of nextJSUrls) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          await cache.put(url, response)
        }
      } catch (e) {
        // Recurso pode não existir, continuar
      }
    }
  } catch (error) {
    console.log('[SW] Next.js cache setup failed:', error)
  }
}

async function setupImageCache() {
  const cache = await caches.open(IMAGE_CACHE)
  
  // Pre-cache ícones essenciais
  const essentialImages = [
    '/favicon.svg',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
  ]
  
  for (const url of essentialImages) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        await cache.put(url, response)
      }
    } catch (e) {
      // Continuar se não conseguir
    }
  }
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys()
  const currentCaches = [CACHE_NAME, STATIC_CACHE, DYNAMIC_CACHE, DATA_CACHE, IMAGE_CACHE]
  
  return Promise.all(
    cacheNames.map(cacheName => {
      if (!currentCaches.includes(cacheName)) {
        console.log('[SW] Deleting old cache:', cacheName)
        return caches.delete(cacheName)
      }
    })
  )
}

async function prefetchEssentialData() {
  // Pre-fetch dados que provavelmente serão necessários
  const essentialEndpoints = [
    '/api/user/profile',
    '/rest/v1/categories',
    '/rest/v1/cards'
  ]
  
  for (const endpoint of essentialEndpoints) {
    try {
      const request = new Request(endpoint)
      if (isAPIRequest(request)) {
        await handleAPIRequest(request)
      }
    } catch (e) {
      // Continuar se falhar
    }
  }
}

function createOfflineResponse(request) {
  const isJSON = request.headers.get('accept')?.includes('application/json')
  
  if (isJSON) {
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'Dados não disponíveis offline',
        cached: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
  
  return new Response('Página não disponível offline', { 
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  })
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FinancePRO - Offline</title>
      <style>
        body { 
          font-family: system-ui; 
          text-align: center; 
          padding: 2rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
        }
        .container {
          background: rgba(255,255,255,0.1);
          padding: 2rem;
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .icon { font-size: 4rem; margin-bottom: 1rem; }
        h1 { margin: 0 0 1rem 0; }
        button {
          background: rgba(255,255,255,0.2);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">💰</div>
        <h1>FinancePRO</h1>
        <p>Você está offline. Algumas funcionalidades podem estar limitadas.</p>
        <button onclick="location.reload()">Tentar Novamente</button>
      </div>
    </body>
    </html>
  `
  
  return new Response(offlineHTML, {
    headers: { 'Content-Type': 'text/html' }
  })
}

function createPlaceholderImage() {
  // SVG placeholder para imagens que falharam
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">
        Imagem não disponível
      </text>
    </svg>
  `
  
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' }
  })
}

// Message handling para comunicação com o cliente
self.addEventListener('message', event => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'PREFETCH_ROUTE':
      prefetchRoute(payload.url)
      break
      
    case 'CLEAR_CACHE':
      clearSpecificCache(payload.cacheName)
      break
      
    case 'UPDATE_CACHE':
      updateSpecificCache(payload.key, payload.data)
      break
      
    default:
      console.log('[SW] Unknown message type:', type)
  }
})

async function prefetchRoute(url) {
  try {
    const request = new Request(url)
    await handlePageRequest(request)
    console.log('[SW] Prefetched route:', url)
  } catch (error) {
    console.log('[SW] Prefetch failed:', error)
  }
}

async function clearSpecificCache(cacheName) {
  try {
    await caches.delete(cacheName)
    console.log('[SW] Cleared cache:', cacheName)
  } catch (error) {
    console.log('[SW] Cache clear failed:', error)
  }
}

async function updateSpecificCache(key, data) {
  try {
    const cache = await caches.open(DATA_CACHE)
    const response = new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'sw-cached-at': Date.now().toString()
      }
    })
    await cache.put(key, response)
    console.log('[SW] Updated cache for:', key)
  } catch (error) {
    console.log('[SW] Cache update failed:', error)
  }
} 