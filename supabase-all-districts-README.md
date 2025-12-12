# Türkiye İl ve İlçe Veritabanı

Bu SQL dosyaları Türkiye'nin 81 ilinin ve tüm ilçelerinin veritabanına eklenmesi için hazırlanmıştır.

## Kurulum Sırası

1. **supabase-cities-districts.sql** - İl ve ilçe tablolarını oluşturur, 81 ili ekler
2. **supabase-districts-part1.sql** - Adana'dan Antalya'ya kadar ilçeler
3. **supabase-districts-part2.sql** - Ardahan'dan Bingöl'e kadar ilçeler
4. **supabase-districts-part3.sql** - Bitlis'ten Denizli'ye kadar ilçeler
5. **supabase-districts-part4.sql** - Diyarbakır'dan Gaziantep'e kadar ilçeler
6. **supabase-districts-part5.sql** - Giresun'dan İzmir'e kadar ilçeler
7. **supabase-districts-part6.sql** - Kahramanmaraş'tan Kırşehir'e kadar ilçeler
8. **supabase-districts-part7.sql** - Kilis'ten Mersin'e kadar ilçeler
9. **supabase-districts-part8.sql** - Muğla'dan Samsun'a kadar ilçeler
10. **supabase-districts-part9.sql** - Siirt'ten Zonguldak'a kadar ilçeler (SON)

## Kullanım

Supabase SQL Editor'de sırasıyla tüm dosyaları çalıştırın:

```sql
-- 1. Önce tabloları ve illeri oluştur
-- supabase-cities-districts.sql

-- 2. Sonra tüm ilçeleri ekle (part1'den part9'a kadar)
-- supabase-districts-part1.sql
-- supabase-districts-part2.sql
-- ... (tüm parçalar)
-- supabase-districts-part9.sql
```

## İçerik

- **81 İl**
- **973 İlçe** (yaklaşık)
- RLS (Row Level Security) politikaları
- Herkes okuyabilir, sadece admin ekleyebilir/güncelleyebilir

## Özellikler

- Duplicate kontrolü (ON CONFLICT DO NOTHING)
- İndeksler (city_id üzerinde)
- Foreign key ilişkileri
- Cascade delete (il silinirse ilçeleri de silinir)
