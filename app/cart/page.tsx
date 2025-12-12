'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Plus, Minus, X } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { useFavorites } from '@/contexts/favorites-context'

export default function CartPage() {
  const { cartItems, loading, updateQuantity, removeFromCart } = useCart()
  const { toggleFavorite } = useFavorites()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0
    return sum + (price * item.quantity)
  }, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 lg:py-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-light text-black">
                Sepet
              </h1>
              <span className="text-gray-500">({cartItems.length})</span>
            </div>
            <Link href="/products" className="text-sm text-gray-600 hover:text-black transition">
              Alışverişe Devam
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mb-4"></div>
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-20">
              <h2 className="text-xl font-light text-gray-800 mb-4">Sepetiniz boş</h2>
              <Link href="/products" className="inline-block bg-black hover:bg-gray-800 text-white px-6 py-3 text-sm font-medium uppercase tracking-wide transition">
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Sol: Ürünler */}
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => {
                  const primaryImage = item.product?.images?.find((img: any) => img.is_primary) || item.product?.images?.[0]
                  const price = item.product?.price || 0
                  
                  return (
                    <div key={item.id} className="border-b border-gray-200 pb-6">
                      <div className="flex gap-6">
                        {/* Ürün Görseli */}
                        <Link href={`/products/${item.product_id}`} className="flex-shrink-0">
                          <div className="w-24 h-32 bg-gray-50 overflow-hidden">
                            {primaryImage && (
                              <img 
                                src={primaryImage.image_url} 
                                alt={item.product?.name} 
                                className="w-full h-full object-cover" 
                              />
                            )}
                          </div>
                        </Link>

                        {/* Ürün Bilgileri */}
                        <div className="flex-1">
                          <Link href={`/products/${item.product_id}`}>
                            <h3 className="font-medium text-black mb-2 hover:text-gray-600 transition">
                              {item.product?.name}
                            </h3>
                          </Link>
                          
                          {/* Varyant Bilgileri */}
                          {item.variant && (
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              {item.variant.color?.name && (
                                <span>Renk: {item.variant.color.name}</span>
                              )}
                              {item.variant.size?.name && (
                                <span>Beden: {item.variant.size.name}</span>
                              )}
                            </div>
                          )}

                          {/* Miktar ve Fiyat */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-300">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-12 h-8 flex items-center justify-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="font-bold text-black">
                                {(price * item.quantity)} TL
                              </div>
                              <button 
                                onClick={() => {
                                  setItemToDelete(item)
                                  setShowDeleteDialog(true)
                                }}
                                className="text-gray-400 hover:text-black transition p-1"
                                aria-label="Kaldır"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Sağ: Sipariş Özeti */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-8">
                  <h2 className="text-lg font-medium text-black mb-6">Sipariş Özeti</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ara Toplam</span>
                      <span>{total} TL</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kargo</span>
                      <span className="text-green-600">Ücretsiz</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">Toplam</span>
                      <span className="text-xl font-bold text-black">{total} TL</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">(KDV Dahil)</p>
                  </div>

                  <Link 
                    href="/checkout" 
                    className="block w-full bg-black hover:bg-gray-800 text-white text-center py-4 font-medium text-sm uppercase tracking-wide transition"
                  >
                    Siparişi Tamamla
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-black">Ürün Sil</h3>
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="text-gray-400 hover:text-black transition p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Bu işlemle ürün sepetinizden kaldırılacaktır. Onaylıyor musunuz?
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Favorilere ekle ve sepetten kaldır
                  toggleFavorite(itemToDelete.product_id)
                  removeFromCart(itemToDelete.id)
                  setShowDeleteDialog(false)
                  setItemToDelete(null)
                }}
                className="w-full bg-black text-white py-3 text-sm font-medium hover:bg-gray-800 transition"
              >
                Sil ve Favorilere Ekle
              </button>
              <button
                onClick={() => {
                  removeFromCart(itemToDelete.id)
                  setShowDeleteDialog(false)
                  setItemToDelete(null)
                }}
                className="w-full border border-gray-300 text-black py-3 text-sm font-medium hover:bg-gray-50 transition"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
