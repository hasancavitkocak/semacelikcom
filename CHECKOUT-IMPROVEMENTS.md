# Checkout Sayfası İyileştirmeleri

## Yapılan Değişiklikler

### 1. Toast Notification Sistemi ✅
- `components/toast.tsx` oluşturuldu
- Özel pop-up bildirimleri
- Otomatik kapanma (3 saniye)
- Success ve Error tipleri

### 2. Adres Düzenleme ✅
- `app/profile/addresses/page.tsx` güncellendi
- Düzenle butonu eklendi
- Form güncelleme modu
- Toast bildirimleri entegre edildi

### 3. Checkout - Fatura ve Teslimat Adresi (YAPILACAK)

#### Özellikler:
- Teslimat Adresi seçimi (kayıtlı adreslerden)
- Fatura Adresi seçimi (kayıtlı adreslerden)
- "Fatura adresi teslimat adresi ile aynı" checkbox
- Yeni adres ekleme seçeneği
- API'den otomatik adres yükleme

#### State Yapısı:
```typescript
const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null)
const [sameAsShipping, setSameAsShipping] = useState(true)
const [shippingData, setShippingData] = useState({...})
const [billingData, setBillingData] = useState({...})
```

#### UI Akışı:
1. Kullanıcı giriş yaptıysa → Kayıtlı adresleri göster
2. Teslimat adresi seçimi (radio buttons)
3. "Yeni adres ekle" seçeneği
4. Fatura adresi bölümü:
   - Checkbox: "Fatura adresi teslimat adresi ile aynı" (default: checked)
   - Unchecked ise → Fatura adresi seçimi göster
5. Devam Et butonu

## Kullanım

### Toast Notification:
```typescript
import Toast from '@/components/toast'

const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null)

// Kullanım
setToast({ message: 'İşlem başarılı!', type: 'success' })

// JSX
{toast && (
  <Toast
    message={toast.message}
    type={toast.type}
    onClose={() => setToast(null)}
  />
)}
```

### Adres Düzenleme:
1. Adreslerim sayfasına git
2. "Düzenle" butonuna tıkla
3. Form otomatik doldurulur
4. Değişiklikleri yap
5. "Adresi Güncelle" butonuna tıkla
6. Toast bildirimi görünür

## Sonraki Adımlar

1. Checkout sayfasını fatura/teslimat ayrımı ile güncelle
2. Kayıtlı adresleri API'den çek
3. Adres seçim UI'ı oluştur
4. "Aynı adres" checkbox mantığı
5. Yeni adres ekleme formu
6. Toast bildirimlerini ekle

## Test Senaryoları

### Adres Düzenleme:
- ✅ Düzenle butonuna tıkla
- ✅ Form doldurulur
- ✅ Değişiklikleri kaydet
- ✅ Toast bildirimi görünür
- ✅ Liste güncellenir

### Checkout:
- [ ] Giriş yapılı kullanıcı → Kayıtlı adresler görünür
- [ ] Teslimat adresi seç
- [ ] Fatura adresi checkbox test
- [ ] Yeni adres ekle
- [ ] Devam Et
