# 🎯 SEMACELIK.COM - Final Kurulum Rehberi

## ✅ Yapılması Gerekenler (Sırayla)

### 1. Supabase Kurulumu
```sql
-- Supabase SQL Editor'de çalıştırın:
-- 1. supabase-tables-only.sql
-- 2. supabase-fix-users-insert.sql
-- 3. supabase-sample-data.sql (opsiyonel - test verileri)
```

### 2. Supabase Storage Kurulumu (Görsel Yükleme İçin)
1. Supabase Dashboard > Storage
2. "Create bucket" butonuna tıklayın
3. Bucket adı: `product-images`
4. Public bucket: ✅ İşaretleyin
5. Create butonuna tıklayın

### 3. Authentication Ayarları
1. Authentication > Providers > Email
2. "Confirm email" toggle'ını KAPATIN
3. Authentication > URL Configuration
4. Site URL: `http://localhost:3000`
5. Redirect URLs: `http://localhost:3000/**`

### 4. Çalışan Özellikler
✅ Kullanıcı kayıt/giriş (Supabase Auth)
✅ Admin paneli (rol bazlı)
✅ Ürün listeleme (Supabase'den)
✅ Kategori yönetimi (Supabase'den)
✅ Kullanıcı yönetimi (Supabase'den)
✅ Sipariş yönetimi (Supabase'den)
✅ Sepet (adet artır/azalt, kaldır)
✅ Checkout (3 adımlı)
✅ Responsive tasarım
✅ Header (dinamik kullanıcı durumu)
✅ Footer

### 5. Çalışmayan/Eksik Özellikler
❌ Görsel yükleme (Supabase Storage entegrasyonu gerekli)
❌ Ürün düzenleme (form doldurulacak)
❌ İyzico ödeme entegrasyonu (API key gerekli)

### 6. Admin Yetkili Emailler
- admin@semacelik.com
- yonetici@semacelik.com
- kirosdevtest@gmail.com

### 7. Test Etme
1. Kayıt ol: `/register`
2. Giriş yap: `/login`
3. Admin panel: `/admin/login`
4. Ürünler: `/products`
5. Sepet: `/cart`
6. Checkout: `/checkout`

## 🚀 Hızlı Başlangıç
```bash
npm run dev
```

Tarayıcıda: http://localhost:3000

## 📝 Notlar
- Tüm veriler Supabase'den çekiliyor
- Dummy veriler kaldırıldı
- Admin paneli gerçek verilerle çalışıyor
- Görsel yükleme için Supabase Storage bucket'ı oluşturulmalı
