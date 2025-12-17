import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hakkımızda | Semacelik',
  description: 'Semacelik - 2018 yılından bu yana bayan giyim alanında imalat ve ihracatta hizmet veren uzman kadromuzla kaliteli tasarımlar sunuyoruz.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 px-8 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-4">
                HAKKIMIZDA
              </h1>
              <p className="text-pink-100 text-lg max-w-2xl mx-auto">
                Bayan giyim alanında kalite ve şıklığı bir araya getiren SEMACELIK ailesi
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-12 space-y-12">
            
            {/* Ana Hikaye */}
            <section className="text-center">
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-8 rounded-xl border border-pink-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Hikayemiz</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Bayan giyim alanında imalat ve ihracatta <span className="font-semibold text-pink-600">2018 yılından bu yana</span> 
                    hizmet veren <span className="font-bold text-purple-700">SEMACELIK</span>, faaliyete başladığı günden bugüne 
                    bayan giyim alanında uzman kadrosuyla <span className="font-semibold">tasarım, planlama ve kesim süreçlerini</span> 
                    bünyesinde barındırmaktadır.
                  </p>
                </div>
              </div>
            </section>

            {/* Misyon ve Vizyon */}
            <section>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Misyon */}
                <div className="bg-white border-2 border-pink-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-pink-700">MİSYONUMUZ</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-center">
                    Modern ve şık tasarım öğelerini birleştirip günlük kullanıma uygun ve zamansız parçaları 
                    <span className="font-semibold text-pink-600"> kaliteli kumaşlarla</span> buluşturup koleksiyonlar oluşturmaktır.
                  </p>
                  <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                    <p className="text-sm text-pink-800 font-medium text-center">
                      Koleksiyonun tüm parçaları özel olarak tasarlanıp <span className="font-bold">el işçiliğiyle</span> hazırlanmaktadır.
                    </p>
                  </div>
                </div>

                {/* Vizyon */}
                <div className="bg-white border-2 border-purple-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-purple-700">VİZYONUMUZ</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-center">
                    <span className="font-semibold text-purple-600">Kalite standartlarının üzerinde</span> üretim yaparak 
                    müşteri memnuniyeti odaklı varlığımızı sürdürerek <span className="font-bold text-purple-700">markamıza değer katmak.</span>
                  </p>
                </div>
              </div>
            </section>

            {/* Değerlerimiz */}
            <section>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Değerlerimiz</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: "✨",
                    title: "Kalite",
                    description: "Standartların üzerinde üretim yaparak en yüksek kaliteyi sunuyoruz.",
                    color: "from-yellow-400 to-orange-500"
                  },
                  {
                    icon: "🎨",
                    title: "Tasarım",
                    description: "Modern ve şık tasarım öğeleriyle zamansız parçalar yaratıyoruz.",
                    color: "from-pink-400 to-red-500"
                  },
                  {
                    icon: "👥",
                    title: "Müşteri Memnuniyeti",
                    description: "Müşteri memnuniyeti odaklı yaklaşımımızla hizmet veriyoruz.",
                    color: "from-blue-400 to-purple-500"
                  }
                ].map((value, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className={`w-12 h-12 bg-gradient-to-r ${value.color} rounded-full flex items-center justify-center text-2xl mb-4`}>
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Süreçlerimiz */}
            <section>
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Üretim Süreçlerimiz</h2>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "1",
                      title: "Tasarım",
                      description: "Uzman kadromuzla modern ve şık tasarımlar oluşturuyoruz.",
                      icon: "🎨"
                    },
                    {
                      step: "2", 
                      title: "Planlama",
                      description: "Detaylı planlama süreciyle en iyi sonuçları hedefliyoruz.",
                      icon: "📋"
                    },
                    {
                      step: "3",
                      title: "Kesim & Üretim",
                      description: "Kaliteli kumaşlarla el işçiliği ile üretim yapıyoruz.",
                      icon: "✂️"
                    }
                  ].map((process, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">{process.icon}</span>
                      </div>
                      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">
                        {process.step}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{process.title}</h3>
                      <p className="text-gray-600 text-sm">{process.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* İstatistikler */}
            <section>
              <div className="bg-gradient-to-r from-pink-600 to-purple-700 rounded-xl p-8 text-white">
                <h2 className="text-3xl font-bold text-center mb-8">Rakamlarla SEMACELIK</h2>
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  {[
                    { number: "2018", label: "Kuruluş Yılı" },
                    { number: "6+", label: "Yıllık Deneyim" },
                    { number: "100%", label: "El İşçiliği" },
                    { number: "∞", label: "Müşteri Memnuniyeti" }
                  ].map((stat, index) => (
                    <div key={index}>
                      <div className="text-3xl font-bold mb-2">{stat.number}</div>
                      <div className="text-pink-100">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className="text-center">
              <div className="bg-white border-2 border-pink-200 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Koleksiyonumuzu Keşfedin</h2>
                <p className="text-gray-600 mb-6">
                  Özel tasarım ve el işçiliği ile hazırlanan zamansız parçalarımızı inceleyin.
                </p>
                <a 
                  href="/products" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors"
                >
                  Ürünleri İncele
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}