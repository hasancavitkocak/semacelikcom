# ⚡ Hızlı Storage Kurulumu (2 Dakika)

## Adım 1: Bucket Oluştur (Dashboard)

1. **Supabase Dashboard'a git:**
   - https://supabase.com/dashboard
   - Projenizi seçin

2. **Storage'ı aç:**
   - Sol menüden **"Storage"** tıklayın

3. **Yeni Bucket oluştur:**
   - **"New bucket"** veya **"Create bucket"** butonuna tıklayın
   - **Name:** `products` (tam olarak bu isim!)
   - **Public bucket:** ✅ **AÇIK** (çok önemli!)
   - **"Create bucket"** tıklayın

## Adım 2: Politikaları Ekle (SQL)

1. **SQL Editor'ü aç:**
   - Sol menüden **"SQL Editor"** tıklayın

2. **Aşağıdaki SQL'i kopyala ve çalıştır:**

```sql
-- Storage politikaları
-- Herkes products bucket'ındaki dosyaları görebilir
CREATE POLICY "Anyone can view products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Authenticated kullanıcılar yükleyebilir
CREATE POLICY "Authenticated can upload products"
ON storage.objects FOR INSERT
WITH CHECK ( 
  bucket_id = 'products' 
  AND auth.role() = 'authenticated' 
);

-- Authenticated kullanıcılar güncelleyebilir
CREATE POLICY "Authenticated can update products"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'products' 
  AND auth.role() = 'authenticated' 
);

-- Authenticated kullanıcılar silebilir
CREATE POLICY "Authenticated can delete products"
ON storage.objects FOR DELETE
USING ( 
  bucket_id = 'products' 
  AND auth.role() = 'authenticated' 
);
```

3. **"Run"** butonuna tıklayın

## Adım 3: Test Et

1. **Storage durumunu kontrol et:**
   ```
   http://localhost:3000/admin/storage-check
   ```
   
   Tüm kontroller ✅ olmalı!

2. **Banner ekle:**
   ```
   http://localhost:3000/admin/banners
   ```
   
   Görsel yükle ve test et!

## ✅ Başarılı!

Artık:
- Banner ekleyebilirsiniz
- Ürün görseli yükleyebilirsiniz
- Tüm görseller Supabase Storage'da saklanır

## 🔍 Sorun mu var?

**Bucket hala bulunamıyor:**
- Bucket isminin tam olarak `products` olduğundan emin olun
- Bucket'ın **Public** olarak işaretli olduğunu kontrol edin
- Sayfayı yenileyin (F5)

**Upload çalışmıyor:**
- SQL politikalarını çalıştırdınız mı?
- Admin olarak giriş yaptınız mı?
- Console'da (F12) hata var mı?

**Hala çalışmıyor:**
- `/admin/storage-check` sayfasını kontrol edin
- Hangi adımda hata var göreceksiniz
