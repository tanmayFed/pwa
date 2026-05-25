import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { dexieDb } from "./dexie-cache";

const isClient = typeof window !== "undefined";

export const indexedDBPersister = isClient
  ? createAsyncStoragePersister({
      storage: {
        getItem: async (key) => {
          const entry = await dexieDb.queryCache.get(key);
          return entry ? entry.value : null;
        },
        setItem: async (key, value) => {
          await dexieDb.queryCache.put({
            key,
            value,
            updatedAt: Date.now(),
          });
        },
        removeItem: async (key) => {
          await dexieDb.queryCache.delete(key);
        },
      },
      throttleTime: 1000,
    })
  : undefined;
