'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import Toast from '@/components/toast'
import { Edit2 } from 'lucide-react'

interface City {
  id: number
  name: string
}

interface District {
  id: number
  city_id: number
  name: string
}

export default function AddressesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [addresses, setAddresses] = useState<any[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([])
  const [addressForm, setAddressForm] = useState({
    id: '',
    title: '',
    address: '',
    city: '',
    district: '',
    postal_code: ''
  })
  const [savingAddress, setSavingAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    checkUser()
    loadCities()
    loadDistricts()
  }, [])

  useEffect(() => {
    // Şehir seçildiğinde ilçeleri filtrele
    if (addressForm.city) {
      const cityData = cities.find(c => c.name === addressForm.city)
      if (cityData) {
        const filtered = districts.filter(d => d.city_id === cityData.id)
        setFilteredDistricts(filtered)
      }
    } else {
      setFilteredDistricts([])
    }
  }, [addressForm.city, cities, districts])

  const loadCities = async () => {
    const { data } = await supabase
      .from('cities')
      .select('*')
      .order('name')
    
    if (data) setCities(data)
  }

  const loadDistricts = async () => {
    const { data } = await supabase
      .from('districts')
      .select('*')
      .order('name')
    
    if (data) setDistricts(data)
  }

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)
      loadAddresses()
    } catch (error) {
      console.error('Check user error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadAddresses = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAddresses(data || [])
    } catch (error) {
      console.error('Load addresses error:', error)
    }
  }

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingAddress(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        alert('Giriş yapmalısınız!')
        return
      }

      const { error } = await supabase
        .from('addresses')
        .insert([{
          user_id: authUser.id,
          title: addressForm.title,
          full_name: authUser.user_metadata?.full_name || '',
          phone: authUser.user_metadata?.phone || '',
          address_line: addressForm.address,
          city: addressForm.city,
          district: addressForm.district,
          postal_code: addressForm.postal_code
        }])

      if (error) throw error

      alert('Adres başarıyla kaydedildi!')
      setAddressForm({
        id: '',
        title: '',
        address: '',
        city: '',
        district: '',
        postal_code: ''
      })
      loadAddresses()
    } catch (error: any) {
      console.error('Save address error:', error)
      alert('Hata: ' + error.message)
    } finally {
      setSavingAddress(false)
    }
  }

  const handleEditAddress = (address: any) => {
    setEditingAddress(address.id)
    setAddressForm({
      id: address.id,
      title: address.title,
      address: address.address,
      city: address.city,
      district: address.district,
      postal_code: address.postal_code
    })
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setAddressForm({
      id: '',
      title: '',
      address: '',
      city: '',
      district: '',
      postal_code: ''
    })
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Adres silindi!')
      loadAddresses()
    } catch (error: any) {
      alert('Hata: ' + error.message)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Profilim</h1>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sol Menü */}
            <nav className="space-y-2">
              <Link href="/profile" className="block px-4 py-3 hover:bg-white rounded-lg transition">
                Hesap Bilgileri
              </Link>
              <Link href="/profile/addresses" className="block px-4 py-3 bg-white rounded-lg font-semibold">
                Adreslerim
              </Link>
              <Link href="/profile/orders" className="block px-4 py-3 hover:bg-white rounded-lg transition">
                Siparişlerim
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-white rounded-lg text-red-600 transition"
              >
                Çıkış Yap
              </button>
            </nav>

            {/* İçerik */}
            <div className="md:col-span-3 space-y-6">
              {/* Yeni Adres Ekle / Düzenle */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                  </h2>
                  {editingAddress && (
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-900 text-sm"
                    >
                      İptal
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSaveAddress} className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2">Adres Başlığı *</label>
                    <input 
                      type="text" 
                      placeholder="Ev, İş, vb."
                      value={addressForm.title}
                      onChange={(e) => setAddressForm({...addressForm, title: e.target.value})}
                      required
                      className="w-full border rounded-lg px-4 py-2 focus:border-gray-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Adres *</label>
                    <textarea 
                      rows={3}
                      placeholder="Mahalle, sokak, bina no, daire no"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                      required
                      className="w-full border rounded-lg px-4 py-2 focus:border-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2">İl *</label>
                      <select
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value, district: ''})}
                        required
                        className="w-full border rounded-lg px-4 py-2 focus:border-gray-900 focus:outline-none"
                      >
                        <option value="">İl Seçin</option>
                        {cities.map(city => (
                          <option key={city.id} value={city.name}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-2">İlçe *</label>
                      <select
                        value={addressForm.district}
                        onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                        disabled={!addressForm.city}
                        required
                        className="w-full border rounded-lg px-4 py-2 focus:border-gray-900 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">İlçe Seçin</option>
                        {filteredDistricts.map(district => (
                          <option key={district.id} value={district.name}>{district.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">Posta Kodu</label>
                    <input 
                      type="text" 
                      placeholder="34000"
                      value={addressForm.postal_code}
                      onChange={(e) => setAddressForm({...addressForm, postal_code: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2 focus:border-gray-900 focus:outline-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={savingAddress}
                    className="bg-gray-900 hover:bg-black text-white"
                  >
                    {savingAddress 
                      ? (editingAddress ? 'Güncelleniyor...' : 'Kaydediliyor...') 
                      : (editingAddress ? 'Adresi Güncelle' : 'Adresi Kaydet')
                    }
                  </Button>
                </form>
              </div>

              {/* Kayıtlı Adresler */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Kayıtlı Adreslerim</h2>
                
                {addresses.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Henüz kayıtlı adresiniz bulunmamaktadır.</p>
                ) : (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border rounded-lg p-4 hover:border-gray-900 transition">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{addr.title}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="text-gray-900 hover:text-gray-700 text-sm flex items-center gap-1"
                            >
                              <Edit2 size={16} />
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-1">{addr.address_line}</p>
                        <p className="text-gray-600 text-sm">
                          {addr.district} / {addr.city}
                          {addr.postal_code && ` - ${addr.postal_code}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
