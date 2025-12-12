'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, ChevronRight, Home, MoreHorizontal } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useFavorites } from '@/contexts/favorites-context'

interface ProductClientProps {
  product: any
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showSizeError, setShowSizeError] = useState(false)
  const [showColorError, setShowColorError] = useState(false)
  const isProductFavorite = isFavorite(product.id)
  
  // Product'tan images ve variants al
  const images = product.images || []
  const variants = product.variants || []

  // Server'dan gelen renk ve beden verileri (artık hızlı!)
  const colors = [...new Set(variants.map((v: any) => v.color?.name).filter(Boolean))] as string[]
  const sizesArray = [...new Set(variants.map((v: any) => v.size?.name).filter(Boolean))] as string[]
  const sizes = sizesArray.sort((a: string, b: string) => {
    // Sayısal bedenler önce
    const numA = parseInt(a)
    const numB = parseInt(b)
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB
    }
    // Harf bedenler
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const indexA = sizeOrder.indexOf(a)
    const indexB = sizeOrder.indexOf(b)
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }
    return a.localeCompare(b)
  })
  
  // Toplam stok kontrolü
  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
  const isOutOfStock = totalStock === 0
  
  // Seçili resim
  const selectedImage = images[selectedImageIndex] || images[0]

  const handleAddToCart = async () => {
    // Renk ve beden kontrolü
    if (colors.length > 0 && !selectedColor) {
      setShowColorError(true)
      return
    }
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true)
      return
    }

    setLoading(true)
    try {
      console.log('🛒 Sepete ekleniyor...', { productId: product.id, quantity })
      
      // Seçili varyantı bul
      let selectedVariantId = null
      if (selectedSize || selectedColor) {
        const variant = variants.find((v: any) => 
          (!selectedColor || v.color?.name === selectedColor) &&
          (!selectedSize || v.size?.name === selectedSize)
        )
        selectedVariantId = variant?.id || null
        console.log('Selected variant:', { selectedSize, selectedColor, variant })
      }

      await addToCart(product.id, selectedVariantId, quantity)
      console.log('✅ Sepete eklendi!')
    } catch (error) {
      console.error('❌ Sepete ekleme hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16">
        {/* Breadcrumb - Desktop */}
        <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-black transition">
            Ana Sayfa
          </Link>
          <ChevronRight size={16} />
          <Link href="/products" className="hover:text-black transition">
            Ürünler
          </Link>
          {product.category && (
            <>
              <ChevronRight size={16} />
              <Link 
                href={`/products?category=${product.category.slug}`} 
                className="hover:text-black transition"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight size={16} />
          <span className="text-black font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Breadcrumb - Mobile */}
        <nav className="md:hidden flex items-center space-x-3 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-black transition">
            <Home size={16} />
          </Link>
          <MoreHorizontal size={16} />
          {product.category && (
            <>
              <MoreHorizontal size={16} />
            </>
          )}
          <MoreHorizontal size={16} />
          <span className="text-black font-medium">
            {product.name.length > 25 ? product.name.substring(0, 25) + '...' : product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Sol: Görsel Galerisi */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-gray-50 overflow-hidden">
              {selectedImage ? (
                <img 
                  src={selectedImage.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p>Görsel Yok</p>
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img: any, index: number) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-50 overflow-hidden border transition ${
                      selectedImageIndex === index 
                        ? 'border-black' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img 
                      src={img.image_url} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sağ: Ürün Bilgileri */}
          <div className="space-y-8">
            {/* Başlık ve Fiyat */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-light text-black leading-tight mb-3">
                    {product.name}
                  </h1>
                  {product.brand && (
                    <p className="text-gray-600 text-lg font-light">{product.brand}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="flex-shrink-0 p-2 hover:bg-gray-50 transition"
                  aria-label={isProductFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
                >
                  <Heart 
                    size={24}
                    className={`transition ${
                      isProductFavorite 
                        ? 'fill-black stroke-black' 
                        : 'stroke-gray-400 hover:stroke-black'
                    }`}
                  />
                </button>
              </div>
              
              <div className="mb-8">
                <span className="text-3xl font-bold text-black">
                  {product.price} TL
                </span>
                <span className="text-sm text-gray-500 ml-2">(KDV Dahil)</span>
              </div>
              
              {isOutOfStock && (
                <div className="text-red-600 text-sm font-medium mb-6">
                  Stokta Yok
                </div>
              )}
            </div>

            {/* Seçenekler */}
            <div className="space-y-8">
              {/* Renk Seçimi */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">
                    Renk
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color)
                          setShowColorError(false)
                        }}
                        className={`px-4 py-2 border text-sm font-medium transition ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                  {showColorError && (
                    <p className="text-red-600 text-sm mt-2">Lütfen bir renk seçin</p>
                  )}
                </div>
              )}

              {/* Beden Seçimi */}
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">
                    Beden
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size)
                          setShowSizeError(false)
                        }}
                        className={`px-4 py-2 border text-sm font-medium transition min-w-[50px] ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {showSizeError && (
                    <p className="text-red-600 text-sm mt-2">Lütfen bir beden seçin</p>
                  )}
                </div>
              )}

              {/* Miktar */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">
                  Miktar
                </label>
                <div className="flex items-center border border-gray-300 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    −
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center border-x border-gray-300 text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Sepete Ekle */}
              <button
                onClick={handleAddToCart}
                disabled={loading || isOutOfStock}
                className="w-full bg-black hover:bg-gray-800 text-white py-4 px-8 text-sm font-medium uppercase tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ekleniyor...' : isOutOfStock ? 'Stokta Yok' : 'Sepete Ekle'}
              </button>
            </div>

            {/* Ürün Açıklaması */}
            {product.description && (
              <div className="border-t pt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">
                  Ürün Açıklaması
                </h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}