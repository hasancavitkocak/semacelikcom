'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { SlidersHorizontal, X, Heart } from 'lucide-react'
import { useFavorites } from '@/contexts/favorites-context'

function ProductsContent() {
  const searchParams = useSearchParams()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  // Filtre state'leri
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(5000)
  const [sortBy, setSortBy] = useState<string>('newest')
  
  // Accordion state'leri
  const [openSections, setOpenSections] = useState<string[]>([])

  useEffect(() => {
    loadProducts()
    loadCategories()
    loadColors()
    loadSizes()
  }, [])

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  useEffect(() => {
    // URL parametrelerini oku
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const menu = searchParams.get('menu')
    const menuItem = searchParams.get('menu_item')
    const discount = searchParams.get('discount')
    const isNew = searchParams.get('new')
    const isBestseller = searchParams.get('bestseller')

    let filtered = [...products]

    // Arama
    if (search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Kategori (URL'den veya manuel seçimden)
    const activeCategory = category || selectedCategory
    if (activeCategory) {
      filtered = filtered.filter(p => {
        // Ana kategori kontrolü (geriye uyumluluk için)
        if (p.category?.name?.toLowerCase() === activeCategory.toLowerCase() ||
            p.category?.slug?.toLowerCase() === activeCategory.toLowerCase()) {
          return true
        }
        
        // Çoklu kategori kontrolü
        if (p.product_categories && p.product_categories.length > 0) {
          return p.product_categories.some((pc: any) => 
            pc.category?.name?.toLowerCase() === activeCategory.toLowerCase() ||
            pc.category?.slug?.toLowerCase() === activeCategory.toLowerCase() ||
            pc.category?.id === activeCategory
          )
        }
        
        return false
      })
    }

    // Menu filtresi
    if (menu) {
      // Menu slug'ına göre filtreleme
      if (menu === 'kategoriler') {
        // Tüm ürünleri göster (filtreleme yok)
      } else {
        // Diğer menüler için özel filtreleme
        filtered = filtered.filter(p => {
          return true // Şimdilik tüm ürünleri göster
        })
      }
    }

    // Menu item filtresi
    if (menuItem) {
      // Menu item slug'ına göre filtreleme
      filtered = filtered.filter(p => {
        // Ana kategori kontrolü (geriye uyumluluk için)
        if (p.category?.slug?.toLowerCase() === menuItem.toLowerCase()) {
          return true
        }
        
        // Çoklu kategori kontrolü
        if (p.product_categories && p.product_categories.length > 0) {
          return p.product_categories.some((pc: any) => 
            pc.category?.slug?.toLowerCase() === menuItem.toLowerCase()
          )
        }
        
        return false
      })
    }

    // İndirim
    if (discount) {
      const discountValue = parseInt(discount)
      filtered = filtered.filter(p => p.discount_percentage >= discountValue)
    }

    // Yeni ürünler
    if (isNew === 'true') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      filtered = filtered.filter(p => new Date(p.created_at) > thirtyDaysAgo)
    }

    // Çok satanlar (şimdilik random)
    if (isBestseller === 'true') {
      filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 20)
    }

    // Renk filtresi
    if (selectedColors.length > 0) {
      // TODO: Ürün varyantlarından renk kontrolü yapılacak
    }

    // Beden filtresi
    if (selectedSizes.length > 0) {
      // TODO: Ürün varyantlarından beden kontrolü yapılacak
    }

    // Fiyat aralığı
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice)

    // Sıralama
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredProducts(filtered)
  }, [products, searchParams, selectedCategory, selectedColors, selectedSizes, minPrice, maxPrice, sortBy])

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        images:product_images(image_url, is_primary),
        product_categories(
          category:categories(id, name, slug),
          is_primary
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Load products error:', error)
    } else {
      setProducts(data || [])
      setFilteredProducts(data || [])
    }
    setLoading(false)
  }

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (data) setCategories(data)
  }

  const loadColors = async () => {
    const { data } = await supabase
      .from('colors')
      .select('*')
      .order('name')
    
    if (data) setColors(data)
  }

  const loadSizes = async () => {
    const { data } = await supabase
      .from('sizes')
      .select('*')
      .order('name')
    
    if (data) setSizes(data)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedColors([])
    setSelectedSizes([])
    setMinPrice(0)
    setMaxPrice(5000)
    setSortBy('newest')
    window.history.pushState({}, '', '/products')
  }

  const toggleColor = (colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    )
  }

  const toggleSize = (sizeName: string) => {
    setSelectedSizes(prev =>
      prev.includes(sizeName)
        ? prev.filter(s => s !== sizeName)
        : [...prev, sizeName]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Yükleniyor...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Sticky Header with Title and Filters */}
        <div className="bg-white sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-base md:text-lg font-bold text-gray-900">
                  {searchParams.get('search') ? `"${searchParams.get('search')}"` : 'Ürünler'}
                </h1>
                <span className="text-sm text-gray-500">({filteredProducts.length})</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Sıralama Butonu - Her zaman görünür */}
                <div className="flex-1 md:flex-none relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M7 12h10M11 18h2"/>
                    </svg>
                    Sırala
                  </button>
                  
                  {showSortMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowSortMenu(false)}
                      />
                      <div className="absolute top-full mt-2 left-0 md:left-auto md:right-0 right-0 md:w-56 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
                        <button
                          onClick={() => {
                            setSortBy('newest')
                            setShowSortMenu(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 font-medium text-sm ${sortBy === 'newest' ? 'bg-gray-100 text-gray-900' : ''}`}
                        >
                          En Yeni
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('price-asc')
                            setShowSortMenu(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 font-medium border-t text-sm ${sortBy === 'price-asc' ? 'bg-gray-100 text-gray-900' : ''}`}
                        >
                          Fiyat: Düşükten Yükseğe
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('price-desc')
                            setShowSortMenu(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 font-medium border-t text-sm ${sortBy === 'price-desc' ? 'bg-gray-100 text-gray-900' : ''}`}
                        >
                          Fiyat: Yüksekten Düşüğe
                        </button>
                        <button
                          onClick={() => {
                            setSortBy('name')
                            setShowSortMenu(false)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 font-medium border-t text-sm ${sortBy === 'name' ? 'bg-gray-100 text-gray-900' : ''}`}
                        >
                          A-Z Sıralama
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Filtre Butonu - Sadece mobil */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white border-2 border-gray-900 rounded-lg font-semibold hover:bg-black"
                >
                  <SlidersHorizontal size={18} />
                  Filtre
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex gap-6">
            {/* Filters Sidebar */}
            <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'hidden'} lg:block lg:static lg:w-72 flex-shrink-0`}>
              {showFilters && (
                <div className="flex items-center justify-between mb-4 lg:hidden pb-4 border-b">
                  <h2 className="text-xl font-bold">Filtreler</h2>
                  <button onClick={() => setShowFilters(false)} className="p-2">
                    <X size={24} />
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {/* Kategori */}
                {categories.length > 0 && (
                  <div className="border-b pb-3">
                    <button
                      onClick={() => toggleSection('category')}
                      className="w-full flex items-center justify-between py-2 font-bold text-sm uppercase text-gray-900"
                    >
                      Kategori
                      <span className="text-xl">{openSections.includes('category') ? '−' : '+'}</span>
                    </button>
                    {openSections.includes('category') && (
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === ''}
                            onChange={() => setSelectedCategory('')}
                            className="w-4 h-4 accent-gray-900"
                          />
                          <span className="text-sm">Tümü</span>
                        </label>
                        {categories.map(cat => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="radio"
                              name="category"
                              checked={selectedCategory === cat.name}
                              onChange={() => setSelectedCategory(cat.name)}
                              className="w-4 h-4 accent-gray-900"
                            />
                            <span className="text-sm">{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Renk */}
                {colors.length > 0 && (
                  <div className="border-b pb-3">
                    <button
                      onClick={() => toggleSection('color')}
                      className="w-full flex items-center justify-between py-2 font-bold text-sm uppercase text-gray-900"
                    >
                      Renk {selectedColors.length > 0 && `(${selectedColors.length})`}
                      <span className="text-xl">{openSections.includes('color') ? '−' : '+'}</span>
                    </button>
                    {openSections.includes('color') && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {colors.map(color => (
                          <button
                            key={color.id}
                            onClick={() => toggleColor(color.name)}
                            className={`px-3 py-1.5 text-sm rounded-full border-2 transition ${
                              selectedColors.includes(color.name)
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {color.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Beden */}
                {sizes.length > 0 && (
                  <div className="border-b pb-3">
                    <button
                      onClick={() => toggleSection('size')}
                      className="w-full flex items-center justify-between py-2 font-bold text-sm uppercase text-gray-900"
                    >
                      Beden {selectedSizes.length > 0 && `(${selectedSizes.length})`}
                      <span className="text-xl">{openSections.includes('size') ? '−' : '+'}</span>
                    </button>
                    {openSections.includes('size') && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {sizes.map(size => (
                          <button
                            key={size.id}
                            onClick={() => toggleSize(size.name)}
                            className={`px-3 py-1.5 text-sm rounded-lg border-2 transition font-medium ${
                              selectedSizes.includes(size.name)
                                ? 'border-gray-900 bg-gray-900 text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {size.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Fiyat Aralığı - Range Slider */}
                <div className="border-b pb-3">
                  <button
                    onClick={() => toggleSection('price')}
                    className="w-full flex items-center justify-between py-2 font-bold text-sm uppercase text-gray-900"
                  >
                    Fiyat
                    <span className="text-xl">{openSections.includes('price') ? '−' : '+'}</span>
                  </button>
                  {openSections.includes('price') && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{minPrice} ₺</span>
                        <span>{maxPrice} ₺</span>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={minPrice}
                          onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 100))}
                          className="w-full accent-gray-900"
                        />
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 100))}
                          className="w-full accent-gray-900"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtreleri Temizle */}
                {(selectedCategory || selectedColors.length > 0 || selectedSizes.length > 0 || minPrice > 0 || maxPrice < 5000) && (
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 px-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 text-sm"
                  >
                    Filtreleri Temizle
                  </button>
                )}

                {showFilters && (
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-semibold lg:hidden mt-4"
                  >
                    Ürünleri Göster ({filteredProducts.length})
                  </button>
                )}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg mb-4">Henüz ürün bulunmuyor.</p>
              <Link href="/" className="text-orange-600 hover:text-orange-700 font-semibold">
                Ana Sayfaya Dön
              </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filteredProducts.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                
                const isProductFavorite = isFavorite(product.id)
                
                return (
                  <div key={product.id} className="group relative">
                    <Link 
                      href={`/products/${product.slug}`}
                      className="block"
                    >
                      <div className="relative overflow-hidden rounded-lg bg-gray-50 mb-3">
                        <div className="aspect-[3/4] overflow-hidden">
                          {primaryImage ? (
                            <img 
                              src={primaryImage.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              Görsel Yok
                            </div>
                          )}
                        </div>
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </div>
                    </Link>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleFavorite(product.id)
                      }}
                      className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-200"
                      aria-label="Favorilere ekle"
                    >
                      <Heart 
                        size={18}
                        className={`transition-all duration-200 ${
                          isProductFavorite 
                            ? 'fill-red-500 stroke-red-500' 
                            : 'stroke-gray-700 hover:stroke-red-500'
                        }`}
                      />
                    </button>
                    
                    <Link href={`/products/${product.slug}`}>
                      <div className="space-y-1">
                        {product.category && (
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {product.category.name}
                          </p>
                        )}
                        <h3 className="text-sm md:text-base font-medium line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{product.price} ₺</p>
                      </div>
                    </Link>
                  </div>
                )
                })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Ürünler yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}