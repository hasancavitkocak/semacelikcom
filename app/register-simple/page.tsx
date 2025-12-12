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
import { simpleAuth } from '@/lib/simple-auth'

export default function RegisterSimplePage() {
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

    try {
      const user = simpleAuth.register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone
      )

      simpleAuth.setCurrentUser(user)
      alert('Kayıt başarılı!')
      router.push('/profile')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Kayıt Ol (Basit)</CardTitle>
            <p className="text-center text-gray-600 text-sm">Yeni hesap oluşturun</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="fullName">Ad Soyad *</Label>
                <Input 
                  id="fullName"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input 
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input 
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="password">Şifre *</Label>
                <Input 
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                <Input 
                  id="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Zaten hesabınız var mı? </span>
                <Link href="/login-simple" className="text-black font-semibold hover:underline">
                  Giriş Yap
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
