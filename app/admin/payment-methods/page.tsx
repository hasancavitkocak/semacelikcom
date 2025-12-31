'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Edit2, Trash2, Plus } from 'lucide-react'

interface PaymentMethod {
  id: number
  name: string
  type: string
  is_active: boolean
  iban?: string
  bank_name?: string
  account_holder?: string
  description?: string
}

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'credit_card',
    is_active: true,
    iban: '',
    bank_name: '',
    account_holder: '',
    description: ''
  })

  useEffect(() => {
    checkAuth()
    loadPaymentMethods()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/admin/login')
      return
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaymentMethods(data || [])
    } catch (error) {
      console.error('Load payment methods error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingMethod) {
        const { error } = await supabase
          .from('payment_methods')
          .update(formData)
          .eq('id', editingMethod.id)
        
        if (error) throw error
        alert('Ödeme yöntemi güncellendi!')
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert([formData])
        
        if (error) throw error
        alert('Ödeme yöntemi eklendi!')
      }
      
      resetForm()
      loadPaymentMethods()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
    setFormData({
      name: method.name,
      type: method.type,
      is_active: method.is_active,
      iban: method.iban || '',
      bank_name: method.bank_name || '',
      account_holder: method.account_holder || '',
      description: method.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ödeme yöntemini silmek istediğinizden emin misiniz?')) return
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Ödeme yöntemi silindi!')
      loadPaymentMethods()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'credit_card',
      is_active: true,
      iban: '',
      bank_name: '',
      account_holder: '',
      description: ''
    })
    setEditingMethod(null)
    setShowForm(false)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card': return 'Kredi Kartı'
      case 'bank_transfer': return 'Havale/EFT'
      case 'cash_on_delivery': return 'Kapıda Ödeme'
      default: return type
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ödeme Yöntemleri</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yeni Ödeme Yöntemi
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6 border">
          <h2 className="text-xl font-bold mb-4">
            {editingMethod ? 'Ödeme Yöntemini Düzenle' : 'Yeni Ödeme Yöntemi'}
          </h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Tür *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="credit_card">Kredi Kartı</option>
                  <option value="bank_transfer">Havale/EFT</option>
                  <option value="cash_on_delivery">Kapıda Ödeme</option>
                </select>
              </div>
            </div>

            {formData.type === 'bank_transfer' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div className="col-span-2">
                  <label className="block font-semibold mb-2">IBAN</label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => setFormData({...formData, iban: e.target.value})}
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Banka Adı</label>
                  <input
                    type="text"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">Hesap Sahibi</label>
                  <input
                    type="text"
                    value={formData.account_holder}
                    onChange={(e) => setFormData({...formData, account_holder: e.target.value})}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold mb-2">Açıklama</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              />
              <label htmlFor="is_active">Aktif</label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingMethod ? 'Güncelle' : 'Kaydet'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outline">
                İptal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Adı</th>
                <th className="px-6 py-3 text-left font-semibold">Tür</th>
                <th className="px-6 py-3 text-left font-semibold">IBAN</th>
                <th className="px-6 py-3 text-left font-semibold">Durum</th>
                <th className="px-6 py-3 text-left font-semibold">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{method.name}</td>
                  <td className="px-6 py-4">{getTypeLabel(method.type)}</td>
                  <td className="px-6 py-4">
                    {method.iban ? (
                      <span className="text-sm font-mono">{method.iban}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      method.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {method.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}