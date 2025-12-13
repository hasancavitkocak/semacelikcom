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
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <ShoppingBag className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Toplam Gelir</p>
              <p className="text-2xl font-bold text-gray-900">₺{stats.revenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Package className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Aktif Ürün</p>
              <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Users className="text-gray-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Toplam Müşteri</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
            </div>
          </div>
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
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="text-gray-600" size={20} />
                </div>
                <span className="font-medium text-gray-900">Yeni Ürün Ekle</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600" size={16} />
            </Link>
            
            <Link 
              href="/admin/categories" 
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="text-gray-600" size={20} />
                </div>
                <span className="font-medium text-gray-900">Kategori Yönet</span>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600" size={16} />
            </Link>
            
            <Link 
              href="/admin/orders" 
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-gray-600" size={20} />
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
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Sistem çalışıyor</p>
                <p className="text-xs text-gray-500">Tüm servisler aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Veritabanı bağlantısı</p>
                <p className="text-xs text-gray-500">Bağlantı başarılı</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
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
