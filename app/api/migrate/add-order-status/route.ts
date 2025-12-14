import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are required')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST() {
  try {
    // Add order_status column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'created';
        
        CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
        
        UPDATE orders 
        SET order_status = 'created' 
        WHERE status = 'paid' AND order_status IS NULL;
      `
    })

    if (alterError) {
      console.error('Migration error:', alterError)
      return NextResponse.json({ 
        success: false,
        error: 'Migration failed',
        details: alterError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Order status column added successfully'
    })
  } catch (error: any) {
    console.error('Migration error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Migration failed',
      details: error.message 
    }, { status: 500 })
  }
}