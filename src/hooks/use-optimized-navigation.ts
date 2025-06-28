'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCache } from '@/context/cache-context'

interface NavigationOptions {
  prefetchRelated?: boolean
  cacheData?: boolean
  priority?: 'high' | 'medium' | 'low'
}

export function useOptimizedNavigation() {
  const router = useRouter()
  const { prefetchRoute, navigateWithPrefetch, cacheStats } = useCache()

  // Mapa de rotas relacionadas para prefetch inteligente
  const relatedRoutes: Record<string, string[]> = {
    '/': ['/dashboard', '/transacoes'],
    '/dashboard': ['/transacoes', '/cartoes', '/orcamento', '/categorias'],
    '/transacoes': ['/categorias', '/cartoes', '/dashboard', '/orcamento'],
    '/cartoes': ['/transacoes', '/dashboard'],
    '/categorias': ['/transacoes', '/orcamento'],
    '/orcamento': ['/categorias', '/transacoes', '/dashboard'],
    '/perfil': ['/dashboard'],
    '/login': ['/dashboard'],
    '/cadastro': ['/login']
  }

  // Prefetch automático baseado na rota atual
  useEffect(() => {
    const currentPath = window.location.pathname
    const related = relatedRoutes[currentPath]
    
    if (related) {
      // Prefetch com delay para não impactar a performance inicial
      const timer = setTimeout(() => {
        related.forEach((route, index) => {
          setTimeout(() => {
            prefetchRoute(route)
          }, index * 200) // Espalhar prefetches
        })
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [prefetchRoute])

  // Navegação otimizada com transição suave
  const navigate = useCallback((
    route: string, 
    options: NavigationOptions = {}
  ) => {
    const { prefetchRelated = true, priority = 'medium' } = options

    // Estratégia baseada na prioridade
    switch (priority) {
      case 'high':
        // Navegação imediata para rotas críticas
        router.push(route)
        break
        
      case 'medium':
        // Navegação com prefetch (padrão)
        navigateWithPrefetch(route)
        break
        
      case 'low':
        // Prefetch primeiro, depois navegar
        prefetchRoute(route)
        setTimeout(() => router.push(route), 100)
        break
    }

    // Prefetch rotas relacionadas se solicitado
    if (prefetchRelated) {
      const related = relatedRoutes[route]
      if (related) {
        setTimeout(() => {
          related.forEach(relatedRoute => {
            prefetchRoute(relatedRoute)
          })
        }, 500)
      }
    }
  }, [router, navigateWithPrefetch, prefetchRoute])

  // Navegação para trás otimizada
  const goBack = useCallback(() => {
    // Tentar usar history API primeiro
    if (window.history.length > 1) {
      router.back()
    } else {
      // Fallback para dashboard
      navigate('/dashboard', { priority: 'high' })
    }
  }, [router, navigate])

  // Navegação para dashboard (home) otimizada
  const goHome = useCallback(() => {
    navigate('/dashboard', { priority: 'high', prefetchRelated: true })
  }, [navigate])

  // Prefetch manual para rotas específicas
  const prefetch = useCallback((routes: string | string[]) => {
    const routeList = Array.isArray(routes) ? routes : [routes]
    
    routeList.forEach((route, index) => {
      setTimeout(() => {
        prefetchRoute(route)
      }, index * 100)
    })
  }, [prefetchRoute])

  // Navegação com substituição (replace)
  const replace = useCallback((route: string) => {
    router.replace(route)
    
    // Prefetch rotas relacionadas
    const related = relatedRoutes[route]
    if (related) {
      setTimeout(() => {
        related.forEach(relatedRoute => {
          prefetchRoute(relatedRoute)
        })
      }, 300)
    }
  }, [router, prefetchRoute])

  // Refresh otimizado da página atual
  const refresh = useCallback(() => {
    router.refresh()
  }, [router])

  // Verificar se uma rota está no cache
  const isRouteCached = useCallback((route: string) => {
    // Verificar através do router se a rota foi prefetched
    // Next.js não expõe isso diretamente, mas podemos simular
    const cached = relatedRoutes[window.location.pathname]?.includes(route)
    return cached || false
  }, [])

  // Estatísticas de performance da navegação
  const getNavigationStats = useCallback(() => {
    return {
      cacheHitRate: cacheStats.hitRate,
      cachedRoutes: Object.keys(relatedRoutes).length,
      currentRoute: window.location.pathname,
      ...cacheStats
    }
  }, [cacheStats])

  return {
    // Navegação principal
    navigate,
    goBack,
    goHome,
    replace,
    refresh,
    
    // Utilitários
    prefetch,
    isRouteCached,
    
    // Estatísticas
    getNavigationStats,
    
    // Navegação específica (shortcuts)
    toDashboard: () => navigate('/dashboard', { priority: 'high' }),
    toTransactions: () => navigate('/transacoes', { priority: 'medium' }),
    toCards: () => navigate('/cartoes', { priority: 'medium' }),
    toCategories: () => navigate('/categorias', { priority: 'medium' }),
    toBudget: () => navigate('/orcamento', { priority: 'medium' }),
    toProfile: () => navigate('/perfil', { priority: 'low' }),
    
    // Estados
    cacheStats
  }
}

// Hook específico para componentes de navegação (menu, sidebar, etc.)
export function useNavigationOptimizer() {
  const { prefetch } = useOptimizedNavigation()

  // Prefetch ao hover (desktop) ou touch start (mobile)
  const handleMouseEnter = useCallback((route: string) => {
    prefetch(route)
  }, [prefetch])

  const handleTouchStart = useCallback((route: string) => {
    prefetch(route)
  }, [prefetch])

  // Props para links otimizados
  const getLinkProps = useCallback((route: string) => ({
    onMouseEnter: () => handleMouseEnter(route),
    onTouchStart: () => handleTouchStart(route),
    style: { touchAction: 'manipulation' } // Previne zoom em mobile
  }), [handleMouseEnter, handleTouchStart])

  return {
    prefetch,
    handleMouseEnter,
    handleTouchStart,
    getLinkProps
  }
}

// Hook para monitoramento de performance da navegação
export function useNavigationPerformance() {
  const { getNavigationStats, cacheStats } = useOptimizedNavigation()

  useEffect(() => {
    // Log estatísticas de performance no console (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      const timer = setInterval(() => {
        const stats = getNavigationStats()
        if (stats.hits > 0 || stats.misses > 0) {
          console.group('🚀 Navigation Performance Stats')
          console.log('Cache Hit Rate:', `${stats.hitRate.toFixed(1)}%`)
          console.log('Cache Size:', stats.size)
          console.log('Total Hits:', stats.hits)
          console.log('Total Misses:', stats.misses)
          console.log('Current Route:', stats.currentRoute)
          console.groupEnd()
        }
      }, 30000) // A cada 30 segundos

      return () => clearInterval(timer)
    }
  }, [getNavigationStats])

  return {
    stats: cacheStats,
    getStats: getNavigationStats
  }
} 