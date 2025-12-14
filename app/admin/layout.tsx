'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LayoutDashboard, Package, Palette, ShoppingBag, FolderOpen, Ticket, Users, Settings, LogOut, Home, Image, Star, Menu, Truck, ChevronDown, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Login sayfasındaysa layout gösterme
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Client-side render bekle
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar - Hidden on mobile */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 bg-gray-900 shadow-2xl lg:flex flex-col z-40">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Dashboard */}
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive('/admin') 
                ? 'bg-white text-gray-900 shadow-lg' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>

          {/* E-ticaret */}
          <div>
            <button
              onClick={() => toggleSection('ecommerce')}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} />
                <span className="font-medium text-sm">E-ticaret</span>
              </div>
              {expandedSections.includes('ecommerce') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>
            {expandedSections.includes('ecommerce') && (
              <div className="ml-4 space-y-1 border-l border-gray-700 pl-4">
                <Link 
                  href="/admin/orders" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/orders') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <ShoppingBag size={16} />
                  <span>Siparişler</span>
                </Link>
                
                <Link 
                  href="/admin/products" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    pathname?.startsWith('/admin/products') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Package size={16} />
                  <span>Ürünler</span>
                </Link>
                
                <Link 
                  href="/admin/categories" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/categories') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FolderOpen size={16} />
                  <span>Kategoriler</span>
                </Link>
                
                <Link 
                  href="/admin/variants" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/variants') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Palette size={16} />
                  <span>Renk & Beden</span>
                </Link>
              </div>
            )}
          </div>

          {/* İçerik Yönetimi */}
          <div>
            <button
              onClick={() => toggleSection('content')}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Image size={18} />
                <span className="font-medium text-sm">İçerik</span>
              </div>
              {expandedSections.includes('content') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>
            {expandedSections.includes('content') && (
              <div className="ml-4 space-y-1 border-l border-gray-700 pl-4">
                <Link 
                  href="/admin/banners" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/banners') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Image size={16} />
                  <span>Banner</span>
                </Link>
                
                <Link 
                  href="/admin/featured" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/featured') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Star size={16} />
                  <span>Vitrin</span>
                </Link>
                
                <Link 
                  href="/admin/home-blocks" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/home-blocks') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span>Ana Sayfa</span>
                </Link>
                
                <Link 
                  href="/admin/menus" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/menus') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Menu size={16} />
                  <span>Menü</span>
                </Link>
              </div>
            )}
          </div>

          {/* Sistem */}
          <div>
            <button
              onClick={() => toggleSection('system')}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span className="font-medium text-sm">Sistem</span>
              </div>
              {expandedSections.includes('system') ? 
                <ChevronDown size={16} /> : 
                <ChevronRight size={16} />
              }
            </button>
            {expandedSections.includes('system') && (
              <div className="ml-4 space-y-1 border-l border-gray-700 pl-4">
                <Link 
                  href="/admin/users" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/users') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Users size={16} />
                  <span>Kullanıcılar</span>
                </Link>
                
                <Link 
                  href="/admin/shipping" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/shipping') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Truck size={16} />
                  <span>Kargo</span>
                </Link>
                
                <Link 
                  href="/admin/coupons" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/coupons') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Ticket size={16} />
                  <span>Kuponlar</span>
                </Link>
                
                <Link 
                  href="/admin/settings" 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive('/admin/settings') 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Settings size={16} />
                  <span>Ayarlar</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
        
        {/* Footer Actions */}
        <div className="p-4 space-y-2 border-t border-gray-800">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
          >
            <Home size={20} />
            <span className="font-medium">Siteye Dön</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 hover:text-red-300 transition-all duration-200 text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedSections(prev => prev.length > 0 ? [] : [])}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Menu size={16} />
            </button>
            <Link href="/" className="text-sm bg-gray-800 px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors">
              <Home size={16} className="inline mr-1" />
              Site
            </Link>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {expandedSections.length > 0 && (
          <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
            <Link 
              href="/admin" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/admin') 
                  ? 'bg-white text-gray-900' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            {/* E-ticaret */}
            <div>
              <button
                onClick={() => toggleSection('ecommerce')}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} />
                  <span className="font-medium text-sm">E-ticaret</span>
                </div>
                {expandedSections.includes('ecommerce') ? 
                  <ChevronDown size={14} /> : 
                  <ChevronRight size={14} />
                }
              </button>
              {expandedSections.includes('ecommerce') && (
                <div className="ml-4 space-y-1 border-l border-gray-700 pl-3">
                  <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <ShoppingBag size={14} />
                    <span>Siparişler</span>
                  </Link>
                  <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Package size={14} />
                    <span>Ürünler</span>
                  </Link>
                  <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <FolderOpen size={14} />
                    <span>Kategoriler</span>
                  </Link>
                  <Link href="/admin/variants" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Palette size={14} />
                    <span>Renk & Beden</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* İçerik */}
            <div>
              <button
                onClick={() => toggleSection('content')}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Image size={16} />
                  <span className="font-medium text-sm">İçerik</span>
                </div>
                {expandedSections.includes('content') ? 
                  <ChevronDown size={14} /> : 
                  <ChevronRight size={14} />
                }
              </button>
              {expandedSections.includes('content') && (
                <div className="ml-4 space-y-1 border-l border-gray-700 pl-3">
                  <Link href="/admin/banners" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Image size={14} />
                    <span>Banner</span>
                  </Link>
                  <Link href="/admin/featured" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Star size={14} />
                    <span>Vitrin</span>
                  </Link>
                  <Link href="/admin/home-blocks" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <LayoutDashboard size={14} />
                    <span>Ana Sayfa</span>
                  </Link>
                  <Link href="/admin/menus" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Menu size={14} />
                    <span>Menü</span>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Sistem */}
            <div>
              <button
                onClick={() => toggleSection('system')}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings size={16} />
                  <span className="font-medium text-sm">Sistem</span>
                </div>
                {expandedSections.includes('system') ? 
                  <ChevronDown size={14} /> : 
                  <ChevronRight size={14} />
                }
              </button>
              {expandedSections.includes('system') && (
                <div className="ml-4 space-y-1 border-l border-gray-700 pl-3">
                  <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Users size={14} />
                    <span>Kullanıcılar</span>
                  </Link>
                  <Link href="/admin/shipping" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Truck size={14} />
                    <span>Kargo</span>
                  </Link>
                  <Link href="/admin/coupons" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Ticket size={14} />
                    <span>Kuponlar</span>
                  </Link>
                  <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200">
                    <Settings size={14} />
                    <span>Ayarlar</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="w-full lg:ml-64 min-h-screen pt-16 lg:pt-0 p-4 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
