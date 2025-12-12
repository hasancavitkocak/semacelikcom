'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import type { Order, OrderItem } from '@/types/database'

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const orderId = params.id

  useEffect(() => {
    loadOrder()
  }, [])

  const loadOrder = async () => {
    try {
      // Sipariş bilgisi
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(email, full_name, phone)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError

      // Sipariş kalemleri
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, description),
          variant:product_variants(
            *,
            color:colors(name),
            size:sizes(name)
          )
        `)
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      setOrder(orderData)
      setItems(itemsData || [])
    } catch (error) {
      console.error('Load order error:', error)
      alert('Sipariş yüklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      alert('Sipariş durumu güncellendi!')
      loadOrder()
    } catch (error: any) {
      console.error('Update error:', error)
      alert('Hata: ' + error.message)
    }
  }

  const statusText: Record<string, string> = {
    pending: 'Beklemede',
    processing: 'Hazırlanıyor',
    shipped: 'Kargoda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal'
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>
  }

  if (!order) {
    return <div className="p-8">Sipariş bulunamadı!</div>
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/orders" className="text-blue-600 hover:underline">
          ← Siparişlere Dön
        </Link>
        <h1 className="text-4xl font-bold mt-4">Sipariş Detayı</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sipariş No:</span>
                  <span className="font-semibold">#{order.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih:</span>
                  <span>{new Date(order.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Durum:</span>
                  <span className={`px-3 py-1 rounded text-sm ${statusColors[order.status]}`}>
                    {statusText[order.status]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam:</span>
                  <span className="font-bold text-lg">{order.total} ₺</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sipariş Kalemleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b pb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product?.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600">
                          {item.variant.color?.name} / {item.variant.size?.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.price} ₺</p>
                      <p className="text-sm text-gray-600">
                        Toplam: {(item.price * item.quantity).toFixed(2)} ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Müşteri Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Ad Soyad</p>
                  <p className="font-semibold">{order.user?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">E-posta</p>
                  <p className="font-semibold">{order.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefon</p>
                  <p className="font-semibold">{order.user?.phone || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teslimat Adresi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>{order.shipping_address || 'Adres bilgisi yok'}</p>
                {order.shipping_city && <p>{order.shipping_city}</p>}
                {order.shipping_zip && <p>{order.shipping_zip}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Durum Güncelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => updateStatus('processing')}
                  disabled={order.status === 'processing'}
                >
                  Hazırlanıyor
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => updateStatus('shipped')}
                  disabled={order.status === 'shipped'}
                >
                  Kargoya Verildi
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => updateStatus('delivered')}
                  disabled={order.status === 'delivered'}
                >
                  Teslim Edildi
                </Button>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => updateStatus('cancelled')}
                  disabled={order.status === 'cancelled'}
                >
                  İptal Et
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
