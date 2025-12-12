'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function AdminFeaturedPage() {
  const [products, setProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

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

      // Vitrin ürünleri çek (en yeni 8 ürün)
      const { data: featured } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          images:product_images(image_url, is_primary)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8)

      setProducts(featured || [])
    } catch (error) {
      console.error('Load error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Vitrin Ürünler Yönetimi</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bilgi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Ana sayfada gösterilen vitrin ürünler, en son eklenen 8 aktif üründür.
            Ürünlerin sırasını değiştirmek için ürün ekleme tarihini güncelleyebilirsiniz.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Vitrin Ürünler ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-600">Henüz vitrin ürünü yok.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((product) => {
                const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0]
                return (
                  <div key={product.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-[3/4] bg-gray-100">
                      {primaryImage && (
                        <img 
                          src={primaryImage.image_url} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{product.category?.name}</p>
                      <p className="font-bold">{product.price} ₺</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Nasıl Çalışır?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Ana sayfada otomatik olarak en son eklenen 8 aktif ürün gösterilir</p>
            <p>• Yeni ürün eklediğinizde otomatik olarak vitrine eklenir</p>
            <p>• Ürünü vitrinden kaldırmak için "Pasif" yapabilirsiniz</p>
            <p>• Sıralamayı değiştirmek için ürünü düzenleyip tekrar kaydedin (updated_at güncellenir)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
