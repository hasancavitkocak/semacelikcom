// Environment variables debug utility
export function checkEnvironmentVariables() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ]

  const missing: string[] = []
  const present: Record<string, string> = {}

  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar]
    if (!value) {
      missing.push(envVar)
    } else {
      // Sadece ilk 10 karakteri göster (güvenlik için)
      present[envVar] = value.substring(0, 10) + '...'
    }
  })

  return {
    missing,
    present,
    isValid: missing.length === 0
  }
}

// Development'da console'a yazdır
if (process.env.NODE_ENV === 'development') {
  const check = checkEnvironmentVariables()
  console.log('Environment Variables Check:', check)
}