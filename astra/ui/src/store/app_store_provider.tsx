import { createContext, useContext } from "react";

import { AppStore } from "./app_store";

let store: any;
export const StoreContext = createContext<AppStore>(new AppStore());

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within StoreProvider");
  }

  return context;
}

export function StoreProvider({ children, hydrationData: hydrationData }: any) {
  const store = initializeStore(hydrationData);

  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
}

function initializeStore(hydrationData = null) {
  const _store = store ?? new AppStore();

  // If your page has Next.js data fetching methods that use a Mobx store, it will
  // get hydrated here, check `pages/ssg.js` and `pages/ssr.js` for more details
  if (hydrationData) {
    _store.hydrate(hydrationData);
  }

  // For SSG and SSR always create a new store
  if (typeof window === "undefined") return _store;

  // Create the store once in the client
  if (!store) store = _store;

  return _store;
}
