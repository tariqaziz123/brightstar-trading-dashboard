"use client";

import { Provider } from "react-redux";

import { store } from "./store";

interface StoreProviderProps {
  children: React.ReactNode;
}

/** * StoreProvider is a React component that wraps its children with the Redux Provider.
 * It provides the Redux store to all components within the application.
 * @param children - The child components to be rendered within the provider.
 * @returns A React component that renders the provider with its children.
 */
export function StoreProvider({
  children,
}: Readonly<StoreProviderProps>) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}