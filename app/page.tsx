'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import HomeSlider from '@/components/home-slider'

export default function HomePage() {
  const [banners, setBanners] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [homeBlocks, setHomeBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      
      // Cache'i tamamen devre dışı bırak (debug için)
      const cacheKey = 'home-data'
      localStorage.removeItem(cacheKey)
      localStorage.removeItem(cacheKey + '-time')

      // Cache yoksa API'den çek
      const response = await fetch('/api/home', {
        next: { revalidate: 300 } // 5 dakika cache
      })
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()

      // Hata kontrolü
      if (data.error) {
        throw new Error(data.error)
      }

      // Cache'e kaydet
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(cacheKey + '-time', Date.now().toString())

      setBanners(data.banners || [])
      setCategories(data.categories || [])
      setFeaturedProducts(data.products || [])
      setHomeBlocks(data.homeBlocks || [])
    } catch (error: any) {
      console.error('Home page data loading error:', error)
      setError(error.message)
      
      // Fallback data - boş arrays
      setBanners([])
      setCategories([])
      setFeaturedProducts([])
      setHomeBlocks([])
    } finally {
      setLoading(false)
    }
  }

  // Skeleton Loading - Sayfa hemen render edilir, veriler gelince güncellenir
  const SkeletonCard = () => (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-gray-200 rounded-lg mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Error Message */}
        {error && (
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">Veri yüklenirken bir hata oluştu: {error}</p>
              <button 
                onClick={loadData}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* Hero Slider - Sadece banner varsa göster */}
        {(loading || banners.length > 0) && (
          <section className="mb-6 sm:mb-8 md:mb-16">
            <div className="container mx-auto px-4">
              <HomeSlider banners={banners} loading={loading} />
            </div>
          </section>
        )}

        <div className="container mx-auto px-4">
          {/* Ana Sayfa Blokları */}
          {homeBlocks.length > 0 && (
            <section className="mb-12 md:mb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {homeBlocks.map((block, index) => (
                  <Link
                    key={block.id}
                    href={block.link_url || '/products'}
                    className="group relative overflow-hidden rounded-lg"
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                      <img
                        src={block.image_url}
                        alt={block.title}
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute bottom-6 left-6">
                      <span className="bg-white px-6 py-3 font-bold text-gray-900 text-lg uppercase tracking-wide inline-block">
                        {block.title}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
          
          {/* Vitrin Ürünler */}
          <section className="mb-12 md:mb-20">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Vitrin Ürünler</h2>
              <p className="text-gray-600 text-sm md:text-base">En yeni ve trend ürünlerimizi keşfedin</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading ? (
                // Skeleton Loading
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => {
                  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                  // Stok kontrolü - tüm varyantların toplam stoğu
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0
                  const isOutOfStock = totalStock === 0
                  
                  return (
                    <Link 
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      className="group"

                    >
                      <div className="relative overflow-hidden rounded-lg bg-gray-50 mb-3">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                          {primaryImage ? (
                            <img 
                              src={primaryImage.image_url} 
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                              onLoad={(e) => e.currentTarget.classList.add('loaded')}
                              style={{ opacity: 1 }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Görsel Yok
                            </div>
                          )}
                        </div>
                        {/* Tükendi Badge */}
                        {isOutOfStock && (
                          <div className="absolute top-4 left-4 bg-gray-900 text-white px-4 py-2 font-bold text-sm uppercase tracking-wide">
                            TÜKENDİ
                          </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category?.name}</p>
                        <h3 className="text-sm md:text-base font-medium line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{product.price} ₺</p>
                      </div>
                    </Link>
                  )
                })
              ) : null}
            </div>
            <div className="text-center mt-8 md:mt-12">
              <Link 
                href="/products" 
                className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition font-medium"
              >
                Tüm Ürünleri Gör
              </Link>
            </div>
          </section>

          {/* Kategoriler */}
          <section className="mb-12 md:mb-20">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Kategoriler</h2>
              <p className="text-gray-600 text-sm md:text-base">Size en uygun kategoriyi seçin</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative overflow-hidden rounded-lg"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                    <img 
                      src={category.image_url || `https://placehold.co/400x500/f5f5f5/666?text=${encodeURIComponent(category.name)}`} 
                      alt={category.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center p-4">
                    <h3 className="text-white text-lg md:text-xl font-bold uppercase tracking-wide">
                      {category.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}