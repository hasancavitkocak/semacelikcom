export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
  format?: 'jpeg' | 'webp'
}

export interface CompressionResult {
  file: File
  url: string
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export async function compressImage(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.7,
    maxSizeKB = 300,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight)
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context oluşturulamadı'))
          return
        }

        // Daha iyi kalite için smoothing
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        // İlk sıkıştırma denemesi
        compressWithQuality(canvas, format, quality, maxSizeKB * 1024)
          .then(blob => {
            const compressedFile = new File([blob], getFileName(file.name, format), { 
              type: format === 'jpeg' ? 'image/jpeg' : 'image/webp' 
            })
            const url = URL.createObjectURL(blob)
            
            resolve({
              file: compressedFile,
              url,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: Math.round((1 - blob.size / file.size) * 100)
            })
          })
          .catch(reject)
      }
      
      img.onerror = () => reject(new Error('Görsel yüklenemedi'))
    }
    
    reader.onerror = () => reject(new Error('Dosya okunamadı'))
  })
}

function calculateDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth
  let height = originalHeight
  
  // Orantılı küçültme
  if (width > maxWidth) {
    height = (height * maxWidth) / width
    width = maxWidth
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height
    height = maxHeight
  }
  
  return { width: Math.round(width), height: Math.round(height) }
}

async function compressWithQuality(
  canvas: HTMLCanvasElement, 
  format: 'jpeg' | 'webp', 
  initialQuality: number, 
  maxSizeBytes: number
): Promise<Blob> {
  let quality = initialQuality
  let blob: Blob | null = null
  
  // Kaliteyi düşürerek hedef boyuta ulaşmaya çalış
  for (let attempt = 0; attempt < 5; attempt++) {
    blob = await new Promise<Blob | null>(resolve => {
      canvas.toBlob(
        resolve,
        format === 'jpeg' ? 'image/jpeg' : 'image/webp',
        quality
      )
    })
    
    if (!blob) {
      throw new Error('Blob oluşturulamadı')
    }
    
    if (blob.size <= maxSizeBytes || quality <= 0.1) {
      break
    }
    
    // Kaliteyi %20 düşür
    quality = Math.max(0.1, quality - 0.2)
  }
  
  if (!blob) {
    throw new Error('Sıkıştırma başarısız')
  }
  
  return blob
}

function getFileName(originalName: string, format: 'jpeg' | 'webp'): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '')
  return `${nameWithoutExt}.${format === 'jpeg' ? 'jpg' : 'webp'}`
}

// Hızlı sıkıştırma için basit fonksiyon
export async function quickCompress(file: File): Promise<CompressionResult> {
  // Çok agresif sıkıştırma - web için optimize
  let options: CompressionOptions = {}
  
  if (file.size > 3 * 1024 * 1024) { // 3MB+
    options = { maxWidth: 800, maxHeight: 800, quality: 0.75, maxSizeKB: 150 }
  } else if (file.size > 1 * 1024 * 1024) { // 1MB+
    options = { maxWidth: 1000, maxHeight: 1000, quality: 0.8, maxSizeKB: 180 }
  } else if (file.size > 500 * 1024) { // 500KB+
    options = { maxWidth: 1200, maxHeight: 1200, quality: 0.82, maxSizeKB: 200 }
  } else if (file.size > 200 * 1024) { // 200KB+
    options = { maxWidth: 1400, maxHeight: 1400, quality: 0.85, maxSizeKB: 220 }
  } else {
    // Zaten küçük dosyalar için minimal sıkıştırma
    options = { maxWidth: 1600, maxHeight: 1600, quality: 0.88, maxSizeKB: 250 }
  }
  
  return compressImage(file, options)
}

// Ürün görselleri için özel sıkıştırma
export async function compressProductImage(file: File): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 0.8,
    maxSizeKB: 200, // Ürün görselleri max 200KB (daha iyi kalite)
    format: 'jpeg'
  })
}

// Banner/kategori görselleri için özel sıkıştırma  
export async function compressBannerImage(file: File): Promise<CompressionResult> {
  return compressImage(file, {
    maxWidth: 1400,
    maxHeight: 800,
    quality: 0.82,
    maxSizeKB: 300, // Banner görselleri max 300KB (daha iyi kalite)
    format: 'jpeg'
  })
}