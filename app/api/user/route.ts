import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl) {
      throw new Error('supabaseUrl is required. Please set NEXT_PUBLIC_SUPABASE_URL environment variable.')
    }
    if (!supabaseAnonKey) {
      throw new Error('supabaseAnonKey is required. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.')
    }
    
    // Cookie'den auth token al
    const cookieStore = cookies()
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      return NextResponse.json({ user: null })
    }

    const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
      global: {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null })
    }

    // Kullanıcı bilgilerini al
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ 
      user: userData || {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name
      }
    })
  } catch (error: any) {
    console.error('User API error:', error)
    return NextResponse.json({ user: null })
  }
}
