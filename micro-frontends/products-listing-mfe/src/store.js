import { configureStore, createSlice } from '@reduxjs/toolkit';

// ── UI slice: sidebar open/close + order banner ──────────────
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    banner: null,
  },
  reducers: {
    openSidebar:  (state) => { state.sidebarOpen = true; },
    closeSidebar: (state) => { state.sidebarOpen = false; },
    showBanner:   (state, action) => { state.banner = action.payload; },
    hideBanner:   (state) => { state.banner = null; },
  },
});

// ── Products slice: list fetched from API ────────────────────
const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [] },
  reducers: {
    setProducts:   (state, action) => { state.items = action.payload; },
    addProduct:    (state, action) => { state.items.push(action.payload); },
    updateProduct: (state, action) => {
      const i = state.items.findIndex(p => p.id === action.payload.id);
      if (i !== -1) state.items[i] = action.payload;
    },
    removeProduct: (state, action) => {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
  },
});

export const { openSidebar, closeSidebar, showBanner, hideBanner } = uiSlice.actions;
export const { setProducts, addProduct, updateProduct, removeProduct } = productsSlice.actions;

export const store = configureStore({
  reducer: {
    ui:       uiSlice.reducer,
    products: productsSlice.reducer,
  },
});
