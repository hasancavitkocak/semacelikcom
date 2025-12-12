'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export default function DebugAuthPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [dbUser, setDbUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // 1. Session kontrolü
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)

      // 2. User kontrolü
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      // 3. DB User kontrolü
      if (currentUser) {
        const { data: dbUserData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('DB User error:', error)
        } else {
          setDbUser(dbUserData)
        }
      }
    } catch (error) {
      console.error('Check auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearSession = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8">Yükleniyor...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Auth Debug</h1>

      <div className="space-y-6">
        {/* Session */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Session</h2>
          {session ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Session Var</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>User ID:</strong> {session.user?.id}</p>
              <p><strong>Expires:</strong> {new Date(session.expires_at * 1000).toLocaleString('tr-TR')}</p>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">❌ Session Yok</p>
          )}
        </div>

        {/* Auth User */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Auth User</h2>
          {user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Auth User Var</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Evet' : '❌ Hayır'}</p>
              <p><strong>Metadata:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(user.user_metadata, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-red-600 font-semibold">❌ Auth User Yok</p>
          )}
        </div>

        {/* DB User */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Database User</h2>
          {dbUser ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ DB User Var</p>
              <p><strong>Email:</strong> {dbUser.email}</p>
              <p><strong>Full Name:</strong> {dbUser.full_name}</p>
              <p><strong>Role:</strong> {dbUser.role}</p>
              <p><strong>Phone:</strong> {dbUser.phone || '-'}</p>
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-semibold">❌ DB User Yok</p>
              <p className="text-sm text-gray-600 mt-2">
                Users tablosunda kayıt bulunamadı. Profil sayfasına giderek otomatik oluşturabilirsiniz.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={handleRefresh}>
            🔄 Yenile
          </Button>
          <Button onClick={handleClearSession} variant="destructive">
            🚪 Çıkış Yap
          </Button>
        </div>

        {/* Cookies */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Cookies</h2>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            {document.cookie || 'Cookie yok'}
          </pre>
        </div>
      </div>
    </div>
  )
}
