// ─── src/store/cartStore.js ──────────────────────────────────────────────
// Cart Store — manages customer cart state for QR ordering
// Persisted in sessionStorage so cart survives page refreshes.
// ──────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * @typedef {Object} CartItem
 * @property {string} id - Menu item ID
 * @property {string} name - Item name
 * @property {number} price - Unit price
 * @property {number} quantity - Quantity
 * @property {string} imageUrl - Item image
 * @property {string} [notes] - Special instructions
 */

/**
 * @typedef {Object} CartStore
 * @property {CartItem[]} items - Cart items
 * @property {string|null} restaurantId - Current restaurant context
 * @property {string|null} restaurantName - Current restaurant name
 * @property {string|null} tableId - Current table context
 * @property {string|null} tableNumber - Current table number
 * @property {Function} addItem - Add item or increment quantity
 * @property {Function} removeItem - Remove item by ID
 * @property {Function} updateQuantity - Update item quantity
 * @property {Function} updateNotes - Update item notes
 * @property {Function} clearCart - Clear all items
 * @property {Function} setContext - Set restaurant/table context
 * @property {Function} clearContext - Clear context (leaves items)
 * @property {Function} getItemCount - Total item count
 * @property {Function} getSubtotal - Total price
 */

export const useCartStore = create(
  persist(
    (set, get) => ({
      // ─── State ──────────────────────────────────────────────────────────
      items: [],
      restaurantId: null,
      restaurantName: null,
      tableId: null,
      tableNumber: null,

      // ─── Actions ────────────────────────────────────────────────────────

      /**
       * Add item to cart or increment quantity if already present.
       */
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + (item.quantity || 1) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: item.id,
                name: item.name,
                price: Number(item.price),
                quantity: item.quantity || 1,
                imageUrl: item.imageUrl || null,
                notes: item.notes || '',
              },
            ],
          };
        }),

      /**
       * Remove item from cart entirely.
       */
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        })),

      /**
       * Update item quantity. Removes item if quantity <= 0.
       */
      updateQuantity: (itemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== itemId) };
          }
          return {
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
          };
        }),

      /**
       * Update special notes for an item.
       */
      updateNotes: (itemId, notes) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, notes } : i
          ),
        })),

      /**
       * Clear all items from cart.
       */
      clearCart: () => set({ items: [] }),

      /**
       * Set restaurant and table context for the current ordering session.
       */
      setContext: (ctx) =>
        set({
          restaurantId: ctx.restaurantId || null,
          restaurantName: ctx.restaurantName || null,
          tableId: ctx.tableId || null,
          tableNumber: ctx.tableNumber || null,
        }),

      /**
       * Clear context without clearing items (for changing tables).
       */
      clearContext: () =>
        set({
          restaurantId: null,
          restaurantName: null,
          tableId: null,
          tableNumber: null,
        }),

      // ─── Computed / Selectors ─────────────────────────────────────────

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'ar-cart-storage',
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        tableId: state.tableId,
        tableNumber: state.tableNumber,
      }),
    }
  )
);

// ─── Selectors ─────────────────────────────────────────────────────────────

/** Get total number of items (sum of quantities). */
export const selectItemCount = (state) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

/** Get subtotal price. */
export const selectSubtotal = (state) =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

/** Check if a specific item is in the cart. */
export const selectItemInCart = (itemId) => (state) =>
  state.items.find((i) => i.id === itemId);

export default useCartStore;
