import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    // İlk 20 karakter göster (güvenlik için)
    supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
    nextAuthUrlPreview: process.env.NEXTAUTH_URL?.substring(0, 30) + '...',
    timestamp: new Date().toISOString()
  })
}