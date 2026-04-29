import { createSlice } from '@reduxjs/toolkit';

const loadCart = () => {
  try {
    const saved = localStorage.getItem('dbach_cart');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

const saveCart = (items) => {
  try { localStorage.setItem('dbach_cart', JSON.stringify(items)); } catch {}
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addToCart(state, action) {
      const { productId, productName, productImage, size, color, price, quantity = 1 } = action.payload;
      const key = `${productId}-${size}-${color}`;
      const existing = state.items.find(i => `${i.productId}-${i.size}-${i.color}` === key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ productId, productName, productImage, size, color, price, quantity });
      }
      saveCart(state.items);
    },
    updateQuantity(state, action) {
      const { productId, size, color, quantity } = action.payload;
      const item = state.items.find(i => i.productId === productId && i.size === size && i.color === color);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => !(i.productId === productId && i.size === size && i.color === color));
        } else {
          item.quantity = quantity;
        }
      }
      saveCart(state.items);
    },
    removeFromCart(state, action) {
      const { productId, size, color } = action.payload;
      state.items = state.items.filter(i => !(i.productId === productId && i.size === size && i.color === color));
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('dbach_cart');
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export default cartSlice.reducer;
