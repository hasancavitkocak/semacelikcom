'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { FolderOpen, Plus, Edit, Trash2, Search, Filter, TrendingUp, MoreHorizontal, Image as ImageIcon, Tag } from 'lucide-react'
import ImageUpload from '@/components/image-upload'
import ToggleSwitch from '@/components/toggle-switch'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [menus, setMenus] = useState<any[]>([])
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FolderOpen className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
                    Kategori Yönetimi
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Toplam {filteredCategories.length} kategori
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-sm">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm font-semibold text-gray-700">Aktif sistem</span>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                <Plus size={18} className="mr-2" />
                Yeni Kategori
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Filters */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200 placeholder-gray-500"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200">
                  <Filter size={16} className="mr-2" />
                  Filtreler
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  {editingId ? <Edit className="text-white" size={20} /> : <Plus className="text-white" size={20} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                  </h2>
                  <p className="text-sm text-gray-500">Kategori bilgilerini girin</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Kategori Adı *</Label>
                    <Input 
                      placeholder="Örn: Elbise"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Slug *</Label>
                    <Input 
                      placeholder="Örn: elbise"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Açıklama</Label>
                  <textarea
                    placeholder="Kategori açıklaması (opsiyonel)"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-200/50 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Kategori Görseli</Label>
                  
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
                      <div className="border-2 border-dashed border-orange-300 hover:border-orange-400 rounded-2xl p-6 text-center bg-gradient-to-br from-orange-50 to-red-50/30 transition-all duration-200 hover:shadow-lg">
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
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200"
                      disabled={!!uploadedImage} // Yüklenen görsel varsa URL alanını devre dışı bırak
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-200">
                    <input 
                      type="checkbox" 
                      checked={formData.show_on_homepage} 
                      onChange={(e) => setFormData({...formData, show_on_homepage: e.target.checked})} 
                      className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <div>
                      <span className="font-semibold text-blue-800">Ana Sayfada Göster</span>
                      <p className="text-sm text-blue-600">Bu kategori ana sayfada görüntülensin</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
                  >
                    {editingId ? 'Güncelle' : 'Kaydet'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    className="px-8 border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Premium Table */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderOpen size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {categories.length === 0 ? 'Henüz kategori yok' : 'Arama sonucu bulunamadı'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {categories.length === 0 ? 'İlk kategorinizi ekleyerek başlayın' : 'Farklı arama terimleri deneyin'}
              </p>
              {categories.length === 0 && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                >
                  <Plus size={18} className="mr-2" />
                  İlk Kategoriyi Ekle
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/80 to-orange-50/80 border-b border-gray-200/50">
                      <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wide">Kategori</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Slug</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Ana Sayfa</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Ürün Sayısı</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">Oluşturma</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {filteredCategories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-orange-50/30 transition-all duration-200 group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative group/image">
                              {category.image_url ? (
                                <>
                                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200">
                                    <img 
                                      src={category.image_url} 
                                      alt={category.name}
                                      className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  {/* Hover Preview */}
                                  <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 opacity-0 invisible group-hover/image:opacity-100 group-hover/image:visible transition-all duration-300 pointer-events-none">
                                    <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white p-2">
                                      <img 
                                        src={category.image_url} 
                                        alt={category.name}
                                        className="w-full h-full object-cover rounded-xl"
                                      />
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                                  <ImageIcon size={20} className="text-orange-600" />
                                </div>
                              )}
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center z-10">
                                  <Tag size={8} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 group-hover:text-orange-900 transition-colors">
                                {category.name}
                              </p>
                              {category.description && (
                                <p className="text-xs text-gray-500 truncate mt-1">{category.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-mono font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                            {category.slug}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className={`w-3 h-3 rounded-full ${
                              category.show_on_homepage 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                : 'bg-gradient-to-r from-gray-300 to-gray-400'
                            }`}></div>
                            <span className={`ml-2 text-xs font-semibold px-2 py-1 rounded-full ${
                              category.show_on_homepage 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {category.show_on_homepage ? 'EVET' : 'HAYIR'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-lg border border-blue-100">
                            <span className="text-sm font-bold text-blue-900">
                              {getProductCount(category)}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">ürün</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs text-gray-600">
                            <div className="font-medium">
                              {new Date(category.created_at).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(category.created_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <div className="relative group/menu">
                              <button className="p-1.5 hover:bg-orange-100 rounded-lg transition-all duration-200 hover:shadow-sm">
                                <MoreHorizontal size={14} className="text-gray-600" />
                              </button>
                              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[120px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-20">
                                <button
                                  onClick={() => handleDelete(category.id)}
                                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                                >
                                  🗑️ Sil
                                </button>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleEdit(category)}
                              className="p-1.5 hover:bg-orange-100 rounded-lg transition-all duration-200 hover:shadow-sm" 
                              title="Düzenle"
                            >
                              <Edit size={14} className="text-orange-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              {filteredCategories.map((category, index) => (
                <div key={category.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-5 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {category.image_url ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                          <img 
                            src={category.image_url} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center shadow-sm">
                          <ImageIcon size={24} className="text-orange-600" />
                        </div>
                      )}
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center z-10">
                          <Tag size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate text-lg">{category.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">{category.slug}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={() => handleEdit(category)}
                            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <Edit size={16} className="text-orange-600" />
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Ürün Sayısı</span>
                          <p className="font-bold text-blue-900 mt-1">
                            {getProductCount(category)} ürün
                          </p>
                        </div>
                        <div className={`bg-gradient-to-r rounded-lg p-3 border ${
                          category.show_on_homepage 
                            ? 'from-green-50 to-emerald-50 border-green-100' 
                            : 'from-gray-50 to-slate-50 border-gray-100'
                        }`}>
                          <span className={`text-xs font-semibold uppercase tracking-wide ${
                            category.show_on_homepage ? 'text-green-600' : 'text-gray-600'
                          }`}>Ana Sayfa</span>
                          <p className={`font-bold mt-1 ${
                            category.show_on_homepage ? 'text-green-900' : 'text-gray-700'
                          }`}>
                            {category.show_on_homepage ? '✅ Gösteriliyor' : '❌ Gizli'}
                          </p>
                        </div>
                      </div>
                      
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                      )}
                      
                      <div className="pt-3 border-t border-gray-200/50">
                        <p className="text-xs text-gray-500 font-medium">
                          Oluşturuldu: {new Date(category.created_at).toLocaleDateString('tr-TR')} • {new Date(category.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Premium Pagination */}
            <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-orange-50/80 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 font-medium">
                  Toplam <span className="font-bold text-gray-900">{filteredCategories.length}</span> kategori
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                    ← Önceki
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-2 text-sm bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold shadow-sm">1</span>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                    Sonraki →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}