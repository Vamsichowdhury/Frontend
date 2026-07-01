import { configureStore, createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [] },
  reducers: {
    setOrders:   (state, action) => { state.items = action.payload; },
    // unshift prepends — keeps newest order at the top of the list
    addOrder:    (state, action) => { state.items.unshift(action.payload); },
    removeOrder: (state, action) => { state.items = state.items.filter(o => o.id !== action.payload); },
  },
});

export const { setOrders, addOrder, removeOrder } = ordersSlice.actions;

export const store = configureStore({
  reducer: {
    orders: ordersSlice.reducer,
  },
});
