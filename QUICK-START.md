# 🚀 Hızlı Başlangıç Rehberi

## Adım 1: Supabase Authentication Ayarları

1. Supabase Dashboard'a gidin
2. **Authentication** > **Providers** > **Email**
3. **"Confirm email"** toggle'ını **KAPATIN** ❌
4. **Save** butonuna tıklayın

5. **Authentication** > **URL Configuration**
6. **Site URL**: `http://localhost:3000`
7. **Redirect URLs**: `http://localhost:3000/**`
8. **Save** butonuna tıklayın

## Adım 2: Tabloları Oluşturun

1. **SQL Editor** seçin
2. **New query** butonuna tıklayın
3. `supabase-tables-only.sql` dosyasını açın
4. Tüm içeriği kopyalayın
5. SQL Editor'e yapıştırın
6. **Run** butonuna tıklayın ▶️

7. **ÖNEMLİ:** Users tablosu için INSERT politikası ekleyin
8. `supabase-fix-users-insert.sql` dosyasını açın
9. Tüm içeriği kopyalayın
10. SQL Editor'e yapıştırın
11. **Run** butonuna tıklayın ▶️

### Kontrol:
- **Table Editor** seçin
- Sol tarafta 12 tablo görmelisiniz:
  - ✅ categories
  - ✅ products
  - ✅ product_images
  - ✅ colors
  - ✅ sizes
  - ✅ product_variants
  - ✅ **users** ⭐ (ÖNEMLİ!)
  - ✅ cart_items
  - ✅ orders
  - ✅ order_items
  - ✅ coupons
  - ✅ addresses

## Adım 3: Örnek Verileri Ekleyin (Opsiyonel)

1. **SQL Editor** > **New query**
2. `supabase-sample-data.sql` dosyasını açın
3. Tüm içeriği kopyalayın
4. SQL Editor'e yapıştırın
5. **Run** butonuna tıklayın ▶️

### Kontrol:
- **Table Editor** > **products** seçin
- 6 örnek ürün görmelisiniz

## Adım 4: İlk Kullanıcıyı Oluşturun

1. Web sitesine gidin: `http://localhost:3000/register`
2. Kayıt formunu doldurun
3. **Kayıt Ol** butonuna tıklayın
4. Başarılı! ✅

### Kontrol:
- Supabase Dashboard > **Table Editor** > **users**
- Kaydınızı görmelisiniz

## Adım 5: Admin Rolü Verin

1. **Table Editor** > **users** seçin
2. Kaydınızı bulun
3. **role** sütununa tıklayın
4. `customer` yerine `admin` yazın
5. Enter'a basın
6. Artık admin paneline girebilirsiniz! 🎉

## Adım 6: Test Edin

### Kullanıcı Girişi:
- URL: `http://localhost:3000/login`
- Email: Kayıt olduğunuz email
- Şifre: Belirlediğiniz şifre

### Admin Paneli:
- URL: `http://localhost:3000/admin/login`
- Email: Admin yaptığınız email
- Şifre: Herhangi bir şifre (min 6 karakter)

## Sorun mu var?

### "Could not find table 'public.users'"
- `supabase-tables-only.sql` dosyasını tekrar çalıştırın
- **Table Editor**'de `users` tablosunu kontrol edin

### Kayıt oldum ama users tablosunda görünmüyor
1. `supabase-fix-users-insert.sql` dosyasını çalıştırın
2. Bu dosya INSERT politikasını ekler
3. Tekrar kayıt olmayı deneyin
4. Veya profil sayfası otomatik oluşturacak

### "email_not_confirmed"
- Authentication > Providers > Email
- "Confirm email" toggle'ını KAPATIN
- Tarayıcı cache'ini temizleyin

### Kullanıcı tabloda görünmüyor
- Kayıt olduktan sonra **Table Editor** > **users** kontrol edin
- Eğer yoksa, SQL'i tekrar çalıştırın

### Admin paneline giremiyorum
- **Table Editor** > **users** > `role` sütununu `admin` yapın
- Admin email listesine eklendiğinden emin olun

## Başarılı! 🎉

Artık sisteminiz hazır:
- ✅ Kullanıcı kayıt/giriş çalışıyor
- ✅ Profil sayfası çalışıyor
- ✅ Admin paneli çalışıyor
- ✅ Ürünler listeleniyor

Keyifli kodlamalar! 🚀
