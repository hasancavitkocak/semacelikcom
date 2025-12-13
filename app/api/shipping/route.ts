import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from '@/lib/security'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 60, 60000)) { // 60 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'free_shipping_threshold',
        'shipping_cost',
        'express_shipping_cost',
        'same_day_shipping_cost',
        'estimated_delivery_days',
        'express_delivery_days',
        'same_day_delivery_hours'
      ])

    const settings: Record<string, string> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })

    const shippingSettings = {
      freeShippingThreshold: parseFloat(settings.free_shipping_threshold || '500'),
      standardCost: parseFloat(settings.shipping_cost || '29.90'),
      expressCost: parseFloat(settings.express_shipping_cost || '49.90'),
      sameDayCost: parseFloat(settings.same_day_shipping_cost || '79.90'),
      standardDays: settings.estimated_delivery_days || '2-4',
      expressDays: settings.express_delivery_days || '1-2',
      sameDayHours: settings.same_day_delivery_hours || '3-6',
      enableExpress: settings.enable_express_shipping === 'true',
      enableSameDay: settings.enable_same_day_shipping === 'true'
    }

    return NextResponse.json(shippingSettings, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error: any) {
    console.error('Shipping API Error:', error)
    
    // Fallback values
    return NextResponse.json({
      freeShippingThreshold: 500,
      standardCost: 29.90,
      expressCost: 49.90,
      sameDayCost: 79.90,
      standardDays: '2-4',
      expressDays: '1-2',
      sameDayHours: '3-6',
      enableExpress: true,
      enableSameDay: false
    })
  }
}

export async function POST(request: Request) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip, 30, 60000)) { // 30 requests per minute
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const { subtotal, selectedOption = 'standard' } = await request.json()

    if (!subtotal || subtotal <= 0) {
      return NextResponse.json({ error: 'Invalid subtotal' }, { status: 400 })
    }

    // Kargo ayarlarını çek
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', [
        'free_shipping_threshold',
        'shipping_cost',
        'express_shipping_cost',
        'same_day_shipping_cost',
        'estimated_delivery_days',
        'express_delivery_days',
        'same_day_delivery_hours',
        'enable_express_shipping',
        'enable_same_day_shipping'
      ])

    const settings: Record<string, string> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })

    const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || '500')
    const standardCost = parseFloat(settings.shipping_cost || '29.90')
    const expressCost = parseFloat(settings.express_shipping_cost || '49.90')
    const sameDayCost = parseFloat(settings.same_day_shipping_cost || '79.90')

    // Mevcut kargo seçenekleri - sadece aktif olanları ekle
    const availableOptions = [
      {
        id: 'standard',
        name: 'Standart Kargo',
        cost: subtotal >= freeShippingThreshold ? 0 : standardCost,
        estimatedDays: `${settings.estimated_delivery_days || '2-4'} gün`,
        description: subtotal >= freeShippingThreshold ? 'Ücretsiz kargo' : `${standardCost} ₺`
      }
    ]

    // Hızlı kargo aktifse ekle
    if (settings.enable_express_shipping === 'true') {
      availableOptions.push({
        id: 'express',
        name: 'Hızlı Kargo',
        cost: expressCost,
        estimatedDays: `${settings.express_delivery_days || '1-2'} gün`,
        description: `${expressCost} ₺ - Öncelikli teslimat`
      })
    }

    // Aynı gün teslimat aktifse ekle
    if (settings.enable_same_day_shipping === 'true') {
      availableOptions.push({
        id: 'same_day',
        name: 'Aynı Gün Teslimat',
        cost: sameDayCost,
        estimatedDays: `${settings.same_day_delivery_hours || '3-6'} saat`,
        description: `${sameDayCost} ₺ - Sadece şehir içi`
      })
    }

    // Seçilen seçeneği bul
    const selectedShippingOption = availableOptions.find(option => option.id === selectedOption) || availableOptions[0]
    
    const shippingCost = selectedShippingOption.cost
    const isFreeShipping = subtotal >= freeShippingThreshold && selectedOption === 'standard'
    const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal)

    return NextResponse.json({
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      isFreeShipping,
      freeShippingRemaining,
      availableOptions,
      selectedOption: selectedShippingOption
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    console.error('Shipping calculation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}