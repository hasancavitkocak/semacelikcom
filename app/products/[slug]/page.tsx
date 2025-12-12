import { notFound } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import ProductClient from './page-client'
import { supabase } from '@/lib/supabase'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params

  try {
    // Tek query'de tüm verileri çek
    let { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(id, image_url, is_primary),
        variants:product_variants(
          id, 
          stock, 
          color_id, 
          size_id,
          colors(id, name, hex_code),
          sizes(id, name, category)
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    // Eğer colors/sizes join çalışmazsa, ayrı çek
    if (product && product.variants?.length > 0) {
      const colorIds = [...new Set(product.variants.map((v: any) => v.color_id).filter(Boolean))]
      const sizeIds = [...new Set(product.variants.map((v: any) => v.size_id).filter(Boolean))]

      if (colorIds.length > 0 || sizeIds.length > 0) {
        const [colorsRes, sizesRes] = await Promise.all([
          colorIds.length > 0 ? supabase.from('colors').select('*').in('id', colorIds) : { data: [] },
          sizeIds.length > 0 ? supabase.from('sizes').select('*').in('id', sizeIds) : { data: [] }
        ])

        // Variants'a renk ve beden bilgilerini ekle
        product.variants = product.variants.map((v: any) => ({
          ...v,
          color: colorsRes.data?.find((c: any) => c.id === v.color_id),
          size: sizesRes.data?.find((s: any) => s.id === v.size_id)
        }))
      }
    }

    // Slug ile bulunamazsa UUID ile dene (backward compatibility)
    if (error && error.code === 'PGRST116') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(slug)) {
        const { data: productById, error: errorById } = await supabase
          .from('products')
          .select(`
            *,
            images:product_images(id, image_url, is_primary),
            variants:product_variants(id, stock, color_id, size_id)
          `)
          .eq('id', slug)
          .eq('is_active', true)
          .single()

        // Aynı renk/beden işlemini UUID için de yap
        if (productById && productById.variants?.length > 0) {
          const colorIds = [...new Set(productById.variants.map((v: any) => v.color_id).filter(Boolean))]
          const sizeIds = [...new Set(productById.variants.map((v: any) => v.size_id).filter(Boolean))]

          if (colorIds.length > 0 || sizeIds.length > 0) {
            const [colorsRes, sizesRes] = await Promise.all([
              colorIds.length > 0 ? supabase.from('colors').select('*').in('id', colorIds) : { data: [] },
              sizeIds.length > 0 ? supabase.from('sizes').select('*').in('id', sizeIds) : { data: [] }
            ])

            productById.variants = productById.variants.map((v: any) => ({
              ...v,
              color: colorsRes.data?.find((c: any) => c.id === v.color_id),
              size: sizesRes.data?.find((s: any) => s.id === v.size_id)
            }))
          }
        }

        if (errorById) {
          notFound()
        }
        product = productById
      } else {
        notFound()
      }
    } else if (error) {
      notFound()
    }

    if (!product) {
      notFound()
    }

    // Görüntülenme sayısını artır
    await supabase
      .from('products')
      .update({ view_count: (product.view_count || 0) + 1 })
      .eq('id', product.id)

    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <ProductClient product={product} />
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error('Product page error:', error)
    notFound()
  }
}

// SEO için metadata oluştur
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params

  try {
    const { data: product } = await supabase
      .from('products')
      .select('name, description, price, images:product_images(image_url, is_primary)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (!product) {
      return {
        title: 'Ürün Bulunamadı',
      }
    }

    const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url

    return {
      title: `${product.name} - Sema Çelik`,
      description: product.description || `${product.name} - ${product.price} ₺`,
      openGraph: {
        title: product.name,
        description: product.description,
        images: primaryImage ? [primaryImage] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: primaryImage ? [primaryImage] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Ürün Detayı',
    }
  }
}