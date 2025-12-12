'use client'

import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'

interface ImageZoomModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageAlt: string
  images?: Array<{ id: string; image_url: string; alt?: string }>
  currentIndex?: number
  onImageChange?: (index: number) => void
}

export default function ImageZoomModal({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  images = [],
  currentIndex = 0,
  onImageChange
}: ImageZoomModalProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // ESC tuşu ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && images.length > 1 && onImageChange) {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
        onImageChange(newIndex)
      }
      if (e.key === 'ArrowRight' && images.length > 1 && onImageChange) {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
        onImageChange(newIndex)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, images.length, currentIndex, onImageChange])

  // Modal açıldığında sıfırla
  useEffect(() => {
    if (isOpen) {
      setZoom(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen, currentIndex])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = imageAlt || 'image'
    link.click()
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom(prev => Math.max(1, Math.min(5, prev + delta))) // Minimum 1x (orijinal boyut)
  }

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1 && zoom > 1) {
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (!isOpen) return null

  const currentImage = images.length > 0 ? images[currentIndex] : { image_url: imageUrl, alt: imageAlt }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Arka plan - tıklayınca kapat */}
      <div 
        className="absolute inset-0 cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal İçeriği */}
      <div className="relative max-w-6xl max-h-[95vh] w-full flex items-center justify-center">
        {/* Ana Görsel Container */}
        <div 
          className="relative"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentImage.image_url}
            alt={currentImage.alt || imageAlt}
            className="max-w-full max-h-[95vh] transition-transform duration-200 select-none rounded-lg shadow-2xl"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
            }}
            draggable={false}
          />

          {/* Kapatma Butonu - Resmin Üstünde */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition backdrop-blur-sm"
            title="Kapat"
          >
            <X size={18} />
          </button>

          {/* Yan Navigasyon - Resmin Üstünde */}
          {images.length > 1 && onImageChange && (
            <>
              <button
                onClick={() => onImageChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition backdrop-blur-sm"
                title="Önceki"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => onImageChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition backdrop-blur-sm"
                title="Sonraki"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Galeri Navigasyonu - Resmin Üstünde */}
          {images.length > 1 && onImageChange && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                {images.map((img, index) => (
                  <button
                    key={img.id || index}
                    onClick={() => onImageChange(index)}
                    className={`w-1.5 h-1.5 rounded-full transition ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}