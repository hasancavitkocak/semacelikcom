'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'

export default function ProfilePage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      if (!authUser) {
        router.push('/login')
        return
      }
      checkUser()
    }
  }, [authUser, authLoading])

  const checkUser = async () => {
    try {
      console.log('🔍 Profil: Kullanıcı kontrol ediliyor...')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      console.log('👤 Auth User:', authUser, 'Error:', authError)
      
      if (!authUser) {
        console.log('❌ Kullanıcı bulunamadı, login\'e yönlendiriliyor...')
        alert('Profil sayfasını görüntülemek için giriş yapmalısınız!')
        router.push('/login')
        return
      }

      console.log('✅ Kullanıcı bulundu:', authUser.email)

      // Kullanıcı bilgilerini al
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        // Eğer kullanıcı users tablosunda yoksa, oluşturmayı dene
        if (error.code === 'PGRST116') {
          console.log('👤 Kullanıcı kaydı oluşturuluyor...')
          
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: authUser.id,
                email: authUser.email || '',
                full_name: authUser.user_metadata?.full_name || (authUser.email ? authUser.email.split('@')[0] : 'Kullanıcı'),
                phone: authUser.user_metadata?.phone || null,
                role: 'customer'
              }
            ])
            .select()
            .single()

          if (insertError) {
            console.warn('⚠️ Kullanıcı kaydı oluşturulamadı (RLS politikası gerekebilir):', insertError.message)
            // Yine de auth bilgilerini göster
            setUser({
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || (authUser.email ? authUser.email.split('@')[0] : 'Kullanıcı'),
              role: 'customer'
            })
          } else {
            setUser(newUser)
          }
        } else {
          // Başka bir hata (RLS vb.), auth bilgilerini göster
          console.warn('⚠️ Users tablosundan veri çekilemedi:', error.message)
          setUser({
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || (authUser.email ? authUser.email.split('@')[0] : 'Kullanıcı'),
            role: 'customer'
          })
        }
      } else {
        setUser(userData)
      }
    } catch (error) {
      console.error('Check user error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Hesabım</h1>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sol Menü */}
            <nav className="space-y-2">
              <Link href="/profile" className="block px-4 py-3 bg-orange-50 text-orange-600 font-semibold">
                Hesap Bilgileri
              </Link>
              <Link href="/profile/addresses" className="block px-4 py-3 hover:bg-gray-100 transition">
                Adreslerim
              </Link>
              <Link href="/profile/orders" className="block px-4 py-3 hover:bg-gray-100 transition">
                Siparişlerim
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className="block px-4 py-3 bg-gray-900 text-white font-semibold hover:bg-gray-800 transition">
                  🔐 Admin Paneli
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 transition"
              >
                Çıkış Yap
              </button>
            </nav>

            {/* İçerik */}
            <div className="md:col-span-3">
              {/* Hesap Bilgileri */}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Kişisel Bilgiler</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Ad Soyad</label>
                    <p className="text-lg font-semibold">{user?.full_name || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">E-posta</label>
                    <p className="text-lg font-semibold">{user?.email || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Telefon</label>
                    <p className="text-lg font-semibold">{user?.phone || 'Belirtilmemiş'}</p>
                  </div>

                  {user?.role && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Hesap Türü</label>
                      <p className="text-lg font-semibold">
                        {user.role === 'admin' ? '🔐 Admin' : '👤 Müşteri'}
                      </p>
                    </div>
                  )}
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
