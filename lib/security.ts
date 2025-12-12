// Güvenlik yardımcı fonksiyonları

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML tag'leri kaldır
    .replace(/javascript:/gi, '') // JavaScript URL'leri kaldır
    .replace(/on\w+=/gi, '') // Event handler'ları kaldır
    .trim()
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// Phone validation
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9+\-\s()]{10,15}$/
  return phoneRegex.test(phone)
}

// Password strength check
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password)
}

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// CSRF token oluştur
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Hassas veriyi loglardan gizle
export function sanitizeForLog(data: any): any {
  const sensitive = ['password', 'token', 'key', 'secret', 'email', 'phone']
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data }
    for (const key in sanitized) {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]'
      }
    }
    return sanitized
  }
  
  return data
}