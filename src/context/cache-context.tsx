'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  hits: number
}

interface CacheContextType {
  // Cache de dados
  set: <T>(key: string, data: T, ttl?: number) => void
  get: <T>(key: string) => T | null
  has: (key: string) => boolean
  clear: (key?: string) => void
  
  // Prefetch inteligente
  prefetchRoute: (route: string) => void
  prefetchData: (key: string, fetcher: () => Promise<any>, ttl?: number) => Promise<void>
  
  // Navegação otimizada
  navigateWithPrefetch: (route: string) => void
  
  // Estado do cache
  cacheStats: {
    size: number
    hits: number
    misses: number
    hitRate: number
  }
  
  // Service Worker
  registerServiceWorker: () => Promise<void>
  updateServiceWorker: () => Promise<void>
  
  // Configurações
  enablePrefetch: boolean
  setEnablePrefetch: (enabled: boolean) => void
}

const CacheContext = createContext<CacheContextType | undefined>(undefined)

// Configurações padrão
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutos
const MAX_CACHE_SIZE = 100 // Máximo de entradas
const PREFETCH_DELAY = 100 // Delay para prefetch em ms

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  
  // Cache em memória
  const cache = useRef<Map<string, CacheEntry>>(new Map())
  
  // Estatísticas
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    size: 0
  })
  
  // Configurações
  const [enablePrefetch, setEnablePrefetch] = useState(true)
  
  // Service Worker
  const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null)
  
  // Prefetch queue
  const prefetchQueue = useRef<Set<string>>(new Set())
  const prefetchTimeout = useRef<NodeJS.Timeout>()
  
  // Inicialização
  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker()
    
    // Cleanup automático do cache
    const cleanupInterval = setInterval(cleanupExpiredEntries, 60000) // 1 minuto
    
    // Prefetch rotas prováveis no carregamento inicial
    setTimeout(() => {
      if (enablePrefetch) {
        prefetchLikelyRoutes()
      }
    }, 2000)
    
    return () => {
      clearInterval(cleanupInterval)
      if (prefetchTimeout.current) {
        clearTimeout(prefetchTimeout.current)
      }
    }
  }, [])
  
  // === FUNÇÕES DE CACHE ===
  
  const set = useCallback(<T,>(key: string, data: T, ttl: number = DEFAULT_TTL) => {
    // Limpar cache se muito grande
    if (cache.current.size >= MAX_CACHE_SIZE) {
      cleanupLeastUsed()
    }
    
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0
    })
    
    updateStats()
    
    // Notificar Service Worker se for dados importantes
    if (swRegistration && isImportantData(key)) {
      swRegistration.active?.postMessage({
        type: 'UPDATE_CACHE',
        payload: { key, data }
      })
    }
  }, [swRegistration])
  
  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cache.current.get(key)
    
    if (!entry) {
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }))
      return null
    }
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      setStats(prev => ({ ...prev, misses: prev.misses + 1 }))
      return null
    }
    
    // Incrementar hits
    entry.hits++
    setStats(prev => ({ ...prev, hits: prev.hits + 1 }))
    
    return entry.data as T
  }, [])
  
  const has = useCallback((key: string): boolean => {
    const entry = cache.current.get(key)
    if (!entry) return false
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.current.delete(key)
      return false
    }
    
    return true
  }, [])
  
  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key)
    } else {
      cache.current.clear()
    }
    updateStats()
  }, [])
  
  // === PREFETCH INTELIGENTE ===
  
  const prefetchRoute = useCallback((route: string) => {
    if (!enablePrefetch || prefetchQueue.current.has(route)) return
    
    prefetchQueue.current.add(route)
    
    // Debounce prefetch requests
    if (prefetchTimeout.current) {
      clearTimeout(prefetchTimeout.current)
    }
    
    prefetchTimeout.current = setTimeout(() => {
      processPrefetchQueue()
    }, PREFETCH_DELAY)
  }, [enablePrefetch])
  
  const prefetchData = useCallback(async (
    key: string, 
    fetcher: () => Promise<any>, 
    ttl: number = DEFAULT_TTL
  ) => {
    if (has(key)) return // Já tem no cache
    
    try {
      const data = await fetcher()
      set(key, data, ttl)
    } catch (error) {
      console.log('Prefetch failed for:', key, error)
    }
  }, [has, set])
  
  const navigateWithPrefetch = useCallback((route: string) => {
    // Prefetch rotas relacionadas antes de navegar
    const relatedRoutes = getRelatedRoutes(route)
    relatedRoutes.forEach(relatedRoute => {
      if (relatedRoute !== route) {
        prefetchRoute(relatedRoute)
      }
    })
    
    // Navegar
    router.push(route)
  }, [router, prefetchRoute])
  
  // === SERVICE WORKER ===
  
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        setSWRegistration(registration)
        
        console.log('Service Worker registered successfully')
        
        // Escutar updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found')
        })
        
        // Recarregar quando o SW for atualizado
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true
            window.location.reload()
          }
        })
        
      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }, [])
  
  const updateServiceWorker = useCallback(async () => {
    if (swRegistration) {
      try {
        await swRegistration.update()
        console.log('Service Worker updated')
      } catch (error) {
        console.error('Service Worker update failed:', error)
      }
    }
  }, [swRegistration])
  
  // === FUNÇÕES AUXILIARES ===
  
  const updateStats = () => {
    setStats(prev => ({ ...prev, size: cache.current.size }))
  }
  
  const cleanupExpiredEntries = () => {
    const now = Date.now()
    let cleaned = 0
    
    for (const [key, entry] of cache.current.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.current.delete(key)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache entries`)
      updateStats()
    }
  }
  
  const cleanupLeastUsed = () => {
    // Converter para array e ordenar por hits
    const entries = Array.from(cache.current.entries())
      .sort(([, a], [, b]) => a.hits - b.hits)
    
    // Remover 25% dos menos usados
    const toRemove = Math.floor(entries.length * 0.25)
    
    for (let i = 0; i < toRemove; i++) {
      const [key] = entries[i]
      cache.current.delete(key)
    }
    
    console.log(`Cleaned ${toRemove} least used cache entries`)
    updateStats()
  }
  
  const processPrefetchQueue = () => {
    prefetchQueue.current.forEach(route => {
      // Prefetch via Service Worker
      if (swRegistration?.active) {
        swRegistration.active.postMessage({
          type: 'PREFETCH_ROUTE',
          payload: { url: route }
        })
      }
      
      // Prefetch via router (Next.js)
      router.prefetch(route)
    })
    
    console.log(`Prefetched ${prefetchQueue.current.size} routes`)
    prefetchQueue.current.clear()
  }
  
  const prefetchLikelyRoutes = () => {
    // Rotas mais prováveis baseadas na navegação típica
    const likelyRoutes = [
      '/dashboard',
      '/transacoes',
      '/cartoes',
      '/categorias',
      '/orcamento'
    ]
    
    likelyRoutes.forEach(route => {
      setTimeout(() => prefetchRoute(route), Math.random() * 1000)
    })
  }
  
  const getRelatedRoutes = (route: string): string[] => {
    // Mapear rotas relacionadas para prefetch inteligente
    const routeMap: Record<string, string[]> = {
      '/': ['/dashboard', '/transacoes'],
      '/dashboard': ['/transacoes', '/cartoes', '/orcamento'],
      '/transacoes': ['/categorias', '/cartoes', '/dashboard'],
      '/cartoes': ['/transacoes', '/dashboard'],
      '/categorias': ['/transacoes', '/orcamento'],
      '/orcamento': ['/categorias', '/transacoes', '/dashboard'],
      '/perfil': ['/dashboard']
    }
    
    return routeMap[route] || []
  }
  
  const isImportantData = (key: string): boolean => {
    // Determinar se os dados são importantes para o Service Worker
    const importantPrefixes = [
      'transactions',
      'categories', 
      'cards',
      'user',
      'budgets'
    ]
    
    return importantPrefixes.some(prefix => key.startsWith(prefix))
  }
  
  // Calcular estatísticas
  const cacheStats = {
    size: stats.size,
    hits: stats.hits,
    misses: stats.misses,
    hitRate: stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)) * 100 
      : 0
  }
  
  const value: CacheContextType = {
    set,
    get,
    has,
    clear,
    prefetchRoute,
    prefetchData,
    navigateWithPrefetch,
    cacheStats,
    registerServiceWorker,
    updateServiceWorker,
    enablePrefetch,
    setEnablePrefetch
  }
  
  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  )
}

export function useCache() {
  const context = useContext(CacheContext)
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider')
  }
  return context
}

// Hook para cache de dados com SWR-like behavior
export function useCachedData<T>(
  key: string, 
  fetcher: () => Promise<T>, 
  options: {
    ttl?: number
    revalidateOnFocus?: boolean
    revalidateInterval?: number
  } = {}
) {
  const { get, set, prefetchData } = useCache()
  const [data, setData] = useState<T | null>(get<T>(key))
  const [isLoading, setIsLoading] = useState(!data)
  const [error, setError] = useState<Error | null>(null)
  
  const { ttl = DEFAULT_TTL, revalidateOnFocus = true, revalidateInterval } = options
  
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await fetcher()
      
      set(key, result, ttl)
      setData(result)
      
    } catch (err) {
      setError(err as Error)
      
      // Tentar usar cache stale em caso de erro
      const staleData = get<T>(key)
      if (staleData) {
        setData(staleData)
      }
    } finally {
      setIsLoading(false)
    }
  }, [key, fetcher, set, ttl, get])
  
  useEffect(() => {
    // Buscar dados se não estão no cache
    if (!data) {
      fetchData()
    }
    
    // Revalidar em intervalo
    if (revalidateInterval) {
      const interval = setInterval(fetchData, revalidateInterval)
      return () => clearInterval(interval)
    }
  }, [data, fetchData, revalidateInterval])
  
  useEffect(() => {
    // Revalidar quando a janela volta ao foco
    if (revalidateOnFocus) {
      const handleFocus = () => {
        if (document.visibilityState === 'visible') {
          fetchData()
        }
      }
      
      document.addEventListener('visibilitychange', handleFocus)
      window.addEventListener('focus', handleFocus)
      
      return () => {
        document.removeEventListener('visibilitychange', handleFocus)
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [revalidateOnFocus, fetchData])
  
  return {
    data,
    isLoading,
    error,
    mutate: fetchData,
    prefetch: () => prefetchData(key, fetcher, ttl)
  }
} 