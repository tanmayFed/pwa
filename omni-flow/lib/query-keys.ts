// This is Centralized registry for all TanStack Query cache keys

export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  detail: () => [...boardKeys.all, "active"] as const,
};
