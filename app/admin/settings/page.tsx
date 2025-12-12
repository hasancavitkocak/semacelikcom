'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/image-upload'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: '',
    site_logo: '',
    site_description: '',
    top_banner: '',
    contact_email: '',
    contact_phone: '',
    instagram_url: '',
    facebook_url: '',
    whatsapp_number: '',
    free_shipping_threshold: '500',
    shipping_cost: '29.90'
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')

      if (error) {
        console.error('Load settings error:', error)
        
        // Tablo yoksa veya RLS hatası varsa varsayılan değerler kullan
        if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
          alert('⚠️ site_settings tablosu bulunamadı!\n\nLütfen Supabase SQL Editor\'de "supabase-settings-table.sql" dosyasını çalıştırın.')
        }
        
        // Varsayılan değerlerle devam et
        setSettings({
          site_name: 'SEMACELIK.COM',
          site_logo: '/logo.svg',
          site_description: 'Kaliteli ve şık kadın giyim ürünleri',
          top_banner: '2000 TL VE ÜZERİ ALIŞVERİŞLERDE ÜCRETSİZ KARGO! 🚚',
          contact_email: 'info@semacelik.com',
          contact_phone: '+90 555 123 4567',
          instagram_url: 'https://instagram.com/semacelik',
          facebook_url: 'https://facebook.com/semacelik',
          whatsapp_number: '+905551234567',
          free_shipping_threshold: '500',
          shipping_cost: '29.90'
        })
        setLoading(false)
        return
      }

      const settingsObj: any = {}
      data?.forEach((item) => {
        settingsObj[item.key] = item.value || ''
      })

      setSettings({
        site_name: settingsObj.site_name || 'SEMACELIK.COM',
        site_logo: settingsObj.site_logo || '/logo.svg',
        site_description: settingsObj.site_description || '',
        top_banner: settingsObj.top_banner || '2000 TL VE ÜZERİ ALIŞVERİŞLERDE ÜCRETSİZ KARGO! 🚚',
        contact_email: settingsObj.contact_email || '',
        contact_phone: settingsObj.contact_phone || '',
        instagram_url: settingsObj.instagram_url || '',
        facebook_url: settingsObj.facebook_url || '',
        whatsapp_number: settingsObj.whatsapp_number || '',
        free_shipping_threshold: settingsObj.free_shipping_threshold || '500',
        shipping_cost: settingsObj.shipping_cost || '29.90'
      })
    } catch (error: any) {
      console.error('Load settings error:', error)
      alert('Ayarlar yüklenirken hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      console.log('💾 Ayarlar kaydediliyor:', settings)
      
      // Her ayarı ayrı ayrı güncelle
      for (const [key, value] of Object.entries(settings)) {
        console.log(`📝 Kaydediliyor: ${key} = ${value}`)
        
        const { data, error } = await supabase
          .from('site_settings')
          .upsert({
            key,
            value: value || null
          }, {
            onConflict: 'key'
          })
          .select()

        if (error) {
          console.error(`❌ ${key} kaydedilemedi:`, error)
          throw error
        }
        
        console.log(`✅ ${key} kaydedildi:`, data)
        
        // Logo kaydedildiyse localStorage'ı güncelle
        if (key === 'site_logo' && value) {
          localStorage.setItem('site_logo', value)
          console.log('🎨 Logo localStorage\'a kaydedildi')
        }
      }

      alert('Ayarlar başarıyla kaydedildi!')
      
      // Sayfayı yenile (logo değişirse header'da görünsün)
      window.location.reload()
    } catch (error: any) {
      console.error('Save settings error:', error)
      alert('Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (file: File, compressedUrl: string) => {
    try {
      // Dosya uzantısını al
      const fileExt = file.name.split('.').pop()
      const fileName = `logos/logo-${Date.now()}.${fileExt}`
      
      console.log('📤 Logo yükleniyor:', fileName)
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload hatası:', uploadError)
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      console.log('✅ Logo URL:', publicUrl)
      
      setSettings({ ...settings, site_logo: publicUrl })
      alert('Logo yüklendi! Kaydetmeyi unutmayın.')
    } catch (error: any) {
      console.error('Logo upload error:', error)
      alert('Logo yüklenirken hata: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Ayarları</h1>
        <p className="text-gray-600 mt-1">Site genelindeki ayarları buradan yönetin</p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-4xl">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Kurulum Talimatları</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Supabase Dashboard → SQL Editor'e gidin</li>
          <li><code className="bg-blue-100 px-1 rounded">supabase-settings-table.sql</code> dosyasını açın</li>
          <li>"Run" butonuna basarak SQL'i çalıştırın</li>
          <li>Bu sayfayı yenileyin</li>
        </ol>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Genel Ayarlar */}
        <Card>
          <CardHeader>
            <CardTitle>Genel Ayarlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Site Adı</Label>
              <Input
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="SEMACELIK.COM"
              />
            </div>

            <div>
              <Label>Site Açıklaması</Label>
              <Input
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                placeholder="Kaliteli ve şık kadın giyim ürünleri"
              />
            </div>

            <div>
              <Label>Üst Banner Mesajı</Label>
              <Input
                value={settings.top_banner}
                onChange={(e) => setSettings({ ...settings, top_banner: e.target.value })}
                placeholder="2000 TL VE ÜZERİ ALIŞVERİŞLERDE ÜCRETSİZ KARGO! 🚚"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sitenin en üstünde görünen duyuru mesajı. Emoji kullanabilirsiniz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mevcut Logo</Label>
              {settings.site_logo && (
                <div className="mt-2 p-6 border rounded-lg bg-white inline-block">
                  <img 
                    src={settings.site_logo} 
                    alt="Logo" 
                    className="h-16 object-contain"
                    style={{ imageRendering: 'crisp-edges' }}
                    onError={(e) => {
                      e.currentTarget.src = '/logo.svg'
                    }}
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">📐 Logo Önerileri</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Format:</strong> SVG (en iyi) veya PNG</li>
                <li><strong>Boyut:</strong> En az 400x120px (yüksek çözünürlük için)</li>
                <li><strong>Arka Plan:</strong> Şeffaf (PNG/SVG)</li>
                <li><strong>Renk:</strong> Koyu renkli logo önerilir (beyaz header için)</li>
              </ul>
            </div>

            <div>
              <Label>Yeni Logo Yükle</Label>
              <ImageUpload onImageUpload={handleLogoUpload} imageType="banner" />
            </div>

            <div>
              <Label>Veya Logo URL'i</Label>
              <Input
                value={settings.site_logo}
                onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                placeholder="https://... veya /logo.svg"
              />
            </div>
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>E-posta</Label>
              <Input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="info@semacelik.com"
              />
            </div>

            <div>
              <Label>Telefon</Label>
              <Input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="+90 555 123 4567"
              />
            </div>

            <div>
              <Label>WhatsApp Numarası</Label>
              <Input
                type="tel"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="+905551234567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ülke kodu ile birlikte, boşluksuz (örn: +905551234567)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sosyal Medya */}
        <Card>
          <CardHeader>
            <CardTitle>Sosyal Medya</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Instagram URL</Label>
              <Input
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/semacelik"
              />
            </div>

            <div>
              <Label>Facebook URL</Label>
              <Input
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/semacelik"
              />
            </div>
          </CardContent>
        </Card>

        {/* Kargo Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle>Kargo Ayarları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Ücretsiz Kargo Limiti (₺)</Label>
              <Input
                type="number"
                step="0.01"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: e.target.value })}
                placeholder="500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Bu tutarın üzerindeki siparişlerde kargo ücretsiz olur
              </p>
            </div>

            <div>
              <Label>Kargo Ücreti (₺)</Label>
              <Input
                type="number"
                step="0.01"
                value={settings.shipping_cost}
                onChange={(e) => setSettings({ ...settings, shipping_cost: e.target.value })}
                placeholder="29.90"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ücretsiz kargo limitinin altındaki siparişler için kargo ücreti
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kaydet Butonu */}
        <div className="flex gap-4">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gray-900 hover:bg-black text-white font-medium px-8"
          >
            {saving ? 'Kaydediliyor...' : '✓ Ayarları Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  )
}
