'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function StorageCheckPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStorage()
  }, [])

  const checkStorage = async () => {
    const result: any = {
      buckets: [],
      productsBucket: null,
      canUpload: false,
      error: null
    }

    try {
      // Bucket listesi
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        result.error = 'Bucket listesi alınamadı: ' + bucketsError.message
      } else {
        result.buckets = buckets || []
        result.productsBucket = buckets?.find(b => b.id === 'products')
      }

      // Test upload
      if (result.productsBucket) {
        const testFile = new Blob(['test'], { type: 'text/plain' })
        const testFileName = `test-${Date.now()}.txt`
        
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(testFileName, testFile)
        
        if (!uploadError) {
          result.canUpload = true
          // Test dosyasını sil
          await supabase.storage.from('products').remove([testFileName])
        } else {
          result.uploadError = uploadError.message
        }
      }
    } catch (error: any) {
      result.error = error.message
    }

    setStatus(result)
    setLoading(false)
  }

  if (loading) {
    return <div className="p-8">Kontrol ediliyor...</div>
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Storage Durumu</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bucket Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {status.buckets.length === 0 ? (
            <p className="text-red-600">❌ Hiç bucket bulunamadı!</p>
          ) : (
            <ul className="space-y-2">
              {status.buckets.map((bucket: any) => (
                <li key={bucket.id} className="flex items-center gap-2">
                  <span className={bucket.id === 'products' ? 'text-green-600' : ''}>
                    {bucket.id === 'products' ? '✅' : '📦'} {bucket.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({bucket.public ? 'Public' : 'Private'})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Products Bucket</CardTitle>
        </CardHeader>
        <CardContent>
          {status.productsBucket ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ Products bucket mevcut</p>
              <p className="text-sm">Public: {status.productsBucket.public ? 'Evet ✅' : 'Hayır ❌'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600">❌ Products bucket bulunamadı!</p>
              <p className="text-sm text-gray-600">
                Supabase Dashboard → Storage → Create Bucket → "products" (Public: Yes)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Testi</CardTitle>
        </CardHeader>
        <CardContent>
          {status.canUpload ? (
            <p className="text-green-600">✅ Dosya yükleme çalışıyor!</p>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600">❌ Dosya yüklenemedi</p>
              {status.uploadError && (
                <p className="text-sm text-gray-600">Hata: {status.uploadError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {status.error && (
        <Card className="mt-6 border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">Hata</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{status.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
