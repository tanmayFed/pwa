import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dexieDb } from "../lib/dexie-cache";
import { boardKeys } from "../lib/query-keys";
import { Board } from "./useBoard";

interface UpdateTaskArgs {
  id: string;
  columnId: string;
  position: string;
}

export function useUpdateTaskPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, columnId, position }: UpdateTaskArgs) => {
      const response = await fetch("/api/board", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, columnId, position }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync card position with the server.");
      }

      return response.json();
    },

    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail() });

      const previousBoard = queryClient.getQueryData<Board>(boardKeys.detail());

      return { previousBoard };
    },

    onError: (err, newData, context) => {
      console.error("Optimistic rollback triggered:", err);

      if (context?.previousBoard) {
        queryClient.setQueryData(boardKeys.detail(), context.previousBoard);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail() });
    },
  });
}
