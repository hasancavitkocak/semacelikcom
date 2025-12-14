'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Truck, Package, Calculator, MapPin, Clock, DollarSign } from 'lucide-react'
import AdminHeader from '@/components/admin-header'

export default function AdminShippingPage() {
  const [settings, setSettings] = useState({
    free_shipping_threshold: '500',
    shipping_cost: '29.90',
    express_shipping_cost: '49.90',
    same_day_shipping_cost: '79.90',
    shipping_regions: 'Türkiye geneli',
    estimated_delivery_days: '2-4',
    express_delivery_days: '1-2',
    same_day_delivery_hours: '3-6',
    enable_express_shipping: 'true',
    enable_same_day_shipping: 'false'
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testAmount, setTestAmount] = useState('250')

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', [
          'free_shipping_threshold',
          'shipping_cost',
          'express_shipping_cost',
          'same_day_shipping_cost',
          'shipping_regions',
          'estimated_delivery_days',
          'express_delivery_days',
          'same_day_delivery_hours',
          'enable_express_shipping',
          'enable_same_day_shipping'
        ])

      const settingsObj: Record<string, string> = {}
      data?.forEach(item => {
        settingsObj[item.key] = item.value
      })

      setSettings({
        free_shipping_threshold: settingsObj.free_shipping_threshold || '500',
        shipping_cost: settingsObj.shipping_cost || '29.90',
        express_shipping_cost: settingsObj.express_shipping_cost || '49.90',
        same_day_shipping_cost: settingsObj.same_day_shipping_cost || '79.90',
        shipping_regions: settingsObj.shipping_regions || 'Türkiye geneli',
        estimated_delivery_days: settingsObj.estimated_delivery_days || '2-4',
        express_delivery_days: settingsObj.express_delivery_days || '1-2',
        same_day_delivery_hours: settingsObj.same_day_delivery_hours || '3-6',
        enable_express_shipping: settingsObj.enable_express_shipping || 'true',
        enable_same_day_shipping: settingsObj.enable_same_day_shipping || 'false'
      })
    } catch (error) {
      console.error('Settings load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: value.toString()
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' })
        
        if (error) throw error
      }

      alert('✅ Kargo ayarları başarıyla kaydedildi!')
    } catch (error: any) {
      console.error('Save error:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const calculateShipping = (amount: number) => {
    const threshold = parseFloat(settings.free_shipping_threshold)
    const cost = parseFloat(settings.shipping_cost)
    
    if (amount >= threshold) {
      return { cost: 0, isFree: true }
    }
    
    return { cost, isFree: false }
  }

  const testShipping = calculateShipping(parseFloat(testAmount))

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Kargo Yönetimi"
        description="Kargo ücretleri ve teslimat ayarları"
        actions={
          <Button 
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-gray-900 hover:bg-black text-white px-6"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Kargo Ücretleri */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-gray-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Kargo Ücretleri</h2>
                <p className="text-gray-600 text-sm">Teslimat ücret ayarları</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Ücretsiz Kargo Limiti (₺)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.free_shipping_threshold}
                  onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                  placeholder="500"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Standart Kargo Ücreti (₺)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.shipping_cost}
                  onChange={(e) => setSettings({ ...settings, shipping_cost: e.target.value })}
                  placeholder="29.90"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ücretsiz kargo limitinin altındaki siparişler için
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Hızlı Kargo
                  </Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.enable_express_shipping === 'true'} 
                      onChange={(e) => setSettings({...settings, enable_express_shipping: e.target.checked ? 'true' : 'false'})} 
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500" 
                    />
                    <span className="text-sm text-gray-600">Aktif</span>
                  </label>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.express_shipping_cost}
                  onChange={(e) => setSettings({ ...settings, express_shipping_cost: e.target.value })}
                  placeholder="49.90"
                  disabled={settings.enable_express_shipping === 'false'}
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1-2 gün içinde teslimat
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Aynı Gün Teslimat
                  </Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.enable_same_day_shipping === 'true'} 
                      onChange={(e) => setSettings({...settings, enable_same_day_shipping: e.target.checked ? 'true' : 'false'})} 
                      className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500" 
                    />
                    <span className="text-sm text-gray-600">Aktif</span>
                  </label>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.same_day_shipping_cost}
                  onChange={(e) => setSettings({ ...settings, same_day_shipping_cost: e.target.value })}
                  placeholder="79.90"
                  disabled={settings.enable_same_day_shipping === 'false'}
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Aynı gün içinde teslimat (şehir içi)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Teslimat Ayarları */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="text-gray-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Teslimat Süreleri</h2>
                <p className="text-gray-600 text-sm">Tahmini teslimat süreleri</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Standart Teslimat (Gün)
                </Label>
                <Input
                  value={settings.estimated_delivery_days}
                  onChange={(e) => setSettings({ ...settings, estimated_delivery_days: e.target.value })}
                  placeholder="2-4"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Hızlı Teslimat (Gün)
                </Label>
                <Input
                  value={settings.express_delivery_days}
                  onChange={(e) => setSettings({ ...settings, express_delivery_days: e.target.value })}
                  placeholder="1-2"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Aynı Gün Teslimat (Saat)
                </Label>
                <Input
                  value={settings.same_day_delivery_hours}
                  onChange={(e) => setSettings({ ...settings, same_day_delivery_hours: e.target.value })}
                  placeholder="3-6"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Teslimat Bölgeleri
                </Label>
                <Input
                  value={settings.shipping_regions}
                  onChange={(e) => setSettings({ ...settings, shipping_regions: e.target.value })}
                  placeholder="Türkiye geneli"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Kargo Hesaplama Testi */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Calculator className="text-gray-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Kargo Hesaplama Testi</h2>
                <p className="text-gray-600 text-sm">Ayarları test edin</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Test Tutarı (₺)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="250"
                  className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Sipariş Tutarı:</span>
                    <span className="font-semibold text-gray-900">{parseFloat(testAmount).toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Kargo Ücreti:</span>
                    <span className={`font-semibold ${testShipping.isFree ? 'text-green-600' : 'text-gray-900'}`}>
                      {testShipping.isFree ? 'Ücretsiz' : `${testShipping.cost.toFixed(2)} ₺`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Toplam:</span>
                    <span className="font-bold text-lg text-gray-900">
                      {(parseFloat(testAmount) + testShipping.cost).toFixed(2)} ₺
                    </span>
                  </div>
                  
                  {!testShipping.isFree && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700">
                        💡 <strong>{settings.free_shipping_threshold} ₺</strong> ve üzeri alışverişlerde kargo ücretsiz!
                        <br />
                        <strong>{(parseFloat(settings.free_shipping_threshold) - parseFloat(testAmount)).toFixed(2)} ₺</strong> daha ekleyin.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bilgi Kartları */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="text-gray-600" size={16} />
            </div>
            <h3 className="font-semibold text-gray-900">Standart Kargo</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• {settings.estimated_delivery_days} gün teslimat</p>
            <p>• {settings.shipping_cost} ₺ ücret</p>
            <p>• {settings.free_shipping_threshold} ₺ üzeri ücretsiz</p>
          </div>
        </div>

        {settings.enable_express_shipping === 'true' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Truck className="text-gray-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-900">Hızlı Kargo</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• {settings.express_delivery_days} gün teslimat</p>
              <p>• {settings.express_shipping_cost} ₺ ücret</p>
              <p>• Öncelikli işlem</p>
            </div>
          </div>
        )}

        {settings.enable_same_day_shipping === 'true' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <MapPin className="text-gray-600" size={16} />
              </div>
              <h3 className="font-semibold text-gray-900">Aynı Gün</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• {settings.same_day_delivery_hours} saat teslimat</p>
              <p>• {settings.same_day_shipping_cost} ₺ ücret</p>
              <p>• Sadece şehir içi</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}