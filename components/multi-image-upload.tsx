'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, GripVertical, Image as ImageIcon } from 'lucide-react'
import { compressProductImage } from '@/lib/image-compression'

interface UploadedImage {
  id: string
  file: File
  url: string
}

interface MultiImageUploadProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
}

export default function MultiImageUpload({ 
  images, 
  onImagesChange,
  maxImages = 20
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processImage = async (file: File): Promise<{ file: File; url: string }> => {
    // 30KB üzeri tüm dosyaları sıkıştır
    if (file.size < 30 * 1024) {
      const url = URL.createObjectURL(file)
      return { file, url }
    }

    // Ürün görseli için özel sıkıştırma (max 100KB)
    const result = await compressProductImage(file)
    return { file: result.file, url: result.url }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Maksimum görsel kontrolü
    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Maksimum ${maxImages} görsel ekleyebilirsiniz!`)
      return
    }

    const filesToProcess = files.slice(0, remainingSlots)
    if (files.length > remainingSlots) {
      alert(`Sadece ${remainingSlots} görsel daha ekleyebilirsiniz. İlk ${remainingSlots} görsel eklendi.`)
    }

    setUploading(true)

    try {
      const newImages: UploadedImage[] = []
      
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue
        
        const { file: processedFile, url } = await processImage(file)
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: processedFile,
          url
        })
      }
      
      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error('Görsel yükleme hatası:', error)
      alert('Görsel yüklenirken bir hata oluştu')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (id: string) => {
    onImagesChange(images.filter(img => img.id !== id))
  }

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only clear drag over if we're leaving the container entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null)
    }
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newImages = [...images]
    const [draggedItem] = newImages.splice(draggedIndex, 1)
    newImages.splice(dropIndex, 0, draggedItem)
    
    onImagesChange(newImages)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault()
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // File drop zone handlers
  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDropZoneDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Maksimum ${maxImages} görsel ekleyebilirsiniz!`)
      return
    }

    const filesToProcess = files.slice(0, remainingSlots)
    setUploading(true)

    try {
      const newImages: UploadedImage[] = []
      
      for (const file of filesToProcess) {
        const { file: processedFile, url } = await processImage(file)
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: processedFile,
          url
        })
      }
      
      onImagesChange([...images, ...newImages])
    } catch (error) {
      console.error('Görsel yükleme hatası:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        onDragOver={handleDropZoneDragOver}
        onDrop={handleDropZoneDrop}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${uploading 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-purple-400 bg-gradient-to-br from-gray-50 to-purple-50/30 hover:shadow-lg'
          }
        `}
      >
        <Upload className={`mx-auto mb-3 ${uploading ? 'text-blue-500 animate-bounce' : 'text-gray-400'}`} size={40} />
        <p className="text-gray-700 font-medium">
          {uploading ? 'Görseller yükleniyor...' : 'Görselleri seçmek için tıklayın'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          veya sürükleyip bırakın
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Birden fazla görsel seçebilirsiniz • Maksimum {maxImages} görsel
        </p>
        <p className="text-xs text-purple-600 mt-1 font-medium">
          🚀 Tüm görseller otomatik olarak 200KB'ye optimize edilecek
        </p>
        {images.length > 0 && (
          <p className="text-xs text-purple-600 mt-1 font-medium">
            {images.length}/{maxImages} görsel eklendi
          </p>
        )}
      </div>

      {/* Images Grid with Drag & Drop */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              Eklenen Görseller ({images.length})
            </p>
            <p className="text-xs text-gray-500">
              💡 Sıralamak için sürükleyin • İlk görsel ana görsel olur
            </p>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={(e) => handleDragEnd(e)}
                className={`
                  relative group cursor-grab active:cursor-grabbing
                  transition-all duration-200
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                  ${dragOverIndex === index && draggedIndex !== index ? 'scale-105' : ''}
                `}
              >
                <div className={`
                  aspect-square rounded-xl overflow-hidden border-2 bg-gray-50 shadow-sm
                  transition-all duration-200
                  ${index === 0 ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'}
                  ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 ring-2 ring-blue-200' : ''}
                  group-hover:shadow-lg group-hover:border-purple-300
                `}>
                  <img 
                    src={img.url} 
                    alt="" 
                    className="w-full h-full object-contain bg-gray-50 group-hover:scale-105 transition-transform duration-300"
                    draggable={false}
                  />
                </div>
                
                {/* Ana görsel badge */}
                {index === 0 && (
                  <span className="absolute top-1 left-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                    ANA
                  </span>
                )}
                
                {/* Sıra numarası */}
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                  {index + 1}
                </span>
                
                {/* Drag handle */}
                <div className="absolute top-1 right-7 bg-white/90 text-gray-600 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 shadow">
                  <GripVertical size={12} />
                </div>
                
                {/* Delete button */}
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); handleRemove(img.id); }} 
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
