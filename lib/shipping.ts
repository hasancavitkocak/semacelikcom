export interface ShippingOption {
  id: string
  name: string
  cost: number
  estimatedDays: string
  description: string
}

export interface ShippingCalculation {
  subtotal: number
  shippingCost: number
  total: number
  isFreeShipping: boolean
  freeShippingRemaining: number
  availableOptions: ShippingOption[]
  selectedOption: ShippingOption
}

// Cache için global değişken
let cachedSettings: any = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 dakika

// Kargo ayarlarını getir (API'den) - cache ile optimize edilmiş
export async function getShippingSettings() {
  // Cache kontrolü
  const now = Date.now()
  if (cachedSettings && (now - cacheTime) < CACHE_DURATION) {
    return cachedSettings
  }

  try {
    const response = await fetch('/api/shipping', {
      next: { revalidate: 300 } // 5 dakika cache
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch shipping settings')
    }
    
    const settings = await response.json()
    
    // Cache'e kaydet
    cachedSettings = settings
    cacheTime = now
    
    return settings
  } catch (error) {
    console.error('Shipping settings error:', error)
    // Fallback values
    const fallbackSettings = {
      freeShippingThreshold: 500,
      standardCost: 29.90,
      expressCost: 49.90,
      sameDayCost: 79.90,
      standardDays: '2-4',
      expressDays: '1-2',
      sameDayHours: '3-6',
      enableExpress: true,
      enableSameDay: false
    }
    
    // Fallback'i de cache'le
    if (!cachedSettings) {
      cachedSettings = fallbackSettings
      cacheTime = now
    }
    
    return fallbackSettings
  }
}

// Kargo hesaplama (API'den)
export async function calculateShipping(subtotal: number, selectedOption: string = 'standard'): Promise<ShippingCalculation> {
  try {
    const response = await fetch('/api/shipping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subtotal, selectedOption })
    })
    
    if (!response.ok) {
      throw new Error('Failed to calculate shipping')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Shipping calculation error:', error)
    
    // Fallback calculation
    const settings = await getShippingSettings()
    const isFreeShipping = subtotal >= settings.freeShippingThreshold && selectedOption === 'standard'
    const shippingCost = isFreeShipping ? 0 : settings.standardCost
    
    return {
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      isFreeShipping,
      freeShippingRemaining: Math.max(0, settings.freeShippingThreshold - subtotal),
      availableOptions: [
        {
          id: 'standard',
          name: 'Standart Kargo',
          cost: shippingCost,
          estimatedDays: settings.standardDays + ' gün',
          description: isFreeShipping ? 'Ücretsiz kargo' : `${settings.standardCost} ₺`
        }
      ],
      selectedOption: {
        id: 'standard',
        name: 'Standart Kargo',
        cost: shippingCost,
        estimatedDays: settings.standardDays + ' gün',
        description: isFreeShipping ? 'Ücretsiz kargo' : `${settings.standardCost} ₺`
      }
    }
  }
}

// Ücretsiz kargo için kalan tutar - optimize edilmiş
export async function getFreeShippingRemaining(subtotal: number): Promise<number> {
  // Hızlı hesaplama için cache'lenmiş ayarları kullan
  const settings = cachedSettings || await getShippingSettings()
  const remaining = settings.freeShippingThreshold - subtotal
  return remaining > 0 ? remaining : 0
}

// Kargo seçeneklerini getir
export async function getShippingOptions(subtotal: number): Promise<ShippingOption[]> {
  const calculation = await calculateShipping(subtotal)
  return calculation.availableOptions
}