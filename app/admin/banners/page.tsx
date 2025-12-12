'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/image-upload'

interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
  display_order: number
  is_active: boolean
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order')

      if (error) {
        console.error('Load banners error:', error)
        throw error
      }
      
      console.log('Loaded banners:', data)
      setBanners(data || [])
    } catch (error: any) {
      console.error('Load banners error:', error)
      alert('Banner yüklenirken hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingId) {
        console.log('Updating banner:', editingId, formData)
        
        const { data, error } = await supabase
          .from('banners')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .select()

        if (error) {
          console.error('Update error:', error)
          throw error
        }
        
        console.log('Updated banner:', data)
        alert('Banner güncellendi!')
      } else {
        console.log('Inserting banner:', formData)
        
        const { data, error } = await supabase
          .from('banners')
          .insert([formData])
          .select()

        if (error) {
          console.error('Insert error:', error)
          throw error
        }
        
        console.log('Inserted banner:', data)
        alert('Banner eklendi!')
      }

      resetForm()
      await loadBanners()
    } catch (error: any) {
      console.error('Save banner error:', error)
      alert('Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      display_order: banner.display_order,
      is_active: banner.is_active
    })
    setEditingId(banner.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Banner silindi!')
      loadBanners()
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Hata: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      display_order: 0,
      is_active: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleImageUpload = async (file: File, compressedUrl: string) => {
    try {
      const fileName = `banners/banner-${Date.now()}.jpg`
      
      console.log('🔄 Görsel yükleniyor:', fileName)
      console.log('📦 Dosya boyutu:', (file.size / 1024).toFixed(2), 'KB')
      
      // Bucket kontrolünü atla - direkt upload dene
      console.log('ℹ️ Bucket kontrolü atlanıyor (Supabase API kısıtlaması)')
      
      // Görseli yükle
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Storage upload error:', error)
        
        // Özel hata mesajları
        if (error.message.includes('new row violates row-level security')) {
          throw new Error('RLS Politikası hatası! Supabase SQL Editor\'de "supabase-storage-final.sql" dosyasını çalıştırın.')
        } else if (error.message.includes('Bucket not found')) {
          throw new Error('"products" bucket bulunamadı! Supabase Dashboard → Storage → New Bucket → Name: "products", Public: YES')
        } else if (error.message.includes('The resource already exists')) {
          throw new Error('Bu dosya zaten var! Farklı bir görsel seçin veya mevcut görseli silin.')
        } else {
          throw error
        }
      }

      console.log('✅ Upload başarılı:', data)

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      console.log('🔗 Public URL:', publicUrl)
      
      setFormData({ ...formData, image_url: publicUrl })
      alert('✅ Görsel başarıyla Supabase Storage\'a yüklendi!')
    } catch (error: any) {
      console.error('❌ Upload error:', error)
      
      const errorMessage = error.message || 'Bilinmeyen hata'
      alert(
        '❌ Görsel Supabase Storage\'a yüklenemedi!\n\n' +
        'Hata: ' + errorMessage + '\n\n' +
        '📋 Kontrol Listesi:\n' +
        '1. Supabase Dashboard → Storage → "products" bucket var mı?\n' +
        '2. Bucket "Public" olarak işaretli mi?\n' +
        '3. Storage RLS politikaları doğru mu?\n\n' +
        'Detaylar için Console\'u (F12) kontrol edin.'
      )
      
      // BLOB URL kullanma - sadece hata göster
      throw error
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">Banner Yönetimi</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'İptal' : '+ Yeni Banner Ekle'}
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📐 Önerilen Banner Boyutları</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Önerilen:</strong> 1920x600px</li>
              <li>• <strong>Minimum:</strong> 1200x400px</li>
              <li>• <strong>Format:</strong> JPG veya PNG</li>
              <li>• <strong>Max:</strong> 2MB</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">🖼️ Örnek Görsel URL'leri</h3>
            <ul className="text-xs text-green-800 space-y-1">
              <li className="break-all">• https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920</li>
              <li className="break-all">• https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920</li>
              <li className="text-xs text-green-600 mt-2">Unsplash'tan ücretsiz görseller kullanabilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? 'Banner Düzenle' : 'Yeni Banner Ekle'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Başlık *</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Alt Başlık</Label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <Label>Banner Görseli * (2 Seçenek)</Label>
                
                <div className="space-y-4">
                  {/* Seçenek 1: Dosya Yükle */}
                  <div>
                    <p className="text-sm font-medium mb-2">Seçenek 1: Dosya Yükle</p>
                    <ImageUpload 
                      onImageUpload={handleImageUpload}
                      recommendedWidth={1920}
                      recommendedHeight={600}
                      imageType="banner"
                    />
                  </div>

                  {/* Seçenek 2: URL Gir */}
                  <div>
                    <p className="text-sm font-medium mb-2">Seçenek 2: Görsel URL'i Girin</p>
                    <Input
                      placeholder="https://images.unsplash.com/photo-..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unsplash, Pexels gibi sitelerden görsel URL'i kullanabilirsiniz
                    </p>
                  </div>

                  {/* Preview */}
                  {formData.image_url && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">✓ Görsel hazır</p>
                      <p className="text-xs text-gray-500 break-all mt-1">{formData.image_url}</p>
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="mt-2 w-full max-w-md h-32 object-contain bg-gray-50 rounded border"
                        onError={(e) => {
                          console.error('Preview failed:', formData.image_url)
                          e.currentTarget.src = 'https://placehold.co/1920x600/e0e0e0/666?text=Görsel+Yüklenemedi'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Link URL (Opsiyonel)</Label>
                <Input
                  placeholder="/products veya https://..."
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Banner'a tıklandığında gidilecek sayfa. Boş bırakılırsa tıklanamaz.
                </p>
              </div>

              <div>
                <Label>Sıralama</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Küçük sayılar önce gösterilir (0, 1, 2...)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Kaydediliyor...' : editingId ? 'Güncelle' : 'Ekle'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tüm Bannerlar ({banners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !showForm ? (
            <p>Yükleniyor...</p>
          ) : banners.length === 0 ? (
            <p className="text-gray-600">Henüz banner bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div key={banner.id} className="border rounded-lg p-4 flex gap-4">
                  <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Banner thumbnail failed:', banner.image_url)
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">Görsel Yok</div>'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{banner.title}</h3>
                    {banner.subtitle && <p className="text-sm text-gray-600">{banner.subtitle}</p>}
                    <p className="text-xs text-gray-400 mt-1 break-all">{banner.image_url}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        banner.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        Sıra: {banner.display_order}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(banner)}>
                      Düzenle
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(banner.id)}>
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
