# Vercel Deployment Kontrol Listesi

## ✅ Tamamlanan Hazırlıklar

- [x] Build başarılı (npm run build)
- [x] TypeScript hataları düzeltildi
- [x] vercel.json oluşturuldu
- [x] .vercelignore oluşturuldu
- [x] Environment variables hazır

## 📋 Deployment Adımları

### 1. Vercel CLI Kurulumu
```bash
npm i -g vercel
```

### 2. Vercel'e Login
```bash
vercel login
```

### 3. İlk Deployment
```bash
vercel --prod
```

Sorular:
- **Set up and deploy?** → Yes
- **Which scope?** → Kişisel hesabınızı seçin
- **Link to existing project?** → No
- **Project name?** → semacelik-com (veya istediğiniz isim)
- **Directory?** → ./ (Enter)
- **Override settings?** → No

### 4. Vercel Dashboard'da Environment Variables Ekleme

https://vercel.com/dashboard → Projeniz → Settings → Environment Variables

Aşağıdaki 3 değişkeni ekleyin (Production, Preview, Development için):

```
NEXT_PUBLIC_SUPABASE_URL
Değer: https://cpeabuvpwftdejqxvsls.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Değer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM

SUPABASE_SERVICE_ROLE_KEY
Değer: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM
```

### 5. Redeploy (Environment Variables Sonrası)
```bash
vercel --prod --force
```

### 6. Supabase Redirect URLs Güncelleme

Supabase Dashboard → Authentication → URL Configuration

**Site URL:**
```
https://your-project-name.vercel.app
```

**Redirect URLs (hepsini ekleyin):**
```
http://localhost:3000/**
https://your-project-name.vercel.app/**
https://*.vercel.app/**
```

## 🧪 Deployment Sonrası Test

Vercel URL'inizi açın ve test edin:

- [ ] Ana sayfa yükleniyor
- [ ] Ürünler listeleniyor
- [ ] Kayıt olma çalışıyor
- [ ] Giriş yapma çalışıyor
- [ ] Admin paneline erişim var
- [ ] Sepet işlemleri çalışıyor

## 🔧 Sorun Giderme

### Build Hatası
```bash
# Local'de test et
npm run build

# Cache temizle
rm -rf .next
npm run build
```

### Environment Variables Hatası
- Vercel Dashboard'dan kontrol edin
- Tüm değişkenlerin Production, Preview, Development için eklendiğinden emin olun
- Redeploy yapın: `vercel --prod --force`

### Supabase Bağlantı Hatası
- Redirect URLs'leri kontrol edin
- Environment variables'ları kontrol edin
- Browser console'da hata mesajlarını kontrol edin

## 📱 Custom Domain (Opsiyonel)

### Domain Ekleme
1. Vercel Dashboard → Settings → Domains
2. Domain adınızı ekleyin (örn: semacelik.com)
3. DNS kayıtlarını güncelleyin:
   - A Record: 76.76.21.21
   - CNAME: cname.vercel-dns.com

### Supabase'de Domain Güncelleme
Custom domain ekledikten sonra Supabase'deki Site URL ve Redirect URLs'leri güncelleyin.

## 🚀 Otomatik Deployment (Git)

### GitHub/GitLab Bağlantısı
1. Vercel Dashboard → Settings → Git
2. Repository'nizi bağlayın
3. Her push otomatik deploy olacak

### Branch Ayarları
- `main` branch → Production
- Diğer branch'ler → Preview

## 📊 Monitoring

### Vercel Analytics
- Vercel Dashboard → Analytics
- Sayfa görüntülemeleri
- Performance metrikleri

### Logs
```bash
vercel logs
```

## 🎉 Deployment Tamamlandı!

Projeniz şu adreste yayında:
```
https://your-project-name.vercel.app
```

Admin paneli:
```
https://your-project-name.vercel.app/admin/login
```

## 📞 Destek

Sorun yaşarsanız:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
