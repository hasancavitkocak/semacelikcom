'use client'

import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

interface Banner {
  id: string
  title: string
  subtitle?: string
  image_url: string
  link_url?: string
}

interface HomeSliderProps {
  banners: Banner[]
  loading?: boolean
}

export default function HomeSlider({ banners, loading = false }: HomeSliderProps) {
  // Loading durumunda skeleton göster
  if (loading) {
    return (
      <div className="h-[200px] sm:h-[300px] md:h-[500px] lg:h-[600px] bg-gray-100 animate-pulse sm:rounded-lg">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Banner yoksa hiçbir şey gösterme
  if (banners.length === 0) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          display: none !important;
        }
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.6 !important;
          width: 10px !important;
          height: 10px !important;
        }
        .swiper-pagination-bullet-active {
          opacity: 1 !important;
          width: 30px !important;
          border-radius: 5px !important;
        }
        .swiper-slide {
          background: white !important;
          overflow: hidden !important;
        }
        .swiper-wrapper {
          background: white !important;
        }
      `}</style>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={banners.length > 1}
        className="h-[200px] sm:h-[300px] md:h-[500px] lg:h-[600px] overflow-hidden sm:rounded-lg"
      >
      {banners.map((banner, index) => {
        const BannerContent = (
          <div className="relative w-full h-full bg-white overflow-hidden">
            <img 
              src={banner.image_url} 
              alt={banner.title}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className="w-full h-full object-cover object-center"
              style={{ minHeight: '100%', minWidth: '100%' }}
              onError={(e) => {
                // Hata durumunda placeholder göster
                const target = e.currentTarget as HTMLImageElement
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDYwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik01ODAgMjgwSDYyMFYzMjBINTgwVjI4MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                target.style.objectFit = 'cover'
              }}
            />
            {(banner.title || banner.subtitle) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end justify-center px-4 pb-6 sm:pb-8 md:pb-12">
                <div className="text-center text-white max-w-4xl">
                  {banner.title && (
                    <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 md:mb-3 drop-shadow-2xl leading-tight">
                      {banner.title}
                    </h2>
                  )}
                  {banner.subtitle && (
                    <p className="text-sm sm:text-base md:text-xl lg:text-2xl drop-shadow-lg">{banner.subtitle}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )

        return (
          <SwiperSlide key={banner.id}>
            {banner.link_url ? (
              <Link href={banner.link_url} className="block w-full h-full">
                {BannerContent}
              </Link>
            ) : (
              BannerContent
            )}
          </SwiperSlide>
        )
      })}
      </Swiper>
    </>
  )
}
