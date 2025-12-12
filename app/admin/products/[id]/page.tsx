'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiImageUpload from '@/components/multi-image-upload'
import { supabase } from '@/lib/supabase'
import { Edit, ArrowLeft, Save, Trash2, Plus, X, ChevronDown, Image as ImageIcon, Palette, Settings2 } from 'lucide-react'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category_id: '',
    fabric_type: '', fabric_composition: '', care_instructions: '',
    brand: '', gender: 'kadın', season: '', is_active: true
  })
  
  // Çoklu kategori desteği
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [primaryCategory, setPrimaryCategory] = useState<string>('')
  const [images, setImages] = useState<any[]>([])
  const [newImages, setNewImages] = useState<{ id: string; file: File; url: string }[]>([])
  const [colors, setColors] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [newVariant, setNewVariant] = useState({ color_id: '', size_id: '', stock: 0 })
  const [editingVariant, setEditingVariant] = useState<string | null>(null)

  useEffect(() => {
    loadProduct()
    loadCategories()
    loadColors()
    loadSizes()
    loadVariants()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }
  const loadColors = async () => {
    const { data } = await supabase.from('colors').select('*').order('name')
    setColors(data || [])
  }
  const loadSizes = async () => {
    const { data } = await supabase.from('sizes').select('*').order('display_order')
    setSizes(data || [])
  }
  const loadVariants = async () => {
    const { data } = await supabase.from('product_variants')
      .select('*, colors (id, name, hex_code), sizes (id, name)')
      .eq('product_id', productId)
    setVariants(data || [])
  }
  const loadProduct = async () => {
    try {
      const { data: product, error } = await supabase.from('products').select('*').eq('id', productId).single()
      if (error) throw error
      
      setFormData({
        name: product.name, description: product.description || '', price: product.price.toString(),
        category_id: product.category_id || '', fabric_type: product.fabric_type || '',
        fabric_composition: product.fabric_composition || '', care_instructions: product.care_instructions || '',
        brand: product.brand || '', gender: product.gender || 'kadın', season: product.season || '',
        is_active: product.is_active
      })

      // Çoklu kategorileri yükle
      const { data: productCategories } = await supabase
        .from('product_categories')
        .select('category_id, is_primary')
        .eq('product_id', productId)
      
      if (productCategories && productCategories.length > 0) {
        const categoryIds = productCategories.map(pc => pc.category_id)
        const primary = productCategories.find(pc => pc.is_primary)?.category_id || categoryIds[0]
        
        setSelectedCategories(categoryIds)
        setPrimaryCategory(primary)
      } else if (product.category_id) {
        // Geriye uyumluluk için eski kategori sistemini destekle
        setSelectedCategories([product.category_id])
        setPrimaryCategory(product.category_id)
      }

      const { data: productImages } = await supabase.from('product_images').select('*').eq('product_id', params.id).order('display_order')
      setImages(productImages || [])
    } catch (error) {
      alert('Ürün yüklenirken hata oluştu!')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) return
    try {
      await supabase.from('product_images').delete().eq('id', imageId)
      setImages(images.filter(img => img.id !== imageId))
    } catch (error) {
      alert('Görsel silinirken hata oluştu!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Validasyon
      if (!primaryCategory) {
        alert('Ana kategori seçmelisiniz!')
        return
      }

      // Ürünü güncelle
      await supabase.from('products').update({
        name: formData.name, description: formData.description, price: parseFloat(formData.price),
        category_id: primaryCategory, fabric_type: formData.fabric_type || null,
        fabric_composition: formData.fabric_composition || null, care_instructions: formData.care_instructions || null,
        brand: formData.brand || null, gender: formData.gender, season: formData.season || null,
        is_active: formData.is_active, updated_at: new Date().toISOString()
      }).eq('id', params.id)

      // Mevcut kategorileri sil ve yenilerini ekle
      await supabase.from('product_categories').delete().eq('product_id', params.id)
      
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map(categoryId => ({
          product_id: params.id,
          category_id: categoryId,
          is_primary: categoryId === primaryCategory
        }))

        await supabase.from('product_categories').insert(categoryInserts)
      }

      if (newImages.length > 0) {
        const maxOrder = images.length > 0 ? Math.max(...images.map(img => img.display_order)) : -1
        for (let i = 0; i < newImages.length; i++) {
          const img = newImages[i]
          const fileName = `${params.id}-${Date.now()}-${i}.jpg`
          await supabase.storage.from('products').upload(fileName, img.file)
          const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
          await supabase.from('product_images').insert([{
            product_id: params.id, image_url: publicUrl, is_primary: images.length === 0 && i === 0, display_order: maxOrder + i + 1
          }])
        }
      }
      alert('Ürün başarıyla güncellendi!')
      router.push('/admin/products')
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      await supabase.from('products').delete().eq('id', params.id)
      alert('Ürün silindi!')
      router.push('/admin/products')
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const handleAddVariant = async () => {
    if (!newVariant.color_id || !newVariant.size_id) { alert('Lütfen renk ve beden seçiniz!'); return }
    if (variants.find(v => v.color_id === newVariant.color_id && v.size_id === newVariant.size_id)) {
      alert('Bu kombinasyon zaten mevcut!'); return
    }
    try {
      const { data } = await supabase.from('product_variants').insert([{
        product_id: productId, color_id: newVariant.color_id, size_id: newVariant.size_id, stock: newVariant.stock
      }]).select('*, colors (id, name, hex_code), sizes (id, name)')
      setVariants([...variants, data![0]])
      setNewVariant({ color_id: '', size_id: '', stock: 0 })
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm('Bu varyantı silmek istediğinizden emin misiniz?')) return
    try {
      await supabase.from('product_variants').delete().eq('id', variantId)
      setVariants(variants.filter(v => v.id !== variantId))
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const handleUpdateVariant = async (variantId: string, updates: any) => {
    try {
      await supabase.from('product_variants').update(updates).eq('id', variantId)
      const { data } = await supabase.from('product_variants')
        .select('*, colors (id, name, hex_code), sizes (id, name)').eq('id', variantId).single()
      setVariants(variants.map(v => v.id === variantId ? data : v))
      setEditingVariant(null)
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Link href="/admin/products">
                  <Button variant="outline" size="sm" className="border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200">
                    <ArrowLeft size={16} className="mr-2" />
                    Geri
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Ürün Düzenle
                  </h1>
                  <p className="text-gray-600 font-medium font-mono">
                    #{productId.slice(0, 8)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="destructive" onClick={handleDelete} className="shadow-lg hover:shadow-xl transition-all duration-200">
                <Trash2 size={16} className="mr-2" />
                Ürünü Sil
              </Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Temel Bilgiler */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings2 className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Temel Bilgiler</h2>
                <p className="text-sm text-gray-500">Ürün adı, fiyat ve kategori bilgileri</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="md:col-span-2 lg:col-span-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Ürün Adı *</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="Ürün adını girin"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Açıklama</Label>
                <textarea 
                  rows={3} 
                  className="w-full border border-gray-200/50 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ürün açıklamasını girin"
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Fiyat (₺) *</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  required 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Kategoriler</Label>
                <div className="space-y-3">
                  {/* Ana Kategori Seçimi */}
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1 block">Ana Kategori *</Label>
                    <div className="relative">
                      <select 
                        className="w-full appearance-none border border-gray-200/50 rounded-xl px-4 py-2.5 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 cursor-pointer" 
                        value={primaryCategory} 
                        onChange={(e) => {
                          setPrimaryCategory(e.target.value)
                          if (e.target.value && !selectedCategories.includes(e.target.value)) {
                            setSelectedCategories([...selectedCategories, e.target.value])
                          }
                        }}
                        required
                      >
                        <option value="">Ana kategori seçin</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  {/* Çoklu Kategori Seçimi */}
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">Ek Kategoriler</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto border border-gray-200/50 rounded-xl p-3 bg-white/30">
                      {categories.map(category => (
                        <label key={category.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategories([...selectedCategories, category.id])
                              } else {
                                setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                                if (primaryCategory === category.id) {
                                  setPrimaryCategory('')
                                }
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-700">{category.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Seçilen: {selectedCategories.length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Marka</Label>
                <Input 
                  value={formData.brand} 
                  onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="Marka adı"
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Sezon</Label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none border border-gray-200/50 rounded-xl px-4 py-2.5 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 cursor-pointer" 
                    value={formData.season} 
                    onChange={(e) => setFormData({...formData, season: e.target.value})}
                  >
                    <option value="">Seçiniz</option>
                    <option value="yaz">Yaz</option>
                    <option value="kış">Kış</option>
                    <option value="ilkbahar">İlkbahar</option>
                    <option value="sonbahar">Sonbahar</option>
                    <option value="her-mevsim">Her Mevsim</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Kumaş Tipi</Label>
                <Input 
                  value={formData.fabric_type} 
                  onChange={(e) => setFormData({...formData, fabric_type: e.target.value})} 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="Örn: Pamuk"
                />
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Kumaş Bileşimi</Label>
                <Input 
                  value={formData.fabric_composition} 
                  onChange={(e) => setFormData({...formData, fabric_composition: e.target.value})} 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="Örn: %100 Pamuk"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Bakım Talimatları</Label>
                <textarea 
                  rows={2} 
                  className="w-full border border-gray-200/50 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200" 
                  value={formData.care_instructions} 
                  onChange={(e) => setFormData({...formData, care_instructions: e.target.value})}
                  placeholder="Yıkama ve bakım talimatları"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-4">
                <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50 hover:shadow-md transition-all duration-200">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active} 
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})} 
                    className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500" 
                  />
                  <div>
                    <span className="font-semibold text-green-800">Ürün Aktif</span>
                    <p className="text-sm text-green-600">Aktif ürünler sitede görüntülenir</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Ürün Görselleri */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <ImageIcon className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ürün Görselleri</h2>
                <p className="text-sm text-gray-500">Ürün fotoğraflarını yönetin</p>
              </div>
            </div>
            
            {images.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold text-gray-700">Mevcut Görseller ({images.length})</Label>
                  <p className="text-xs text-gray-500">Silmek için X'e tıklayın</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                  {images.map((img, index) => (
                    <div key={img.id} className="relative group">
                      <div className={`aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 shadow-sm group-hover:shadow-lg transition-all duration-200 ${
                        img.is_primary ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200/50 group-hover:border-blue-300'
                      }`}>
                        <img src={img.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">ANA</span>
                      )}
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {index + 1}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteImage(img.id)} 
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200/50 pt-6">
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">Yeni Görsel Ekle</Label>
              <MultiImageUpload 
                images={newImages}
                onImagesChange={setNewImages}
                maxImages={20}
              />
            </div>
          </div>

          {/* Renk ve Beden Yönetimi */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Renk ve Beden Yönetimi</h2>
                <p className="text-sm text-gray-500">Ürün varyantlarını ve stok bilgilerini yönetin</p>
              </div>
            </div>
            
            {variants.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Mevcut Varyantlar ({variants.length})</Label>
                <div className="bg-white/50 rounded-xl border border-gray-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50/80 to-orange-50/80 border-b border-gray-200/50">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Renk</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Beden</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Stok</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/50">
                        {variants.map((variant) => (
                          <tr key={variant.id} className="hover:bg-orange-50/30 transition-all duration-200">
                            {editingVariant === variant.id ? (
                              <>
                                <td className="py-3 px-4">
                                  <select 
                                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white" 
                                    value={variant.color_id} 
                                    onChange={(e) => setVariants(variants.map(v => v.id === variant.id ? {...v, color_id: e.target.value} : v))}
                                  >
                                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                  </select>
                                </td>
                                <td className="py-3 px-4">
                                  <select 
                                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white" 
                                    value={variant.size_id} 
                                    onChange={(e) => setVariants(variants.map(v => v.id === variant.id ? {...v, size_id: e.target.value} : v))}
                                  >
                                    {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <Input 
                                    type="number" 
                                    className="w-20 h-8 text-sm text-center mx-auto" 
                                    value={variant.stock} 
                                    onChange={(e) => setVariants(variants.map(v => v.id === variant.id ? {...v, stock: parseInt(e.target.value) || 0} : v))} 
                                  />
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      onClick={() => handleUpdateVariant(variant.id, { color_id: variant.color_id, size_id: variant.size_id, stock: variant.stock })}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Kaydet
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => { setEditingVariant(null); loadVariants(); }}
                                    >
                                      İptal
                                    </Button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm" 
                                      style={{ backgroundColor: variant.colors?.hex_code || '#ccc' }} 
                                    />
                                    <span className="font-medium text-gray-900">{variant.colors?.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm">{variant.sizes?.name}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`font-bold text-sm px-3 py-1 rounded-full ${
                                    variant.stock > 10 
                                      ? 'bg-green-100 text-green-700' 
                                      : variant.stock > 0 
                                        ? 'bg-yellow-100 text-yellow-700' 
                                        : 'bg-red-100 text-red-700'
                                  }`}>
                                    {variant.stock}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingVariant(variant.id)}
                                      className="hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      <Edit size={14} className="mr-1" />
                                      Düzenle
                                    </Button>
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="destructive" 
                                      onClick={() => handleDeleteVariant(variant.id)}
                                    >
                                      <Trash2 size={14} />
                                    </Button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200/50">
              <Label className="text-sm font-semibold text-orange-800 mb-4 block">Yeni Varyant Ekle</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <select 
                    className="w-full appearance-none border border-orange-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200 cursor-pointer" 
                    value={newVariant.color_id} 
                    onChange={(e) => setNewVariant({...newVariant, color_id: e.target.value})}
                  >
                    <option value="">Renk Seçin</option>
                    {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 pointer-events-none" size={16} />
                </div>
                <div className="relative">
                  <select 
                    className="w-full appearance-none border border-orange-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200 cursor-pointer" 
                    value={newVariant.size_id} 
                    onChange={(e) => setNewVariant({...newVariant, size_id: e.target.value})}
                  >
                    <option value="">Beden Seçin</option>
                    {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 pointer-events-none" size={16} />
                </div>
                <Input 
                  type="number" 
                  placeholder="Stok Adedi" 
                  value={newVariant.stock} 
                  onChange={(e) => setNewVariant({...newVariant, stock: parseInt(e.target.value) || 0})} 
                  className="border-orange-200 focus:ring-orange-500/20 focus:border-orange-500/30"
                />
                <Button 
                  type="button" 
                  onClick={handleAddVariant} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Varyant Ekle
                </Button>
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 sticky bottom-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                disabled={saving} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-6 text-lg font-semibold"
              >
                <Save size={22} className="mr-2" />
                {saving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
              </Button>
              <Link href="/admin/products">
                <Button type="button" variant="outline" className="w-full sm:w-auto px-8 py-6 border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200">
                  İptal
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              💡 Tüm değişiklikler bu butona basıldığında kaydedilir.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
