import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function SimpleProductTest({ params }: ProductPageProps) {
  const { slug } = await params

  try {
    console.log('Testing slug:', slug)
    
    // Basit query
    const { data: product, error } = await supabase
      .from('products')
      .select('id, name, slug, price, description')
      .eq('slug', slug)
      .single()

    console.log('Query result:', { product, error })

    if (error || !product) {
      console.log('Product not found')
      notFound()
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
        <p className="text-xl mb-2">Price: {product.price} ₺</p>
        <p className="text-gray-600 mb-4">Slug: {product.slug}</p>
        <p className="text-gray-600">ID: {product.id}</p>
        {product.description && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Description:</h3>
            <p>{product.description}</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error in simple test:', error)
    notFound()
  }
}