import { observer } from "mobx-react";
import React, { useEffect } from "react";

import { useStore } from "../../store/app_store_provider";
import { ChatView } from "../chat";
import { HomeView } from "../home";

export const IndexView = observer(() => {
  const store = useStore();

  useEffect(() => {
    store.init();
  }, []);

  if (!store.isInitialized) {
    return null;
  }

  return store.api.isAuthenticated ? <ChatView /> : <HomeView />;
});
