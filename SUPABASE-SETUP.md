# Supabase Kurulum Rehberi

## 1. Supabase Projesi Oluşturma

1. https://supabase.com adresine gidin
2. "Start your project" butonuna tıklayın
3. Yeni bir proje oluşturun
4. Proje adı: `semacelik-com`
5. Database şifresi belirleyin (güvenli bir şifre)
6. Region: `Europe (Frankfurt)` veya size en yakın bölge

## 2. Authentication Ayarları

### Email Provider Ayarları
1. Sol menüden **Authentication** > **Providers** seçin
2. **Email** provider'ı aktif edin
3. **Confirm email** toggle'ını **KAPATIN** (geliştirme için)
4. **Save** butonuna tıklayın

### URL Configuration
1. **Authentication** > **URL Configuration** seçin
2. **Site URL**: `http://localhost:3000` ekleyin
3. **Redirect URLs** bölümüne ekleyin:
   - `http://localhost:3000/**`
   - `http://localhost:3000/login`
   - `http://localhost:3000/profile`
4. **Save** butonuna tıklayın

### Email Templates (Opsiyonel)
1. **Authentication** > **Email Templates** seçin
2. Confirm signup template'ini düzenleyebilirsiniz
3. Veya email confirmation'ı tamamen kapatabilirsiniz

## 3. Veritabanı Şemasını Yükleme

1. Sol menüden **SQL Editor** seçin
2. **New query** butonuna tıklayın
3. `supabase-schema.sql` dosyasının içeriğini kopyalayın
4. SQL Editor'e yapıştırın
5. **Run** butonuna tıklayın

### Oluşturulacak Tablolar:
- ✅ categories (Kategoriler)
- ✅ products (Ürünler)
- ✅ product_images (Ürün görselleri)
- ✅ colors (Renkler)
- ✅ sizes (Bedenler)
- ✅ product_variants (Ürün varyantları)
- ✅ users (Kullanıcılar)
- ✅ cart_items (Sepet)
- ✅ orders (Siparişler)
- ✅ order_items (Sipariş detayları)
- ✅ coupons (Kuponlar)
- ✅ addresses (Adresler)

## 4. API Keys

1. Sol menüden **Settings** > **API** seçin
2. Aşağıdaki bilgileri kopyalayın:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`

3. `.env.local` dosyasını güncelleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 5. Row Level Security (RLS) Politikaları

SQL şeması otomatik olarak RLS politikalarını oluşturur:

- **Public**: Herkes ürünleri ve kategorileri görebilir
- **Authenticated**: Kullanıcılar kendi sepet ve siparişlerini görebilir
- **Admin**: Admin rolündeki kullanıcılar her şeyi yönetebilir

## 6. İlk Admin Kullanıcısı Oluşturma

1. Web sitesinden normal kayıt olun: `/register`
2. Supabase Dashboard > **Table Editor** > **users** tablosuna gidin
3. Kaydınızı bulun
4. `role` sütununu `customer`'dan `admin`'e değiştirin
5. Artık admin paneline giriş yapabilirsiniz!

## 7. Test Verileri

SQL şeması otomatik olarak şunları ekler:
- 10 kategori (Elbise, Tişört, Pantolon, vb.)
- 6 örnek ürün
- 10 renk
- 13 beden
- Örnek varyantlar

## 8. Sorun Giderme

### "relation does not exist" hatası
- SQL şemasını tekrar çalıştırın
- Tüm SQL kodunun başarıyla çalıştığından emin olun

### "email_not_confirmed" hatası
1. **Authentication** > **Providers** > **Email** seçin
2. **"Confirm email"** toggle'ını **KAPATIN**
3. **Save** butonuna tıklayın
4. **Authentication** > **URL Configuration** seçin
5. **Site URL**: `http://localhost:3000` ekleyin
6. **Redirect URLs**: `http://localhost:3000/**` ekleyin
7. Tarayıcı cache'ini temizleyin veya incognito modda deneyin

### Kayıt olurken hata
- Authentication > Email provider'ın aktif olduğundan emin olun
- Email confirmation'ın kapalı olduğundan emin olun
- URL Configuration'ın doğru olduğundan emin olun

### Kullanıcı tabloda görünmüyor
- `users` tablosunun oluşturulduğundan emin olun
- RLS politikalarının doğru olduğundan emin olun

### Admin paneline giremiyorum
- `users` tablosunda `role` sütununun `admin` olduğundan emin olun
- Admin email listesine eklendiğinden emin olun

## 9. Üretim Ortamı

Üretim ortamına geçerken:
1. Email confirmation'ı aktif edin
2. SMTP ayarlarını yapılandırın
3. Custom domain ekleyin
4. Rate limiting ayarlayın
5. Backup stratejisi belirleyin

## Yardım

Sorun yaşarsanız:
- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
