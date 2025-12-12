'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  email: string
  full_name: string
  phone?: string
  role?: string
}

interface AuthContextType {
  user: UserData | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // İlk session kontrolü
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Auth değişikliklerini dinle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserData = async (userId: string) => {
    try {
      // Cache kontrolü - 10 dakika
      const cacheKey = `user_data_${userId}`
      const cached = localStorage.getItem(cacheKey)
      const cacheTime = localStorage.getItem(cacheKey + '_time')
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < 10 * 60 * 1000) { // 10 dakika
          setUser(JSON.parse(cached))
          setLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      let userData: UserData
      if (error || !data) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
          userData = {
            id: authUser.id,
            email: authUser.email || '',
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Kullanıcı',
            phone: authUser.user_metadata?.phone,
            role: 'customer'
          }
        } else {
          setLoading(false)
          return
        }
      } else {
        userData = {
          id: data.id,
          email: data.email,
          full_name: data.full_name || 'Kullanıcı',
          phone: data.phone,
          role: data.role
        }
      }

      setUser(userData)
      localStorage.setItem(cacheKey, JSON.stringify(userData))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
    } catch (error) {
      // Sessiz hata
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) return { error }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    
    // Cache'i temizle
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_data_') || key.startsWith('cart_')) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  const refreshUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser) {
      await loadUserData(authUser.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
