import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Sözleşmesi | Semacelik',
  description: 'Semacelik gizlilik sözleşmesi, kişisel bilgilerinizin korunması ve ödeme güvenliği hakkında detaylı bilgiler.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-teal-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white text-center">
              GİZLİLİK SÖZLEŞMESİ
            </h1>
            <p className="text-green-100 text-center mt-2">
              Kişisel Bilgilerinizin Korunması ve Ödeme Güvenliği
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-8">
            
            {/* Giriş */}
            <section>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <h2 className="text-xl font-bold text-green-800 mb-4">Değerli Üyemiz,</h2>
                <p className="text-gray-700 leading-relaxed">
                  Kişisel bilgilerinizin korunması ve ödeme sırasındaki güvenliğiniz bizim için çok önemlidir. 
                  Bu yüzden bilgilerinizi <span className="font-semibold text-green-700">titizlikle korumanın önemi ve bilinci</span> 
                  ile ödemelerinizi gerçekleştiriyoruz.
                </p>
              </div>
            </section>

            {/* Bilgilerin Alınması ve Korunması */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-200">
                BİLGİLERİNİZİN ALINMASI, KORUNMASI VE ÖDEME AŞAMASI
              </h2>
              
              <div className="space-y-6">
                {/* Gizlilik */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                      🔒
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-800 mb-2">Mutlak Gizlilik</h3>
                      <p className="text-gray-700 leading-relaxed">
                        İstisnasız <span className="font-semibold">tüm müşterilerimize ait kişisel bilgiler, kati suretle gizlilik içerisinde</span> 
                        alınmaktadır. Bununla beraber iş sürecimizin sorunsuz ilerlemesi için müşteri bilgilerimizin saklanması ve 
                        kullanımı kısmen gereklidir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bilgi Saklama */}
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-yellow-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                      💾
                    </div>
                    <div>
                      <h3 className="font-bold text-yellow-800 mb-2">Bilgi Saklama ve Kullanım</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Siparişlerin en iyi şekilde karşılanması için, işin tamamlanmasına yönelik bilgiler sitemizde saklanır ve 
                        gerektiğinde teslimat sırasında <span className="font-semibold">lojistik ve kargo firmalarına aktarılır.</span> 
                        Bunun haricinde kişisel bilgiler <span className="font-bold text-red-600">kesinlikle 3. şahıslara iletilmemektedir.</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pazarlama Kullanımı */}
                <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                      📧
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-800 mb-2">Pazarlama ve İyileştirme</h3>
                      <p className="text-gray-700 leading-relaxed">
                        Müşteri bilgilerini yeni satış kampanyaları hakkında bilgi vermek, ürün ve hizmet sunumunu iyileştirmek üzere 
                        saklar ve kullanır. Ayrıca gerektiğinde <span className="font-semibold">anonim kullanıcı profilleri</span> 
                        pazar araştırması için kullanılmaktadır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ödeme Güvenliği */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-200">
                ÖDEME GÜVENLİĞİ
              </h2>
              
              <div className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">Iyzico Ödeme Sistemi</h3>
                    <p className="text-green-600 text-sm">Optimum güvenlik için güvenilir ödeme altyapısı</p>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed">
                  Ödemeleriniz sırasında <span className="font-bold text-green-700">optimum güvenliğin sağlanması</span> için, 
                  <span className="font-semibold"> Iyzico ödeme sistemini</span> kullanmaktayız. Ödemenin gerçekleştirilmesi için 
                  gerekli olan bilgiler (Örnek: Kredi kartı numarası) <span className="font-bold text-red-600">sitemiz tarafından saklanmamaktadır.</span>
                </p>
              </div>
            </section>

            {/* Müşteri Hakları */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-200">
                MÜŞTERİ HAKLARI
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">Bilgi Talep Hakkı</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Müşteriler kendileri hakkında hangi bilgilerin saklanmış olduğunu öğrenmek için 
                    <span className="font-semibold"> ücretsiz olarak yazılı bilgi talep edebilirler.</span>
                  </p>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-3">Düzeltme ve Silme Hakkı</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Olası düzeltmeler, engellemeler veya bilgilerin silinmesi hakkındaki talepleriniz, 
                    <span className="font-semibold"> yasaların öngördüğü ölçüde, derhal işleme alınmaktadır.</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Güvenlik Önlemleri */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-200">
                GÜVENLİK ÖNLEMLERİ
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    icon: "🔐",
                    title: "SSL Şifreleme",
                    description: "Tüm veri transferleri SSL sertifikası ile şifrelenmektedir.",
                    color: "bg-green-50 border-green-200"
                  },
                  {
                    icon: "🛡️",
                    title: "Güvenli Sunucular",
                    description: "Verileriniz güvenli sunucularda korunmaktadır.",
                    color: "bg-blue-50 border-blue-200"
                  },
                  {
                    icon: "🔒",
                    title: "Erişim Kontrolü",
                    description: "Kişisel bilgilere erişim sıkı kontrol altındadır.",
                    color: "bg-purple-50 border-purple-200"
                  },
                  {
                    icon: "💳",
                    title: "Kart Bilgisi Saklanmaz",
                    description: "Kredi kartı bilgileriniz hiçbir şekilde saklanmamaktadır.",
                    color: "bg-red-50 border-red-200"
                  }
                ].map((security, index) => (
                  <div key={index} className={`${security.color} border p-4 rounded-lg`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{security.icon}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{security.title}</h3>
                        <p className="text-gray-600 text-sm">{security.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* İletişim */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-200">
                SORULARINIZ İÇİN İLETİŞİM
              </h2>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">E-mail</p>
                    <p className="text-gray-600">info@semacelik.com</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Son Not */}
            <section className="bg-gradient-to-r from-green-100 to-teal-100 p-6 rounded-lg text-center">
              <h3 className="font-bold text-gray-900 mb-2">Saygılarımızla,</h3>
              <p className="text-gray-700 font-semibold">SEMACELIK Ekibi</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}