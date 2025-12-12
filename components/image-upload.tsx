'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { quickCompress, compressProductImage, compressBannerImage } from '@/lib/image-compression'

interface ImageUploadProps {
  onImageUpload: (file: File, compressedUrl: string) => void
  maxSizeKB?: number
  quality?: number
  recommendedWidth?: number
  recommendedHeight?: number
  showDimensions?: boolean
  imageType?: 'product' | 'banner' | 'category' | 'general'
}

export default function ImageUpload({ 
  onImageUpload, 
  maxSizeKB = 500,
  quality = 0.8,
  recommendedWidth,
  recommendedHeight,
  showDimensions = false,
  imageType = 'general'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        
        img.onload = () => {
          // Boyutları kaydet
          setDimensions({ width: img.width, height: img.height })
          
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Maksimum boyut 1200px (daha küçük dosya boyutu için)
          const maxDimension = 1200
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Sıkıştırılmış görsel
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Görsel sıkıştırılamadı'))
              }
            },
            'image/jpeg',
            0.7 // Daha agresif sıkıştırma
          )
        }
      }
      
      reader.onerror = reject
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir görsel dosyası seçin')
      return
    }

    console.log('📁 Dosya seçildi:', file.name, Math.round(file.size / 1024), 'KB')
    setUploading(true)

    try {
      // 50KB üzeri tüm dosyaları sıkıştır
      if (file.size < 50 * 1024) {
        console.log('✅ Dosya çok küçük, direkt yükleniyor')
        const previewUrl = URL.createObjectURL(file)
        setPreview(previewUrl)
        onImageUpload(file, previewUrl)
      } else {
        console.log('🔄 Akıllı sıkıştırma başlatılıyor...', imageType)
        
        let result
        switch (imageType) {
          case 'product':
            result = await compressProductImage(file)
            break
          case 'banner':
          case 'category':
            result = await compressBannerImage(file)
            break
          default:
            result = await quickCompress(file)
        }
        
        console.log(`✅ Sıkıştırma tamamlandı: ${Math.round(result.originalSize / 1024)}KB → ${Math.round(result.compressedSize / 1024)}KB (%${result.compressionRatio} azalma)`)
        setPreview(result.url)
        setDimensions({ width: 0, height: 0 }) // Boyutlar sıkıştırma sonrası değişir
        
        onImageUpload(result.file, result.url)
      }
    } catch (error) {
      console.error('❌ Görsel yükleme hatası:', error)
      alert('Görsel yüklenirken bir hata oluştu: ' + (error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition text-center"
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={40} />
          <p className="text-gray-600">
            {uploading ? 'Yükleniyor...' : 'Görsel yüklemek için tıklayın'}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {imageType === 'product' && 'Ürün görseli max 200KB\'ye optimize edilecek'}
            {imageType === 'banner' && 'Banner görseli max 300KB\'ye optimize edilecek'}
            {imageType === 'category' && 'Kategori görseli max 300KB\'ye optimize edilecek'}
            {imageType === 'general' && 'Görsel otomatik olarak optimize edilecek'}
          </p>
          {recommendedWidth && recommendedHeight && (
            <p className="text-xs text-blue-600 mt-2">
              Önerilen: {recommendedWidth}x{recommendedHeight}px
            </p>
          )}
        </button>
      ) : (
        <div className="relative">
          <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          {dimensions && (
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {dimensions.width}x{dimensions.height}px
            </div>
          )}
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  )
}
