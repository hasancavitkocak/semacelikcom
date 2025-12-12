# 🔒 Deployment Güvenlik Checklist

## ✅ Tamamlanan Güvenlik Önlemleri

### 1. **Environment Variables**
- [x] `.env.local` - Development için
- [x] `.env.production` - Production için  
- [x] `.env.example` - Template
- [x] `.gitignore` - Env dosyaları korunuyor

### 2. **Console Log Temizliği**
- [x] Production'da console log'lar otomatik kaldırılıyor
- [x] Debug mesajları temizlendi
- [x] Hassas bilgiler loglanmıyor

### 3. **HTTP Güvenlik Headers**
- [x] XSS Protection
- [x] Content-Type Options
- [x] Frame Options (Clickjacking koruması)
- [x] HTTPS Strict Transport Security
- [x] Referrer Policy
- [x] Permissions Policy

### 4. **Rate Limiting**
- [x] API endpoint'lerde rate limiting
- [x] IP bazlı takip
- [x] Production: 50 req/15min
- [x] Development: 100 req/15min

### 5. **Input Sanitization**
- [x] HTML tag temizliği
- [x] JavaScript injection koruması
- [x] Email/telefon validasyonu
- [x] Password strength kontrolü

### 6. **Middleware Koruması**
- [x] Admin sayfaları koruması
- [x] CORS ayarları
- [x] API güvenlik headers

## 🚀 Deployment Adımları

### 1. **Vercel/Netlify Deployment**
```bash
# Environment variables'ları platform'a ekle:
NEXT_PUBLIC_SUPABASE_URL=https://cpeabuvpwftdejqxvsls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXTAUTH_SECRET=semacelik-production-secret-key-2024-secure
NEXTAUTH_URL=https://semacelik.com
NODE_ENV=production
```

### 2. **Domain Ayarları**
- [x] HTTPS zorlaması
- [x] WWW redirect ayarları
- [x] CORS domain'leri güncelle

### 3. **Supabase Production Ayarları**
- [ ] RLS (Row Level Security) politikaları kontrol et
- [ ] API rate limiting ayarları
- [ ] Database backup ayarları
- [ ] Storage bucket permissions

### 4. **Monitoring**
- [ ] Error tracking (Sentry vb.)
- [ ] Performance monitoring
- [ ] Uptime monitoring

## ⚠️ Güvenlik Notları

1. **NEXTAUTH_SECRET** production'da mutlaka değiştir
2. **SUPABASE_SERVICE_ROLE_KEY** sadece server-side kullan
3. **Rate limiting** değerlerini trafiğe göre ayarla
4. **CORS** sadece gerçek domain'lere izin ver
5. **Console log'lar** production'da görünmez

## 🔍 Test Checklist

- [ ] Console'da hata yok
- [ ] Network tab'da hassas bilgi yok
- [ ] Rate limiting çalışıyor
- [ ] HTTPS redirect çalışıyor
- [ ] Admin sayfaları korunuyor
- [ ] Form validasyonları çalışıyor