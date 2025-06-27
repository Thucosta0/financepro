'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Navigation } from './navigation'

export function ConditionalNavigation({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  
  // Páginas que não devem mostrar a navegação
  const noNavPages = ['/', '/login', '/cadastro', '/reset-password', '/confirm-email', '/test-reset']
  const shouldShowNav = user && !noNavPages.includes(pathname)

  if (!shouldShowNav) {
    return <>{children}</>
  }

  return (
    <>
      <Navigation />
      <div className="lg:pl-64 pt-16 lg:pt-0 min-h-screen bg-gray-50">
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </>
  )
} 