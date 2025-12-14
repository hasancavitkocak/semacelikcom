'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Package, Truck, CheckCircle, Clock, XCircle, Eye, Edit, Search, Filter } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  user_id: string
  user_email: string
  user_name: string
  payment_status: string
  tracking_number?: string
  order_items_count: number
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  // Arama ve filtreleme için debounced effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(true)
      loadOrders()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter])

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({
        admin: 'true',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/orders?${params}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to load orders')
      }

      setOrders(result.data || [])
    } catch (error) {
      console.error('Load orders error:', error)
      alert('Siparişler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!selectedOrder) return

    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: newStatus,
          tracking_number: trackingNumber.trim() || null
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to update order')
      }

      // Refresh orders
      await loadOrders()
      
      setShowStatusModal(false)
      setSelectedOrder(null)
      setNewStatus('')
      setTrackingNumber('')
      
      alert('Sipariş durumu güncellendi')
    } catch (error) {
      console.error('Update order status error:', error)
      alert('Sipariş durumu güncellenirken hata oluştu')
    }
  }

  const cancelOrder = async (orderId: string) => {
    if (!confirm('Bu siparişi iptal etmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Failed to cancel order')
      }

      await loadOrders()
      alert('Sipariş iptal edildi')
    } catch (error) {
      console.error('Cancel order error:', error)
      alert('Sipariş iptal edilirken hata oluştu')
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string; icon: any }> = {
      created: { 
        text: 'Oluşturuldu', 
        color: 'text-blue-600', 
        bgColor: 'bg-blue-100',
        icon: Clock
      },
      processing: { 
        text: 'Hazırlanıyor', 
        color: 'text-orange-600', 
        bgColor: 'bg-orange-100',
        icon: Package
      },
      shipped: { 
        text: 'Kargoya Verildi', 
        color: 'text-purple-600', 
        bgColor: 'bg-purple-100',
        icon: Truck
      },
      delivered: { 
        text: 'Teslim Edildi', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: CheckCircle
      },
      cancelled: { 
        text: 'İptal Edildi', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        icon: XCircle
      },
      returned: { 
        text: 'İade Edildi', 
        color: 'text-gray-600', 
        bgColor: 'bg-gray-100',
        icon: XCircle
      }
    }
    return statusMap[status] || { 
      text: status, 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100',
      icon: Clock
    }
  }



  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h1>
          <p className="text-gray-600">Tüm siparişleri görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Sipariş no, müşteri adı veya e-posta ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="created">Oluşturuldu</option>
              <option value="processing">Hazırlanıyor</option>
              <option value="shipped">Kargoya Verildi</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
              <option value="returned">İade Edildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-600">Siparişler yükleniyor...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sipariş bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinize uygun sipariş bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sipariş
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const StatusIcon = statusInfo.icon

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.order_items_count} ürün
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user_email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          <StatusIcon size={14} />
                          {statusInfo.text}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.total.toFixed(2)} TL
                        </div>
                        <div className={`text-xs ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {order.payment_status === 'paid' ? 'Ödendi' : 'Beklemede'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setNewStatus(order.status)
                              setTrackingNumber(order.tracking_number || '')
                              setShowStatusModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Durumu Güncelle"
                          >
                            <Edit size={16} />
                          </button>
                          {order.status !== 'cancelled' && order.status !== 'delivered' && (
                            <button
                              onClick={() => cancelOrder(order.id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Siparişi İptal Et"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sipariş Durumunu Güncelle
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedOrder.order_number} - {selectedOrder.user_name}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Durum
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created">Oluşturuldu</option>
                    <option value="processing">Hazırlanıyor</option>
                    <option value="shipped">Kargoya Verildi</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                    <option value="returned">İade Edildi</option>
                  </select>
                </div>

                {(newStatus === 'shipped' || newStatus === 'delivered') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kargo Takip Numarası
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Takip numarasını girin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={updateOrderStatus}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Güncelle
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedOrder(null)
                    setNewStatus('')
                    setTrackingNumber('')
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}