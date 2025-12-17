import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'İptal ve İade Şartları | Etna Perde',
  description: 'Etna Perde ürün iade ve iptal şartları, tüketici hakları ve iade süreci hakkında detaylı bilgiler.',
}

export default function IptalIadeShartlariPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              İPTAL VE İADE ŞARTLARI
            </h1>
            <p className="text-red-100 text-center mt-2">
              Tüketici Hakları ve İade Süreci
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            
            {/* Yasal Dayanak */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-200">
                YASAL DAYANAK
              </h2>
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  Ürün iade istekleri <span className="font-semibold">23/02/1995 tarihli ve 4077 sayılı Tüketicinin Korunması Hakkında Kanunun 31 inci</span> ve 
                  bu Kanuna <span className="font-semibold">4822 sayılı Kanunla eklenen 9/A maddeleri</span> esas alınarak aşağıdaki kriterler dâhilinde yapılmaktadır.
                </p>
              </div>
            </section>

            {/* İade Hakkı */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-200">
                TÜKETİCİ İADE HAKKI
              </h2>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    7
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 mb-2">7 Günlük İade Hakkı</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Kanunen internetten yapılan satışlarda (mesafeli sözleşmeler ile satışlarda) tüketicilerin 
                      <span className="font-bold text-green-700"> teslim aldığı tarihten itibaren 7 gün içerisinde</span> 
                      hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiç bir gerekçe göstermeksizin malı reddederek 
                      <span className="font-bold text-green-700"> ürünü iade hakkı mevcuttur.</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* İade Şartları */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-200">
                İADE ŞARTLARI VE SÜRECİ
              </h2>
              
              <div className="grid gap-6">
                {/* İade Süresi */}
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-yellow-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ⏰
                    </div>
                    <h3 className="font-bold text-yellow-800">İade Süresi</h3>
                  </div>
                  <p className="text-gray-700">
                    Sitemizden yapılmış olan alışverişlerde <span className="font-bold">7 güne kadar</span> fatura ibrazı ile 
                    kullanılmamış ürünlerde iade konusunda destek sağlamaktayız.
                  </p>
                </div>

                {/* İade Yeri */}
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      📍
                    </div>
                    <h3 className="font-bold text-purple-800">İade Yeri</h3>
                  </div>
                  <p className="text-gray-700">
                    İnternet mağazamızdan aldığınız ürünlerin iadeleri <span className="font-bold">sadece internet mağazamıza</span> yapılabilmektedir.
                  </p>
                </div>

                {/* Kargo Ücreti */}
                <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      🚚
                    </div>
                    <h3 className="font-bold text-orange-800">Kargo Ücreti</h3>
                  </div>
                  <p className="text-gray-700">
                    Geri iadelerde <span className="font-bold">kargo ücreti alıcıya aittir.</span>
                  </p>
                </div>
              </div>
            </section>

            {/* İade Süreci Adımları */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-200">
                İADE SÜRECİ ADIMLARI
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "İade Talebinde Bulunun",
                    description: "Ürünü teslim aldığınız tarihten itibaren 7 gün içinde iade talebinde bulunun.",
                    color: "bg-blue-500"
                  },
                  {
                    step: "2", 
                    title: "Ürünü Hazırlayın",
                    description: "Ürünü orijinal ambalajında, kullanılmamış ve hasarsız şekilde hazırlayın.",
                    color: "bg-green-500"
                  },
                  {
                    step: "3",
                    title: "Faturayı Ekleyin", 
                    description: "Ürün ile birlikte fatura aslını veya kopyasını ekleyin.",
                    color: "bg-yellow-500"
                  },
                  {
                    step: "4",
                    title: "Kargo ile Gönderin",
                    description: "Ürünü kargo ile adresimize gönderin. Kargo ücreti size aittir.",
                    color: "bg-purple-500"
                  },
                  {
                    step: "5",
                    title: "İade İşlemi",
                    description: "Ürün tarafımıza ulaştıktan sonra kontrol edilir ve iade işlemi başlatılır.",
                    color: "bg-red-500"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className={`${item.color} text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* İade Edilemeyecek Ürünler */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-200">
                İADE EDİLEMEYECEK ÜRÜNLER
              </h2>
              
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Hijyen kuralları gereği iade edilemeyecek ürünler",
                    "Kullanılmış veya hasarlı ürünler", 
                    "Özel dikim/ölçü ürünler",
                    "Tek kullanımlık ürünler",
                    "Ambalajı açılmış kozmetik ürünler",
                    "Son kullanım tarihi geçmiş ürünler"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* İletişim Bilgileri */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-200">
                İADE İÇİN İLETİŞİM
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">İletişim Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">E-mail:</span> info@semacelik.com</p>
                      <p><span className="font-medium">Firma:</span> Etna Perde | Giyim Mağazası</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">İade Süreci</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• İade talebinizi e-mail ile bildirin</p>
                      <p>• Ürün kontrolü 2-3 iş günü sürer</p>
                      <p>• Onay sonrası iade işlemi başlatılır</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Önemli Notlar */}
            <section className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-4 text-center">ÖNEMLİ NOTLAR</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• İade hakkınız yasal bir haktır ve hiçbir gerekçe göstermek zorunda değilsiniz.</p>
                <p>• Ürünler hasarsız ve kullanılmamış olarak iade edilmelidir.</p>
                <p>• İade kargo ücreti müşteriye aittir.</p>
                <p>• İade süreci tamamlandıktan sonra ödeme iadeniz 10 iş günü içinde yapılır.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}