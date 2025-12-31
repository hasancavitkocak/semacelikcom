'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { supabase } from '@/lib/supabase'
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown } from 'lucide-react'

// Helper function to get payment method display name
const getPaymentMethodName = (method: string): string => {
  const methodMap: Record<string, string> = {
    'credit_card': 'Kredi Kartı',
    'bank_transfer': 'Havale/EFT',
    'cash_on_delivery': 'Kapıda Ödeme',
    'iyzico': 'Kredi Kartı (İyzico)'
  }
  return methodMap[method] || method
}

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  subtotal?: number
  shipping_cost?: number
  created_at: string
  payment_status?: string
  payment_method?: string
  tracking_number?: string
  order_items?: any[]
  order_items_count?: number
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    checkUser()
  }, [])

  // Refresh orders every 60 seconds to get status updates
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      loadOrders(user.id, false) // Background refresh, no loading state
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [user?.id])

  const checkUser = async () => {
    try {
      setLoading(true)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)
      await loadOrders(authUser.id)
    } catch (error) {
      console.error('Check user error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadOrders = async (userId: string, showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await fetch(`/api/orders?user_id=${userId}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to load orders')
      }

      setOrders(result.data || [])
    } catch (error) {
      console.error('Load orders error:', error)
      setOrders([])
    } finally {
      if (showLoading) setLoading(false)
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

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; icon: any; bgColor: string }> = {
      created: { 
        text: 'Sipariş Alındı', 
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

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

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
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-2xl font-bold">Siparişlerim</h2>
                    
                    {/* Filter */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        >
                          <option value="all">Tüm Siparişler</option>
                          <option value="created">Sipariş Alındı</option>
                          <option value="processing">Hazırlanıyor</option>
                          <option value="shipped">Kargoya Verildi</option>
                          <option value="delivered">Teslim Edildi</option>
                          <option value="cancelled">İptal Edildi</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      

                    </div>
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900 mb-4"></div>
                    <p className="text-gray-600">Siparişler yükleniyor...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-4">
                      {statusFilter === 'all' ? 'Henüz siparişiniz bulunmuyor' : 'Bu durumda sipariş bulunmuyor'}
                    </h3>
                    <p className="text-gray-600 mb-6">İlk siparişinizi vermek için ürünlerimize göz atın</p>
                    <Link 
                      href="/products" 
                      className="inline-block bg-gray-900 hover:bg-black text-white px-6 py-3 text-sm font-medium rounded-lg transition"
                    >
                      Alışverişe Başla
                    </Link>
                  </div>
                ) : (
                  <div>
                    {filteredOrders.map((order, index) => {
                      const statusInfo = getStatusInfo(order.status)
                      const StatusIcon = statusInfo.icon
                      const orderNumber = order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`
                      
                      return (
                        <div key={order.id} className={`p-4 sm:p-6 hover:bg-gray-50 transition min-w-0 ${index > 0 ? 'border-t border-gray-200' : ''}`}>
                          {/* Order Header */}
                          <div className="flex flex-col gap-4 mb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-black mb-1 break-all">Sipariş No: {orderNumber}</h3>
                                <div className="text-sm text-gray-600">
                                  {new Date(order.created_at).toLocaleDateString('tr-TR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                  <StatusIcon size={14} />
                                  {statusInfo.text}
                                </div>
                                <Link
                                  href={`/profile/orders/${order.id}`}
                                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition whitespace-nowrap"
                                >
                                  Sipariş Detay
                                </Link>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Alınan Ürün: {order.order_items_count || 0} adet
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                              {order.order_items?.slice(0, 6).map((item, index) => {
                                const primaryImage = item.product?.images?.find((img: any) => img.is_primary) || item.product?.images?.[0]
                                
                                return (
                                  <Link
                                    key={item.id}
                                    href={`/products/${item.product?.slug || item.product_id}`}
                                    className="group block"
                                  >
                                    <div className="aspect-square bg-white rounded-md overflow-hidden border border-gray-200 group-hover:border-gray-900 transition">
                                      {primaryImage ? (
                                        <img 
                                          src={primaryImage.image_url} 
                                          alt={item.product?.name || 'Ürün'}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                          <Package size={16} className="text-gray-400" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="mt-1 text-xs text-center">
                                      <p className="font-medium text-gray-900 group-hover:text-gray-600 transition text-xs line-clamp-2 leading-tight">
                                        {item.product?.name || 'Ürün'}
                                      </p>
                                      <p className="text-gray-500 text-xs">
                                        {item.variant?.color?.name} / {item.variant?.size?.name}
                                      </p>
                                    </div>
                                  </Link>
                                )
                              })}
                              
                              {(order.order_items_count || 0) > 6 && (
                                <div className="aspect-square bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                                  <div className="text-center">
                                    <p className="text-xs font-medium text-gray-600">
                                      +{(order.order_items_count || 0) - 6}
                                    </p>
                                    <p className="text-xs text-gray-500">daha</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Order Summary */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                              <div className="text-sm text-gray-600 space-y-1">
                                {order.payment_status === 'paid' ? (
                                  <span className="text-green-600 font-medium">✓ Ödendi</span>
                                ) : (
                                  <span className="text-orange-600 font-medium">⏳ Ödeme Bekliyor</span>
                                )}
                                {order.payment_method && (
                                  <div className="text-xs text-gray-500">
                                    {getPaymentMethodName(order.payment_method)}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 font-medium">Toplam:</span>
                                <p className="text-lg font-bold text-black whitespace-nowrap">
                                  {order.total?.toFixed(2) || '0.00'} TL
                                </p>
                              </div>
                            </div>
                            
                            {order.tracking_number && (
                              <div className="mt-2 text-sm text-gray-600">
                                Kargo Takip: <strong>{order.tracking_number}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
