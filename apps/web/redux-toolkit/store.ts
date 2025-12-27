import { configureStore } from "@reduxjs/toolkit";
import sideBarReducer from "../features/SideBarSlice";
import logInReducer from "../features/LoginSlice";

export const store = configureStore({
  reducer: { sideBarReducer, logInReducer },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
