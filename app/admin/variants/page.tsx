'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { Palette, Plus, Edit, Trash2, Search, Filter, TrendingUp, Ruler, Tag, MoreHorizontal } from 'lucide-react'

export default function AdminVariantsPage() {
  const [colors, setColors] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [filteredColors, setFilteredColors] = useState<any[]>([])
  const [filteredSizes, setFilteredSizes] = useState<any[]>([])
  const [showColorForm, setShowColorForm] = useState(false)
  const [showSizeForm, setShowSizeForm] = useState(false)
  const [colorForm, setColorForm] = useState({ id: '', name: '', hexCode: '#000000' })
  const [sizeForm, setSizeForm] = useState({ id: '', name: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [editingColor, setEditingColor] = useState(false)
  const [editingSize, setEditingSize] = useState(false)
  const [colorSearch, setColorSearch] = useState('')
  const [sizeSearch, setSizeSearch] = useState('')
  const [sizeFilter, setSizeFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: colorsData } = await supabase
      .from('colors')
      .select('*')
      .order('name')
    
    const { data: sizesData } = await supabase
      .from('sizes')
      .select('*')
      .order('name')
    
    setColors(colorsData || [])
    setSizes(sizesData || [])
    setFilteredColors(colorsData || [])
    setFilteredSizes(sizesData || [])
  }

  // Arama ve filtreleme
  useEffect(() => {
    let filtered = colors.filter(color => 
      color.name.toLowerCase().includes(colorSearch.toLowerCase())
    )
    setFilteredColors(filtered)
  }, [colors, colorSearch])

  useEffect(() => {
    let filtered = sizes.filter(size => {
      const matchesSearch = size.name.toLowerCase().includes(sizeSearch.toLowerCase())
      const matchesFilter = !sizeFilter || size.category === sizeFilter
      return matchesSearch && matchesFilter
    })
    setFilteredSizes(filtered)
  }, [sizes, sizeSearch, sizeFilter])

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingColor && colorForm.id) {
        const { error } = await supabase
          .from('colors')
          .update({ name: colorForm.name, hex_code: colorForm.hexCode })
          .eq('id', colorForm.id)
        
        if (error) throw error
        alert('Renk güncellendi!')
      } else {
        const { error } = await supabase
          .from('colors')
          .insert([{ name: colorForm.name, hex_code: colorForm.hexCode }])
        
        if (error) throw error
        alert('Renk eklendi!')
      }
      
      setColorForm({ id: '', name: '', hexCode: '#000000' })
      setShowColorForm(false)
      setEditingColor(false)
      loadData()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const editColor = (color: any) => {
    setColorForm({ id: color.id, name: color.name, hexCode: color.hex_code })
    setEditingColor(true)
    setShowColorForm(true)
  }

  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingSize && sizeForm.id) {
        const { error } = await supabase
          .from('sizes')
          .update({ name: sizeForm.name, category: sizeForm.category })
          .eq('id', sizeForm.id)
        
        if (error) throw error
        alert('Beden güncellendi!')
      } else {
        const { error } = await supabase
          .from('sizes')
          .insert([{ name: sizeForm.name, category: sizeForm.category }])
        
        if (error) throw error
        alert('Beden eklendi!')
      }
      
      setSizeForm({ id: '', name: '', category: '' })
      setShowSizeForm(false)
      setEditingSize(false)
      loadData()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const editSize = (size: any) => {
    setSizeForm({ id: size.id, name: size.name, category: size.category })
    setEditingSize(true)
    setShowSizeForm(true)
  }

  const deleteColor = async (id: string) => {
    if (!confirm('Bu rengi silmek istediğinizden emin misiniz?')) return
    
    try {
      const { error } = await supabase
        .from('colors')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Renk silindi!')
      loadData()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const deleteSize = async (id: string) => {
    if (!confirm('Bu bedeni silmek istediğinizden emin misiniz?')) return
    
    try {
      const { error } = await supabase
        .from('sizes')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      alert('Beden silindi!')
      loadData()
    } catch (error: any) {
      alert('Hata: ' + error.message)
    }
  }

  const handleCancel = () => {
    setShowColorForm(false)
    setShowSizeForm(false)
    setEditingColor(false)
    setEditingSize(false)
    setColorForm({ id: '', name: '', hexCode: '#000000' })
    setSizeForm({ id: '', name: '', category: '' })
  }

  return (
    <div className="space-y-6">
      {/* Sade Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Renk & Beden Yönetimi</h1>
        <p className="text-gray-600">
          {colors.length} renk • {sizes.length} beden tanımlı
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Renkler Bölümü */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Palette className="text-gray-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Renkler</h2>
                <p className="text-gray-600 text-sm">{filteredColors.length} renk</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowColorForm(!showColorForm)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
            >
              <Plus size={16} className="mr-2" />
              {showColorForm ? 'İptal' : 'Yeni Renk'}
            </Button>
          </div>

          {/* Arama */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Renk ara..."
              value={colorSearch}
              onChange={(e) => setColorSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          {/* Renk Formu */}
          {showColorForm && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <form onSubmit={handleColorSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Renk Adı</Label>
                    <Input 
                      placeholder="Örn: Siyah, Beyaz, Kırmızı" 
                      value={colorForm.name}
                      onChange={(e) => setColorForm({...colorForm, name: e.target.value})}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Renk Kodu</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="#000000" 
                        value={colorForm.hexCode}
                        onChange={(e) => setColorForm({...colorForm, hexCode: e.target.value})}
                        required
                        className="border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      />
                      <input 
                        type="color" 
                        className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                        value={colorForm.hexCode}
                        onChange={(e) => setColorForm({...colorForm, hexCode: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {loading ? (editingColor ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingColor ? 'Güncelle' : 'Kaydet')}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Renkler Listesi */}
          <div className="space-y-3">
            {filteredColors.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Palette size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz renk yok</h3>
                <p className="text-gray-600 mb-4">İlk renginizi ekleyerek başlayın</p>
                <Button 
                  onClick={() => setShowColorForm(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
                >
                  <Plus size={16} className="mr-2" />
                  İlk Rengi Ekle
                </Button>
              </div>
            ) : (
              filteredColors.map((color) => (
                <div key={color.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg border border-gray-300"
                      style={{ backgroundColor: color.hex_code }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{color.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{color.hex_code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => editColor(color)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                      title="Düzenle"
                    >
                      <Edit size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => deleteColor(color.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bedenler Bölümü */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Ruler className="text-gray-600" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Bedenler</h2>
                <p className="text-gray-600 text-sm">{filteredSizes.length} beden</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowSizeForm(!showSizeForm)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
            >
              <Plus size={16} className="mr-2" />
              {showSizeForm ? 'İptal' : 'Yeni Beden'}
            </Button>
          </div>

          {/* Arama ve Filtre */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Beden ara..."
                value={sizeSearch}
                onChange={(e) => setSizeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={sizeFilter}
                onChange={(e) => setSizeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="Üst Giyim">Üst Giyim</option>
                <option value="Alt Giyim">Alt Giyim</option>
                <option value="Ayakkabı">Ayakkabı</option>
                <option value="Ev Tekstili">Ev Tekstili</option>
              </select>
            </div>
          </div>

          {/* Beden Formu */}
          {showSizeForm && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
              <form onSubmit={handleSizeSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Beden Adı</Label>
                    <Input 
                      placeholder="Örn: S, M, L, 36, 38, 40" 
                      value={sizeForm.name}
                      onChange={(e) => setSizeForm({...sizeForm, name: e.target.value})}
                      required
                      className="border-gray-300 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Kategori</Label>
                    <select 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      value={sizeForm.category}
                      onChange={(e) => setSizeForm({...sizeForm, category: e.target.value})}
                      required
                    >
                      <option value="">Kategori Seçiniz</option>
                      <option value="Üst Giyim">Üst Giyim</option>
                      <option value="Alt Giyim">Alt Giyim</option>
                      <option value="Ayakkabı">Ayakkabı</option>
                      <option value="Ev Tekstili">Ev Tekstili</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {loading ? (editingSize ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingSize ? 'Güncelle' : 'Kaydet')}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    İptal
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Bedenler Listesi */}
          <div className="space-y-4">
            {filteredSizes.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Ruler size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz beden yok</h3>
                <p className="text-gray-600 mb-4">İlk bedeninizi ekleyerek başlayın</p>
                <Button 
                  onClick={() => setShowSizeForm(true)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
                >
                  <Plus size={16} className="mr-2" />
                  İlk Bedeni Ekle
                </Button>
              </div>
            ) : (
              // Kategorilere göre grupla
              [...new Set(filteredSizes.map(s => s.category))].map(category => (
                <div key={category} className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <Tag className="w-4 h-4 text-gray-600" />
                    {category}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {filteredSizes
                      .filter(size => size.category === category)
                      .map((size) => (
                        <div key={size.id} className="group bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                          <div className="text-center mb-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-900 font-medium text-sm mx-auto mb-2">
                              {size.name}
                            </div>
                          </div>
                          <div className="flex gap-1 justify-center">
                            <button 
                              onClick={() => editSize(size)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors" 
                              title="Düzenle"
                            >
                              <Edit size={12} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => deleteSize(size.id)}
                              className="p-1 hover:bg-red-50 rounded transition-colors"
                              title="Sil"
                            >
                              <Trash2 size={12} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}