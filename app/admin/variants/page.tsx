'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'

export default function AdminVariantsPage() {
  const [colors, setColors] = useState<any[]>([])
  const [sizes, setSizes] = useState<any[]>([])
  const [showColorForm, setShowColorForm] = useState(false)
  const [showSizeForm, setShowSizeForm] = useState(false)
  const [colorForm, setColorForm] = useState({ id: '', name: '', hexCode: '#000000' })
  const [sizeForm, setSizeForm] = useState({ id: '', name: '', category: '' })
  const [loading, setLoading] = useState(false)
  const [editingColor, setEditingColor] = useState(false)
  const [editingSize, setEditingSize] = useState(false)

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
  }

  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingColor && colorForm.id) {
        // Güncelleme
        const { error } = await supabase
          .from('colors')
          .update({ name: colorForm.name, hex_code: colorForm.hexCode })
          .eq('id', colorForm.id)
        
        if (error) throw error
        alert('Renk güncellendi!')
      } else {
        // Yeni ekleme
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
        // Güncelleme
        const { error } = await supabase
          .from('sizes')
          .update({ name: sizeForm.name, category: sizeForm.category })
          .eq('id', sizeForm.id)
        
        if (error) throw error
        alert('Beden güncellendi!')
      } else {
        // Yeni ekleme
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

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Renk & Beden Yönetimi</h1>
        <p className="text-gray-600 mt-1">Ürünleriniz için renk ve beden tanımları oluşturun</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Renkler */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Renkler</h2>
            <Button 
              onClick={() => {
                if (showColorForm) {
                  setShowColorForm(false)
                  setEditingColor(false)
                  setColorForm({ id: '', name: '', hexCode: '#000000' })
                } else {
                  setShowColorForm(true)
                }
              }} 
              size="sm"
              className="bg-gray-900 hover:bg-black text-white font-medium"
            >
              {showColorForm ? 'İptal' : '+ Yeni Renk'}
            </Button>
          </div>

          {showColorForm && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <form onSubmit={handleColorSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="colorName" className="text-sm font-medium text-gray-900">Renk Adı</Label>
                  <Input 
                    id="colorName" 
                    placeholder="Örn: Siyah" 
                    value={colorForm.name}
                    onChange={(e) => setColorForm({...colorForm, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="hexCode" className="text-sm font-medium text-gray-900">Renk Kodu</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      id="hexCode" 
                      placeholder="#000000" 
                      value={colorForm.hexCode}
                      onChange={(e) => setColorForm({...colorForm, hexCode: e.target.value})}
                      required
                    />
                    <input 
                      type="color" 
                      className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                      value={colorForm.hexCode}
                      onChange={(e) => setColorForm({...colorForm, hexCode: e.target.value})}
                    />
                  </div>
                </div>
                <Button type="submit" size="sm" disabled={loading} className="bg-gray-900 hover:bg-black text-white font-medium">
                  {loading ? (editingColor ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingColor ? 'Güncelle' : 'Kaydet')}
                </Button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Renk</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Kod</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {colors.map((color) => (
                    <tr key={color.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: color.hex_code }}
                          />
                          <span className="font-medium text-gray-900">{color.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{color.hex_code}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editColor(color)}
                            className="border-gray-300"
                          >
                            Düzenle
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteColor(color.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bedenler */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Bedenler</h2>
            <Button 
              onClick={() => {
                if (showSizeForm) {
                  setShowSizeForm(false)
                  setEditingSize(false)
                  setSizeForm({ id: '', name: '', category: '' })
                } else {
                  setShowSizeForm(true)
                }
              }} 
              size="sm"
              className="bg-gray-900 hover:bg-black text-white font-medium"
            >
              {showSizeForm ? 'İptal' : '+ Yeni Beden'}
            </Button>
          </div>

          {showSizeForm && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <form onSubmit={handleSizeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="sizeName" className="text-sm font-medium text-gray-900">Beden</Label>
                  <Input 
                    id="sizeName" 
                    placeholder="Örn: M, 38" 
                    value={sizeForm.name}
                    onChange={(e) => setSizeForm({...sizeForm, name: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sizeCategory" className="text-sm font-medium text-gray-900">Kategori</Label>
                  <select 
                    id="sizeCategory"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    value={sizeForm.category}
                    onChange={(e) => setSizeForm({...sizeForm, category: e.target.value})}
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="Üst Giyim">Üst Giyim</option>
                    <option value="Alt Giyim">Alt Giyim</option>
                    <option value="Ayakkabı">Ayakkabı</option>
                    <option value="Ev Tekstili">Ev Tekstili</option>
                  </select>
                </div>
                <Button type="submit" size="sm" disabled={loading} className="bg-gray-900 hover:bg-black text-white font-medium">
                  {loading ? (editingSize ? 'Güncelleniyor...' : 'Kaydediliyor...') : (editingSize ? 'Güncelle' : 'Kaydet')}
                </Button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Beden</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Kategori</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sizes.map((size) => (
                    <tr key={size.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{size.name}</td>
                      <td className="px-6 py-4 text-gray-600">{size.category}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => editSize(size)}
                            className="border-gray-300"
                          >
                            Düzenle
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => deleteSize(size.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Sil
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
