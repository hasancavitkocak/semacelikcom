'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Session kontrolü
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        setLoading(false)
        return
      }

      setUser(session.user)

      // Role kontrolü
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!error && userData) {
        setUserRole(userData.role)
      }

      setLoading(false)
    } catch (error) {
      console.error('Auth check error:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Auth Test Sayfası</h1>
      
      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Kullanıcı Bilgileri</h2>
        
        {user ? (
          <div className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {userRole || 'Bilinmiyor'}</p>
            <p><strong>Admin mi?:</strong> {userRole === 'admin' ? '✅ Evet' : '❌ Hayır'}</p>
          </div>
        ) : (
          <p className="text-red-600">Giriş yapılmamış!</p>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Test Sonucu</h3>
        {user && userRole === 'admin' ? (
          <p className="text-green-600">✅ Admin paneline erişim yetkisi var!</p>
        ) : (
          <p className="text-red-600">❌ Admin paneline erişim yetkisi yok!</p>
        )}
      </div>
    </div>
  )
}