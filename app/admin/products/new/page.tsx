'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Save, Palette, ChevronDown, Trash2, Image as ImageIcon, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiImageUpload from '@/components/multi-image-upload'
import { supabase } from '@/lib/supabase'
import { createSlug } from '@/lib/slug-utils'

interface Category {
  id: string
  name: string
}

interface Color {
  id: string
  name: string
  hex_code: string
}

interface Size {
  id: string
  name: string
  display_order: number
}

interface Variant {
  tempId: string
  color_id: string
  size_id: string
  stock: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [sizes, setSizes] = useState<Size[]>([])
  const [uploadedImages, setUploadedImages] = useState<{ id: string; file: File; url: string }[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [newVariant, setNewVariant] = useState({ color_id: '', size_id: '', stock: 0 })
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    category_id: '', // Ana kategori (geriye uyumluluk için)
    fabric_type: '',
    fabric_composition: '',
    care_instructions: '',
    brand: '',
    gender: 'kadın',
    season: '',
    is_active: true
  })

  // Name değiştiğinde slug'ı otomatik oluştur
  const handleNameChange = (name: string) => {
    const slug = createSlug(name)
    setFormData(prev => ({ ...prev, name, slug }))
  }
  
  // Çoklu kategori seçimi için
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [primaryCategory, setPrimaryCategory] = useState<string>('')

  useEffect(() => {
    loadCategories()
    loadColors()
    loadSizes()
  }, [])

  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  const loadColors = async () => {
    const { data } = await supabase.from('colors').select('*').order('name')
    if (data) setColors(data)
  }

  const loadSizes = async () => {
    const { data } = await supabase.from('sizes').select('*').order('display_order')
    if (data) setSizes(data)
  }



  const addVariant = () => {
    if (!newVariant.color_id || !newVariant.size_id) {
      alert('Lütfen renk ve beden seçiniz!')
      return
    }
    if (variants.find(v => v.color_id === newVariant.color_id && v.size_id === newVariant.size_id)) {
      alert('Bu kombinasyon zaten mevcut!')
      return
    }
    setVariants([...variants, {
      tempId: Date.now().toString(),
      color_id: newVariant.color_id,
      size_id: newVariant.size_id,
      stock: newVariant.stock
    }])
    setNewVariant({ color_id: '', size_id: '', stock: 0 })
  }

  const removeVariant = (tempId: string) => {
    setVariants(variants.filter(v => v.tempId !== tempId))
  }

  const getColorName = (colorId: string) => colors.find(c => c.id === colorId)?.name || ''
  const getColorHex = (colorId: string) => colors.find(c => c.id === colorId)?.hex_code || '#ccc'
  const getSizeName = (sizeId: string) => sizes.find(s => s.id === sizeId)?.name || ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasyon
      if (!primaryCategory) {
        alert('Ana kategori seçmelisiniz!')
        return
      }

      // Ürünü oluştur
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price: parseFloat(formData.price),
          category_id: primaryCategory, // Ana kategori (geriye uyumluluk için)
          fabric_type: formData.fabric_type || null,
          fabric_composition: formData.fabric_composition || null,
          care_instructions: formData.care_instructions || null,
          brand: formData.brand || null,
          gender: formData.gender,
          season: formData.season || null,
          is_active: formData.is_active
        }])
        .select()
        .single()

      if (productError) throw productError

      // Çoklu kategorileri ekle
      if (selectedCategories.length > 0) {
        const categoryInserts = selectedCategories.map(categoryId => ({
          product_id: product.id,
          category_id: categoryId,
          is_primary: categoryId === primaryCategory
        }))

        const { error: categoryError } = await supabase
          .from('product_categories')
          .insert(categoryInserts)
        
        if (categoryError) throw categoryError
      }

      // Görselleri yükle ve ekle
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const img = uploadedImages[i]
          const fileName = `${product.id}-${Date.now()}-${i}.jpg`
          
          const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, img.file)
          
          if (uploadError) {
            console.error('Upload error:', uploadError)
            continue
          }

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName)

          await supabase.from('product_images').insert([{
            product_id: product.id,
            image_url: publicUrl,
            is_primary: i === 0,
            display_order: i
          }])
        }
      }

      // Varyantları ekle
      if (variants.length > 0) {
        const variantInserts = variants.map(v => ({
          product_id: product.id,
          color_id: v.color_id,
          size_id: v.size_id,
          stock: v.stock
        }))

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantInserts)
        
        if (variantError) throw variantError
      }

      alert('Ürün başarıyla eklendi!')
      router.push('/admin/products')
    } catch (error: any) {
      console.error('Ürün ekleme hatası:', error)
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
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
                  <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 transition-all duration-200">
                    <ArrowLeft size={16} className="mr-2" />
                    Geri
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                    Yeni Ürün Ekle
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Mağazanıza yeni ürün ekleyin
                  </p>
                </div>
              </div>
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
                  onChange={(e) => handleNameChange(e.target.value)} 
                  required 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="Ürün adını girin"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">URL Slug *</Label>
                <Input 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})} 
                  required 
                  className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200"
                  placeholder="url-slug-ornek"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /products/{formData.slug || 'url-slug'}
                </p>
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
              
              <div>
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
                    <Label className="text-xs font-medium text-gray-600 mb-2 block">Ek Kategoriler (Opsiyonel)</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-200/50 rounded-xl p-3 bg-white/30">
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
                          <span className="text-sm text-gray-700">{category.name}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Seçilen kategoriler: {selectedCategories.length} / Ana: {categories.find(c => c.id === primaryCategory)?.name || 'Seçilmedi'}
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
                <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200">
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
                <p className="text-sm text-gray-500">Toplu görsel ekleyin ve sürükleyerek sıralayın</p>
              </div>
            </div>
            
            <MultiImageUpload 
              images={uploadedImages}
              onImagesChange={setUploadedImages}
              maxImages={20}
            />
          </div>

          {/* Renk ve Beden Yönetimi */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Palette className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Renk ve Beden Yönetimi</h2>
                <p className="text-sm text-gray-500">Ürün varyantlarını ve stok bilgilerini ekleyin</p>
              </div>
            </div>
            
            {variants.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Eklenen Varyantlar ({variants.length})</Label>
                <div className="bg-white/50 rounded-xl border border-gray-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-gray-50/80 to-orange-50/80 border-b border-gray-200/50">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Renk</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Beden</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">Stok</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700 text-sm">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100/50">
                        {variants.map((variant) => (
                          <tr key={variant.tempId} className="hover:bg-orange-50/30 transition-all duration-200">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-sm" 
                                  style={{ backgroundColor: getColorHex(variant.color_id) }} 
                                />
                                <span className="font-medium text-gray-900">{getColorName(variant.color_id)}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm">{getSizeName(variant.size_id)}</span>
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
                            <td className="py-3 px-4 text-center">
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => removeVariant(variant.tempId)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </td>
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
                    {colors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
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
                    {sizes.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
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
                  onClick={addVariant} 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus size={18} className="mr-2" />
                  Varyant Ekle
                </Button>
              </div>
            </div>

            {variants.length === 0 && (
              <div className="mt-4 text-center py-8 bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl border-2 border-dashed border-orange-200">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Palette size={20} className="text-orange-600" />
                </div>
                <p className="text-gray-600 font-medium">Henüz varyant eklenmedi</p>
                <p className="text-sm text-gray-500">Yukarıdan renk ve beden seçerek varyant ekleyin</p>
              </div>
            )}
          </div>

          {/* Kaydet Butonu */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 sticky bottom-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-6 text-lg font-semibold"
              >
                <Save size={22} className="mr-2" />
                {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
              </Button>
              <Link href="/admin/products">
                <Button type="button" variant="outline" className="w-full sm:w-auto px-8 py-6 border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200">
                  İptal
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
