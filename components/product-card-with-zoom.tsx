'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/contexts/favorites-context'
import ImageZoomModal from '@/components/image-zoom-modal'

interface ProductCardWithZoomProps {
  product: any
  className?: string
}

export default function ProductCardWithZoom({ product, className = '' }: ProductCardWithZoomProps) {
  const { toggleFavorite, isFavorite } = useFavorites()
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false)
  
  const isProductFavorite = isFavorite(product.id)
  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
  const isOutOfStock = product.variants?.every((v: any) => v.stock === 0) || false

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsZoomModalOpen(true)
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product.id)
  }

  return (
    <>
      <Link href={`/products/${product.slug}`} className={`group block ${className}`}>
        <div className="relative">
          {/* Ürün Görseli */}
          <div className="aspect-[3/4] bg-gray-50 overflow-hidden mb-4 relative">
            {primaryImage ? (
              <>
                <img 
                  src={primaryImage.image_url} 
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                  onLoad={(e) => e.currentTarget.classList.add('loaded')}
                  style={{ opacity: 1 }}
                />
                {/* Zoom Butonu */}
                <button
                  onClick={handleImageClick}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-sm"
                  title="Büyütmek için tıklayın"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Görsel Yok
              </div>
            )}
            
            {/* Stok Durumu */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-3 py-1 text-sm font-medium">
                  Stokta Yok
                </span>
              </div>
            )}
          </div>

          {/* Ürün Bilgileri */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                {product.name}
              </h3>
              <button
                onClick={handleFavoriteClick}
                className="flex-shrink-0 p-1 hover:bg-gray-50 rounded transition"
                aria-label={isProductFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
              >
                <Heart 
                  size={16}
                  className={`transition ${
                    isProductFavorite 
                      ? 'fill-red-500 stroke-red-500' 
                      : 'stroke-gray-400 hover:stroke-red-500'
                  }`}
                />
              </button>
            </div>
            
            <p className="text-lg font-bold text-gray-900">
              {product.price} TL
            </p>
            
            {product.category && (
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category.name}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        imageUrl={primaryImage?.image_url || ''}
        imageAlt={product.name}
        images={product.images?.map((img: any, index: number) => ({
          id: img.id,
          image_url: img.image_url,
          alt: `${product.name} - Görsel ${index + 1}`
        })) || []}
        currentIndex={0}
        onImageChange={() => {}} // Tek görsel için
      />
    </>
  )
}