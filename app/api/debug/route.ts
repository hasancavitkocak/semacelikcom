import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Environment variables kontrolü
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
      // İlk 10 karakter göster
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      status: 'OK',
      message: 'Debug endpoint working',
      environment: envCheck
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}