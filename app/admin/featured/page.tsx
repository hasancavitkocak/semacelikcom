'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Plus, Search, X, Star, Package } from 'lucide-react'
import AdminHeader, { AdminHeaderButton } from '@/components/admin-header'

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

  // Vitrine ekli olmayan ürünleri filtrele
  const availableProducts = filteredProducts.filter(product => 
    !featuredProducts.some(fp => fp.product.id === product.id)
  )

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Vitrin Ürünleri"
        description={`${featuredProducts.length} vitrin ürünü`}
        actions={
          <AdminHeaderButton onClick={() => setShowProductSelector(true)} icon={Plus}>
            Ürün Ekle
          </AdminHeaderButton>
        }
      />

      {/* Bilgi Kartı */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="text-gray-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vitrin Sistemi</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• Manuel olarak ürün seçebilir ve vitrine ekleyebilirsiniz</p>
              <p>• Ürünlerin sırasını değiştirebilir, istediğiniz zaman kaldırabilirsiniz</p>
              <p>• Ana sayfada seçtiğiniz ürünler görüntülenir</p>
              <p>• Maksimum 8 ürün vitrine ekleyebilirsiniz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vitrin Ürünleri */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Mevcut Vitrin Ürünleri ({featuredProducts.length}/8)
          </h2>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-900"></div>
              <span className="ml-3 text-gray-600">Yükleniyor...</span>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Star size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz vitrin ürünü yok</h3>
              <p className="text-gray-600 mb-6">İlk vitrin ürününüzü ekleyerek başlayın</p>
              <AdminHeaderButton onClick={() => setShowProductSelector(true)} icon={Plus}>
                İlk Ürünü Ekle
              </AdminHeaderButton>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.map((featured, index) => {
                const product = featured.product
                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                
                return (
                  <div key={featured.id} className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    <div className="relative">
                      <div className="aspect-[3/4] bg-gray-100">
                        {primaryImage ? (
                          <img 
                            src={primaryImage.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package size={32} />
                          </div>
                        )}
                      </div>
                      
                      {/* Sıra numarası */}
                      <div className="absolute top-2 left-2 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      
                      {/* Kaldır butonu */}
                      <button
                        onClick={() => removeFromFeatured(featured.id)}
                        disabled={saving}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1 text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{product.category?.name}</p>
                      <p className="font-semibold text-gray-900">{product.price} ₺</p>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Vitrine Ürün Ekle</h2>
                  <p className="text-sm text-gray-600">Listeden ürün seçin</p>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                        <div 
                          key={product.id} 
                          className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                          onClick={() => addToFeatured(product.id)}
                        >
                          <div className="aspect-[3/4] bg-gray-100">
                            {primaryImage ? (
                              <img 
                                src={primaryImage.image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package size={24} />
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-medium text-xs line-clamp-2 mb-1 text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-600 mb-1">{product.category?.name}</p>
                            <p className="font-semibold text-xs text-gray-900">{product.price} ₺</p>
                          </div>
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white rounded-full p-2 shadow-lg">
                              <Plus size={16} className="text-gray-900" />
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
  )
}