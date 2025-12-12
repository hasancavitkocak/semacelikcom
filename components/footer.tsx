'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Footer() {
  const [openSections, setOpenSections] = useState<string[]>([])
  const [footerMenus, setFooterMenus] = useState<any[]>([])

  useEffect(() => {
    loadFooterMenus()
  }, [])

  const loadFooterMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select(`
          *,
          menu_items:menu_items(
            *,
            category:categories(name, slug)
          )
        `)
        .eq('show_in_footer', true)
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      setFooterMenus(data || [])
    } catch (error) {
      console.error('Load footer menus error:', error)
    }
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  return (
    <footer className="bg-black text-white mt-12 md:mt-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Desktop Grid */}
        <div className={`hidden md:grid gap-6 md:gap-8 ${footerMenus.length > 0 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {/* Dinamik Menüler */}
          {footerMenus.map((menu) => (
            <div key={menu.id}>
              <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">{menu.name}</h3>
              <ul className="space-y-2 text-sm md:text-base">
                {menu.menu_items && menu.menu_items.length > 0 ? (
                  menu.menu_items.map((item: any) => (
                    <li key={item.id}>
                      <Link 
                        href={item.category ? `/products?category=${item.category.slug}` : `/products?menu_item=${item.slug}`}
                        className="hover:underline"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li>
                    <Link href={`/products?menu=${menu.slug}`} className="hover:underline">
                      Tüm {menu.name}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
          {/* Kurumsal */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Kurumsal</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link href="/" className="hover:underline">Anasayfa</Link></li>
              <li><Link href="/about" className="hover:underline">Hakkımızda</Link></li>
              <li><Link href="/privacy" className="hover:underline">Gizlilik Sözleşmesi</Link></li>
              <li><Link href="/contact" className="hover:underline">İletişim</Link></li>
            </ul>
          </div>

          {/* Müşteri İlişkileri */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Müşteri İlişkileri</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link href="/register" className="hover:underline">Üyelik</Link></li>
              <li><Link href="/products" className="hover:underline">Alışveriş</Link></li>
              <li><Link href="/shipping" className="hover:underline">Kargo & Teslimat</Link></li>
              <li><Link href="/kvkk" className="hover:underline">KVKK</Link></li>
            </ul>
          </div>

          {/* Yardım */}
          <div>
            <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Yardım</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><Link href="/sales-agreement" className="hover:underline">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/faq" className="hover:underline">Sıkça Sorulan Sorular</Link></li>
              <li><Link href="/terms" className="hover:underline">İptal ve İade Şartları</Link></li>
            </ul>
            
            {/* Social Media */}
            <div className="flex gap-4 mt-4 md:mt-6">
              <a href="#" className="hover:text-gray-300" aria-label="Instagram">
                <Instagram size={20} className="md:w-6 md:h-6" />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="Facebook">
                <Facebook size={20} className="md:w-6 md:h-6" />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="Twitter">
                <Twitter size={20} className="md:w-6 md:h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Accordion */}
        <div className="md:hidden space-y-1">
          {/* Dinamik Menüler */}
          {footerMenus.map((menu) => (
            <div key={menu.id} className="border-b border-gray-700">
              <button
                onClick={() => toggleSection(menu.slug)}
                className="w-full flex items-center justify-between py-4 font-bold text-left"
              >
                <span>{menu.name}</span>
                {openSections.includes(menu.slug) ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {openSections.includes(menu.slug) && (
                <div className="pb-4">
                  <ul className="space-y-3 text-sm">
                    {menu.menu_items && menu.menu_items.length > 0 ? (
                      menu.menu_items.map((item: any) => (
                        <li key={item.id}>
                          <Link 
                            href={item.category ? `/products?category=${item.category.slug}` : `/products?menu_item=${item.slug}`}
                            className="block py-1 hover:text-gray-300"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Link 
                          href={`/products?menu=${menu.slug}`} 
                          className="block py-1 hover:text-gray-300"
                        >
                          Tüm {menu.name}
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {/* Kurumsal */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => toggleSection('kurumsal')}
              className="w-full flex items-center justify-between py-4 font-bold text-left"
            >
              <span>Kurumsal</span>
              {openSections.includes('kurumsal') ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {openSections.includes('kurumsal') && (
              <div className="pb-4">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/" className="block py-1 hover:text-gray-300">Anasayfa</Link></li>
                  <li><Link href="/about" className="block py-1 hover:text-gray-300">Hakkımızda</Link></li>
                  <li><Link href="/privacy" className="block py-1 hover:text-gray-300">Gizlilik Sözleşmesi</Link></li>
                  <li><Link href="/contact" className="block py-1 hover:text-gray-300">İletişim</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Müşteri İlişkileri */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => toggleSection('musteri')}
              className="w-full flex items-center justify-between py-4 font-bold text-left"
            >
              <span>Müşteri İlişkileri</span>
              {openSections.includes('musteri') ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {openSections.includes('musteri') && (
              <div className="pb-4">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/register" className="block py-1 hover:text-gray-300">Üyelik</Link></li>
                  <li><Link href="/products" className="block py-1 hover:text-gray-300">Alışveriş</Link></li>
                  <li><Link href="/shipping" className="block py-1 hover:text-gray-300">Kargo & Teslimat</Link></li>
                  <li><Link href="/kvkk" className="block py-1 hover:text-gray-300">KVKK</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Yardım */}
          <div className="border-b border-gray-700">
            <button
              onClick={() => toggleSection('yardim')}
              className="w-full flex items-center justify-between py-4 font-bold text-left"
            >
              <span>Yardım</span>
              {openSections.includes('yardim') ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
            {openSections.includes('yardim') && (
              <div className="pb-4">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/sales-agreement" className="block py-1 hover:text-gray-300">Mesafeli Satış Sözleşmesi</Link></li>
                  <li><Link href="/faq" className="block py-1 hover:text-gray-300">Sıkça Sorulan Sorular</Link></li>
                  <li><Link href="/terms" className="block py-1 hover:text-gray-300">İptal ve İade Şartları</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Social Media - Always visible on mobile */}
          <div className="py-4">
            <h3 className="font-bold mb-4">Bizi Takip Edin</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-gray-300" aria-label="Instagram">
                <Instagram size={24} />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="Facebook">
                <Facebook size={24} />
              </a>
              <a href="#" className="hover:text-gray-300" aria-label="Twitter">
                <Twitter size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm text-gray-400">
          <p>&copy; 2024 semacelik.com - Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}
