# semacelik.com - Kadın Giyim E-Ticaret

Modern, full-stack kadın giyim e-ticaret platformu. Next.js 15, Supabase ve shadcn/ui ile geliştirilmiştir.

## 🚀 Özellikler

### Müşteri Tarafı
- ✅ Hero slider ile anasayfa
- ✅ Responsive header & footer
- ✅ Kategori bazlı ürün listeleme
- ✅ Ürün detay sayfası (beden/renk seçimi)
- ✅ Sepet yönetimi (icon ile)
- ✅ Ödeme sayfası
- ✅ Kullanıcı profili
- ✅ Sipariş takibi
- ✅ Lucide React icon kütüphanesi

### Admin Paneli
- ✅ Güvenli giriş sistemi (middleware)
- ✅ Modern sidebar navigasyon
- ✅ Dashboard (istatistikler)
- ✅ Ürün yönetimi (CRUD)
- ✅ Görsel yükleme ve otomatik optimizasyon
- ✅ Renk & Beden yönetimi
- ✅ Sipariş yönetimi
- ✅ Kategori yönetimi
- ✅ Kupon/kampanya yönetimi
- ✅ Kullanıcı yönetimi
- ✅ Genel ayarlar

### Tekstil Özellikleri
- ✅ Kumaş tipi ve bileşimi
- ✅ Bakım talimatları
- ✅ Beden tablosu (XS-XXL, 34-44)
- ✅ Renk varyantları (hex kod ile)
- ✅ Sezon filtreleme
- ✅ Marka yönetimi

## 🛠️ Teknolojiler

- **Framework:** Next.js 15 (App Router)
- **Veritabanı:** Supabase (PostgreSQL)
- **UI Kütüphanesi:** shadcn/ui + Tailwind CSS
- **Icon Kütüphanesi:** Lucide React
- **Slider:** Swiper.js
- **Dil:** TypeScript

## 📦 Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env.local` dosyası zaten yapılandırılmış durumda

3. Supabase veritabanını kurun:
   - Supabase dashboard'a gidin (https://supabase.com)
   - Authentication > Providers > Email'i aktif edin
   - SQL Editor'ü açın
   - `supabase-schema.sql` dosyasındaki SQL kodunu çalıştırın
   - Tablolar oluşturulacak ve örnek veriler eklenecek

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

5. Tarayıcıda açın: [http://localhost:3000](http://localhost:3000)

## 📁 Proje Yapısı

```
├── app/
│   ├── page.tsx              # Anasayfa
│   ├── products/             # Ürün sayfaları
│   ├── cart/                 # Sepet
│   ├── checkout/             # Ödeme
│   ├── profile/              # Kullanıcı profili
│   └── admin/                # Admin paneli
│       ├── page.tsx          # Dashboard
│       ├── products/         # Ürün yönetimi
│       ├── orders/           # Sipariş yönetimi
│       ├── categories/       # Kategori yönetimi
│       ├── coupons/          # Kupon yönetimi
│       ├── users/            # Kullanıcı yönetimi
│       └── settings/         # Ayarlar
├── components/ui/            # shadcn/ui bileşenleri
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── utils.ts             # Yardımcı fonksiyonlar
├── types/
│   └── database.ts          # TypeScript tipleri
└── supabase-schema.sql      # Veritabanı şeması
```

## 🔐 Supabase Yapılandırması

Veritabanı URL: `https://cpeabuvpwftdejqxvsls.supabase.co`

Tablolar:
- `categories` - Ürün kategorileri
- `products` - Ürünler
- `product_variants` - Ürün varyantları (beden, renk vb.)
- `users` - Kullanıcılar
- `cart_items` - Sepet öğeleri
- `orders` - Siparişler
- `order_items` - Sipariş detayları
- `coupons` - İndirim kuponları
- `addresses` - Kullanıcı adresleri

## 🎨 UI Bileşenleri

Kullanılan shadcn/ui bileşenleri:
- Button
- Card
- Table
- Input
- Label
- Select

## 🔐 Giriş Sistemleri

### Kullanıcı Girişi (Supabase Auth)
- URL: `http://localhost:3000/register` - Yeni kayıt
- URL: `http://localhost:3000/login` - Giriş
- Gerçek Supabase Auth kullanılıyor
- Kayıt olduktan sonra otomatik olarak `users` tablosuna eklenir
- Profil sayfasında gerçek kullanıcı bilgileri görüntülenir
- Siparişlerim sayfasında gerçek siparişler listelenir

### Admin Paneli Girişi (Rol Bazlı)
- URL: `http://localhost:3000/admin/login`
- Yetkili Admin E-postaları:
  - `admin@semacelik.com`
  - `yonetici@semacelik.com`
- Şifre: Herhangi bir şifre (minimum 6 karakter)
- Admin paneli middleware ile korunmaktadır
- Kullanıcı Yönetimi'nden kullanıcılara admin rolü atayabilirsiniz

### Veritabanı Tabloları
- `users` - Kullanıcı bilgileri (Supabase Auth ile entegre)
- `orders` - Siparişler
- `products` - Ürünler
- `categories` - Kategoriler
- `colors` - Renkler
- `sizes` - Bedenler
- `product_variants` - Ürün varyantları
- `cart_items` - Sepet öğeleri

## 🎨 Görsel Optimizasyonu

Ürün görselleri yüklenirken otomatik olarak:
- Maksimum 1200px boyutuna küçültülür
- JPEG formatında %80 kalite ile sıkıştırılır
- Canvas API ile optimize edilir
- Site performansı için optimize boyutta saklanır

## 📝 Sonraki Adımlar

- [ ] Supabase Auth entegrasyonu (giriş/kayıt)
- [ ] Supabase Storage ile görsel yükleme
- [ ] Ödeme gateway entegrasyonu (iyzico)
- [ ] E-posta bildirimleri
- [ ] Gelişmiş arama ve filtreleme
- [ ] Ürün yorumları ve puanlama
- [ ] Favori ürünler
- [ ] Kargo takip sistemi
- [ ] Stok uyarı sistemi

## 🚀 Deploy

Vercel'e deploy etmek için:

```bash
vercel
```

Environment variables'ları Vercel dashboard'dan ekleyin.
