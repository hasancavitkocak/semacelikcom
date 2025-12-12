'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/image-upload'

export default function AdminHomeBlocksPage() {
  const [blocks, setBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    display_order: 0
  })

  useEffect(() => {
    loadBlocks()
  }, [])

  const loadBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('home_blocks')
        .select('*')
        .order('display_order')

      if (error) {
        console.error('❌ Bloklar yüklenemedi:', error)
        throw error
      }
      
      console.log('✅ Bloklar yüklendi:', data)
      setBlocks(data || [])
    } catch (error) {
      console.error('Load blocks error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Görsel kontrolü
    if (!formData.image_url || formData.image_url.trim() === '') {
      alert('Lütfen bir görsel yükleyin veya URL girin!')
      return
    }
    
    setLoading(true)

    try {
      console.log('💾 Blok kaydediliyor:', formData)
      
      if (editingBlock) {
        const { error } = await supabase
          .from('home_blocks')
          .update(formData)
          .eq('id', editingBlock.id)

        if (error) throw error
        alert('Blok güncellendi!')
      } else {
        const { error } = await supabase
          .from('home_blocks')
          .insert([formData])

        if (error) throw error
        alert('Blok eklendi!')
      }

      setFormData({ title: '', image_url: '', link_url: '', display_order: 0 })
      setShowForm(false)
      setEditingBlock(null)
      loadBlocks()
    } catch (error: any) {
      console.error('❌ Kaydetme hatası:', error)
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu bloğu silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('home_blocks')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Blok silindi!')
      loadBlocks()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const handleEdit = (block: any) => {
    setEditingBlock(block)
    setFormData({
      title: block.title,
      image_url: block.image_url,
      link_url: block.link_url || '',
      display_order: block.display_order
    })
    setShowForm(true)
  }

  const handleImageUpload = async (file: File, compressedUrl: string) => {
    try {
      console.log('📤 Görsel yükleniyor:', file.name)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `home-blocks/${Date.now()}.${fileExt}`
      
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

      console.log('✅ Görsel URL:', publicUrl)
      
      setFormData(prev => ({ ...prev, image_url: publicUrl }))
      alert('Görsel yüklendi! Şimdi formu kaydedin.')
    } catch (error: any) {
      console.error('❌ Görsel yükleme hatası:', error)
      alert('Görsel yüklenirken hata: ' + error.message)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa Blokları</h1>
          <p className="text-gray-600 mt-1">Kategori/koleksiyon bloklarını yönetin</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingBlock(null)
            setFormData({ title: '', image_url: '', link_url: '', display_order: blocks.length })
          }}
          className="bg-gray-900 hover:bg-black text-white"
        >
          <Plus size={20} className="mr-2" />
          Yeni Blok
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBlock ? 'Blok Düzenle' : 'Yeni Blok Ekle'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-900">Başlık *</Label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="CEKET, HIRKA, ETEK..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-900">Sıra</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900">Link URL</Label>
              <Input
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="/products?category=ceket"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-900">Görsel *</Label>
              
              {/* Önizleme */}
              {formData.image_url && (
                <div className="mt-2 mb-4 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-green-800">✓ Görsel Hazır</p>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Değiştir
                    </button>
                  </div>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full max-h-60 object-contain bg-gray-50 rounded-lg"
                    onError={(e) => {
                      console.error('❌ Görsel yüklenemedi:', formData.image_url)
                      e.currentTarget.src = 'https://via.placeholder.com/400x500/e5e7eb/6b7280?text=Görsel+Yüklenemedi'
                    }}
                  />
                  <p className="text-xs text-gray-600 mt-2 break-all">{formData.image_url}</p>
                </div>
              )}
              
              {/* Yükleme Alanı */}
              {!formData.image_url && (
                <div className="space-y-3 mt-2">
                  <ImageUpload onImageUpload={handleImageUpload} imageType="banner" />
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">veya URL girin</span>
                    </div>
                  </div>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading} className="bg-gray-900 hover:bg-black text-white">
                {loading ? 'Kaydediliyor...' : editingBlock ? 'Güncelle' : 'Ekle'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setEditingBlock(null)
                }}
              >
                İptal
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Bloklar Listesi */}
      <div className="grid md:grid-cols-3 gap-6">
        {blocks.map((block) => (
          <div key={block.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
            <div className="relative aspect-[4/5] bg-gray-100">
              {block.image_url ? (
                <img
                  src={block.image_url}
                  alt={block.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Görsel yüklenemedi:', block.image_url)
                    e.currentTarget.src = 'https://via.placeholder.com/400x500/e5e7eb/6b7280?text=' + encodeURIComponent(block.title)
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-sm">Görsel Yok</p>
                    <p className="text-xs mt-1">Düzenle butonuna tıklayın</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <span className="bg-white px-4 py-2 font-bold text-gray-900">
                  {block.title}
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {block.display_order}
              </div>
            </div>
            <div className="p-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(block)}
                className="flex-1"
              >
                <Edit size={16} className="mr-1" />
                Düzenle
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(block.id)}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {blocks.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Henüz blok eklenmemiş</p>
          <Button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-gray-900 hover:bg-black text-white"
          >
            İlk Bloğu Ekle
          </Button>
        </div>
      )}
    </div>
  )
}
