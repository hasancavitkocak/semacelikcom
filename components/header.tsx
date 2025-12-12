'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, LogOut, Search, Menu, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/contexts/cart-context'
import { useAuth } from '@/contexts/auth-context'

export default function Header() {
  const { cartCount } = useCart()
  const { user, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [siteLogo, setSiteLogo] = useState('')
  const [topBanner, setTopBanner] = useState('2000 TL VE ÜZERİ ALIŞVERİŞLERDE ÜCRETSİZ KARGO! 🚚')
  const [headerMenus, setHeaderMenus] = useState<any[]>([])
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<Set<string>>(new Set())

  useEffect(() => {
    // localStorage'dan logo'yu yükle (sadece client-side)
    if (typeof window !== 'undefined') {
      const cachedLogo = localStorage.getItem('site_logo')
      if (cachedLogo) {
        setSiteLogo(cachedLogo)
      }
    }
    
    loadSiteLogo()
    loadTopBanner()
    loadHeaderMenus()
  }, [])

  const loadSiteLogo = async () => {
    try {
      // Cache kontrolü - 1 saat
      const cached = localStorage.getItem('site_logo_cache')
      const cacheTime = localStorage.getItem('site_logo_cache_time')
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < 60 * 60 * 1000) { // 1 saat
          setSiteLogo(cached)
          return
        }
      }

      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_logo')
        .single()
      
      const logoUrl = data?.value || ''
      setSiteLogo(logoUrl)
      if (logoUrl) {
        localStorage.setItem('site_logo', logoUrl)
        localStorage.setItem('site_logo_cache', logoUrl)
        localStorage.setItem('site_logo_cache_time', Date.now().toString())
      }
    } catch (error: any) {
      setSiteLogo('')
    }
  }

  const loadTopBanner = async () => {
    try {
      // Cache kontrolü - 30 dakika
      const cached = localStorage.getItem('top_banner_cache')
      const cacheTime = localStorage.getItem('top_banner_cache_time')
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < 30 * 60 * 1000) { // 30 dakika
          setTopBanner(cached)
          return
        }
      }

      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'top_banner')
        .single()
      
      const bannerText = data?.value || '2000 TL VE ÜZERİ ALIŞVERİŞLERDE ÜCRETSİZ KARGO! 🚚'
      setTopBanner(bannerText)
      localStorage.setItem('top_banner_cache', bannerText)
      localStorage.setItem('top_banner_cache_time', Date.now().toString())
    } catch (error) {
      // Hata varsa varsayılan banner kullan
    }
  }

  const loadHeaderMenus = async () => {
    try {
      // Cache kontrolü - 15 dakika
      const cached = localStorage.getItem('header_menus_cache')
      const cacheTime = localStorage.getItem('header_menus_cache_time')
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < 15 * 60 * 1000) { // 15 dakika
          setHeaderMenus(JSON.parse(cached))
          return
        }
      }

      const { data, error } = await supabase
        .from('menus')
        .select(`
          *,
          menu_items:menu_items(
            *,
            category:categories(name, slug)
          )
        `)
        .eq('show_in_header', true)
        .eq('is_active', true)
        .order('display_order')

      if (error) throw error
      
      const menus = data || []
      setHeaderMenus(menus)
      localStorage.setItem('header_menus_cache', JSON.stringify(menus))
      localStorage.setItem('header_menus_cache_time', Date.now().toString())
    } catch (error) {
      // Sessiz hata
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout hatası:', error)
      window.location.href = '/login'
    }
  }

  const toggleMobileMenu = (menuId: string) => {
    const newExpanded = new Set(expandedMobileMenus)
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId)
    } else {
      newExpanded.add(menuId)
    }
    setExpandedMobileMenus(newExpanded)
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Announcement Bar */}
      {topBanner && (
        <div className="bg-gray-800 text-white text-center py-2 px-4">
          <p className="text-xs md:text-sm font-medium">
            {topBanner}
          </p>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Left Side: Menu + Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Menu - Mobile (Logonun solunda) */}
            <button 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {siteLogo && (
                <img 
                  src={siteLogo} 
                  alt="Logo" 
                  className="h-12 md:h-16 object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              )}
            </Link>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase">
            {headerMenus.map((menu) => (
              <div key={menu.id} className="relative group">
                <Link 
                  href={
                    menu.redirect_category_id 
                      ? `/products?category=${menu.redirect_category_id}` 
                      : `/products?menu=${menu.slug}`
                  } 
                  className="hover:text-gray-900 transition flex items-center gap-1"
                >
                  {menu.name}
                  {!menu.redirect_category_id && menu.menu_items && menu.menu_items.length > 0 && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                
                {/* Simple Dropdown Menu */}
                {!menu.redirect_category_id && menu.menu_items && menu.menu_items.length > 0 && (
                  <div className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {menu.menu_items
                        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
                        .map((item: any) => (
                        <Link 
                          key={item.id}
                          href={item.category ? `/products?category=${item.category.slug}` : `/products?menu_item=${item.slug}`}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 transition normal-case"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            

          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">

            {/* Arama - Desktop */}
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                }
              }}
              className="hidden md:flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 transition"
            >
              <Search size={18} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-32 lg:w-48"
              />
            </form>

            {/* Arama - Mobile */}
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden hover:text-gray-900 transition" 
              title="Ara"
            >
              <Search size={20} />
            </button>
            
            {/* Favoriler - Her zaman görünür */}
            <Link href="/favorites" className="hover:text-gray-900 transition" title="Favoriler">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </Link>
            
            {/* Kullanıcı - Desktop Dropdown */}
            <div className="hidden md:block relative group">
              <button className="hover:text-gray-900 transition">
                <User size={22} />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {user ? (
                  <div className="py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{user.full_name || 'Kullanıcı'}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 transition">
                      Profilim
                    </Link>
                    <Link href="/profile/orders" className="block px-4 py-2 text-sm hover:bg-gray-100 transition">
                      Siparişlerim
                    </Link>
                    <Link href="/profile/addresses" className="block px-4 py-2 text-sm hover:bg-gray-100 transition">
                      Adreslerim
                    </Link>
                  </div>
                ) : (
                  <div className="py-2">
                    <Link href="/login" className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 transition">
                      Giriş Yap
                    </Link>
                    <Link href="/register" className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 transition">
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Kullanıcı - Mobile */}
            <Link href={user ? "/profile" : "/login"} className="md:hidden hover:text-gray-900 transition" title={user ? "Profil" : "Giriş"}>
              <User size={20} />
            </Link>
            
            {/* Sepet - Her zaman görünür */}
            <Link href="/cart" className="hover:text-gray-900 transition relative">
              <ShoppingCart size={20} className="md:w-[22px] md:h-[22px]" />
              <span className={`absolute -top-2 -right-2 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold ${
                cartCount > 0 ? 'bg-gray-900' : 'bg-gray-400'
              }`}>
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t py-4 px-4">
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  setMobileSearchOpen(false)
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                }
              }}
              className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3"
            >
              <Search size={20} className="text-gray-500" />
              <input 
                type="text" 
                placeholder="Ürün ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent border-none outline-none text-base flex-1"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </form>
          </div>
        )}

        {/* Modern Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t bg-white shadow-lg">
            {/* Simple User Section */}
            {user ? (
              <div className="border-b border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.full_name || 'Kullanıcı'}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link 
                    href="/profile" 
                    className="flex-1 text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded text-xs font-medium transition-colors text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex-1 text-center py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-xs font-medium transition-colors"
                  >
                    Çıkış
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-b border-gray-100 p-4">
                <Link 
                  href="/login" 
                  className="flex items-center justify-center gap-2 w-full py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={16} />
                  Giriş Yap / Kayıt Ol
                </Link>
              </div>
            )}
            
            {/* Categories Section */}
            <div className="p-4 space-y-1">
            
              {/* Simple Menu List */}
              {headerMenus.map((menu) => (
                <div key={menu.id}>
                  {menu.redirect_category_id ? (
                    // Direkt yönlendirme varsa normal link
                    <Link 
                      href={`/products?category=${menu.redirect_category_id}`}
                      className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 font-medium text-gray-900 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>{menu.name}</span>
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ) : (
                    // Alt kategoriler varsa accordion
                    <>
                      <button
                        onClick={() => toggleMobileMenu(menu.id)}
                        className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 font-medium text-gray-900 text-left text-sm"
                      >
                        <span>{menu.name}</span>
                        {menu.menu_items && menu.menu_items.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {menu.menu_items.length}
                            </span>
                            <svg 
                              className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                                expandedMobileMenus.has(menu.id) ? 'rotate-180' : ''
                              }`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        )}
                      </button>
                      
                      {/* Alt kategoriler - Simple list */}
                      {expandedMobileMenus.has(menu.id) && menu.menu_items && menu.menu_items.length > 0 && (
                        <div className="bg-gray-50 mx-2 rounded">
                          {menu.menu_items
                            .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
                            .map((item: any) => (
                            <Link 
                              key={item.id}
                              href={item.category ? `/products?category=${item.category.slug}` : `/products?menu_item=${item.slug}`}
                              className="block py-2 px-4 text-sm text-gray-600 hover:bg-gray-100 first:rounded-t last:rounded-b"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            

          </nav>
        )}
      </div>
    </header>
  )
}
