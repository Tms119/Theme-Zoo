import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      toggleCart: () => set({ isOpen: !get().isOpen }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (product) => {
        const currentItems = get().items;
        const exists = currentItems.find(item => item._id === product._id);
        
        if (!exists) {
          set({ items: [...currentItems, product], isOpen: true });
        } else {
          set({ isOpen: true }); // Just open if it's already there
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item._id !== productId) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + (item.price_usd || 0), 0);
      }
    }),
    {
      name: 'themezoo-cart', // local storage key
      partialize: (state) => ({ items: state.items }), // only persist items, not isOpen state
    }
  )
);

export default useCart;
