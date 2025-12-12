'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Menu, Plus, Edit, Search, Filter, TrendingUp, MoreHorizontal, ChevronDown, ChevronRight, Layers, List } from 'lucide-react'
import ToggleSwitch from '@/components/toggle-switch'

export default function AdminMenusPage() {
  const [menus, setMenus] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    icon: '',
    display_order: 0,
    is_active: true,
    show_in_header: true,
    show_in_footer: false,
    redirect_category_id: ''
  })
  const [itemFormData, setItemFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    display_order: 0,
    is_active: true
  })

  useEffect(() => {
    loadMenus()
    loadCategories()
  }, [])

  const loadMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select(`
          *,
          menu_items:menu_items(
            *,
            category:categories(name, slug)
          )
        `)
        .order('display_order')

      if (error) throw error
      setMenus(data || [])
    } catch (error) {
      console.error('Load menus error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Load categories error:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        const { error } = await supabase
          .from('menus')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)

        if (error) throw error
        alert('✅ Menü başarıyla güncellendi!')
      } else {
        const { error } = await supabase
          .from('menus')
          .insert([formData])

        if (error) throw error
        alert('✅ Menü başarıyla eklendi!')
      }

      setFormData({ name: '', slug: '', description: '', icon: '', display_order: 0, is_active: true, show_in_header: true, show_in_footer: false, redirect_category_id: '' })
      setEditingId(null)
      setShowForm(false)
      loadMenus()
    } catch (error: any) {
      console.error('Save menu error:', error)
      alert('❌ Hata: ' + (error.message || 'Bilinmeyen hata'))
    }
  }

  const handleEdit = (menu: any) => {
    setFormData({
      name: menu.name,
      slug: menu.slug,
      description: menu.description || '',
      icon: menu.icon || '',
      display_order: menu.display_order || 0,
      is_active: menu.is_active !== false,
      show_in_header: menu.show_in_header !== false,
      show_in_footer: menu.show_in_footer || false,
      redirect_category_id: menu.redirect_category_id || ''
    })
    setEditingId(menu.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setFormData({ name: '', slug: '', description: '', icon: '', display_order: 0, is_active: true, show_in_header: true, show_in_footer: false, redirect_category_id: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menüyü silmek istediğinizden emin misiniz? Kategoriler de silinecektir.')) return

    try {
      const { error } = await supabase
        .from('menus')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Menü silindi!')
      loadMenus()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Menü silinirken hata oluştu!')
    }
  }

  // Menu Item Functions
  const handleAddMenuItem = (menuId: string) => {
    const menu = menus.find(m => m.id === menuId)
    const nextOrder = menu?.menu_items ? Math.max(...menu.menu_items.map((item: any) => item.display_order ?? 0)) + 1 : 1
    
    setSelectedMenuId(menuId)
    setItemFormData({
      name: '',
      slug: '',
      description: '',
      category_id: '',
      display_order: nextOrder,
      is_active: true
    })
    setEditingItemId(null)
    setShowItemForm(true)
  }

  const handleEditMenuItem = (item: any) => {
    setSelectedMenuId(item.menu_id)
    setItemFormData({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      category_id: item.category_id || '',
      display_order: item.display_order || 0,
      is_active: item.is_active !== false
    })
    setEditingItemId(item.id)
    setShowItemForm(true)
  }

  const handleSubmitMenuItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const itemData = {
        ...itemFormData,
        menu_id: selectedMenuId
      }

      if (editingItemId) {
        const { error } = await supabase
          .from('menu_items')
          .update({
            ...itemData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItemId)

        if (error) throw error
        alert('✅ Alt kategori başarıyla güncellendi!')
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert([itemData])

        if (error) throw error
        alert('✅ Alt kategori başarıyla eklendi!')
      }

      setItemFormData({
        name: '',
        slug: '',
        description: '',
        category_id: '',
        display_order: 0,
        is_active: true
      })
      setEditingItemId(null)
      setSelectedMenuId(null)
      setShowItemForm(false)
      loadMenus()
    } catch (error: any) {
      console.error('Save menu item error:', error)
      alert('❌ Hata: ' + (error.message || 'Bilinmeyen hata'))
    }
  }

  const handleCancelMenuItem = () => {
    setItemFormData({
      name: '',
      slug: '',
      description: '',
      category_id: '',
      display_order: 0,
      is_active: true
    })
    setEditingItemId(null)
    setSelectedMenuId(null)
    setShowItemForm(false)
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Bu alt kategoriyi silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Alt kategori silindi!')
      loadMenus()
    } catch (error) {
      console.error('Delete menu item error:', error)
      alert('Alt kategori silinirken hata oluştu!')
    }
  }

  // Kategori seçildiğinde otomatik ad ve slug doldur
  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat.id === categoryId)
    if (selectedCategory) {
      setItemFormData({
        ...itemFormData,
        category_id: categoryId,
        name: selectedCategory.name,
        slug: selectedCategory.slug
      })
    } else {
      setItemFormData({
        ...itemFormData,
        category_id: categoryId
      })
    }
  }

  const handleToggleActive = async (menuId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('menus')
        .update({ is_active: !currentStatus })
        .eq('id', menuId)

      if (error) throw error
      
      setMenus(menus.map(menu => 
        menu.id === menuId ? { ...menu, is_active: !currentStatus } : menu
      ))
    } catch (error) {
      console.error('Toggle active error:', error)
      alert('Durum değiştirilirken hata oluştu!')
    }
  }

  const toggleMenuExpansion = (menuId: string) => {
    const newExpanded = new Set(expandedMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMenus(newExpanded)
  }

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMenuItemCount = (menu: any) => {
    return menu.menu_items?.length || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Menu className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-800 bg-clip-text text-transparent">
                    Menü Yönetimi
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Toplam {filteredMenus.length} menü
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 shadow-sm">
                <TrendingUp className="text-green-600" size={16} />
                <span className="text-sm font-semibold text-gray-700">Hiyerarşik yapı</span>
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
              >
                <Plus size={18} className="mr-2" />
                Yeni Menü
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
                  placeholder="Menü ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200 placeholder-gray-500"
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

        {/* Menu Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  {editingId ? <Edit className="text-white" size={20} /> : <Plus className="text-white" size={20} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? 'Menü Düzenle' : 'Yeni Menü Ekle'}
                  </h2>
                  <p className="text-sm text-gray-500">Menü bilgilerini girin</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Menü Adı *</Label>
                    <Input 
                      placeholder="Örn: Giyim"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Slug *</Label>
                    <Input 
                      placeholder="Örn: giyim"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      required
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">İkon (Lucide)</Label>
                    <Input 
                      placeholder="Örn: Shirt, Watch, Footprints"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">Sıralama</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
                      className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Açıklama</Label>
                  <textarea
                    placeholder="Menü açıklaması (opsiyonel)"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border border-gray-200/50 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Yönlendirme Kategorisi</Label>
                  <select
                    value={formData.redirect_category_id}
                    onChange={(e) => setFormData({...formData, redirect_category_id: e.target.value})}
                    className="w-full border border-gray-200/50 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/30 transition-all duration-200"
                  >
                    <option value="">Yönlendirme yok (alt kategoriler gösterilir)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Seçilirse menüye tıklandığında direkt bu kategoriye yönlendirir</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200">
                      <ToggleSwitch
                        checked={formData.is_active}
                        onChange={(checked) => setFormData({...formData, is_active: checked})}
                        color="green"
                        size="md"
                      />
                      <div>
                        <span className="font-semibold text-green-800">Aktif</span>
                        <p className="text-sm text-green-600">Menü görünür</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-200">
                      <input 
                        type="checkbox" 
                        checked={formData.show_in_header} 
                        onChange={(e) => setFormData({...formData, show_in_header: e.target.checked})} 
                        className="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <div>
                        <span className="font-semibold text-blue-800">Header'da</span>
                        <p className="text-sm text-blue-600">Üst menüde göster</p>
                      </div>
                    </label>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                      <input 
                        type="checkbox" 
                        checked={formData.show_in_footer} 
                        onChange={(e) => setFormData({...formData, show_in_footer: e.target.checked})} 
                        className="w-5 h-5 rounded border-gray-300 text-gray-600 focus:ring-gray-500" 
                      />
                      <div>
                        <span className="font-semibold text-gray-800">Footer'da</span>
                        <p className="text-sm text-gray-600">Alt menüde göster</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
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

        {/* Menu Item Form Modal */}
        {showItemForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  {editingItemId ? <Edit className="text-white" size={20} /> : <Plus className="text-white" size={20} />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingItemId ? 'Kategori Düzenle' : 'Menüye Kategori Ekle'}
                  </h2>
                  <p className="text-sm text-gray-500">Menüde gösterilecek kategoriyi seçin</p>
                </div>
              </div>

              <form onSubmit={handleSubmitMenuItem} className="space-y-6">
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Kategori Seç *</Label>
                  <select
                    value={itemFormData.category_id}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                    className="w-full border border-gray-200/50 rounded-xl px-4 py-3 bg-white/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
                  >
                    <option value="">Kategori seçin</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Kategori seçtiğinizde ad ve slug otomatik doldurulacak</p>
                </div>

                {itemFormData.category_id && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Seçilen Kategori:</h4>
                    <p className="text-blue-700"><strong>Ad:</strong> {itemFormData.name}</p>
                    <p className="text-blue-700"><strong>Slug:</strong> {itemFormData.slug}</p>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">Sıralama</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={itemFormData.display_order}
                    onChange={(e) => setItemFormData({...itemFormData, display_order: parseInt(e.target.value) || 0})}
                    className="bg-white/50 border-gray-200/50 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Küçük sayılar önce görünür (0, 1, 2...)</p>
                </div>

                <div>
                  <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 hover:shadow-md transition-all duration-200">
                    <ToggleSwitch
                      checked={itemFormData.is_active}
                      onChange={(checked) => setItemFormData({...itemFormData, is_active: checked})}
                      color="green"
                      size="md"
                    />
                    <div>
                      <span className="font-semibold text-green-800">Aktif</span>
                      <p className="text-sm text-green-600">Kategori menüde görünür</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 py-3"
                  >
                    {editingItemId ? 'Güncelle' : 'Kaydet'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelMenuItem}
                    className="px-8 border-gray-200/50 bg-white/50 hover:bg-white/80 transition-all duration-200"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Premium Menu Tree */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Menu size={32} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {menus.length === 0 ? 'Henüz menü yok' : 'Arama sonucu bulunamadı'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {menus.length === 0 ? 'İlk menünüzü ekleyerek başlayın' : 'Farklı arama terimleri deneyin'}
              </p>
              {menus.length === 0 && (
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                >
                  <Plus size={18} className="mr-2" />
                  İlk Menüyü Ekle
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {filteredMenus.map((menu, index) => (
                  <div key={menu.id} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                    {/* Ana Menü */}
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleMenuExpansion(menu.id)}
                          className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                        >
                          {expandedMenus.has(menu.id) ? (
                            <ChevronDown size={16} className="text-purple-600" />
                          ) : (
                            <ChevronRight size={16} className="text-purple-600" />
                          )}
                        </button>
                        
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                          <Layers size={20} className="text-purple-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-lg">{menu.name}</h3>
                            <span className="text-sm font-mono text-gray-500">/{menu.slug}</span>
                          </div>
                          {menu.description && (
                            <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`px-2 py-1 rounded-full font-semibold ${
                              menu.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {menu.is_active ? 'Aktif' : 'Pasif'}
                            </span>
                            {menu.show_in_header && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">Header</span>
                            )}
                            {menu.show_in_footer && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-semibold">Footer</span>
                            )}
                            <span className="text-gray-500">{getMenuItemCount(menu)} kategori</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ToggleSwitch
                            checked={menu.is_active !== false}
                            onChange={() => handleToggleActive(menu.id, menu.is_active !== false)}
                            color="green"
                            size="sm"
                          />
                          <button 
                            onClick={() => handleEdit(menu)}
                            className="p-2 hover:bg-purple-100 rounded-lg transition-colors" 
                            title="Düzenle"
                          >
                            <Edit size={16} className="text-purple-600" />
                          </button>
                          <div className="relative group">
                            <button className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
                              <MoreHorizontal size={16} className="text-gray-600" />
                            </button>
                            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl py-2 min-w-[120px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                              <button
                                onClick={() => handleDelete(menu.id)}
                                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                              >
                                🗑️ Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Kategoriler */}
                    {expandedMenus.has(menu.id) && (
                      <div className="border-t border-gray-200/50 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 p-5">
                        {menu.menu_items && menu.menu_items.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                <List size={16} />
                                Kategoriler ({menu.menu_items.length})
                              </h4>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs"
                                onClick={() => handleAddMenuItem(menu.id)}
                              >
                                <Plus size={14} className="mr-1" />
                                Kategori Ekle
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {menu.menu_items
                                .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
                                .map((item: any, index: number) => (
                                <div key={item.id} className="bg-white/70 rounded-lg p-4 border border-purple-100 hover:shadow-sm transition-all duration-200">
                                  <div className="flex items-center gap-3">
                                    {/* Sıralama Numarası */}
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {item.display_order ?? index + 1}
                                    </div>
                                    
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">#{item.display_order ?? 0}</span>
                                      </div>
                                      <p className="text-xs text-gray-500">/{item.slug}</p>
                                      {item.category && (
                                        <p className="text-xs text-purple-600 mt-1">→ {item.category.name}</p>
                                      )}
                                    </div>
                                    
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => handleEditMenuItem(item)}
                                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                                        title="Düzenle"
                                      >
                                        <Edit size={14} className="text-purple-600" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteMenuItem(item.id)}
                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                        title="Sil"
                                      >
                                        <MoreHorizontal size={14} className="text-red-600" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                              <List size={20} className="text-purple-600" />
                            </div>
                            <p className="text-gray-600 mb-3">Bu menüde henüz alt kategori yok</p>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddMenuItem(menu.id)}
                            >
                              <Plus size={14} className="mr-1" />
                              İlk Kategoriyi Ekle
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}