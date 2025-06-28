// Service Worker de Limpeza - Remove cache e desregistra
console.log('[SW] Iniciando limpeza e desregistro...')

// Evento de instalação - limpa todos os caches
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando worker de limpeza...')
  
  event.waitUntil(
    (async () => {
      try {
        // Limpar todos os caches existentes
        const cacheNames = await caches.keys()
        console.log('[SW] Caches encontrados:', cacheNames)
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('[SW] Deletando cache:', cacheName)
            return caches.delete(cacheName)
          })
        )
        
        console.log('[SW] Todos os caches foram limpos!')
        
        // Força a ativação imediata
        await self.skipWaiting()
        
      } catch (error) {
        console.error('[SW] Erro na limpeza:', error)
      }
    })()
  )
})

// Evento de ativação - assume controle e desregistra
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando worker de limpeza...')
  
  event.waitUntil(
    (async () => {
      try {
        // Assume controle de todos os clientes
        await self.clients.claim()
        
        // Notifica todos os clientes para desregistrar o SW
        const clients = await self.clients.matchAll()
        clients.forEach(client => {
          client.postMessage({
            type: 'CLEANUP_COMPLETE',
            message: 'Service Worker será desregistrado'
          })
        })
        
        console.log('[SW] Limpeza concluída. SW será desregistrado.')
        
      } catch (error) {
        console.error('[SW] Erro na ativação:', error)
      }
    })()
  )
})

// Intercepta todas as requisições e deixa passar direto (sem cache)
self.addEventListener('fetch', (event) => {
  // Não faz nada - deixa requisições passarem direto para a rede
  return
})

// Remove este arquivo após 5 segundos
setTimeout(() => {
  console.log('[SW] Tentando desregistrar...')
  self.registration.unregister().then(() => {
    console.log('[SW] Service Worker desregistrado com sucesso!')
  }).catch((error) => {
    console.error('[SW] Erro ao desregistrar:', error)
  })
}, 5000) 