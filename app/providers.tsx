'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { CartProvider } from '@/contexts/cart-context'
import { FavoritesProvider } from '@/contexts/favorites-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  )
}
