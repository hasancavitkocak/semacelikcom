'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Check, CreditCard, Truck, CheckCircle, ShoppingBag, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import PhoneInput from '@/components/phone-input'
import { calculateShipping, getFreeShippingRemaining, type ShippingCalculation } from '@/lib/shipping'

interface Address {
  id: string
  title: string
  full_name: string
  phone: string
  address_line: string
  city: string
  district: string
  postal_code?: string
}

interface City {
  id: number
  name: string
}

interface District {
  id: number
  city_id: number
  name: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems } = useCart()
  const [currentStep, setCurrentStep] = useState(1)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([])
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState('standard')
  const [shippingCalculation, setShippingCalculation] = useState<ShippingCalculation | null>(null)
  const [freeShippingRemaining, setFreeShippingRemaining] = useState(0)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [addressesLoading, setAddressesLoading] = useState(false)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zipCode: '',
    paymentMethod: 'iyzico'
  })
  const [billingData, setBillingData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    zipCode: ''
  })

  // İlk yükleme - paralel olarak tüm verileri çek
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart')
      return
    }
    
    // Paralel yükleme
    const initializeData = async () => {
      await Promise.all([
        cities.length === 0 ? loadCities() : Promise.resolve(),
        districts.length === 0 ? loadDistricts() : Promise.resolve()
      ])
    }
    
    initializeData()
  }, [cartItems.length])

  useEffect(() => {
    // Şehir seçildiğinde ilçeleri filtrele
    if (formData.city) {
      const cityData = cities.find(c => c.name === formData.city)
      if (cityData) {
        const filtered = districts.filter(d => d.city_id === cityData.id)
        setFilteredDistricts(filtered)
      }
    } else {
      setFilteredDistricts([])
    }
  }, [formData.city, cities, districts])

  const loadCities = async () => {
    setCitiesLoading(true)
    try {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name')
      
      if (data) setCities(data)
    } catch (error) {
      console.error('Load cities error:', error)
    } finally {
      setCitiesLoading(false)
    }
  }

  const loadDistricts = async () => {
    try {
      const { data, error } = await supabase
        .from('districts')
        .select('*')
        .order('name')
      
      if (data) setDistricts(data)
    } catch (error) {
      console.error('Load districts error:', error)
    }
  }

  // User değiştiğinde adresleri yükle - SADECE BİR KEZ
  useEffect(() => {
    if (user && !authLoading && savedAddresses.length === 0) {
      loadAddresses(user.id)
      setFormData(prev => ({
        ...prev,
        fullName: user.full_name || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }
  }, [user?.id, authLoading])

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0
    return sum + (price * item.quantity)
  }, 0)

  const total = shippingCalculation ? shippingCalculation.total : subtotal

  // Kargo hesaplama
  useEffect(() => {
    const calculateShippingCost = async () => {
      if (subtotal > 0 && cartItems.length > 0) {
        setShippingLoading(true)
        try {
          const calculation = await calculateShipping(subtotal, selectedShippingOption)
          setShippingCalculation(calculation)
          
          const remaining = await getFreeShippingRemaining(subtotal)
          setFreeShippingRemaining(remaining)
        } catch (error) {
          console.error('Shipping calculation error:', error)
        } finally {
          setShippingLoading(false)
        }
      }
    }

    calculateShippingCost()
  }, [subtotal, selectedShippingOption, cartItems.length])

  const loadAddresses = async (userId: string) => {
    setAddressesLoading(true)
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (data && data.length > 0) {
        setSavedAddresses(data)
        // İlk adresi varsayılan olarak seç
        setSelectedAddressId(data[0].id)
        fillFormWithAddress(data[0])
      } else {
        setUseNewAddress(true)
      }
    } catch (error) {
      console.error('Load addresses error:', error)
    } finally {
      setAddressesLoading(false)
    }
  }

  const fillFormWithAddress = (address: Address) => {
    setFormData(prev => ({
      ...prev,
      fullName: address.full_name,
      phone: address.phone,
      address: address.address_line,
      city: address.city,
      district: address.district,
      zipCode: address.postal_code || ''
    }))
  }

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    setUseNewAddress(false)
    const address = savedAddresses.find(a => a.id === addressId)
    if (address) {
      fillFormWithAddress(address)
    }
  }

  const steps = [
    { number: 1, title: 'Teslimat' },
    { number: 2, title: 'Ödeme' },
    { number: 3, title: 'Onay' }
  ]

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city) {
        alert('Lütfen tüm zorunlu alanları doldurun!')
        return
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handlePayment = () => {
    setError('')
    
    if (!termsAccepted) {
      setError('Lütfen sözleşmeleri okuyup kabul edin!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    // İyzico entegrasyonu burada yapılacak
    alert('İyzico ödeme sayfasına yönlendiriliyorsunuz...')
    // İyzico API çağrısı yapılacak
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8">Ödeme</h1>

          {/* Progress Steps */}
          <div className="mb-6 md:mb-8 bg-white rounded-lg p-4 md:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.number
                        ? 'bg-gray-900 text-white'
                        : currentStep === step.number
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step.number ? <Check size={18} className="md:w-5 md:h-5" /> : <span className="text-sm md:text-base">{step.number}</span>}
                    </div>
                    <span className={`text-xs md:text-sm mt-1 md:mt-2 text-center font-medium ${
                      currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 md:mx-4 transition-all ${
                      currentStep > step.number ? 'bg-gray-900' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Form Area */}
            <div className="md:col-span-2">
              {/* Step 1: Teslimat Bilgileri */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-gray-900">
                    <Truck size={24} />
                    Teslimat Bilgileri
                  </h2>

                  {/* Kayıtlı Adresler */}
                  {user && !useNewAddress && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MapPin size={18} />
                        Kayıtlı Adreslerim
                      </h3>
                      
                      {addressesLoading ? (
                        <div className="space-y-3">
                          {[1, 2].map(i => (
                            <div key={i} className="border-2 border-gray-200 rounded-lg p-4 animate-pulse">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : savedAddresses.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {savedAddresses.map(address => (
                              <div 
                                key={address.id}
                                onClick={() => handleAddressSelect(address.id)}
                                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                                  selectedAddressId === address.id 
                                    ? 'border-gray-900 bg-gray-50' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input 
                                    type="radio" 
                                    checked={selectedAddressId === address.id}
                                    onChange={() => handleAddressSelect(address.id)}
                                    className="mt-1 w-5 h-5 accent-gray-900"
                                  />
                                  <div className="flex-1">
                                    <p className="font-bold text-lg mb-1">{address.title}</p>
                                    <p className="text-gray-700">{address.full_name} - {address.phone}</p>
                                    <p className="text-gray-600 text-sm mt-1">{address.address_line}</p>
                                    <p className="text-gray-600 text-sm">{address.district} / {address.city}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setUseNewAddress(true)}
                            className="mt-4 text-gray-900 font-semibold hover:underline"
                          >
                            + Yeni Adres Ekle
                          </button>
                        </>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p>Kayıtlı adres bulunamadı</p>
                          <button
                            type="button"
                            onClick={() => setUseNewAddress(true)}
                            className="mt-2 text-gray-900 font-semibold hover:underline"
                          >
                            + Yeni Adres Ekle
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Yeni Adres Formu */}
                  {(useNewAddress || !user || savedAddresses.length === 0) && (
                    <div className="space-y-6">
                      {user && savedAddresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setUseNewAddress(false)
                            if (savedAddresses[0]) {
                              handleAddressSelect(savedAddresses[0].id)
                            }
                          }}
                          className="text-gray-900 font-semibold hover:underline mb-4"
                        >
                          ← Kayıtlı Adreslerime Dön
                        </button>
                      )}

                      <div>
                        <label className="block font-bold mb-3 text-gray-700">Ad Soyad *</label>
                        <input 
                          type="text" 
                          required
                          className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition"
                          placeholder="Adınız Soyadınız"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block font-bold mb-3 text-gray-700">E-posta *</label>
                          <input 
                            type="email" 
                            required
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition"
                            placeholder="ornek@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-3 text-gray-700">Telefon *</label>
                          <PhoneInput 
                            value={formData.phone}
                            onChange={(value) => setFormData({...formData, phone: value})}
                            placeholder="05XX XXX XX XX"
                            required
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold mb-3 text-gray-700">Adres *</label>
                        <textarea 
                          required
                          rows={4}
                          className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition resize-none"
                          placeholder="Mahalle, sokak, bina no, daire no..."
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block font-bold mb-3 text-gray-700">İl *</label>
                          <select
                            required
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition"
                            value={formData.city}
                            onChange={(e) => {
                              setFormData({...formData, city: e.target.value, district: ''})
                            }}
                          >
                            <option value="">{citiesLoading ? 'Şehirler yükleniyor...' : 'İl Seçin'}</option>
                            {cities.map(city => (
                              <option key={city.id} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold mb-3 text-gray-700">İlçe *</label>
                          <select
                            required
                            disabled={!formData.city}
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                            value={formData.district}
                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                          >
                            <option value="">İlçe Seçin</option>
                            {filteredDistricts.map(district => (
                              <option key={district.id} value={district.name}>{district.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold mb-3 text-gray-700">Posta Kodu</label>
                          <input 
                            type="text" 
                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg focus:border-gray-900 focus:ring-2 focus:ring-gray-200 transition"
                            placeholder="34000"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Kargo Seçenekleri */}
                  <div className="mt-8 pt-8 border-t-2">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Truck size={20} />
                      Kargo Seçenekleri
                    </h3>
                    
                    {shippingLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map(i => (
                          <div key={i} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                              <div>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                              </div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        ))}
                      </div>
                    ) : shippingCalculation && shippingCalculation.availableOptions ? (
                      <div className="space-y-3">
                        {shippingCalculation.availableOptions.map((option) => (
                          <label 
                            key={option.id}
                            className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                              selectedShippingOption === option.id 
                                ? 'border-gray-900 bg-gray-50' 
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shipping"
                                value={option.id}
                                checked={selectedShippingOption === option.id}
                                onChange={(e) => setSelectedShippingOption(e.target.value)}
                                className="w-5 h-5 accent-gray-900"
                              />
                              <div>
                                <p className="font-semibold text-gray-900">{option.name}</p>
                                <p className="text-sm text-gray-600">{option.estimatedDays} • {option.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                {option.cost === 0 ? 'Ücretsiz' : `${option.cost.toFixed(2)} ₺`}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>Kargo seçenekleri yükleniyor...</p>
                      </div>
                    )}
                  </div>

                  {/* Fatura Adresi */}
                  <div className="mt-8 pt-8 border-t-2">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      Fatura Adresi
                    </h3>
                    
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="checkbox"
                        checked={sameAsShipping}
                        onChange={(e) => setSameAsShipping(e.target.checked)}
                        className="w-5 h-5 accent-gray-900"
                      />
                      <span className="font-medium">Fatura adresi teslimat adresi ile aynı</span>
                    </label>

                    {!sameAsShipping && (
                      <div className="mt-6 space-y-6 p-6 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-4">Farklı bir fatura adresi kullanmak istiyorsanız aşağıdaki bilgileri doldurun.</p>
                        
                        {user && savedAddresses.length > 0 ? (
                          <div>
                            <h4 className="font-semibold mb-3">Kayıtlı Adreslerimden Seç</h4>
                            <div className="space-y-2">
                              {savedAddresses.map(address => (
                                <label 
                                  key={address.id}
                                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                                    selectedBillingId === address.id 
                                      ? 'border-gray-900 bg-white' 
                                      : 'border-gray-200 hover:border-gray-400 bg-white'
                                  }`}
                                >
                                  <input 
                                    type="radio" 
                                    name="billing"
                                    checked={selectedBillingId === address.id}
                                    onChange={() => {
                                      setSelectedBillingId(address.id)
                                      setBillingData({
                                        fullName: address.full_name,
                                        phone: address.phone,
                                        address: address.address_line,
                                        city: address.city,
                                        district: address.district,
                                        zipCode: address.postal_code || ''
                                      })
                                    }}
                                    className="mt-1 w-4 h-4 accent-gray-900"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold">{address.title}</p>
                                    <p className="text-sm text-gray-600">{address.full_name}</p>
                                    <p className="text-sm text-gray-600">{address.address_line}</p>
                                    <p className="text-sm text-gray-600">{address.district} / {address.city}</p>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block font-semibold mb-2">Ad Soyad *</label>
                              <input 
                                type="text" 
                                required={!sameAsShipping}
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-gray-900 focus:outline-none"
                                placeholder="Adınız Soyadınız"
                                value={billingData.fullName}
                                onChange={(e) => setBillingData({...billingData, fullName: e.target.value})}
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-2">Telefon *</label>
                              <PhoneInput 
                                value={billingData.phone}
                                onChange={(value) => setBillingData({...billingData, phone: value})}
                                placeholder="05XX XXX XX XX"
                                required={!sameAsShipping}
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-gray-900 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-2">Adres *</label>
                              <textarea 
                                required={!sameAsShipping}
                                rows={3}
                                className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-gray-900 focus:outline-none resize-none"
                                placeholder="Mahalle, sokak, bina no, daire no..."
                                value={billingData.address}
                                onChange={(e) => setBillingData({...billingData, address: e.target.value})}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block font-semibold mb-2">İl *</label>
                                <select
                                  required={!sameAsShipping}
                                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-gray-900 focus:outline-none"
                                  value={billingData.city}
                                  onChange={(e) => setBillingData({...billingData, city: e.target.value, district: ''})}
                                >
                                  <option value="">{citiesLoading ? 'Şehirler yükleniyor...' : 'İl Seçin'}</option>
                                  {cities.map(city => (
                                    <option key={city.id} value={city.name}>{city.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block font-semibold mb-2">İlçe *</label>
                                <select
                                  required={!sameAsShipping}
                                  disabled={!billingData.city}
                                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-gray-900 focus:outline-none disabled:bg-gray-100"
                                  value={billingData.district}
                                  onChange={(e) => setBillingData({...billingData, district: e.target.value})}
                                >
                                  <option value="">İlçe Seçin</option>
                                  {filteredDistricts.map(district => (
                                    <option key={district.id} value={district.name}>{district.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Ödeme Yöntemi */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm border border-gray-200">
                  <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3 text-gray-900">
                    <CreditCard size={20} className="md:w-6 md:h-6" />
                    Ödeme Yöntemi
                  </h2>
                  <div className="space-y-4 md:space-y-6">
                    <div className="border-2 border-gray-900 bg-gray-50 rounded-lg p-4 md:p-6 cursor-pointer hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3 md:gap-4">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={formData.paymentMethod === 'iyzico'}
                          onChange={() => setFormData({...formData, paymentMethod: 'iyzico'})}
                          className="w-4 h-4 md:w-5 md:h-5 accent-gray-900 flex-shrink-0"
                        />
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <CreditCard size={20} className="md:w-6 md:h-6 text-gray-900" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm md:text-base">Kredi/Banka Kartı</p>
                          <p className="text-xs md:text-sm text-gray-600">İyzico ile güvenli ödeme</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                      <div className="flex gap-2 md:gap-3">
                        <Check size={18} className="md:w-5 md:h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900 mb-1 text-sm md:text-base">Güvenli Ödeme</p>
                          <p className="text-xs md:text-sm text-gray-600">
                            Ödemeniz İyzico güvencesi altında işlenir. Kart bilgileriniz saklanmaz ve 256-bit SSL ile şifrelenir.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Onay */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg p-4 md:p-8 shadow-sm border border-gray-200">
                  {error && (
                    <div className="mb-4 bg-red-50 border-2 border-red-500 text-red-700 p-4 rounded-lg font-semibold flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {error}
                    </div>
                  )}
                  
                  <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2 md:gap-3 text-gray-900">
                    <CheckCircle size={20} className="md:w-6 md:h-6" />
                    Sipariş Özeti
                  </h2>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Truck size={18} className="md:w-5 md:h-5" />
                        Teslimat Bilgileri
                      </h3>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 rounded-xl border-2 space-y-2 md:space-y-3">
                        <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                          <span className="text-gray-600 font-medium text-sm md:text-base">Ad Soyad:</span>
                          <strong className="text-base md:text-lg">{formData.fullName}</strong>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                          <span className="text-gray-600 font-medium text-sm md:text-base">E-posta:</span>
                          <strong className="text-base md:text-lg break-all">{formData.email}</strong>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between gap-1 md:gap-0">
                          <span className="text-gray-600 font-medium text-sm md:text-base">Telefon:</span>
                          <strong className="text-base md:text-lg">{formData.phone}</strong>
                        </div>
                        <div className="pt-2 md:pt-3 border-t-2">
                          <span className="text-gray-600 font-medium block mb-2 text-sm md:text-base">Adres:</span>
                          <strong className="text-base md:text-lg">{formData.address}, {formData.district} / {formData.city}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm md:text-base">
                        <ShoppingBag size={18} className="md:w-5 md:h-5" />
                        Ürünler ({cartItems.length} adet)
                      </h3>
                      <div className="space-y-2 md:space-y-3">
                        {cartItems.map(item => {
                          const price = item.product?.price || 0
                          const primaryImage = item.product?.images?.find((img: any) => img.is_primary) || item.product?.images?.[0]
                          return (
                            <div key={item.id} className="flex gap-3 md:gap-4 bg-gray-50 p-3 md:p-4 rounded-xl border-2 hover:border-gray-200 transition">
                              {primaryImage && (
                                <img src={primaryImage.image_url} alt={item.product?.name} className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm md:text-lg mb-1 line-clamp-2">{item.product?.name}</p>
                                <div className="space-y-1">
                                  {item.variant?.color && (
                                    <p className="text-gray-600 text-xs md:text-sm">
                                      <span className="font-medium">Renk:</span> {item.variant.color.name}
                                    </p>
                                  )}
                                  {item.variant?.size && (
                                    <p className="text-gray-600 text-xs md:text-sm">
                                      <span className="font-medium">Beden:</span> {item.variant.size.name}
                                    </p>
                                  )}
                                  <p className="text-gray-600 text-xs md:text-base">
                                    <span className="font-medium">Adet:</span> {item.quantity}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="font-bold text-base md:text-xl text-gray-900">{(price * item.quantity).toFixed(2)} ₺</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className={`border-2 md:border-3 rounded-xl md:rounded-2xl p-4 md:p-6 transition ${
                      error && !termsAccepted 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-start gap-3 md:gap-4">
                        <input 
                          type="checkbox" 
                          checked={termsAccepted}
                          onChange={(e) => {
                            setTermsAccepted(e.target.checked)
                            setError('')
                          }}
                          className="mt-1 w-5 h-5 md:w-6 md:h-6 accent-gray-900 flex-shrink-0" 
                        />
                        <label className="text-gray-800 leading-relaxed text-sm md:text-base cursor-pointer" onClick={() => setTermsAccepted(!termsAccepted)}>
                          <Link href="/terms" target="_blank" className="text-gray-900 hover:underline font-bold">Mesafeli Satış Sözleşmesi</Link>'ni ve <Link href="/privacy" target="_blank" className="text-gray-900 hover:underline font-bold">Gizlilik Politikası</Link>'nı okudum, kabul ediyorum.
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 md:gap-4 mt-4 md:mt-6">
                {currentStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                    className="flex-1 border-2 border-gray-300 hover:bg-gray-50 font-semibold py-4 md:py-6 text-base md:text-lg"
                  >
                    ← Geri
                  </Button>
                )}
                {currentStep < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-4 md:py-6 text-base md:text-lg"
                  >
                    Devam Et →
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handlePayment}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 md:py-6 text-base md:text-lg"
                  >
                    ✓ Ödemeyi Tamamla
                  </Button>
                )}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg p-4 md:p-6 sticky top-4 shadow-sm border border-gray-200">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Sipariş Özeti</h3>
                <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                  {cartItems.map(item => {
                    const price = item.product?.price || 0
                    return (
                      <div key={item.id} className="flex justify-between gap-2">
                        <span className="text-gray-600 line-clamp-1">{item.product?.name} x{item.quantity}</span>
                        <span className="font-semibold whitespace-nowrap">{(price * item.quantity).toFixed(2)} ₺</span>
                      </div>
                    )
                  })}
                  <div className="border-t pt-2 md:pt-3 flex justify-between">
                    <span>Ara Toplam</span>
                    <span>{subtotal.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    {shippingLoading ? (
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    ) : (
                      <span className={`font-semibold ${shippingCalculation?.isFreeShipping ? 'text-green-600' : 'text-orange-600'}`}>
                        {shippingCalculation?.isFreeShipping ? 'Ücretsiz' : `${shippingCalculation?.shippingCost.toFixed(2)} ₺`}
                      </span>
                    )}
                  </div>
                  {freeShippingRemaining > 0 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                      💡 <strong>{freeShippingRemaining.toFixed(2)} ₺</strong> daha ekleyin, kargo ücretsiz olsun!
                    </div>
                  )}
                  <div className="border-t pt-2 md:pt-3 flex justify-between font-bold text-base md:text-lg">
                    <span>Toplam</span>
                    <span>{total.toFixed(2)} ₺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
