'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import PhoneInput from '@/components/phone-input'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır!')
      setLoading(false)
      return
    }

    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Lütfen tüm zorunlu alanları doldurun!')
      setLoading(false)
      return
    }

    try {
      console.log('📝 Kayıt işlemi başlıyor...')
      console.log('📧 Email:', formData.email)
      console.log('👤 Full Name:', formData.fullName)
      console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      
      // Supabase Auth ile kayıt
      console.log('🔐 SignUp isteği gönderiliyor...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone
          }
        }
      })

      console.log('📊 SignUp yanıtı alındı')
      console.log('✅ Data:', authData)
      console.log('❌ Error:', authError)

      if (authError) {
        console.error('❌ Auth hatası detayı:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        })
        
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı! Giriş yapmayı deneyin.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      if (authData.user) {
        console.log('✅ Auth kaydı başarılı! User ID:', authData.user.id)
        console.log('🎫 Session var mı?', !!authData.session)
        
        // Users tablosuna ekle
        console.log('💾 Users tablosuna ekleniyor...')
        const { error: dbError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: formData.email,
              full_name: formData.fullName,
              phone: formData.phone || null,
              role: 'customer'
            }
          ])

        if (dbError) {
          console.warn('⚠️ Users tablosuna ekleme hatası:', dbError)
        } else {
          console.log('✅ Users tablosuna eklendi!')
        }

        // Email confirmation kapalıysa direkt giriş yap
        if (authData.session) {
          console.log('✅ Session var, ana sayfaya yönlendiriliyor...')
          alert('Kayıt başarılı! Hoş geldiniz.')
          setTimeout(() => {
            window.location.href = '/'
          }, 500)
        } else {
          console.log('⚠️ Session yok, login sayfasına yönlendiriliyor...')
          alert('Kayıt başarılı! Lütfen giriş yapın.')
          setTimeout(() => {
            window.location.href = '/login'
          }, 500)
        }
      } else {
        console.error('⚠️ User oluşturulamadı')
        setError('Kayıt yapılamadı. Lütfen tekrar deneyin.')
        setLoading(false)
      }
    } catch (error: any) {
      console.error('❌ Catch bloğu - Register error:', error)
      console.error('❌ Error stack:', error.stack)
      setError(error.message || 'Kayıt sırasında bir hata oluştu!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Kayıt Olun</h1>
            <p className="text-gray-600">Yeni hesap oluşturun ve alışverişe başlayın</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Ad Soyad *</Label>
                <Input 
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Adınız Soyadınız"
                  className="mt-1.5 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-posta *</Label>
                <Input 
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="ornek@email.com"
                  className="mt-1.5 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Telefon</Label>
                <PhoneInput 
                  value={formData.phone}
                  onChange={(value) => setFormData({...formData, phone: value})}
                  placeholder="05XX XXX XX XX"
                  className="mt-1.5 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900 w-full rounded-md border px-3"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Şifre *</Label>
                <Input 
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="mt-1.5 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Şifre Tekrar *</Label>
                <Input 
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="mt-1.5 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base rounded-lg mt-6 transition-colors" 
                disabled={loading}
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Button>

              <div className="text-center text-sm pt-4 border-t">
                <span className="text-gray-600">Zaten hesabınız var mı? </span>
                <Link href="/login" className="text-gray-900 font-semibold hover:text-gray-700 transition-colors">
                  Giriş Yap
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
