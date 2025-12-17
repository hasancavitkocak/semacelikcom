import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | Etna Perde',
  description: 'Etna Perde mesafeli satış sözleşmesi ve tüketici hakları hakkında bilgiler.',
}

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              MESAFELİ SATIŞ SÖZLEŞMESİ
            </h1>
            <p className="text-gray-200 text-center mt-2">
              6502 Sayılı Tüketicilerin Korunması Hakkındaki Kanun Kapsamında
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            
            {/* Madde 1 - Taraflar */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 1 - TARAFLAR
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">1.1 - SATICI</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Ünvanı:</span> Etna Perde | Giyim Mağazası</p>
                    <p><span className="font-medium">E-mail:</span> info@semacelik.com</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-3">1.2 - ALICI</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-medium">Adı/Soyadı/Ünvanı:</span> ________________</p>
                    <p><span className="font-medium">Adresi:</span> ________________</p>
                    <p><span className="font-medium">Telefon:</span> ________________</p>
                    <p><span className="font-medium">E-mail:</span> ________________</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Madde 2 - Konu */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 2 - KONU
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait internet sitesinden elektronik ortamda siparişini yaptığı 
                  aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı 
                  Tüketicilerin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmeleri Uygulama Esas ve Usulleri Hakkında 
                  Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
                </p>
              </div>
            </section>

            {/* Madde 3 - Sözleşme Konusu Ürün */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 3 - SÖZLEŞME KONUSU ÜRÜN
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Ürünlerin Cinsi ve türü, Miktarı, Marka/Modeli, Rengi, Satış Bedeli yukarıda belirtildiği gibidir.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><span className="font-medium">Ödeme Şekli:</span> ________________</p>
                    <p><span className="font-medium">Teslimat Adresi:</span> ________________</p>
                    <p><span className="font-medium">Teslim Edilecek Kişi:</span> ________________</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-medium">Fatura Adresi:</span> ________________</p>
                    <p><span className="font-medium">Kargo Ücreti:</span> ________________</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Madde 4 - Genel Hükümler */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 4 - GENEL HÜKÜMLER
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: "4.1",
                    content: "ALICI, SATICI internet sitesinde sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu, iş yoğunluğuna göre teslimat süresinin 3 ayı bulabileceğini ve elektronik ortamda gerekli teyidi verdiğini beyan eder."
                  },
                  {
                    title: "4.2",
                    content: "Sözleşme konusu ürün, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde ön bilgiler içinde açıklanan süre içinde ALICI veya gösterdiği adresteki kişi/kuruluşa teslim edilir."
                  },
                  {
                    title: "4.3",
                    content: "Sözleşme konusu ürün, ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu tutulamaz."
                  },
                  {
                    title: "4.4",
                    content: "SATICI, sözleşme konusu ürünün sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile teslim edilmesinden sorumludur."
                  },
                  {
                    title: "4.5",
                    content: "Sözleşme konusu ürünün teslimatı için işbu sözleşmenin imzalı nüshasının SATICI'ya ulaştırılmış olması ve bedelinin ALICI'nın tercih ettiği ödeme şekli ile ödenmiş olması şarttır. Herhangi bir nedenle ürün bedeli ödenmez veya banka kayıtlarında iptal edilir ise, SATICI ürünün teslimi yükümlülüğünden kurtulmuş kabul edilir."
                  },
                  {
                    title: "4.6",
                    content: "Ürünün tesliminden sonra ALICI'ya ait kredi kartının ALICI'nın kusurundan kaynaklanmayan bir şekilde yetkisiz kişilerce haksız veya hukuka aykırı olarak kullanılması nedeni ile ilgili banka veya finans kuruluşun ürün bedelini SATICI'ya ödememesi halinde, ALICI'nın kendisine teslim edilmiş olması kaydıyla ürünün 3 gün içinde SATICI'ya gönderilmesi zorunludur. Bu takdirde nakliye giderleri ALICI'ya aittir."
                  },
                  {
                    title: "4.7",
                    content: "SATICI mücbir sebepler veya nakliyeyi engelleyen hava muhalefeti, ulaşımın kesilmesi gibi olağanüstü durumlar nedeni ile sözleşme konusu ürünü süresi içinde teslim edemez ise, durumu ALICI'ya bildirmekle yükümlüdür. Bu takdirde ALICI siparişin iptal edilmesini, sözleşme konusu ürünün varsa emsali ile değiştirilmesini, ve/veya teslimat süresinin engelleyici durumun ortadan kalkmasına kadar ertelenmesi haklarından birini kullanabilir. ALICI'nın siparişi iptal etmesi halinde ödediği tutar 10 gün içinde kendisine nakten ve defaten ödenir."
                  },
                  {
                    title: "4.8",
                    content: "Garanti belgesi ile satılan ürünlerden olan veya olmayan ürünlerin arızalı veya bozuk olanlar, garanti şartları içinde gerekli onarımın yapılması için SATICI'ya gönderilebilir, bu takdirde kargo giderleri SATICI tarafından karşılanacaktır."
                  },
                  {
                    title: "4.9",
                    content: "İşbu sözleşme, ALICI tarafından imzalanıp SATICI'ya faks veya posta yolu ile ulaştırılmasından sonra geçerlilik kazanır."
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg">
                    <span className="font-semibold text-blue-600">{item.title}.</span>
                    <span className="text-gray-700 ml-2">{item.content}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Madde 5 - Cayma Hakkı */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 5 - CAYMA HAKKI
              </h2>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  ALICI, sözleşme konusu ürünün kendisine veya gösterdiği adresteki kişi/kuruluşa tesliminden itibaren 
                  <span className="font-bold text-red-600"> 14 gün içinde cayma hakkına</span> sahiptir. Cayma hakkının kullanılması için bu süre içinde 
                  SATICI'ya faks, e-mail veya telefon ile bildirimde bulunulması ve ürünün 6. madde hükümleri çerçevesinde 
                  kullanılmamış olması şarttır. Bu hakkın kullanılması halinde, 3. kişiye veya ALICI'ya teslim edilen ürünün 
                  SATICI'ya gönderildiğine ilişkin kargo teslim tutanağı örneği ile fatura aslının iadesi zorunludur. 
                  Bu belgelerin ulaşmasını takip eden 14 gün içinde ürün bedeli ALICI'ya iade edilir. Fatura aslı gönderilmez ise 
                  KDV ve varsa sair yasal yükümlülükler iade edilemez. Cayma hakkı nedeni ile iade edilen ürünün kargo bedeli 
                  SATICI tarafından karşılanır.
                </p>
              </div>
            </section>

            {/* Madde 6 - Cayma Hakkı Kullanılamayacak Ürünler */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 6 - CAYMA HAKKI KULLANILAMAYACAK ÜRÜNLER
              </h2>
              <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  Niteliği itibarıyla iade edilemeyecek ürünler, tek kullanımlık ürünler, kopyalanabilir yazılım ve programlar, 
                  sarf malzemeleri, hızlı bozulan veya son kullanım tarihi geçen ürünler ve hizmet için cayma hakkı kullanılamaz.
                </p>
              </div>
            </section>

            {/* Madde 7 - Genel Hükümler */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 7 - GENEL HÜKÜMLER
              </h2>
              <div className="space-y-3">
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <span className="font-semibold text-blue-600">7.1.</span>
                  <span className="text-gray-700 ml-2">18 yaşından küçük kişiler SATICI'dan alış-veriş yapamaz.</span>
                </div>
                <div className="bg-white border border-gray-200 p-4 rounded-lg">
                  <span className="font-semibold text-blue-600">7.2.</span>
                  <span className="text-gray-700 ml-2">Dizgi ve sistem hatalarından meydana gelen fiyat yanlışlıklarından SATICI sorumlu değildir.</span>
                </div>
              </div>
            </section>

            {/* Madde 8 - Yetkili Mahkeme */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                MADDE 8 - YETKİLİ MAHKEME
              </h2>
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  İşbu sözleşmenin uygulanmasında, Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri 
                  ile ALICI'nın veya SATICI'nın yerleşim yerindeki Tüketici Mahkemeleri yetkilidir. Siparişin gerçekleşmesi durumunda 
                  ALICI işbu sözleşmenin tüm koşullarını kabul etmiş sayılır.
                </p>
              </div>
            </section>

            {/* İmza Alanı */}
            <section className="border-t-2 border-gray-300 pt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-4">SATICI</h3>
                    <p className="font-semibold text-gray-800">Etna Perde | Giyim Mağazası</p>
                    <div className="mt-8 border-t border-blue-300 pt-2">
                      <p className="text-sm text-gray-600">İmza</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-bold text-green-900 mb-4">ALICI</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Adı/Soyadı: ________________</p>
                      <p>Tarih: ________________</p>
                    </div>
                    <div className="mt-8 border-t border-green-300 pt-2">
                      <p className="text-sm text-gray-600">İmza</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer Note */}
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">
                Bu sözleşme 6502 sayılı Tüketicilerin Korunması Hakkındaki Kanun ve ilgili yönetmelikler çerçevesinde hazırlanmıştır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}