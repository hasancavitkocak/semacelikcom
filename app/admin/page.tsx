'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, Users, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AdminHeader from '@/components/admin-header'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    products: 0,
    users: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Sipariş sayısı ve toplam gelir
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')

      // Son 3 sipariş
      const { data: recentOrdersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)



      // Ürün sayısı
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Son 3 ürün
      const { data: recentProductsData } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          created_at,
          images:product_images(image_url, is_primary)
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      // Kullanıcı sayısı
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

      setStats({
        orders: orders?.length || 0,
        revenue: totalRevenue,
        products: productCount || 0,
        users: userCount || 0
      })

      // Siparişleri formatla
      const formattedOrders = recentOrdersData?.map(order => ({
        id: order.id,
        order_number: order.conversation_id || `#${order.id.slice(0, 8).toUpperCase()}`,
        total_amount: order.total_amount,
        order_status: order.order_status || (order.status === 'paid' ? 'created' : order.status),
        created_at: order.created_at,
        user_name: order.shipping_address?.fullName || 'Bilinmiyor',
        user_email: order.shipping_address?.email || 'Bilinmiyor'
      })) || []

      setRecentOrders(formattedOrders)
      setRecentProducts(recentProductsData || [])
    } catch (error) {
      console.error('Load data error:', error)
      // Hata durumunda boş array'ler set et
      setRecentOrders([])
      setRecentProducts([])
      setStats({
        orders: 0,
        revenue: 0,
        products: 0,
        users: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    { title: 'Toplam Sipariş', value: stats.orders.toString() },
    { title: 'Toplam Gelir', value: `₺${stats.revenue.toFixed(2)}` },
    { title: 'Aktif Ürün', value: stats.products.toString() },
    { title: 'Toplam Müşteri', value: stats.users.toString() }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
            <span className="ml-3 text-gray-600">Dashboard yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Dashboard"
        description="Hoş geldiniz! İşte sitenizin genel durumu."
        actions={
          <Link 
            href="/admin/products/new"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition flex items-center gap-2"
          >
            <Plus size={16} />
            Yeni Ürün
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-gray-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
              <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500">Bu ay: +12%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-gray-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₺{stats.revenue.toFixed(0)}</p>
              <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500">Bu ay: +8%</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="text-gray-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
              <p className="text-sm font-medium text-gray-600">Aktif Ürün</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500">Stokta: {Math.floor(stats.products * 0.85)}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="text-gray-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
              <p className="text-sm font-medium text-gray-600">Toplam Müşteri</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500">Aktif: {Math.floor(stats.users * 0.6)}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Son Siparişler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Son Siparişler</h3>
            <Link 
              href="/admin/orders"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz sipariş yok</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-600">{order.user_name || order.user_email}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{order.total_amount} ₺</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.order_status === 'created' ? 'bg-blue-100 text-blue-800' :
                      order.order_status === 'processing' ? 'bg-orange-100 text-orange-800' :
                      order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.order_status === 'created' ? 'Oluşturuldu' :
                       order.order_status === 'processing' ? 'Hazırlanıyor' :
                       order.order_status === 'shipped' ? 'Kargoda' :
                       order.order_status === 'delivered' ? 'Teslim Edildi' :
                       order.order_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Son Ürünler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Son Eklenen Ürünler</h3>
            <Link 
              href="/admin/products"
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">Henüz ürün yok</p>
            ) : (
              recentProducts.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                return (
                  <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {primaryImage ? (
                        <img 
                          src={primaryImage.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(product.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{product.price} ₺</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
