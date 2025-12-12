'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './auth-context'

interface CartItem {
  id: string
  product_id: string
  variant_id?: string
  quantity: number
  product: {
    name: string
    price: number
    images: { image_url: string; is_primary: boolean }[]
  }
  variant?: {
    color?: { name: string }
    size?: { name: string }
  }
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  loading: boolean
  addToCart: (productId: string, variantId: string | null, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  refreshCart: () => Promise<void>
  showToast: (message: string, type: 'success' | 'error') => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const loadCart = useCallback(async () => {
    if (authLoading) return
    
    if (!user) {
      setCartItems([])
      setLoading(false)
      return
    }

    try {
      // Cache kontrolü - 2 dakika (sepet daha sık değişebilir)
      const cacheKey = `cart_${user.id}`
      const cached = localStorage.getItem(cacheKey)
      const cacheTime = localStorage.getItem(cacheKey + '_time')
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime)
        if (age < 2 * 60 * 1000) { // 2 dakika
          setCartItems(JSON.parse(cached))
          setLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(
            name,
            price,
            images:product_images(image_url, is_primary)
          ),
          variant:product_variants(
            color:colors(name),
            size:sizes(name)
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error
      
      const cartData = data || []
      setCartItems(cartData)
      localStorage.setItem(cacheKey, JSON.stringify(cartData))
      localStorage.setItem(cacheKey + '_time', Date.now().toString())
    } catch (error) {
      // Sessiz hata
    } finally {
      setLoading(false)
    }
  }, [user, authLoading])

  // User değiştiğinde sepeti yükle
  useEffect(() => {
    loadCart()
  }, [loadCart])



  const addToCart = async (productId: string, variantId: string | null, quantity: number) => {
    try {
      if (!user) {
        throw new Error('Giriş yapmalısınız')
      }

      // Aynı ürün ve varyant varsa miktarı güncelle
      const existingItem = cartItems.find(
        item => item.product_id === productId && item.variant_id === variantId
      )

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id)

        if (error) throw error
        
        // Optimistic update - hemen state'i güncelle
        setCartItems(items => 
          items.map(item => 
            item.id === existingItem.id 
              ? { ...item, quantity: newQuantity }
              : item
          )
        )
        showToast(`Sepetteki miktar güncellendi (${newQuantity} adet)`, 'success')
      } else {
        const { data, error } = await supabase
          .from('cart_items')
          .insert([{
            user_id: user.id,
            product_id: productId,
            variant_id: variantId,
            quantity: quantity
          }])
          .select(`
            *,
            product:products(
              name,
              price,
              images:product_images(image_url, is_primary)
            ),
            variant:product_variants(
              color:colors(name),
              size:sizes(name)
            )
          `)
          .single()

        if (error) throw error
        
        // Optimistic update - hemen state'e ekle
        if (data) {
          setCartItems(items => [...items, data])
        }
        showToast('Ürün sepete eklendi', 'success')
      }
    } catch (error: any) {
      showToast(error.message || 'Sepete eklenirken hata oluştu', 'error')
      throw error
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      // Optimistic update
      setCartItems(items => items.filter(item => item.id !== itemId))

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)

      if (error) {
        // Hata olursa geri yükle
        await loadCart()
        throw error
      }
      showToast('Ürün sepetten kaldırıldı', 'success')
    } catch (error: any) {
      showToast('Hata oluştu', 'error')
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        await removeFromCart(itemId)
        return
      }

      // Optimistic update
      setCartItems(items => 
        items.map(item => 
          item.id === itemId 
            ? { ...item, quantity }
            : item
        )
      )

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)

      if (error) {
        // Hata olursa geri yükle
        await loadCart()
        throw error
      }
    } catch (error: any) {
      showToast('Hata oluştu', 'error')
      throw error
    }
  }

  const refreshCart = async () => {
    await loadCart()
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      refreshCart,
      showToast
    }}>
      {children}
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-slide-in">
          <div className={`rounded-lg shadow-xl border-2 p-4 min-w-[320px] ${
            toast.type === 'success' 
              ? 'bg-white border-gray-900' 
              : 'bg-white border-red-500'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-1 h-12 rounded-full ${
                toast.type === 'success' ? 'bg-gray-900' : 'bg-red-500'
              }`} />
              <p className={`font-semibold text-gray-800 flex-1 ${
                toast.type === 'success' ? 'text-gray-900' : 'text-red-900'
              }`}>
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
