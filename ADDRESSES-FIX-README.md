# Addresses Tablosu Düzeltme Rehberi

## Sorun
Addresses tablosunda kolon isimleri uyumsuz:
- Kod `address_line` kullanıyor ama tablo `full_address` kolonuna sahip
- Kod `postal_code` kullanıyor ama tablo `zip_code` kolonuna sahip

## Çözüm

### Seçenek 1: Tabloyu Yeniden Oluştur (ÖNERİLEN)

**supabase-addresses-recreate.sql** dosyasını Supabase SQL Editor'de çalıştırın.

Bu dosya:
1. Mevcut tabloyu yedekler (addresses_backup)
2. Eski tabloyu siler
3. Doğru kolon isimleriyle yeni tablo oluşturur
4. RLS politikalarını ekler

### Seçenek 2: Mevcut Tabloyu Güncelle

**supabase-addresses-fix.sql** dosyasını çalıştırın.

Bu dosya:
1. Yeni kolonlar ekler
2. Eski verileri yeni kolonlara kopyalar
3. Eski kolonları kaldırır

## Yeni Tablo Yapısı

```sql
CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(100) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line TEXT NOT NULL,        -- ✅ Adres satırı
  city VARCHAR(100) NOT NULL,        -- ✅ İl
  district VARCHAR(100) NOT NULL,    -- ✅ İlçe
  postal_code VARCHAR(10),           -- ✅ Posta kodu
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Kullanılan Kolonlar

- `title` - Adres başlığı (Ev, İş, vb.)
- `full_name` - Alıcı adı soyadı
- `phone` - Telefon numarası
- `address_line` - Tam adres (mahalle, sokak, bina, daire)
- `city` - İl (İstanbul, Ankara, vb.)
- `district` - İlçe (Kadıköy, Çankaya, vb.)
- `postal_code` - Posta kodu (opsiyonel)

## Adımlar

1. Supabase Dashboard'a girin
2. SQL Editor'ü açın
3. **supabase-addresses-recreate.sql** dosyasını kopyalayın
4. Çalıştırın (Run)
5. Uygulamayı yenileyin
6. Adres eklemeyi test edin

## Test

Adres ekleme formu:
- Adres Başlığı: "Ev"
- Adres: "Atatürk Mahallesi, Cumhuriyet Caddesi No:123 Daire:4"
- İl: "İstanbul"
- İlçe: "Kadıköy"
- Posta Kodu: "34710"

Başarılı olursa "Adres başarıyla kaydedildi!" mesajı görünecek.
