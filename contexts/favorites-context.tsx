'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth-context'

interface FavoritesContextType {
  favorites: string[]
  loading: boolean
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setFavorites([])
      setLoading(false)
    }
  }, [user?.id])

  const loadFavorites = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)

      if (!error && data) {
        setFavorites(data.map(f => f.product_id))
      }
    } catch (error) {
      console.error('Load favorites error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      alert('Favorilere eklemek için giriş yapmalısınız')
      return
    }

    const isFav = favorites.includes(productId)

    // Optimistic update
    if (isFav) {
      setFavorites(prev => prev.filter(id => id !== productId))
    } else {
      setFavorites(prev => [...prev, productId])
    }

    try {
      if (isFav) {
        // Remove from favorites
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId)
      } else {
        // Add to favorites
        await supabase
          .from('favorites')
          .insert([{ user_id: user.id, product_id: productId }])
      }
    } catch (error) {
      // Revert on error
      if (isFav) {
        setFavorites(prev => [...prev, productId])
      } else {
        setFavorites(prev => prev.filter(id => id !== productId))
      }
      console.error('Toggle favorite error:', error)
    }
  }

  const isFavorite = (productId: string) => {
    return favorites.includes(productId)
  }

  const refreshFavorites = async () => {
    await loadFavorites()
  }

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
