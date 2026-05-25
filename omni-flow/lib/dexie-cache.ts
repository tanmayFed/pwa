import Dexie, { type Table } from "dexie";

interface CacheEntry {
  key: string;
  value: any;
  updatedAt: number;
}

export interface DexieTask {
  id: string;
  title: string;
  content: string | null;
  columnId: string;
  position: string;
}

class OmniFlowCacheDB extends Dexie {
  queryCache!: Table<CacheEntry, string>;
  tasks!: Table<DexieTask, string>;

  constructor() {
    super("OmniFlowCacheDB");
    this.version(1).stores({
      queryCache: "key",
      tasks: "id, columnId, position",
    });
  }
}
const isClient = typeof window !== "undefined";
export const dexieDb = isClient
  ? new OmniFlowCacheDB()
  : ({
      queryCache: {
        get: async () => null,
        put: async () => {},
        delete: async () => {},
      },
      tasks: {
        toArray: async () => [],
        put: async () => {},
        bulkAdd: async () => {},
      },
    } as any);
