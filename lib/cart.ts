import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  image: string
  material: string
  size: string
  quantity: number
  price: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getSubtotal: () => number
  getShipping: () => number
  getTax: () => number
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existingItem = get().items.find(
          (i) => i.id === item.id && i.material === item.material && i.size === item.size,
        )

        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.id === item.id && i.material === item.material && i.size === item.size
                ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                : i,
            ),
          })
        } else {
          set({
            items: [...get().items, { ...item, quantity: item.quantity || 1 }],
          })
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
          })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getShipping: () => {
        const subtotal = get().getSubtotal()
        if (subtotal === 0) return 0
        if (subtotal > 100) return 0 // Free shipping over $100
        return 8.0
      },

      getTax: () => {
        return get().getSubtotal() * 0.1 // 10% tax
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShipping() + get().getTax()
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
