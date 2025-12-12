'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
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
    cancelled: 'İptal'
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Sipariş Yönetimi</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tüm Siparişler ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : orders.length === 0 ? (
            <p className="text-gray-600">Henüz sipariş bulunmuyor.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sipariş No</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString('tr-TR')}</TableCell>
                    <TableCell>{order.total} ₺</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {statusText[order.status] || order.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">Detay</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
