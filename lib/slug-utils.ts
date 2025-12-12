// Türkçe karakterleri slug'a çeviren utility
export function createSlug(text: string): string {
  return text
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .toLowerCase() // Sonunda küçük harfe çevir
    .replace(/[^a-z0-9\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
    .replace(/^-|-$/g, '') // Başta ve sonda tire varsa kaldır
}

// Baş harfleri büyük tutan versiyon (eğer istersen)
export function createSlugWithCapitals(text: string): string {
  return text
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Özel karakterleri kaldır
    .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
    .replace(/-+/g, '-') // Çoklu tireleri tek tire yap
    .replace(/^-|-$/g, '') // Başta ve sonda tire varsa kaldır
}

// Slug'dan ID çıkar (eğer slug sonunda ID varsa)
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]
  
  // UUID formatında mı kontrol et
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(lastPart)) {
    return lastPart
  }
  
  return null
}

// Slug'ı validate et
export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100
}