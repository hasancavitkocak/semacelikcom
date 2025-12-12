# Supabase Storage Kurulumu

## ❌ Hata: "products" bucket bulunamadı!

Bu hatayı alıyorsanız, Supabase Storage'ı kurmanız gerekiyor.

## ✅ Çözüm: 2 Yöntem

### Yöntem 1: SQL ile Otomatik Kurulum (ÖNERİLEN)

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard

2. **SQL Editor'ü açın**
   - Sol menüden "SQL Editor" seçin

3. **SQL dosyasını çalıştırın**
   ```sql
   -- supabase-storage-setup.sql dosyasının içeriğini kopyalayın
   -- SQL Editor'e yapıştırın
   -- "Run" butonuna tıklayın
   ```

4. **Başarı mesajı**
   - "Success. No rows returned" mesajını görmelisiniz
   - Bu normal ve doğrudur!

### Yöntem 2: Manuel Kurulum (Dashboard)

1. **Supabase Dashboard'a gidin**
   - https://supabase.com/dashboard

2. **Storage'ı açın**
   - Sol menüden "Storage" seçin

3. **Yeni Bucket oluşturun**
   - "Create Bucket" butonuna tıklayın
   - **Bucket name:** `products`
   - **Public bucket:** ✅ YES (ÖNEMLİ!)
   - "Create" butonuna tıklayın

4. **RLS Politikalarını ekleyin**
   - SQL Editor'de `supabase-storage-setup.sql` dosyasını çalıştırın
   - (Sadece politika kısmını çalıştırabilirsiniz)

## 🧪 Test Etme

### 1. Storage Durumu Sayfası
```
http://localhost:3000/admin/storage-check
```

Bu sayfa size şunları gösterir:
- ✅ Bucket listesi
- ✅ Products bucket durumu
- ✅ Upload testi

### 2. Banner Ekleme
```
http://localhost:3000/admin/banners
```

1. "Yeni Banner Ekle" butonuna tıklayın
2. Görsel yükleyin
3. Console'u açın (F12)
4. Logları kontrol edin:
   - 🔄 Görsel yükleniyor
   - ✅ Bucket bulundu
   - ✅ Upload başarılı
   - 🔗 Public URL

## 📐 Banner Boyutları

### Önerilen Boyutlar
- **İdeal:** 1920x600px
- **Minimum:** 1200x400px
- **Format:** JPG veya PNG
- **Maksimum boyut:** 2MB

### Responsive Boyutlar
- **Mobil:** 300px yükseklik
- **Tablet:** 400-500px yükseklik
- **Desktop:** 600px yükseklik
- **Genişlik:** Full width (otomatik)

## 🔧 Sorun Giderme

### "Bucket bulunamadı" hatası
```bash
# SQL Editor'de çalıştırın:
SELECT * FROM storage.buckets WHERE id = 'products';

# Sonuç boşsa, bucket yok demektir
# supabase-storage-setup.sql dosyasını çalıştırın
```

### "Yetki hatası" (RLS)
```bash
# SQL Editor'de çalıştırın:
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

# Politikaları göreceksiniz
# Yoksa, supabase-storage-setup.sql dosyasını çalıştırın
```

### "Public URL çalışmıyor"
```bash
# Bucket public mi kontrol edin:
SELECT id, name, public FROM storage.buckets WHERE id = 'products';

# public = false ise:
UPDATE storage.buckets SET public = true WHERE id = 'products';
```

## 📝 Kontrol Listesi

Kurulum tamamlandıktan sonra kontrol edin:

- [ ] `products` bucket oluşturuldu
- [ ] Bucket "Public" olarak işaretli
- [ ] RLS politikaları eklendi
- [ ] Storage Check sayfası ✅ gösteriyor
- [ ] Banner yükleme çalışıyor
- [ ] Ana sayfada banner görünüyor

## 🎉 Başarılı Kurulum

Tüm kontroller ✅ ise, artık:
- Banner ekleyebilirsiniz
- Ürün görseli yükleyebilirsiniz
- Kategori görseli yükleyebilirsiniz

Görseller Supabase Storage'da saklanacak ve public URL ile erişilebilir olacak!
