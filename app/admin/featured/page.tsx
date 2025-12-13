'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, GripVertical, Star, Package, TrendingUp } from 'lucide-react'

export default function AdminFeaturedPage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Ürün arama filtresi
    const filtered = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [allProducts, searchTerm])

  const loadData = async () => {
    try {
      // Tüm aktif ürünleri çek
      const { data: allProds } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          images:product_images(image_url, is_primary)
        `)
        .eq('is_active', true)
        .order('name')

      setAllProducts(allProds || [])

      // Vitrin ürünlerini çek
      const { data: featured } = await supabase
        .from('featured_products')
        .select(`
          *,
          product:products(
            *,
            category:categories(name),
            images:product_images(image_url, is_primary)
          )
        `)
        .eq('is_active', true)
        .order('display_order')

      setFeaturedProducts(featured || [])
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToFeatured = async (productId: string) => {
    setSaving(true)
    try {
      const maxOrder = Math.max(...featuredProducts.map(fp => fp.display_order), 0)
      
      const { error } = await supabase
        .from('featured_products')
        .insert([{
          product_id: productId,
          display_order: maxOrder + 1,
          is_active: true
        }])

      if (error) throw error
      
      alert('✅ Ürün vitrine eklendi!')
      loadData()
      setShowProductSelector(false)
    } catch (error: any) {
      console.error('Add to featured error:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const removeFromFeatured = async (featuredId: string) => {
    if (!confirm('Bu ürünü vitrinden kaldırmak istediğinizden emin misiniz?')) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('featured_products')
        .delete()
        .eq('id', featuredId)

      if (error) throw error
      
      alert('✅ Ürün vitrinden kaldırıldı!')
      loadData()
    } catch (error: any) {
      console.error('Remove from featured error:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const updateDisplayOrder = async (featuredId: string, newOrder: number) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('featured_products')
        .update({ display_order: newOrder })
        .eq('id', featuredId)

      if (error) throw error
      loadData()
    } catch (error: any) {
      console.error('Update order error:', error)
      alert('❌ Hata: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Vitrine ekli olmayan ürünleri filtrele
  const availableProducts = filteredProducts.filter(product => 
    !featuredProducts.some(fp => fp.product.id === product.id)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Star className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent">
                    Vitrin Ürünler Yönetimi
                  </h1>
                  <p className="text-gray-600 font-medium">
                    {featuredProducts.length} vitrin ürünü
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-sm">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm font-semibold text-gray-700">Manuel seçim</span>
              </div>
              <Button 
                onClick={() => setShowProductSelector(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                <Plus size={18} className="mr-2" />
                Ürün Ekle
              </Button>
            </div>
          </div>
        </div>

        {/* Bilgi Kartı */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Yeni Vitrin Sistemi</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Artık manuel olarak ürün seçebilir ve vitrine ekleyebilirsiniz</p>
                  <p>• Ürünlerin sırasını değiştirebilir, istediğiniz zaman kaldırabilirsiniz</p>
                  <p>• Ana sayfada seçtiğiniz ürünler görüntülenir</p>
                  <p>• Maksimum 8 ürün vitrine ekleyebilirsiniz</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vitrin Ürünleri */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-orange-50/80">
            <h2 className="text-xl font-bold text-gray-900">
              Mevcut Vitrin Ürünleri ({featuredProducts.length}/8)
            </h2>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
              </div>
            ) : featuredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Star size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz vitrin ürünü yok</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">İlk vitrin ürününüzü ekleyerek başlayın</p>
                <Button 
                  onClick={() => setShowProductSelector(true)}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                >
                  <Plus size={16} className="mr-2" />
                  İlk Ürünü Ekle
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.map((featured, index) => {
                  const product = featured.product
                  const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                  
                  return (
                    <div key={featured.id} className="group bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                      <div className="relative">
                        <div className="aspect-[3/4] bg-gray-100">
                          {primaryImage ? (
                            <img 
                              src={primaryImage.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package size={32} />
                            </div>
                          )}
                        </div>
                        
                        {/* Sıra numarası */}
                        <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        
                        {/* Kaldır butonu */}
                        <button
                          onClick={() => removeFromFeatured(featured.id)}
                          disabled={saving}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-orange-900 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">{product.category?.name}</p>
                        <p className="font-bold text-orange-600">{product.price} ₺</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ürün Seçici Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-orange-50/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                      <Plus className="text-white" size={20} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Vitrine Ürün Ekle</h2>
                      <p className="text-sm text-gray-600">Listeden ürün seçin</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProductSelector(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Arama */}
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/30 transition-all duration-200 placeholder-gray-500"
                  />
                </div>
                
                {/* Ürün Listesi */}
                <div className="max-h-96 overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Tüm ürünler vitrine eklenmiş'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {availableProducts.map((product) => {
                        const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                        
                        return (
                          <div key={product.id} className="group bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer"
                               onClick={() => addToFeatured(product.id)}>
                            <div className="aspect-[3/4] bg-gray-100">
                              {primaryImage ? (
                                <img 
                                  src={primaryImage.image_url} 
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package size={24} />
                                </div>
                              )}
                            </div>
                            
                            <div className="p-3">
                              <h3 className="font-semibold text-xs line-clamp-2 mb-1 group-hover:text-orange-900 transition-colors">
                                {product.name}
                              </h3>
                              <p className="text-xs text-gray-600 mb-1">{product.category?.name}</p>
                              <p className="font-bold text-xs text-orange-600">{product.price} ₺</p>
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="bg-white/90 rounded-full p-2">
                                <Plus size={16} className="text-orange-600" />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
