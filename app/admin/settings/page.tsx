'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Settings, Globe, Mail, Phone, Instagram, Facebook, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '@/components/image-upload'
import AdminHeader from '@/components/admin-header'

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
    whatsapp_number: ''
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
          top_banner: 'Yeni Web Sitemiz Yayında! 🎉',
          contact_email: 'info@semacelik.com',
          contact_phone: '+90 555 123 4567',
          instagram_url: 'https://instagram.com/semacelik',
          facebook_url: 'https://facebook.com/semacelik',
          whatsapp_number: '+905551234567'
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
        top_banner: settingsObj.top_banner || 'Yeni Web Sitemiz Yayında! 🎉',
        contact_email: settingsObj.contact_email || '',
        contact_phone: settingsObj.contact_phone || '',
        instagram_url: settingsObj.instagram_url || '',
        facebook_url: settingsObj.facebook_url || '',
        whatsapp_number: settingsObj.whatsapp_number || ''
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
      <div className="space-y-6">
        <AdminHeader
          title="Site Ayarları"
          description="Site genelindeki ayarları buradan yönetin"
        />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
            <span className="ml-3 text-gray-600">Ayarlar yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Site Ayarları"
        description="Site genelindeki ayarları buradan yönetin"
        actions={
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gray-900 hover:bg-black text-white px-6"
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        }
      />
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">📋 Kurulum Talimatları</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Supabase Dashboard → SQL Editor'e gidin</li>
          <li><code className="bg-blue-100 px-1 rounded">supabase-settings-table.sql</code> dosyasını açın</li>
          <li>"Run" butonuna basarak SQL'i çalıştırın</li>
          <li>Bu sayfayı yenileyin</li>
        </ol>
      </div>

      <div className="grid gap-6">
        {/* Genel Ayarlar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Globe className="text-gray-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Genel Ayarlar</h2>
              <p className="text-gray-600 text-sm">Site temel bilgileri</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Site Adı</Label>
              <Input
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                placeholder="SEMACELIK.COM"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Site Açıklaması</Label>
              <Input
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                placeholder="Kaliteli ve şık kadın giyim ürünleri"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Üst Banner Mesajı</Label>
              <Input
                value={settings.top_banner}
                onChange={(e) => setSettings({ ...settings, top_banner: e.target.value })}
                placeholder="Yeni Web Sitemiz Yayında! 🎉"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sitenin en üstünde görünen duyuru mesajı. Emoji kullanabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="text-gray-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Logo</h2>
              <p className="text-gray-600 text-sm">Site logosu ayarları</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Mevcut Logo</Label>
              {settings.site_logo && (
                <div className="mt-2 p-6 border border-gray-200 rounded-lg bg-gray-50 inline-block">
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
              <h4 className="font-medium text-blue-900 mb-2">📐 Logo Önerileri</h4>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li><strong>Format:</strong> SVG (en iyi) veya PNG</li>
                <li><strong>Boyut:</strong> En az 400x120px (yüksek çözünürlük için)</li>
                <li><strong>Arka Plan:</strong> Şeffaf (PNG/SVG)</li>
                <li><strong>Renk:</strong> Koyu renkli logo önerilir (beyaz header için)</li>
              </ul>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Yeni Logo Yükle</Label>
              <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center bg-gray-50 transition-colors">
                <ImageUpload onImageUpload={handleLogoUpload} imageType="banner" />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Veya Logo URL'i</Label>
              <Input
                value={settings.site_logo}
                onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                placeholder="https://... veya /logo.svg"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail className="text-gray-600" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">İletişim Bilgileri</h2>
              <p className="text-gray-600 text-sm">İletişim ve sosyal medya</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">E-posta</Label>
              <Input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                placeholder="info@semacelik.com"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Telefon</Label>
              <Input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                placeholder="+90 555 123 4567"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">WhatsApp Numarası</Label>
              <Input
                type="tel"
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                placeholder="+905551234567"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ülke kodu ile birlikte, boşluksuz (örn: +905551234567)
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Instagram URL</Label>
              <Input
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/semacelik"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Facebook URL</Label>
              <Input
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/semacelik"
                className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
