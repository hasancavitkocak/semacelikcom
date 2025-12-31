'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, User, MapPin, CreditCard, Truck, Calendar, Edit, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AdminHeader from '@/components/admin-header'

interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_slug?: string
  variant_name?: string
  quantity: number
  price: number
  total: number
  product?: {
    name: string
    slug?: string
    images?: Array<{ image_url: string; is_primary: boolean }>
  }
}

interface OrderDetail {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  created_at: string
  updated_at: string
  user_id: string
  user_email: string
  user_name: string
  payment_status: string
  payment_method: string
  tracking_number?: string
  shipping_address: any // Allow flexible address structure
  billing_address?: any // Allow flexible address structure
  notes?: string
  order_items: OrderItem[]
}

// Helper function to safely get address field with multiple possible names
const getAddressField = (address: any, fieldNames: string[]): string => {
  if (!address) return 'Bilinmiyor'
  
  for (const fieldName of fieldNames) {
    if (address[fieldName] && typeof address[fieldName] === 'string') {
      return address[fieldName]
    }
  }
  return 'Bilinmiyor'
}

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

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}?admin=true`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Sipariş yüklenemedi')
      }

      console.log('📦 Order data:', result.data)
      console.log('🏠 Shipping address structure:', result.data.shipping_address)
      console.log('🏠 Billing address structure:', result.data.billing_address)

      setOrder(result.data)
      setNewStatus(result.data.status)
      setTrackingNumber(result.data.tracking_number || '')
    } catch (error) {
      console.error('Load order error:', error)
      alert('Sipariş yüklenirken hata oluştu')
      router.push('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async () => {
    if (!order) return
    
    setSaving(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          status: newStatus,
          tracking_number: trackingNumber.trim() || null
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || 'Sipariş güncellenemedi')
      }

      // Refresh order
      await loadOrder()
      setEditingStatus(false)
      alert('Sipariş durumu güncellendi')
    } catch (error: any) {
      console.error('Update order error:', error)
      alert('Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
      created: { text: 'Oluşturuldu', color: 'text-blue-800', bgColor: 'bg-blue-100' },
      processing: { text: 'Hazırlanıyor', color: 'text-orange-800', bgColor: 'bg-orange-100' },
      shipped: { text: 'Kargoda', color: 'text-purple-800', bgColor: 'bg-purple-100' },
      delivered: { text: 'Teslim Edildi', color: 'text-green-800', bgColor: 'bg-green-100' },
      cancelled: { text: 'İptal Edildi', color: 'text-red-800', bgColor: 'bg-red-100' },
      returned: { text: 'İade Edildi', color: 'text-gray-800', bgColor: 'bg-gray-100' }
    }
    return statusMap[status] || { text: status, color: 'text-gray-800', bgColor: 'bg-gray-100' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
            <span className="ml-3 text-gray-600">Sipariş yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Sipariş Bulunamadı"
          description="Aradığınız sipariş bulunamadı"
          backUrl="/admin/orders"
          backLabel="Siparişler"
        />
      </div>
    )
  }

  const statusInfo = getStatusInfo(order.status)

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`Sipariş ${order.order_number}`}
        description={`${order.user_name} - ${new Date(order.created_at).toLocaleDateString('tr-TR')}`}
        backUrl="/admin/orders"
        backLabel="Siparişler"
        actions={
          <div className="flex items-center gap-3">
            {editingStatus ? (
              <>
                <Button
                  onClick={() => setEditingStatus(false)}
                  variant="outline"
                  size="sm"
                >
                  <X size={16} className="mr-2" />
                  İptal
                </Button>
                <Button
                  onClick={updateOrderStatus}
                  disabled={saving}
                  size="sm"
                  className="bg-gray-900 hover:bg-black text-white"
                >
                  <Save size={16} className="mr-2" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setEditingStatus(true)}
                variant="outline"
                size="sm"
              >
                <Edit size={16} className="mr-2" />
                Durumu Güncelle
              </Button>
            )}
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Sipariş Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sipariş Durumu */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu</h3>
            
            {editingStatus ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Durum</Label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="created">Oluşturuldu</option>
                    <option value="processing">Hazırlanıyor</option>
                    <option value="shipped">Kargoda</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                    <option value="returned">İade Edildi</option>
                  </select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Kargo Takip No</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Kargo takip numarası"
                    className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  <span className={`text-sm ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {order.payment_status === 'paid' ? '✓ Ödendi' : '⏳ Ödeme Bekliyor'}
                  </span>
                </div>
                
                {order.tracking_number && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={16} />
                    <span>Kargo Takip: <strong>{order.tracking_number}</strong></span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={16} />
                  <span>Oluşturulma: {new Date(order.created_at).toLocaleString('tr-TR')}</span>
                </div>
                
                {order.updated_at !== order.created_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>Güncelleme: {new Date(order.updated_at).toLocaleString('tr-TR')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sipariş Ürünleri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Ürünleri</h3>
            
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0] ? (
                      <img 
                        src={item.product.images.find(img => img.is_primary)?.image_url || item.product.images[0].image_url} 
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                    {item.variant_name && (
                      <p className="text-sm text-gray-600">{item.variant_name}</p>
                    )}
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">Adet: {item.quantity || 0}</span>
                      <span className="text-sm text-gray-600">Birim: {(item.price || 0).toFixed(2)} ₺</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{(item.total || (item.price * item.quantity) || 0).toFixed(2)} ₺</p>
                    {(item.product?.slug || item.product_slug) && (
                      <Link 
                        href={`/products/${item.product?.slug || item.product_slug}`}
                        className="text-xs text-blue-600 hover:text-blue-800"
                        target="_blank"
                      >
                        Ürünü Görüntüle →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Toplam */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="text-gray-900">{(order.subtotal || 0).toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo:</span>
                  <span className="text-gray-900">{(order.shipping_cost || 0).toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                  <span className="text-gray-900">Toplam:</span>
                  <span className="text-gray-900">{(order.total || 0).toFixed(2)} ₺</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Müşteri ve Adres Bilgileri */}
        <div className="space-y-6">
          {/* Müşteri Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Müşteri Bilgileri</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{order.user_name}</p>
                <p className="text-sm text-gray-600">{order.user_email}</p>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard size={16} className="text-gray-400" />
                  <span className="text-gray-600">Ödeme: {getPaymentMethodName(order.payment_method)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Teslimat Adresi</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">
                {getAddressField(order.shipping_address, ['fullName', 'full_name', 'name'])}
              </p>
              <p className="text-gray-600">
                {getAddressField(order.shipping_address, ['phone', 'phoneNumber', 'phone_number'])}
              </p>
              <p className="text-gray-600">
                {getAddressField(order.shipping_address, ['email', 'emailAddress', 'email_address'])}
              </p>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-900">
                  {getAddressField(order.shipping_address, ['address', 'address_line', 'addressLine', 'street', 'street_address'])}
                </p>
                <p className="text-gray-600">
                  {getAddressField(order.shipping_address, ['district', 'state', 'county'])}, {getAddressField(order.shipping_address, ['city', 'town'])}
                </p>
                <p className="text-gray-600">
                  {getAddressField(order.shipping_address, ['postalCode', 'postal_code', 'zipCode', 'zip_code', 'zip'])}
                </p>
              </div>
            </div>
          </div>

          {/* Fatura Adresi */}
          {order.billing_address && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Fatura Adresi</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {getAddressField(order.billing_address, ['fullName', 'full_name', 'name'])}
                </p>
                <p className="text-gray-600">
                  {getAddressField(order.billing_address, ['phone', 'phoneNumber', 'phone_number'])}
                </p>
                <p className="text-gray-600">
                  {getAddressField(order.billing_address, ['email', 'emailAddress', 'email_address'])}
                </p>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-900">
                    {getAddressField(order.billing_address, ['address', 'address_line', 'addressLine', 'street', 'street_address'])}
                  </p>
                  <p className="text-gray-600">
                    {getAddressField(order.billing_address, ['district', 'state', 'county'])}, {getAddressField(order.billing_address, ['city', 'town'])}
                  </p>
                  <p className="text-gray-600">
                    {getAddressField(order.billing_address, ['postalCode', 'postal_code', 'zipCode', 'zip_code', 'zip'])}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notlar */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Notları</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}