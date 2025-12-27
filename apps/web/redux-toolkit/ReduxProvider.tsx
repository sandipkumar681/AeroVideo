"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useAppDispatch } from "@/redux-toolkit/hooks";
import { useEffect } from "react";
import { checkAuth } from "@/features/LoginSlice";

function AuthInit({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInit>{children}</AuthInit>
    </Provider>
  );
}
