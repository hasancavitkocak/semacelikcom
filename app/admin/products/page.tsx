'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Edit, Search, Filter, MoreHorizontal, ExternalLink, Plus, ChevronDown, Star, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          variants:product_variants(id, stock),
          images:product_images(image_url, is_primary),
          product_categories(
            category:categories(name),
            is_primary
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Products loaded:', data)
      setProducts(data || [])
    } catch (error) {
      console.error('Load products error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.product_categories && product.product_categories.some((pc: any) => 
                           pc.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                         ))
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active)
    return matchesSearch && matchesStatus
  })

  console.log('Products:', products.length, 'Filtered:', filteredProducts.length)

  const getTotalStock = (variants: any[]) => {
    if (!variants || variants.length === 0) return 0
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('Ürün silindi!')
      loadProducts()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Ürün silinirken hata oluştu!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                    Ürün Yönetimi
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Toplam {filteredProducts.length} ürün • {products.filter(p => p.is_active).length} aktif
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-sm">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm font-semibold text-gray-700">+12% bu ay</span>
              </div>
              <Link href="/admin/products/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6">
                  <Plus size={18} className="mr-2" />
                  Yeni Ürün
                </Button>
              </Link>
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
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 placeholder-gray-500"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white/50 border border-gray-200/50 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all duration-200 cursor-pointer"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif Ürünler</option>
                    <option value="inactive">Pasif Ürünler</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <Button variant="outline" className="border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200">
                  <Filter size={16} className="mr-2" />
                  Filtreler
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Table */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {products.length === 0 ? 'Henüz ürün yok' : 'Arama sonucu bulunamadı'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {products.length === 0 ? 'İlk ürününüzü ekleyerek mağazanızı oluşturmaya başlayın' : 'Farklı arama terimleri deneyin veya filtreleri temizleyin'}
              </p>
              {products.length === 0 && (
                <Link href="/admin/products/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3">
                    <Plus size={18} className="mr-2" />
                    İlk Ürünü Ekle
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-b border-gray-200/50">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[280px]">Ürün</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[140px]">Durum</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[80px]">ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[100px]">Marka</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[120px]">Kategori</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[120px]">Toplam Stok</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[120px]">Satış Fiyatı</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[140px]">Ekleme Tarihi</th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[140px]">Yayın Tarihi</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-[120px]">Eylemler</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/50">
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id} className="hover:bg-blue-50/30 transition-all duration-200 group">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative group/image">
                              {(() => {
                                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                                return primaryImage ? (
                                  <>
                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200 cursor-pointer">
                                      <img 
                                        src={primaryImage.image_url} 
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-300"
                                      />
                                    </div>
                                    {/* Hover Preview */}
                                    <div className="absolute left-16 top-1/2 -translate-y-1/2 z-50 opacity-0 invisible group-hover/image:opacity-100 group-hover/image:visible transition-all duration-300 pointer-events-none">
                                      <div className="w-64 h-80 rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white p-2">
                                        <img 
                                          src={primaryImage.image_url} 
                                          alt={product.name}
                                          className="w-full h-full object-contain rounded-xl"
                                        />
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                                    <Package size={20} className="text-blue-600" />
                                  </div>
                                )
                              })()}
                              {index < 3 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center z-10">
                                  <Star size={8} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">#{product.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full shadow-sm ${
                              product.is_active 
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                : 'bg-gradient-to-r from-gray-300 to-gray-400'
                            }`}></div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              product.is_active 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {product.is_active ? 'SEMACELIK' : 'PASIF'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {product.id.slice(-4)}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-semibold text-gray-900">SEMACELIK</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-medium text-gray-700 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                            {product.category?.name || 'Kategori yok'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-center">
                            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-blue-50 px-2 py-1 rounded-lg border border-indigo-100">
                              <span className="text-sm font-bold text-indigo-900">
                                {getTotalStock(product.variants)}
                              </span>
                              <div className="text-xs text-indigo-600 font-medium">
                                <div>Varyasyon</div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-sm text-gray-900">
                            {product.price.toFixed(2).replace('.', ',')} 
                            <span className="text-xs font-medium text-gray-500 ml-1">TRY</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs text-gray-600">
                            <div className="font-medium">
                              {new Date(product.created_at).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(product.created_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs text-gray-600">
                            <div className="font-medium">
                              {new Date(product.created_at).toLocaleDateString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(product.created_at).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <div className="relative group/menu">
                              <button className="p-1.5 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-sm">
                                <MoreHorizontal size={14} className="text-gray-600" />
                              </button>
                              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[120px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-20">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                                >
                                  🗑️ Sil
                                </button>
                              </div>
                            </div>
                            <Link href={`/admin/products/${product.id}`}>
                              <button className="p-1.5 hover:bg-blue-100 rounded-lg transition-all duration-200 hover:shadow-sm" title="Düzenle">
                                <Edit size={14} className="text-blue-600" />
                              </button>
                            </Link>
                            <Link href={`/products/${product.id}`} target="_blank">
                              <button className="p-1.5 hover:bg-indigo-100 rounded-lg transition-all duration-200 hover:shadow-sm" title="Ürünü Görüntüle">
                                <ExternalLink size={14} className="text-indigo-600" />
                              </button>
                            </Link>
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
              {filteredProducts.map((product, index) => (
                <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-5 hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {(() => {
                        const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                        return primaryImage ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                            <img 
                              src={primaryImage.image_url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                            <Package size={24} className="text-blue-600" />
                          </div>
                        )
                      })()}
                      {index < 3 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center z-10">
                          <Star size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate text-lg">{product.name}</h3>
                          <p className="text-sm text-gray-500 font-mono">#{product.id.slice(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Link href={`/admin/products/${product.id}`}>
                            <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                              <Edit size={16} className="text-blue-600" />
                            </button>
                          </Link>
                          <Link href={`/products/${product.id}`} target="_blank">
                            <button className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
                              <ExternalLink size={16} className="text-indigo-600" />
                            </button>
                          </Link>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                          <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">Durum</span>
                          <div className="flex items-center mt-1">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              product.is_active ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <span className={`text-sm font-bold ${
                              product.is_active ? 'text-green-700' : 'text-gray-500'
                            }`}>
                              {product.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                          <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Kategori</span>
                          <p className="font-bold text-blue-900 mt-1 text-sm">
                            {product.category?.name || 'Kategori yok'}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                          <span className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Fiyat</span>
                          <p className="font-bold text-purple-900 mt-1">
                            {product.price.toFixed(2).replace('.', ',')} TRY
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-100">
                          <span className="text-xs text-orange-600 font-semibold uppercase tracking-wide">Stok</span>
                          <p className="font-bold text-orange-900 mt-1">
                            {getTotalStock(product.variants)} adet
                          </p>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-200/50">
                        <p className="text-xs text-gray-500 font-medium">
                          Eklendi: {new Date(product.created_at).toLocaleDateString('tr-TR')} • {new Date(product.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Premium Pagination */}
            <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/80 to-blue-50/80 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 font-medium">
                  Toplam <span className="font-bold text-gray-900">{filteredProducts.length}</span> ürün • 
                  <span className="font-bold text-green-600"> {products.filter(p => p.is_active).length}</span> aktif
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                    ← Önceki
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold shadow-sm">1</span>
                    <span className="px-3 py-2 text-sm text-gray-500 hover:bg-white rounded-lg transition-colors cursor-pointer">2</span>
                    <span className="px-3 py-2 text-sm text-gray-500 hover:bg-white rounded-lg transition-colors cursor-pointer">3</span>
                  </div>
                  <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200">
                    Sonraki →
                  </button>
                  <select className="ml-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:shadow-sm transition-all duration-200 cursor-pointer">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
