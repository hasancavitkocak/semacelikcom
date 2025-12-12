'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading, signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Zaten giriş yapmışsa ana sayfaya yönlendir
    if (!authLoading && user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setError('')
    setLoading(true)

    try {
      const { error: authError } = await signIn(formData.email, formData.password)

      if (authError) {
        setError('E-posta veya şifre hatalı!')
        setLoading(false)
        return
      }

      router.push('/')
    } catch (error: any) {
      setError('Giriş yapılamadı!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Hoş Geldiniz</h1>
            <p className="text-gray-600">Hesabınıza giriş yapın</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-posta</Label>
                <Input 
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="ornek@email.com"
                  className="mt-1.5 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Şifre</Label>
                <Input 
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  className="mt-1.5 h-12 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base rounded-lg transition-colors" 
                disabled={loading}
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
              </Button>

              <div className="text-center text-sm pt-4 border-t">
                <span className="text-gray-600">Hesabınız yok mu? </span>
                <Link href="/register" className="text-gray-900 font-semibold hover:text-gray-700 transition-colors">
                  Kayıt Ol
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
