'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { CheckCircle, Package, Truck, MapPin, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react'

interface OrderDetail {
  id: string
  order_number: string
  status: string
  total: number
  subtotal?: number
  shipping_cost?: number
  created_at: string
  payment_status?: string
  shipping_address?: any
  billing_address?: any
  order_items?: any[]
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrderDetail()
  }, [])

  const loadOrderDetail = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Order not found')
      }

      setOrder(result.data)
    } catch (error) {
      console.error('Load order detail error:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-4"></div>
            <p className="text-gray-600">Sipariş bilgileri yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sipariş bulunamadı</h2>
            <Link href="/" className="text-gray-900 hover:underline">
              Ana sayfaya dön
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const orderNumber = order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Siparişiniz Başarıyla Oluşturuldu!</h1>
            <p className="text-lg text-gray-600">
              Sipariş numaranız: <strong className="text-gray-900">{orderNumber}</strong>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Sipariş onay e-postası adresinize gönderilmiştir.
            </p>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package size={24} />
                Sipariş Özeti
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sipariş Bilgileri</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Sipariş No: <strong>{orderNumber}</strong></p>
                    <p>Sipariş Tarihi: <strong>
                      {new Date(order.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </strong></p>
                    <p>Ürün Adedi: <strong>{order.order_items?.length || 0} adet</strong></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ödeme Bilgileri</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Ödeme Durumu: <span className="text-green-600 font-semibold">✓ Ödendi</span></p>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-center">
                        <span className="text-gray-700 text-sm">Toplam Ödenen Tutar</span><br/>
                        <strong className="text-2xl text-gray-900">{order.total?.toFixed(2)} TL</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Sipariş Edilen Ürünler</h3>
                <div className="space-y-4">
                  {order.order_items?.map((item) => {
                    const primaryImage = item.product?.images?.find((img: any) => img.is_primary) || item.product?.images?.[0]
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          {primaryImage ? (
                            <img 
                              src={primaryImage.image_url} 
                              alt={item.product?.name || 'Ürün'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Package size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {item.product?.name || 'Ürün'}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span>Renk: <strong>{item.variant?.color?.name || 'Belirtilmemiş'}</strong></span>
                            <span>Beden: <strong>{item.variant?.size?.name || 'Belirtilmemiş'}</strong></span>
                            <span>Adet: <strong>{item.quantity}</strong></span>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-gray-900 whitespace-nowrap">
                            {(item.price * item.quantity).toFixed(2)} TL
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Ara Toplam:</span>
                      <span>{order.subtotal?.toFixed(2) || order.total?.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Kargo Ücreti:</span>
                      <span>
                        {order.shipping_cost && order.shipping_cost > 0 
                          ? `${order.shipping_cost.toFixed(2)} TL`
                          : 'Ücretsiz'
                        }
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Toplam:</span>
                        <span>{order.total?.toFixed(2)} TL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {order.shipping_address && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Truck size={24} />
                  Teslimat Bilgileri
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin size={16} className="text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Teslimat Adresi</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>{order.shipping_address.fullName || order.shipping_address.full_name}</strong></p>
                      <p>{order.shipping_address.phone}</p>
                      <p>{order.shipping_address.address || order.shipping_address.address_line}</p>
                      <p>{order.shipping_address.district} / {order.shipping_address.city}</p>
                      {(order.shipping_address.zipCode || order.shipping_address.postal_code) && (
                        <p>Posta Kodu: {order.shipping_address.zipCode || order.shipping_address.postal_code}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Truck size={16} className="text-gray-600" />
                      <h3 className="font-semibold text-gray-900">Kargo Bilgileri</h3>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Tahmini Teslimat: <strong>2-3 iş günü</strong></p>
                      <p className="text-blue-600">
                        Kargo takip numarası e-posta ile gönderilecektir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ne yapmak istiyorsunuz?</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition"
                >
                  <ShoppingBag size={20} />
                  Alışverişe Devam Et
                </Link>
                <Link
                  href={`/profile/orders/${order.id}`}
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  <Package size={20} />
                  Sipariş Detaylarını Görüntüle
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Sorularınız için <Link href="/contact" className="text-gray-900 hover:underline">iletişim</Link> sayfamızı ziyaret edebilirsiniz.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}