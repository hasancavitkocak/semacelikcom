'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, MapPin, CreditCard } from 'lucide-react'

interface OrderDetail {
  id: string
  order_number: string
  status: string
  total: number
  subtotal?: number
  shipping_cost?: number
  created_at: string
  payment_status?: string
  tracking_number?: string
  shipping_address?: any
  billing_address?: any
  order_items?: any[]
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  // Başarı mesajı göster
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      // Başarı mesajı göster
      setTimeout(() => {
        alert('Siparişiniz başarıyla oluşturuldu!')
      }, 1000)
    }
  }, [])

  // Refresh order data every 30 seconds to get status updates
  useEffect(() => {
    if (!user?.id || !order?.id) return

    const interval = setInterval(() => {
      loadOrderDetail(user.id, params.id as string, false) // Background refresh, no loading state
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [user?.id, order?.id, params.id])

  const checkUser = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)
      await loadOrderDetail(authUser.id, params.id as string)
    } catch (error) {
      console.error('Check user error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadOrderDetail = async (userId: string, orderId: string, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await fetch(`/api/orders/${orderId}?user_id=${userId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Order not found')
      }

      setOrder(result.data)
    } catch (error) {
      console.error('Load order detail error:', error)
      if (showLoading) router.push('/profile/orders')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; icon: any; bgColor: string }> = {
      created: { 
        text: 'Oluşturuldu', 
        color: 'text-blue-600', 
        icon: Clock,
        bgColor: 'bg-blue-50 border-blue-200'
      },
      processing: { 
        text: 'Hazırlanıyor', 
        color: 'text-orange-600', 
        icon: Package,
        bgColor: 'bg-orange-50 border-orange-200'
      },
      shipped: { 
        text: 'Kargoya Verildi', 
        color: 'text-purple-600', 
        icon: Truck,
        bgColor: 'bg-purple-50 border-purple-200'
      },
      delivered: { 
        text: 'Teslim Edildi', 
        color: 'text-green-600', 
        icon: CheckCircle,
        bgColor: 'bg-green-50 border-green-200'
      },
      cancelled: { 
        text: 'İptal Edildi', 
        color: 'text-red-600', 
        icon: XCircle,
        bgColor: 'bg-red-50 border-red-200'
      },
      returned: { 
        text: 'İade Edildi', 
        color: 'text-gray-600', 
        icon: XCircle,
        bgColor: 'bg-gray-50 border-gray-200'
      }
    }
    return statusMap[status] || { 
      text: status, 
      color: 'text-gray-600', 
      icon: Clock,
      bgColor: 'bg-gray-50 border-gray-200'
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Profilim</h1>
            <div className="grid md:grid-cols-4 gap-6">
              <nav className="space-y-2">
                <Link href="/profile" className="block px-4 py-3 hover:bg-white rounded-lg transition">
                  Hesap Bilgileri
                </Link>
                <Link href="/profile/addresses" className="block px-4 py-3 hover:bg-white rounded-lg transition">
                  Adreslerim
                </Link>
                <Link href="/profile/orders" className="block px-4 py-3 bg-white rounded-lg font-semibold">
                  Siparişlerim
                </Link>
              </nav>
              <div className="md:col-span-3">
                <div className="bg-white rounded-lg p-8 shadow-sm text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-4"></div>
                  <p className="text-gray-600">Sipariş detayları yükleniyor...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Sipariş bulunamadı</h2>
          <Link href="/profile/orders" className="text-gray-900 hover:underline">
            Siparişlerime dön
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)
  const StatusIcon = statusInfo.icon
  const orderNumber = order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Profilim</h1>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sol Menü */}
            <nav className="space-y-2">
              <Link href="/profile" className="block px-4 py-3 hover:bg-white rounded-lg transition">
                Hesap Bilgileri
              </Link>
              <Link href="/profile/addresses" className="block px-4 py-3 hover:bg-white rounded-lg transition">
                Adreslerim
              </Link>
              <Link href="/profile/orders" className="block px-4 py-3 bg-white rounded-lg font-semibold">
                Siparişlerim
              </Link>
              {user?.user_metadata?.role === 'admin' && (
                <Link href="/admin" className="block px-4 py-3 bg-gray-900 text-white font-semibold hover:bg-gray-800 transition rounded-lg">
                  🔐 Admin Paneli
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-white rounded-lg text-red-600 transition"
              >
                Çıkış Yap
              </button>
            </nav>

            {/* İçerik */}
            <div className="md:col-span-3 space-y-4">
              {/* Breadcrumb */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
                <Link 
                  href="/profile/orders" 
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition text-sm"
                >
                  <ArrowLeft size={16} />
                  Siparişlerime Dön
                </Link>
              </div>

              {/* Order Header */}
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-black mb-2">Sipariş No: {orderNumber}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                      <span>
                        Sipariş Tarihi: {new Date(order.created_at).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>Ürün Adedi: {order.order_items?.length || 0}</span>
                      <span>Toplam Tutar: {order.total?.toFixed(2) || '0.00'} TL</span>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg border ${statusInfo.bgColor}`}>
                    <StatusIcon size={20} className={statusInfo.color} />
                    <span className={`font-medium ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      {[
                        { key: 'created', label: 'Sipariş Alındı', icon: Clock },
                        { key: 'processing', label: 'Hazırlanıyor', icon: Package },
                        { key: 'shipped', label: 'Kargoya Verildi', icon: Truck },
                        { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle }
                      ].map((step, index) => {
                        const StepIcon = step.icon
                        const isActive = order.status === step.key
                        const isCompleted = ['created', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                        const isCancelled = order.status === 'cancelled'
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                              isCancelled 
                                ? 'bg-red-100 text-red-600' 
                                : isActive 
                                  ? 'bg-gray-900 text-white' 
                                  : isCompleted 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gray-100 text-gray-400'
                            }`}>
                              <StepIcon size={16} />
                            </div>
                            <span className={`text-xs text-center font-medium max-w-20 ${
                              isCancelled 
                                ? 'text-red-600' 
                                : isActive 
                                  ? 'text-gray-900' 
                                  : isCompleted 
                                    ? 'text-green-600' 
                                    : 'text-gray-400'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10" />
                    <div 
                      className={`absolute top-5 left-5 h-0.5 transition-all duration-500 -z-10 ${
                        order.status === 'cancelled' 
                          ? 'bg-red-300' 
                          : 'bg-green-300'
                      }`}
                      style={{ 
                        width: order.status === 'cancelled' 
                          ? '0%' 
                          : order.status === 'created' 
                            ? 'calc(33.33% - 20px)' 
                            : order.status === 'processing' 
                              ? 'calc(66.66% - 20px)' 
                              : order.status === 'shipped' 
                                ? 'calc(100% - 40px)' 
                                : order.status === 'delivered' 
                                  ? 'calc(100% - 40px)' 
                                  : '0%' 
                      }}
                    />
                  </div>
                </div>

                {order.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <XCircle size={20} className="text-red-600" />
                      <h3 className="font-semibold text-red-900">Sipariş İptal Edildi</h3>
                    </div>
                    <p className="text-red-800 text-sm mt-1">
                      Bu sipariş iptal edilmiştir. Ödeme yaptıysanız, iade işlemi başlatılacaktır.
                    </p>
                  </div>
                )}

                {order.tracking_number && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Kargo Takip Bilgisi</h3>
                    <p className="text-blue-800">
                      <strong>Takip Numarası:</strong> {order.tracking_number}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-6">Alınan Ürün: {order.order_items?.length || 0} adet</h3>
                
                <div className="space-y-6">
                  {order.order_items?.map((item) => {
                    const primaryImage = item.product?.images?.find((img: any) => img.is_primary) || item.product?.images?.[0]
                    
                    return (
                      <div key={item.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-900 transition">
                        <Link href={`/products/${item.product?.slug || item.product_id}`} className="flex-shrink-0 group">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                            {primaryImage ? (
                              <img 
                                src={primaryImage.image_url} 
                                alt={item.product?.name || 'Ürün'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <Link 
                            href={`/products/${item.product?.slug || item.product_id}`}
                            className="block group"
                          >
                            <h4 className="font-semibold text-black group-hover:text-gray-600 transition truncate">
                              {item.product?.name || 'Ürün'}
                            </h4>
                          </Link>
                          
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Renk: <strong>{item.variant?.color?.name || 'Belirtilmemiş'}</strong></span>
                              <span>Beden: <strong>{item.variant?.size?.name || 'Belirtilmemiş'}</strong></span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Adet: <strong>{item.quantity}</strong></span>
                              <span>Birim Fiyat: <strong>{item.price?.toFixed(2)} TL</strong></span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-black whitespace-nowrap">
                            {(item.price * item.quantity).toFixed(2)} TL
                          </p>
                          {order.status === 'cancelled' && (
                            <div className="mt-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                                <XCircle size={12} />
                                İptal Edildi
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-600">
                      <span className="flex-1">Ara toplam ({order.order_items?.length || 0} ürün):</span>
                      <span className="font-semibold whitespace-nowrap flex-shrink-0 text-right">{order.subtotal?.toFixed(2) || order.total?.toFixed(2) || '0.00'} TL</span>
                    </div>
                    
                    {order.shipping_cost && order.shipping_cost > 0 ? (
                      <div className="flex justify-between items-center text-gray-600">
                        <span className="flex-1">Kargo Ücreti:</span>
                        <span className="font-semibold whitespace-nowrap flex-shrink-0 text-right">{order.shipping_cost.toFixed(2)} TL</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="flex-1">Kargo Ücreti:</span>
                        <span className="font-semibold whitespace-nowrap flex-shrink-0 text-right">Ücretsiz Kargo</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center text-xl font-bold text-black">
                        <span className="flex-1">TOPLAM</span>
                        <span className="whitespace-nowrap flex-shrink-0 text-right">{order.total?.toFixed(2) || '0.00'} TL</span>
                      </div>
                    </div>
                  </div>

                  {order.payment_status && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-gray-600" />
                          <span className="text-gray-600">Ödeme Durumu:</span>
                        </div>
                        <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                          order.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-orange-100 text-orange-600'
                        }`}>
                          {order.payment_status === 'paid' ? '✓ Ödendi' : '⏳ Ödeme Bekliyor'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              {(order.shipping_address || order.billing_address) && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Adres Bilgileri</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {order.shipping_address && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin size={16} className="text-gray-600" />
                          <h4 className="font-semibold">Teslimat Adresi</h4>
                        </div>
                        <div className="text-gray-600 text-sm space-y-1">
                          <p>{order.shipping_address.full_name}</p>
                          <p>{order.shipping_address.phone}</p>
                          <p>{order.shipping_address.address_line}</p>
                          <p>{order.shipping_address.district} / {order.shipping_address.city}</p>
                          {order.shipping_address.postal_code && (
                            <p>Posta Kodu: {order.shipping_address.postal_code}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {order.billing_address && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard size={16} className="text-gray-600" />
                          <h4 className="font-semibold">Fatura Adresi</h4>
                        </div>
                        <div className="text-gray-600 text-sm space-y-1">
                          <p>{order.billing_address.full_name}</p>
                          <p>{order.billing_address.phone}</p>
                          <p>{order.billing_address.address_line}</p>
                          <p>{order.billing_address.district} / {order.billing_address.city}</p>
                          {order.billing_address.postal_code && (
                            <p>Posta Kodu: {order.billing_address.postal_code}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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