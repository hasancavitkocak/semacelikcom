import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Build time'da environment variable'lar yoksa default değerler kullan
const defaultUrl = 'https://cpeabuvpwftdejqxvsls.supabase.co'
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZWFidXZwd2Z0ZGVqcXh2c2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjAxMzYsImV4cCI6MjA4MDgzNjEzNn0.1eHCTMTT9Xy6sWP0ygf0SSD0BXv0Ab8O_RsPGTcqnSM'

const finalUrl = supabaseUrl || defaultUrl
const finalKey = supabaseAnonKey || defaultKey

if (!finalUrl || !finalKey) {
  console.error('Supabase configuration missing:', { hasUrl: !!finalUrl, hasKey: !!finalKey })
}

// Singleton pattern - hot reload'da yeni instance oluşmasını engelle
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createClient(finalUrl, finalKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-auth-token'
    }
  })

  return supabaseInstance
}

// Global'de sakla - hot reload'da kaybolmasın
declare global {
  var __supabase: SupabaseClient | undefined
}

export const supabase = globalThis.__supabase ?? getSupabaseClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__supabase = supabase
}
