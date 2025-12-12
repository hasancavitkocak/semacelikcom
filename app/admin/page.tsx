'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Package, Users, FolderOpen, TrendingUp, Eye, Plus, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    products: 0,
    users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Sipariş sayısı ve toplam gelir
      const { data: orders } = await supabase
        .from('orders')
        .select('total')

      // Ürün sayısı
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Kullanıcı sayısı
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0

      setStats({
        orders: orders?.length || 0,
        revenue: totalRevenue,
        products: productCount || 0,
        users: userCount || 0
      })
    } catch (error) {
      console.error('Load stats error:', error)
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
      <div>
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600">Hoş geldiniz! İşte sitenizin genel durumu.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-white" size={24} />
            </div>
            <div className="text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-700 mb-1">Toplam Sipariş</p>
          <p className="text-3xl font-bold text-blue-900">{stats.orders}</p>
          <p className="text-xs text-blue-600 mt-2">Toplam sipariş sayısı</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-green-700 mb-1">Toplam Gelir</p>
          <p className="text-3xl font-bold text-green-900">₺{stats.revenue.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-2">Toplam satış geliri</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div className="text-purple-600">
              <Eye size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-purple-700 mb-1">Aktif Ürün</p>
          <p className="text-3xl font-bold text-purple-900">{stats.products}</p>
          <p className="text-xs text-purple-600 mt-2">Satışa hazır ürünler</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div className="text-orange-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-orange-700 mb-1">Toplam Müşteri</p>
          <p className="text-3xl font-bold text-orange-900">{stats.users}</p>
          <p className="text-xs text-orange-600 mt-2">Kayıtlı müşteriler</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Hızlı İşlemler</h3>
            <Plus className="text-gray-400" size={20} />
          </div>
          <div className="space-y-3">
            <Link 
              href="/admin/products/new" 
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={20} />
                </div>
                <span className="font-medium text-gray-900">Yeni Ürün Ekle</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600" size={16} />
            </Link>
            
            <Link 
              href="/admin/categories" 
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <FolderOpen className="text-white" size={20} />
                </div>
                <span className="font-medium text-gray-900">Kategori Yönet</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600" size={16} />
            </Link>
            
            <Link 
              href="/admin/orders" 
              className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-white" size={20} />
                </div>
                <span className="font-medium text-gray-900">Siparişleri Görüntüle</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600" size={16} />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sistem Durumu</h3>
            <Eye className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sistem çalışıyor</p>
                <p className="text-xs text-gray-500">Tüm servisler aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Veritabanı bağlantısı</p>
                <p className="text-xs text-gray-500">Bağlantı başarılı</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Depolama alanı</p>
                <p className="text-xs text-gray-500">%85 kullanımda</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
