# Email Confirmation Sorunu Çözümü

## Sorun
Kayıt olurken `"email_not_confirmed"` hatası alıyorsunuz.

## Çözüm 1: Email Confirmation'ı Kapatma (Önerilen - Geliştirme İçin)

### Adım 1: Provider Ayarları
1. Supabase Dashboard'a gidin
2. **Authentication** > **Providers** seçin
3. **Email** provider'a tıklayın
4. **"Confirm email"** toggle'ını **KAPATIN** ❌
5. **Save** butonuna tıklayın

### Adım 2: URL Configuration
1. **Authentication** > **URL Configuration** seçin
2. **Site URL** kısmına: `http://localhost:3000`
3. **Redirect URLs** kısmına ekleyin:
   ```
   http://localhost:3000/**
   http://localhost:3000/login
   http://localhost:3000/profile
   ```
4. **Save** butonuna tıklayın

### Adım 3: Cache Temizleme
1. Tarayıcı cache'ini temizleyin
2. Veya **Incognito/Private** modda deneyin
3. Yeni bir kayıt deneyin

---

## Çözüm 2: Manuel Email Onaylama (Email Confirmation Kapatılamıyorsa)

### Yöntem A: Supabase Dashboard'dan Onaylama
1. Kayıt olduktan sonra Supabase Dashboard'a gidin
2. **Authentication** > **Users** seçin
3. Kaydınızı bulun
4. Kullanıcının yanındaki **"..."** menüsüne tıklayın
5. **"Confirm email"** seçeneğine tıklayın
6. Artık giriş yapabilirsiniz!

### Yöntem B: SQL ile Onaylama
1. **SQL Editor** seçin
2. Şu SQL'i çalıştırın:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'sizin@email.com';
```
3. `sizin@email.com` yerine kendi email'inizi yazın
4. **Run** butonuna tıklayın
5. Artık giriş yapabilirsiniz!

---

## Çözüm 3: SMTP Ayarları (Üretim İçin)

Eğer email confirmation'ı kullanmak istiyorsanız:

1. **Settings** > **Auth** > **SMTP Settings** seçin
2. Kendi SMTP bilgilerinizi girin:
   - **Host**: smtp.gmail.com (Gmail için)
   - **Port**: 587
   - **Username**: sizin@gmail.com
   - **Password**: uygulama şifresi
3. **Save** butonuna tıklayın
4. Artık onay emailleri gönderilecek

### Gmail için Uygulama Şifresi Oluşturma:
1. Google Hesabı > Güvenlik
2. 2 Adımlı Doğrulama'yı aktif edin
3. Uygulama şifreleri oluşturun
4. "Mail" ve "Diğer" seçin
5. Oluşturulan şifreyi SMTP ayarlarında kullanın

---

## Test Etme

Kayıt olduktan sonra:

```bash
# Tarayıcı console'da (F12)
supabase.auth.getUser()
```

Eğer `user` objesi dönüyorsa, başarılı! ✅

---

## Hala Çalışmıyor mu?

### Kontrol Listesi:
- [ ] Email provider aktif mi?
- [ ] Confirm email kapalı mı?
- [ ] URL Configuration doğru mu?
- [ ] Cache temizlendi mi?
- [ ] Incognito modda denendi mi?
- [ ] Supabase project'i yeniden başlatıldı mı?

### Son Çare:
1. Yeni bir Supabase projesi oluşturun
2. Baştan kurulum yapın
3. Email confirmation'ı hiç açmayın

---

## Üretim Ortamı İçin

Üretim ortamında email confirmation kullanmalısınız:

1. SMTP ayarlarını yapılandırın
2. Custom domain ekleyin
3. Email template'lerini özelleştirin
4. Rate limiting ayarlayın

Ama geliştirme sırasında kapalı tutabilirsiniz.
