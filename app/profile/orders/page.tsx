'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { supabase } from '@/lib/supabase'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Load orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusText: Record<string, string> = {
    pending: 'Beklemede',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi'
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12">
        <div className="mb-6">
          <Link href="/profile" className="text-sm md:text-base hover:underline">← Profilime Dön</Link>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">Siparişlerim</h1>

        {loading ? (
          <p>Yükleniyor...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-gray-600 mb-4">Henüz siparişiniz bulunmuyor</p>
            <Link href="/products" className="text-blue-600 hover:underline">
              Alışverişe başlayın
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Sipariş No: #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${statusColor[order.status] || 'bg-gray-100'}`}>
                    {statusText[order.status] || order.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-lg md:text-xl font-bold">{order.total} ₺</p>
                  <Link 
                    href={`/profile/orders/${order.id}`}
                    className="text-blue-600 hover:underline text-sm md:text-base"
                  >
                    Detayları Gör →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
