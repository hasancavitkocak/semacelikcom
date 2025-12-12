'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/cart-context'
import { useFavorites } from '@/contexts/favorites-context'
import { useAuth } from '@/contexts/auth-context'

export default function FavoritesPage() {
  const { user } = useAuth()
  const { favorites: favoriteIds, toggleFavorite, refreshFavorites } = useFavorites()

  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      refreshFavorites() // Sayfaya girince favorileri yenile
    }
  }, [user?.id])

  useEffect(() => {
    if (!user) {
      setFavoriteProducts([])
      setLoading(false)
      return
    }
    
    if (favoriteIds.length > 0) {
      loadFavoriteProducts()
    } else {
      setFavoriteProducts([])
      setLoading(false)
    }
  }, [favoriteIds])

  const loadFavoriteProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          images:product_images (
            image_url,
            is_primary
          )
        `)
        .in('id', favoriteIds)

      if (error) throw error
      setFavoriteProducts(data || [])
    } catch (error) {
      console.error('Favoriler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Heart size={32} className="text-red-500" />
            Favorilerim
          </h1>

          {favoriteProducts.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Favori ürününüz yok</h2>
              <p className="text-gray-600 mb-6">Beğendiğiniz ürünleri favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz</p>
              <Link href="/products">
                <Button className="bg-gray-900 hover:bg-black text-white">
                  Ürünleri Keşfet
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {favoriteProducts.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                // Discount özelliği şimdilik yok

                return (
                  <div key={product.id} className="group relative">
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative overflow-hidden rounded-lg bg-gray-50 mb-3">
                        <div className="aspect-[3/4] overflow-hidden">
                          <img
                            src={primaryImage?.image_url || '/placeholder.png'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    </Link>

                    {/* Remove from Favorites */}
                    <button
                      onClick={() => toggleFavorite(product.id)}
                      className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 transition-all duration-200"
                      aria-label="Favorilerden çıkar"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>

                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-sm md:text-base font-medium line-clamp-2 group-hover:text-gray-600 transition-colors mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg md:text-xl font-bold text-gray-900">
                        {product.price.toFixed(2)} ₺
                      </span>
                    </div>


                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
