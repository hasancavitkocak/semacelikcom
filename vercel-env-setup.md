# Vercel Environment Variables Setup

Vercel Dashboard'da aşağıdaki environment variable'ları ayarlaman gerekiyor:

## Production Environment Variables

1. Vercel Dashboard'a git: https://vercel.com/dashboard
2. Projenizi seçin
3. Settings > Environment Variables'a git
4. Aşağıdaki değişkenleri ekle:

### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL=https://cpeabuvpwftdejqxvsls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM
```

### Security
```
NEXTAUTH_SECRET=semacelik-production-secret-key-2024-secure
NEXTAUTH_URL=https://semacelik.com
```

### Rate Limiting
```
RATE_LIMIT_MAX_REQUESTS=50
RATE_LIMIT_WINDOW_MS=900000
```

### CORS
```
ALLOWED_ORIGINS=https://semacelik.com,https://www.semacelik.com
```

### Production
```
NODE_ENV=production
```

## Önemli Notlar

1. Her environment variable için "Production", "Preview", ve "Development" ortamlarını seç
2. Değişiklikleri kaydettikten sonra projeyi yeniden deploy et
3. NEXT_PUBLIC_ prefix'li değişkenler client-side'da kullanılabilir

## Alternatif: Vercel CLI ile

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

## Deploy Sonrası

Değişkenleri ekledikten sonra:
```bash
vercel --prod
```