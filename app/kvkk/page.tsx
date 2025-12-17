import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK - Kişisel Verilerin Korunması | Etna Perde',
  description: 'Etna Perde kişisel verilerin korunması politikası, KVKK uyum bilgilendirmesi ve gizlilik şartları.',
}

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              KİŞİSEL VERİLERİN KORUNMASI KANUNU
            </h1>
            <p className="text-blue-100 text-center mt-2">
              KVKK Bilgilendirme ve Gizlilik Politikası
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            
            {/* Giriş */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                KİŞİSEL VERİLERİN KORUNMASINA İLİŞKİN BİLGİLENDİRME
              </h2>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-semibold">Etnaperde</span> olarak kişisel verilerinizin 
                  <span className="font-bold text-blue-700"> 6698 sayılı Kişisel Verilerin Korunması Kanunu'na</span> ("Kanun") 
                  uygun olarak işlenerek, muhafaza edilmesine büyük önem veriyoruz. Müşterilerimizi kişisel verileri toplama, 
                  işleme, aktarma amacımız ve yöntemlerimiz ve buna bağlı olarak sizlerin Kanun'dan kaynaklanan haklarınızla 
                  ilgili bilgilendirmek isteriz.
                </p>
              </div>
            </section>

            {/* 1. Kişisel Verilerin Toplanması */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                1. KİŞİSEL VERİLERİN TOPLANMASINA İLİŞKİN YÖNTEMLER
              </h2>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-semibold">Etnaperde</span> olarak, veri sorumlusu sıfatıyla, mevzuattan kaynaklanan yasal 
                  yükümlülüklerimiz çerçevesinde; markalarımızın hizmetlerinden faydalanabilmeniz, onayınız halinde kampanyalarımız 
                  hakkında sizleri bilgilendirmek, öneri ve şikayetlerinizi kayıt altına alabilmek, sizlere daha iyi hizmet 
                  standartları oluşturabilmek, Etnaperde ticari ve iş stratejilerinin belirlenmesi ve uygulanması gibi amaçlarla 
                  kişisel verilerinizi <span className="font-semibold">sözlü, internet sitesi, sosyal medya mecraları, mobil uygulamalar</span> 
                  ve benzeri vasıtalarla sözlü, yazılı ya da elektronik yöntemlerle toplamaktayız.
                </p>
              </div>
            </section>

            {/* 2. Kişisel Verilerin İşlenmesi */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                2. KİŞİSEL VERİLERİN İŞLENMESİ VE İŞLEME AMAÇLARI
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <span className="font-semibold">Etnaperde</span> olarak, veri sorumlusu sıfatı ile çağrı merkezlerimiz, 
                    yazılı iletişim kanallarımız, sosyal medya sayfalarımız, mobil iletişim kanalları, mağaza içi iletişim 
                    kanalları ve/veya bunlarla sınırlı olmamak üzere her türlü kanallar aracılığı ile; onayınız dahilinde 
                    elde ettiğimiz kişisel ve/veya özel nitelikli kişisel verileriniz:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p>• Tamamen veya kısmen elde edilebilir</p>
                      <p>• Kaydedilebilir, saklanabilir, depolanabilir</p>
                      <p>• Değiştirilebilir, güncellenebilir</p>
                      <p>• Periyodik olarak kontrol edilebilir</p>
                    </div>
                    <div className="space-y-2">
                      <p>• Yeniden düzenlenebilir, sınıflandırılabilir</p>
                      <p>• Gerekli süre kadar muhafaza edilebilir</p>
                      <p>• İlgili 3. kişilerle paylaşılabilir</p>
                      <p>• Yurtdışına aktarılabilir</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">İşleme Amaçları:</h3>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <p>• Hizmetlerden faydalanabilmeniz</p>
                      <p>• Kampanyalar hakkında bilgilendirme</p>
                      <p>• Öneri ve şikayetlerin kaydı</p>
                    </div>
                    <div className="space-y-2">
                      <p>• Daha iyi hizmet standartları</p>
                      <p>• Ticari stratejilerin belirlenmesi</p>
                      <p>• İş stratejilerinin uygulanması</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Kişisel Verilerin Aktarılması */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                3. KİŞİSEL VERİLERİN AKTARILMASI
              </h2>
              <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <span className="font-semibold">Etnaperde</span>, söz konusu kişisel verilerinizi sadece; açık rızanıza istinaden 
                  veya Kanun'da belirtilen güvenlik ve gizlilik esasları çerçevesinde yeterli önlemler alınmak kaydıyla 
                  yurt içinde ve gerekli güvenlik önlemlerinin alınması kaydıyla yurt dışında aktarabilir.
                </p>
                
                <h4 className="font-semibold text-orange-800 mb-3">Aktarım Yapılabilecek Taraflar:</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <p>• Grup şirketlerimiz</p>
                    <p>• İş ortaklarımız</p>
                    <p>• Anlaşmalı müşteriler</p>
                    <p>• Tedarikçiler</p>
                  </div>
                  <div className="space-y-2">
                    <p>• Denetim şirketleri</p>
                    <p>• Kamu kurum ve kuruluşları</p>
                    <p>• Yetkili otoriteler</p>
                    <p>• Yasal zorunluluk halinde ilgili makamlar</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. Veri Sahibinin Hakları */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                4. KİŞİSEL VERİ SAHİBİNİN HAKLARI
              </h2>
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold">Etnaperde</span> ilgili kişilerin aşağıdaki taleplerine karşılık verecektir:
                </p>
                
                <div className="space-y-3">
                  {[
                    "Kişisel verilerin işlenip işlenmediğini ve hangi verilerin işlendiğini öğrenme",
                    "İşleme faaliyetinin amaçlarına ilişkin bilgi alma", 
                    "Kişisel verilerin aktarıldığı üçüncü kişileri bilme",
                    "Kişisel verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme",
                    "Kanun'a uygun olarak kişisel verilerin silinmesini veya yok edilmesini isteme",
                    "Yapılan işlemlerin üçüncü kişilere bildirilmesini isteme",
                    "Otomatik sistemler vasıtasıyla analiz edilmesi sonucuna itiraz etme",
                    "Kişisel verilerinin birer kopyasını alma"
                  ].map((right, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {String.fromCharCode(97 + index)}
                      </div>
                      <p className="text-gray-700 text-sm">{right}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* İletişim Bilgileri */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                İLETİŞİM BİLGİLERİ
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Görüş ve sorularınızla ilgili bizimle iletişime geçebilirsiniz.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Şirket Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Ünvanı:</span> Etnaperde</p>
                      <p><span className="font-medium">Telefon:</span> 212 871 97 77</p>
                      <p><span className="font-medium">E-mail:</span> semacelikofficial@gmail.com</p>
                      <p><span className="font-medium">Mersis No:</span> 03811046197900019</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Vergi Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Vergi Dairesi:</span> Fatih</p>
                      <p><span className="font-medium">Vergi Numarası:</span> 3810461979</p>
                      <p><span className="font-medium">Adres:</span> Sümbül Efendi Mh Hacı Kadın Cd. No: 34/A İstanbul / Kocamustafapaşa</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Gizlilik ve Güvenlik */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                GİZLİLİK VE GÜVENLİK
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Veri Toplama ve Kullanım</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Etnaperde Online Shop, müşterilerine daha iyi hizmet verebilmek amacıyla bazı kişisel bilgilerinizi 
                    (isim, yaş, ilgi alanlarınız, e-posta vb.) sizlerden talep etmektedir. Sunucularımızda toplanan bu bilgiler, 
                    dönemsel kampanya çalışmaları, müşteri profillerine yönelik özel promosyon faaliyetlerinin kurgulanması ve 
                    istenmeyen e-postaların iletilmemesine yönelik müşteri "sınıflandırma" çalışmalarında sadece 
                    <span className="font-semibold"> Etnaperde Online Shop bünyesinde</span> kullanılmaktadır.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">Veri Paylaşım Politikası</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Etnaperde Online Shop, üyelik formlarından topladığı bilgileri söz konusu üyenin haberi ya da aksi bir 
                    talimatı olmaksızın, <span className="font-bold">üçüncü şahıslarla kesinlikle paylaşmamakta</span>, 
                    faaliyet dışı hiçbir nedenle ticari amaçla kullanmamakta ve de satmamaktadır.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-3">Resmi Makam Talepleri</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Müşteri bilgileri, ancak resmi makamlarca bu bilgilerin talep edilmesi halinde ve yürürlükteki emredici 
                    mevzuat hükümleri gereğince resmi makamlara açıklama yapmak zorunda olduğu durumlarda resmi makamlara 
                    açıklanabilecektir.
                  </p>
                </div>

                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">Ödeme Güvenliği</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Ödeme sayfasında istenen kredi kartı bilgileriniz, siteden alışveriş yapan siz değerli müşterilerimizin 
                    güvenliğini en üst seviyede tutmak amacıyla <span className="font-bold">hiçbir şekilde Etnaperde Online Shop 
                    veya ona hizmet veren şirketlerin sunucularında tutulmamaktadır.</span> Bu şekilde ödemeye yönelik tüm 
                    işlemlerin Etnaperde Online Shop arayüzü üzerinden banka ve bilgisayarınız arasında gerçekleşmesi sağlanmaktadır.
                  </p>
                </div>
              </div>
            </section>

            {/* Çerez Kullanımı */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200">
                ÇEREZ KULLANIMI
              </h2>
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-indigo-800 mb-3">Çerez Nedir?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Çerezler, sitemizi ziyaret ettiğinizde bilgisayarınız ya da mobil cihazınıza (akıllı telefon veya tablet gibi) 
                    kaydedilen küçük metin dosyaları ya da bilgilerdir.
                  </p>
                </div>

                <div className="bg-teal-50 border border-teal-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-teal-800 mb-3">Çerez Kullanım Amaçları</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• Sitelerimizin daha kolay kullanılması</p>
                    <p>• İlgi ve ihtiyaçlarınıza göre ayarlanması</p>
                    <p>• Tercih ayarlarınızın hatırlanması</p>
                    <p>• Gelecekteki hareketlerinizin hızlanması</p>
                    <p>• Ziyaretçi davranışlarının analiz edilmesi</p>
                    <p>• Site tasarımının ve kullanışlılığının geliştirilmesi</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Bilgileri */}
            <section className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-4">ETNAPERDE</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Adres:</span> Sümbül Efendi Mh Hacı Kadın Cd. No: 34/A İstanbul / Kocamustafapaşa</p>
                  <p><span className="font-medium">Telefon:</span> 212 871 97 77</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}