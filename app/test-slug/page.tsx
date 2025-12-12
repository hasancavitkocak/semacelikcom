'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSlugPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug')
        .limit(5)

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Slug Test</h1>
      <div className="space-y-2">
        {products.map(product => (
          <div key={product.id} className="border p-4 rounded">
            <p><strong>ID:</strong> {product.id}</p>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Slug:</strong> {product.slug || 'NULL'}</p>
            <a 
              href={`/products/${product.slug || product.id}`}
              className="text-blue-600 hover:underline"
            >
              → Go to product
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}