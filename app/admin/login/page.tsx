'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Zaten giriş yapmışsa admin'e yönlendir
    checkSession()
  }, [])

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      console.log('✅ Zaten giriş yapılmış, yönlendiriliyor...')
      // Direkt yönlendir
      window.location.href = '/admin'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password
      })

      if (authError) {
        setError('E-posta veya şifre hatalı!')
        setLoading(false)
        return
      }

      if (data.session) {
        router.push('/admin')
      }
    } catch (error: any) {
      setError('Giriş yapılamadı!')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Girişi</CardTitle>
          <p className="text-center text-gray-600">semacelik.com</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="admin@semacelik.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input 
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Admin Girişi</p>
              <p className="text-xs">Supabase users tablosunda role='admin' olan hesaplar giriş yapabilir.</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
