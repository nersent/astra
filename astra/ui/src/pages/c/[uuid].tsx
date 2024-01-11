import { useRouter } from "next/router";

import { useStore } from "../../store/app_store_provider";
import { IndexView } from "../../views/index";

export function Index() {
  const router = useRouter();
  const store = useStore();
  const { uuid } = router.query;
  store.defaultChatUuid = uuid as string;
  return <IndexView />;
}

export default Index;
