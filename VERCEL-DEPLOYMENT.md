# Vercel Deployment Rehberi

## 1. Vercel Hesabı ve Proje Kurulumu

### Vercel CLI Kurulumu
```bash
npm i -g vercel
```

### Vercel'e Giriş
```bash
vercel login
```

## 2. Proje Deploy Etme

### İlk Deploy (Production)
```bash
vercel --prod
```

Komut çalıştırıldığında:
- Proje adı soracak (varsayılan: semacelik-com)
- Scope seçimi (kişisel hesap veya team)
- Proje ayarları onayı

### Preview Deploy (Test)
```bash
vercel
```

## 3. Environment Variables (Vercel Dashboard)

Vercel Dashboard'da Project Settings > Environment Variables bölümünden ekleyin:

### Production, Preview ve Development için:

```
NEXT_PUBLIC_SUPABASE_URL=https://cpeabuvpwftdejqxvsls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM
```

## 4. Supabase Ayarları

### Redirect URLs Güncelleme
Supabase Dashboard > Authentication > URL Configuration:

**Site URL:**
```
https://your-project.vercel.app
```

**Redirect URLs:**
```
http://localhost:3000/**
https://your-project.vercel.app/**
https://*.vercel.app/**
```

## 5. Domain Ayarları (Opsiyonel)

### Custom Domain Ekleme
1. Vercel Dashboard > Project > Settings > Domains
2. Domain adınızı ekleyin (örn: semacelik.com)
3. DNS kayıtlarını güncelleyin:
   - A Record: 76.76.21.21
   - CNAME: cname.vercel-dns.com

### Supabase'de Domain Güncelleme
Custom domain ekledikten sonra Supabase'deki URL'leri güncelleyin.

## 6. Build Kontrol

### Local Build Test
Deploy etmeden önce local'de test edin:
```bash
npm run build
npm run start
```

### Build Hataları
Eğer build hatası alırsanız:
- TypeScript hatalarını kontrol edin
- Environment variables'ları kontrol edin
- Dependencies'leri kontrol edin: `npm install`

## 7. Deployment Sonrası Kontroller

✅ Ana sayfa yükleniyor mu?
✅ Ürünler listeleniyor mu?
✅ Login/Register çalışıyor mu?
✅ Admin paneline erişim var mı?
✅ Supabase bağlantısı çalışıyor mu?
✅ Görseller yükleniyor mu?

## 8. Otomatik Deployment

Git repository bağlandıktan sonra:
- Her `git push` otomatik preview deploy oluşturur
- `main` branch'e merge otomatik production deploy yapar

## 9. Vercel CLI Komutları

```bash
# Proje listesi
vercel list

# Deployment listesi
vercel ls

# Logs görüntüleme
vercel logs

# Environment variables listesi
vercel env ls

# Environment variable ekleme
vercel env add VARIABLE_NAME

# Projeyi silme
vercel remove project-name
```

## 10. Troubleshooting

### Build Hatası
```bash
# Local'de build test et
npm run build

# Cache temizle
rm -rf .next
npm run build
```

### Environment Variables Hatası
- Vercel Dashboard'dan kontrol edin
- Redeploy yapın: `vercel --prod --force`

### Supabase Bağlantı Hatası
- Redirect URLs'leri kontrol edin
- CORS ayarlarını kontrol edin
- Environment variables'ları kontrol edin

## Hızlı Deployment Adımları

```bash
# 1. Vercel CLI kur
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Environment variables ekle (Vercel Dashboard)
# 5. Supabase redirect URLs güncelle
# 6. Test et!
```

## Notlar

- İlk deployment 2-3 dakika sürebilir
- Preview deployments otomatik SSL sertifikası alır
- Vercel otomatik CDN ve caching sağlar
- Edge Functions Frankfurt (fra1) bölgesinde çalışır
