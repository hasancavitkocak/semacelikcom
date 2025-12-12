'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function StorageDebugPage() {
  const [log, setLog] = useState<string[]>([])
  const [testing, setTesting] = useState(false)

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testStorage = async () => {
    setLog([])
    setTesting(true)
    
    try {
      addLog('🔍 Test başlıyor...')
      
      // 1. Auth kontrolü
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        addLog(`✅ Kullanıcı: ${user.email}`)
        addLog(`✅ Role: ${user.role}`)
      } else {
        addLog('❌ Kullanıcı giriş yapmamış!')
      }
      
      // 2. Bucket listesi
      addLog('🔍 Bucket listesi kontrol ediliyor...')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        addLog(`❌ Bucket listesi hatası: ${bucketsError.message}`)
      } else {
        addLog(`✅ ${buckets?.length || 0} bucket bulundu`)
        buckets?.forEach(b => {
          addLog(`  📦 ${b.name} (${b.public ? 'Public' : 'Private'})`)
        })
      }
      
      // 3. Products bucket kontrolü
      const productsBucket = buckets?.find(b => b.id === 'products')
      if (productsBucket) {
        addLog(`✅ Products bucket bulundu`)
        addLog(`  Public: ${productsBucket.public ? 'Evet' : 'Hayır'}`)
      } else {
        addLog(`❌ Products bucket bulunamadı!`)
        setTesting(false)
        return
      }
      
      // 4. Test dosyası oluştur
      addLog('🔍 Test dosyası oluşturuluyor...')
      const testContent = 'Test content ' + Date.now()
      const testBlob = new Blob([testContent], { type: 'text/plain' })
      const testFileName = `test/test-${Date.now()}.txt`
      
      addLog(`📝 Dosya adı: ${testFileName}`)
      addLog(`📦 Dosya boyutu: ${testBlob.size} bytes`)
      
      // 5. Upload testi
      addLog('🔍 Upload testi yapılıyor...')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('products')
        .upload(testFileName, testBlob, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        addLog(`❌ Upload hatası: ${uploadError.message}`)
        addLog(`❌ Hata kodu: ${uploadError.name}`)
        addLog(`❌ Detay: ${JSON.stringify(uploadError)}`)
      } else {
        addLog(`✅ Upload başarılı!`)
        addLog(`  Path: ${uploadData.path}`)
        
        // 6. Public URL al
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(testFileName)
        
        addLog(`✅ Public URL: ${publicUrl}`)
        
        // 7. Dosyayı sil
        addLog('🔍 Test dosyası siliniyor...')
        const { error: deleteError } = await supabase.storage
          .from('products')
          .remove([testFileName])
        
        if (deleteError) {
          addLog(`⚠️ Silme hatası: ${deleteError.message}`)
        } else {
          addLog(`✅ Test dosyası silindi`)
        }
      }
      
      addLog('🎉 Test tamamlandı!')
      
    } catch (error: any) {
      addLog(`❌ Beklenmeyen hata: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Storage Debug</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Storage Upload Testi</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testStorage} disabled={testing}>
            {testing ? 'Test Yapılıyor...' : 'Test Başlat'}
          </Button>
        </CardContent>
      </Card>

      {log.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Logları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
              {log.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
