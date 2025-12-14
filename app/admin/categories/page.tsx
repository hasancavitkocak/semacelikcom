'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { FolderOpen, Plus, Edit, Trash2, Search, Image as ImageIcon } from 'lucide-react'
import ImageUpload from '@/components/image-upload'
import AdminHeader, { AdminHeaderButton } from '@/components/admin-header'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    image_url: '',
    show_on_homepage: false,
    parent_menu_id: ''
  })
  const [uploadedImage, setUploadedImage] = useState<{ file: File; url: string } | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products:products(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Load categories error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let finalImageUrl = formData.image_url

      // Eğer yeni görsel yüklendiyse, önce onu Supabase Storage'a yükle
      if (uploadedImage) {
        const fileName = `category-${Date.now()}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, uploadedImage.file)
        
        if (uploadError) {
          console.error('Upload error:', uploadError)
          alert('Görsel yüklenirken hata oluştu!')
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName)
        
        finalImageUrl = publicUrl
      }

      const categoryData = {
        ...formData,
        image_url: finalImageUrl
      }

      if (editingId) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Kategori başarıyla güncellendi!')
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([categoryData])

        if (error) throw error
        alert('✅ Kategori başarıyla eklendi!')
      }

      setFormData({ name: '', slug: '', description: '', image_url: '', show_on_homepage: false, parent_menu_id: '' })
      setUploadedImage(null)
      setEditingId(null)
      setShowForm(false)
      loadCategories()
    } catch (error: any) {
      console.error('Save category error:', error)
      alert('❌ Hata: ' + (error.message || 'Bilinmeyen hata'))
    }
  }

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      show_on_homepage: category.show_on_homepage || false,
      parent_menu_id: category.parent_menu_id || ''
    })
    setEditingId(category.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({ name: '', slug: '', description: '', image_url: '', show_on_homepage: false, parent_menu_id: '' })
    setUploadedImage(null)
    setEditingId(null)
    setShowForm(false)
  }

  const handleImageUpload = (file: File, compressedUrl: string) => {
    setUploadedImage({ file, url: compressedUrl })
    setFormData({...formData, image_url: ''}) // URL alanını temizle
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Kategori silindi!')
      loadCategories()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Kategori silinirken hata oluştu!')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProductCount = (category: any) => {
    return category.products?.[0]?.count || 0
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Kategoriler"
        description={`Toplam ${filteredCategories.length} kategori`}
        actions={
          <AdminHeaderButton onClick={() => setShowForm(true)} icon={Plus}>
            Yeni Kategori
          </AdminHeaderButton>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {editingId ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </h2>
              <p className="text-gray-600">Kategori bilgilerini girin</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Kategori Adı *</Label>
                  <Input 
                    placeholder="Örn: Elbise"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Slug *</Label>
                  <Input 
                    placeholder="Örn: elbise"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    required
                    className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Açıklama</Label>
                <textarea
                  placeholder="Kategori açıklaması (opsiyonel)"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Kategori Görseli</Label>
                
                {/* Yüklenen görsel varsa göster */}
                {uploadedImage ? (
                  <div className="mb-4">
                    <div className="relative inline-block">
                      <img 
                        src={uploadedImage.url} 
                        alt="Yüklenen görsel" 
                        className="w-32 h-32 object-contain bg-gray-50 rounded-xl border-2 border-green-300 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-sm text-green-600 mt-2 font-medium">✅ Yeni görsel yüklendi</p>
                  </div>
                ) : (
                  <>
                    {/* Mevcut görsel varsa göster */}
                    {formData.image_url && (
                      <div className="mb-4">
                        <img 
                          src={formData.image_url} 
                          alt="Mevcut görsel" 
                          className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <p className="text-sm text-gray-500 mt-2">Mevcut görsel</p>
                      </div>
                    )}
                    
                    {/* Görsel yükleme alanı */}
                    <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center bg-gray-50 transition-colors">
                      <ImageUpload onImageUpload={handleImageUpload} imageType="category" />
                      <p className="text-sm text-gray-500 mt-2">Kategori görseli yükleyin</p>
                    </div>
                  </>
                )}
                
                {/* Alternatif olarak URL girme */}
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">veya Görsel URL'si girin</Label>
                  <Input 
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({...formData, image_url: e.target.value})
                      setUploadedImage(null) // URL girilirse yüklenen görseli temizle
                    }}
                    className="border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    disabled={!!uploadedImage} // Yüklenen görsel varsa URL alanını devre dışı bırak
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.show_on_homepage} 
                    onChange={(e) => setFormData({...formData, show_on_homepage: e.target.checked})} 
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500" 
                  />
                  <div>
                    <span className="font-medium text-gray-900">Ana Sayfada Göster</span>
                    <p className="text-sm text-gray-600">Bu kategori ana sayfada görüntülensin</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  className="flex-1 bg-gray-900 hover:bg-black text-white"
                >
                  {editingId ? 'Güncelle' : 'Kaydet'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="px-6 border-gray-300 hover:bg-gray-50"
                >
                  İptal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
            <span className="ml-3 text-gray-600">Kategoriler yükleniyor...</span>
          </div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {categories.length === 0 ? 'Henüz kategori yok' : 'Arama sonucu bulunamadı'}
          </h3>
          <p className="text-gray-600 mb-6">
            {categories.length === 0 ? 'İlk kategorinizi ekleyerek başlayın' : 'Farklı arama terimleri deneyin'}
          </p>
          {categories.length === 0 && (
            <AdminHeaderButton onClick={() => setShowForm(true)} icon={Plus}>
              İlk Kategoriyi Ekle
            </AdminHeaderButton>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Slug</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Ana Sayfa</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Ürün Sayısı</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Oluşturma</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {category.image_url ? (
                            <img 
                              src={category.image_url} 
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{category.name}</p>
                          {category.description && (
                            <p className="text-sm text-gray-500 truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.show_on_homepage 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.show_on_homepage ? 'Evet' : 'Hayır'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getProductCount(category)} ürün
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(category.created_at).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(category.created_at).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEdit(category)}
                          className="text-gray-600 hover:text-gray-900 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}